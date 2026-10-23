// POST /api/cat-planner → create or update a student's CAT exam day plan. Returns { uid }.
// The admit card is read in the browser; only test-day fields arrive here.
import { catDb, newUid, cleanText, validPhone, normPhone, resolveCity, findOrCreateCentre } from "../../lib/catPlannerServer";
import { EXAM_YEAR, EXAM_DATE, SLOTS } from "../../lib/catPlanner";

const hhmm = (v) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(String(v || "")) ? v : null);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const b = req.body || {};
  const name = cleanText(b.name, 80);
  const phone = normPhone(b.phone);
  const email = cleanText(b.email, 120).toLowerCase();
  const mode = ["pdf", "manual", "early"].includes(b.mode) ? b.mode : "manual";

  if (name.length < 2) return res.status(400).json({ error: "Please enter your name." });
  if (!validPhone(phone)) return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: "Please check your email address." });

  const city = resolveCity(b.city);
  if (!city) return res.status(400).json({ error: "Please choose your CAT test city." });

  const slot = [1, 2, 3].includes(Number(b.slot)) ? Number(b.slot) : null;
  if (mode !== "early") {
    if (!slot) return res.status(400).json({ error: "Please choose your slot." });
    if (!cleanText(b.centreName)) return res.status(400).json({ error: "Please enter your test centre name." });
  }

  try {
    const db = catDb();
    let centre = null;
    if (mode !== "early") {
      centre = await findOrCreateCentre(db, { city, name: b.centreName, address: b.centreAddress, pincode: b.pincode });
    }
    const def = SLOTS[slot] || {};
    const row = {
      exam_year: EXAM_YEAR,
      name,
      phone,
      email: email || null,
      city_slug: city.slug,
      wa_opt_in: b.waOptIn !== false,
      updated_at: new Date().toISOString(),
    };
    if (mode !== "early") {
      Object.assign(row, {
        input_mode: mode,
        centre_id: centre?.id || null,
        slot,
        exam_date: /^\d{4}-\d{2}-\d{2}$/.test(b.examDate || "") && String(b.examDate).startsWith(String(EXAM_YEAR)) ? b.examDate : EXAM_DATE,
        exam_start: hhmm(b.examStart) || def.start || null,
        exam_end: hhmm(b.examEnd) || def.end || null,
        reporting_time: mode === "pdf" ? hhmm(b.reporting) : hhmm(b.reporting) || null,
        gate_time: mode === "pdf" ? hhmm(b.gate) : hhmm(b.gate) || null,
      });
    }
    if (b.startArea !== undefined) row.start_area = cleanText(b.startArea, 160) || null;
    if (b.travelMins !== undefined) row.travel_mins = Math.min(600, Math.max(5, parseInt(b.travelMins, 10) || 0)) || null;
    if (b.carpoolOptIn !== undefined) row.carpool_opt_in = Boolean(b.carpoolOptIn);
    if (b.carpoolArea !== undefined) row.carpool_area = cleanText(b.carpoolArea, 120) || null;

    const { data: existing } = await db.from("cat_planner").select("id, uid, input_mode").eq("phone", phone).eq("exam_year", EXAM_YEAR).maybeSingle();
    let uid;
    if (existing) {
      uid = existing.uid;
      // an early sign-up that now uploads a card keeps the same plan link
      if (mode === "early" && existing.input_mode !== "early") delete row.input_mode;
      const { error } = await db.from("cat_planner").update(row).eq("id", existing.id);
      if (error) throw error;
    } else {
      uid = newUid();
      const ref = cleanText(b.ref, 20);
      const { error } = await db.from("cat_planner").insert({
        ...row,
        uid,
        input_mode: mode,
        ref_uid: ref && ref !== uid ? ref : null,
        utm: b.utm && typeof b.utm === "object" ? b.utm : null,
      });
      if (error) throw error;
    }
    if (centre?._new) {
      try { await res.revalidate(`/cat-exam-centres/${centre.city_slug}`); } catch {}
    }
    return res.status(200).json({ ok: true, uid, centre: centre ? { city_slug: centre.city_slug, slug: centre.slug } : null });
  } catch (e) {
    return res.status(500).json({ error: "Could not save your plan. Please try again in a minute." });
  }
}
