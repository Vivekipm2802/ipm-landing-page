// Server-only helpers for the CAT Exam Day Planner and centre pages (service-role Supabase).
// Import only from pages/api/* or getServerSideProps / getStaticProps.
import crypto from "crypto";
import { catDb } from "./catServer";
import { matchCity, slugify, cityBySlug } from "./catPlanner";

export { catDb };

const UA = "IPMCareers-CATPlanner/1.0 (+https://register.ipmcareer.com/cat-exam-centres)";

export function newUid() {
  return crypto.randomBytes(9).toString("base64url").replace(/[-_]/g, "x").slice(0, 12);
}

export const cleanText = (s, max = 300) => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, max);
export const validPhone = (p) => /^[6-9]\d{9}$/.test(String(p || ""));
export const normPhone = (p) => String(p || "").replace(/\D/g, "").replace(/^(91|0)(?=[6-9]\d{9}$)/, "");

// City from free text; keeps unknown cities (slugged) so no plan is ever rejected
export function resolveCity(text) {
  const c = matchCity(text);
  if (c) return { slug: c.slug, name: c.name, state: c.state, official: true };
  const name = cleanText(text, 60);
  return name ? { slug: slugify(name), name, state: null, official: false } : null;
}

export async function findOrCreateCentre(db, { city, name, address, pincode }) {
  const nm = cleanText(name, 160);
  if (!nm || !city) return null;
  const slug = slugify(nm) || "centre";
  const { data: found } = await db.from("cat_centres").select("*").eq("city_slug", city.slug).eq("slug", slug).maybeSingle();
  if (found) {
    // fill a missing address once
    if (!found.address && address) await db.from("cat_centres").update({ address: cleanText(address, 400), pincode: pincode || found.pincode }).eq("id", found.id);
    return found;
  }
  const row = { slug, city_slug: city.slug, city: city.name, state: city.state, name: nm, address: cleanText(address, 400) || null, pincode: (String(pincode || "").match(/\d{6}/) || [])[0] || null };
  const { data, error } = await db.from("cat_centres").insert(row).select("*").single();
  if (error) {
    // raced with another insert
    const { data: again } = await db.from("cat_centres").select("*").eq("city_slug", city.slug).eq("slug", slug).maybeSingle();
    return again || null;
  }
  return { ...data, _new: true };
}

// ── geocoding + nearby (OpenStreetMap), cached on the centre row ────────
async function getJson(url, opts = {}, ms = 6000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: ctl.signal, headers: { "User-Agent": UA, Accept: "application/json", ...(opts.headers || {}) } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

const km = (a, b, c, d) => {
  const R = 6371, r = Math.PI / 180;
  const x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

async function geocode(centre) {
  const city = cityBySlug(centre.city_slug);
  const near = (lat, lng) => !city || km(lat, lng, city.lat, city.lng) < 45;
  const cityName = city ? city.aliases[0] : centre.city;
  // Indian addresses rarely match whole; try the centre name, then each named locality in the address
  const tries = [{ q: `${centre.name}, ${cityName}`, precision: "address" }];
  if (centre.address) {
    const skip = new RegExp(`^(india|${(city?.state || "x").toLowerCase()}|${(city?.aliases || []).map((a) => a.toLowerCase().replace(/[^a-z ]/g, "")).join("|") || "x"})$`, "i");
    const parts = centre.address.split(",").map((p) => p.replace(/\bIndia\b|\b\d{6}\b|-/gi, " ").trim())
      .filter((p) => /[a-z]{4,}/i.test(p) && !/^near\b|^opp\.?\b|^behind\b/i.test(p) && !skip.test(p));
    parts.slice(0, 3).forEach((p) => tries.push({ q: `${p}, ${cityName}`, precision: "locality" }));
  }
  for (const t of tries.slice(0, 4)) {
    const d = await getJson(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(t.q)}`);
    const hit = d && d[0];
    if (hit && near(+hit.lat, +hit.lon)) return { lat: +hit.lat, lng: +hit.lon, precision: t.precision };
    await new Promise((r) => setTimeout(r, 1000)); // Nominatim: max 1 request per second
  }
  if (centre.pincode) {
    const d = await getJson(`https://nominatim.openstreetmap.org/search?format=json&limit=1&country=India&postalcode=${centre.pincode}`);
    const hit = d && d[0];
    if (hit && near(+hit.lat, +hit.lon)) return { lat: +hit.lat, lng: +hit.lon, precision: "pincode" };
  }
  if (city) return { lat: city.lat, lng: city.lng, precision: "city" };
  return null;
}

async function nearby(lat, lng) {
  const q = `[out:json][timeout:20];(
    node["railway"="station"]["station"!="subway"](around:9000,${lat},${lng});
    node["railway"="station"]["station"="subway"](around:3500,${lat},${lng});
    node["station"="subway"](around:3500,${lat},${lng});
    node["amenity"="bus_station"](around:3500,${lat},${lng});
    node["amenity"="parking"](around:900,${lat},${lng});
    way["amenity"="parking"](around:900,${lat},${lng});
  );out center 60;`;
  let d = null;
  for (const ep of ["https://overpass-api.de/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]) {
    d = await getJson(ep, { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "Content-Type": "application/x-www-form-urlencoded" } }, 9000);
    if (d && Array.isArray(d.elements)) break;
  }
  if (!d || !Array.isArray(d.elements)) return null;
  const out = { rail: [], metro: [], bus: [], parking: [] };
  const seen = new Set();
  for (const e of d.elements) {
    const t = e.tags || {};
    const la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon;
    if (la == null) continue;
    const name = t["name:en"] || t.name || (t.amenity === "parking" ? "Parking" : "");
    if (!name) continue;
    const dist = Math.round(km(lat, lng, la, lo) * 10) / 10;
    const kind = t.station === "subway" || t.subway === "yes" ? "metro" : t.railway === "station" ? "rail" : t.amenity === "bus_station" ? "bus" : t.amenity === "parking" ? "parking" : null;
    if (!kind) continue;
    const key = kind + name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out[kind].push({ name, km: dist });
  }
  for (const k of Object.keys(out)) out[k] = out[k].sort((a, b) => a.km - b.km).slice(0, 3);
  return out;
}

// Called from SSR/ISR; best effort, never throws, never waits longer than budgetMs, gives up after 3 tries
export async function ensureCentreEnriched(db, centre, budgetMs = 12000) {
  if (!centre || centre.geo_status === "ok" || centre.geo_attempts >= 3) return centre;
  return Promise.race([enrich(db, centre), new Promise((r) => setTimeout(() => r(centre), budgetMs))]);
}

async function enrich(db, centre) {
  try {
    const g = await geocode(centre);
    const patch = { geo_attempts: (centre.geo_attempts || 0) + 1, updated_at: new Date().toISOString() };
    if (g) {
      patch.lat = g.lat; patch.lng = g.lng; patch.geo_precision = g.precision;
      const n = g.precision !== "city" ? await nearby(g.lat, g.lng) : null;
      if (n) patch.nearby = n;
      patch.geo_status = g.precision === "city" && patch.geo_attempts < 3 ? "pending" : "ok";
    } else if (patch.geo_attempts >= 3) {
      patch.geo_status = "failed";
    }
    const { data } = await db.from("cat_centres").update(patch).eq("id", centre.id).select("*").single();
    return data || { ...centre, ...patch };
  } catch {
    return centre;
  }
}

export async function centreCounts(db, centreId) {
  const { data } = await db.rpc("cat_planner_counts", { p_centre: centreId });
  const bySlot = { 1: 0, 2: 0, 3: 0 };
  let total = 0;
  (data || []).forEach((r) => { total += Number(r.n); if (bySlot[r.slot] != null) bySlot[r.slot] = Number(r.n); });
  return { total, bySlot };
}

export async function cityCounts(db) {
  const { data } = await db.rpc("cat_city_counts");
  const map = {};
  (data || []).forEach((r) => { map[r.city_slug] = { plans: Number(r.plans), centres: Number(r.centres) }; });
  return map;
}

export async function reviewSummary(db, centreId, limit = 20) {
  const { data } = await db
    .from("cat_centre_reviews")
    .select("id, exam, slot, overall, lab_temp, system_lag, noise, frisking, reach_tip, comment, display_name, created_at")
    .eq("centre_id", centreId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = data || [];
  const avg = rows.length ? Math.round((rows.reduce((s, r) => s + r.overall, 0) / rows.length) * 10) / 10 : null;
  const tally = (k) => rows.reduce((m, r) => (r[k] ? { ...m, [r[k]]: (m[r[k]] || 0) + 1 } : m), {});
  return { count: rows.length, avg, lab_temp: tally("lab_temp"), system_lag: tally("system_lag"), noise: tally("noise"), frisking: tally("frisking"), rows };
}

// Real weather and air quality in a city on CAT 2025 day (30 Nov 2025), at each slot's reporting time
export async function lastCatDayWeather(lat, lng) {
  if (!lat || !lng) return null;
  const day = "2025-11-30";
  const [w, a] = await Promise.all([
    getJson(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${day}&end_date=${day}&hourly=temperature_2m,relative_humidity_2m,precipitation,weather_code&timezone=Asia%2FKolkata`, {}, 5000),
    getJson(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&start_date=${day}&end_date=${day}&hourly=us_aqi,pm2_5&timezone=Asia%2FKolkata`, {}, 5000),
  ]);
  if (!w?.hourly?.temperature_2m) return null;
  const at = (h) => ({
    hour: h,
    temp: w.hourly.temperature_2m[h] ?? null,
    humidity: w.hourly.relative_humidity_2m?.[h] ?? null,
    rain: w.hourly.precipitation?.[h] ?? null,
    code: w.hourly.weather_code?.[h] ?? null,
    aqi: a?.hourly?.us_aqi?.[h] ?? null,
    pm25: a?.hourly?.pm2_5?.[h] ?? null,
  });
  return { date: day, slots: [at(7), at(11), at(15)] };
}

export const safe = async (fn, fallback) => {
  try { return await fn(); } catch { return fallback; }
};
