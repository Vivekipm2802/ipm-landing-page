// CAT 2026 Exam Day Planner: shared helpers (safe for browser and server).
import { CAT_CITIES } from "./catCities";

export const EXAM_YEAR = 2026;
export const EXAM_DATE = "2026-11-29";          // Sunday
export const ADMIT_CARD_DATE = "2026-11-04";    // download begins (iimcat.ac.in)
export const SITE = "https://register.ipmcareer.com";
export const PLANNER_PATH = "/cat-exam-day-planner";
export const CENTRES_PATH = "/cat-exam-centres";

// CAT 2025 pattern. The admit card is the final word, so plans built from a PDF use the card's own times.
export const SLOTS = {
  1: { label: "Slot 1 (morning)", start: "08:30", end: "10:30", reporting: "07:00", gate: "08:15" },
  2: { label: "Slot 2 (afternoon)", start: "12:30", end: "14:30", reporting: "11:00", gate: "12:15" },
  3: { label: "Slot 3 (evening)", start: "16:30", end: "18:30", reporting: "15:00", gate: "16:15" },
};

export const CHECKLIST = [
  { id: "print", text: "Admit card printed on A4 (every page), photo and signature clearly visible" },
  { id: "photo", text: "The same passport photo you uploaded in the CAT form, pasted on the admit card" },
  { id: "id", text: "One original government photo ID: Aadhaar, PAN, passport, driving licence or voter ID (not damaged)" },
  { id: "pens", text: "Two simple pens" },
  { id: "bottle", text: "A transparent water bottle" },
  { id: "nogadgets", text: "No phone, smartwatch, calculator, wallet or papers inside (there is no locker at most centres)" },
  { id: "nometal", text: "No jewellery or metal items; no thick-soled shoes or clothes with large buttons" },
  { id: "sign", text: "Do not sign the admit card at home: sign it in front of the invigilator" },
  { id: "time", text: "Reach by the reporting time. The gate closes before the exam starts and late entry is not allowed" },
];

// ── cities ──────────────────────────────────────────────────────────────
export const slugify = (s) =>
  String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z]/g, "");

export function cityBySlug(slug) {
  return CAT_CITIES.find((c) => c.slug === slug) || null;
}

// Map whatever the admit card / student typed ("Kanpur", "Gurugram", "Noida") to an official test city
export function matchCity(text) {
  const t = norm(text);
  if (!t) return null;
  for (const c of CAT_CITIES) if (c.aliases.some((a) => norm(a) === t) || norm(c.name) === t) return c;
  for (const c of CAT_CITIES) if (c.aliases.some((a) => norm(a).length > 3 && (t.includes(norm(a)) || norm(a).includes(t)))) return c;
  return null;
}

export const STATES = Array.from(new Set(CAT_CITIES.map((c) => c.state)));

// ── time ────────────────────────────────────────────────────────────────
export const istDate = (date, hhmm) => (date && hhmm ? new Date(`${date}T${hhmm}:00+05:30`) : null);
export const addMin = (d, m) => (d ? new Date(d.getTime() + m * 60000) : null);

export function fmtTime(d) {
  if (!d) return "";
  const p = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).formatToParts(d);
  const get = (t) => (p.find((x) => x.type === t) || {}).value || "";
  return `${get("hour")}:${get("minute")} ${get("dayPeriod").toUpperCase()}`;
}
export function fmtHHMM(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
export function fmtDay(date) {
  if (!date) return "";
  const d = new Date(`${date}T12:00:00+05:30`);
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(d);
}

// All the moments of exam day for one plan
export function planTimes(plan, city) {
  const slot = SLOTS[plan?.slot] || null;
  const date = plan?.exam_date || EXAM_DATE;
  const start = plan?.exam_start || slot?.start || "";
  const end = plan?.exam_end || slot?.end || "";
  const reporting = plan?.reporting_time || slot?.reporting || "";
  const gate = plan?.gate_time || slot?.gate || "";
  const fogBuffer = city?.fog && Number(plan?.slot) === 1 ? 20 : 0;
  const buffer = 20 + fogBuffer;
  const travel = Number(plan?.travel_mins) || null;
  const reportingAt = istDate(date, reporting);
  const leaveAt = reportingAt && travel ? addMin(reportingAt, -(travel + buffer)) : null;
  const wakeAt = leaveAt ? addMin(leaveAt, -75) : reportingAt ? addMin(reportingAt, -150) : null;
  const prevDay = new Date(`${date}T12:00:00+05:30`);
  prevDay.setUTCDate(prevDay.getUTCDate() - 1);
  const prev = prevDay.toISOString().slice(0, 10);
  return {
    date,
    slot: plan?.slot || null,
    fromCard: Boolean(plan?.reporting_time),
    startAt: istDate(date, start),
    endAt: istDate(date, end),
    reportingAt,
    gateAt: istDate(date, gate),
    leaveAt,
    wakeAt,
    nightBeforeAt: istDate(prev, "21:00"),
    buffer,
    fogBuffer,
    travel,
  };
}

// ── links ───────────────────────────────────────────────────────────────
const enc = encodeURIComponent;
export const centreQuery = (c) => [c?.name, c?.address].filter(Boolean).join(", ");

export function directionsUrl(centre, origin) {
  const dest = centreQuery(centre) || (centre?.lat ? `${centre.lat},${centre.lng}` : "");
  return `https://www.google.com/maps/dir/?api=1&destination=${enc(dest)}&travelmode=driving${origin ? `&origin=${enc(origin)}` : ""}`;
}
export const mapsSearchUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${enc(q)}`;
export const mapsEmbedUrl = (centre) => `https://www.google.com/maps?q=${enc(centreQuery(centre) || `${centre?.lat},${centre?.lng}`)}&output=embed`;

export function uberUrl(centre) {
  const p = ["action=setPickup", "pickup=my_location"];
  if (centre?.lat && centre?.lng && centre?.geo_precision === "address") {
    p.push(`dropoff[latitude]=${centre.lat}`, `dropoff[longitude]=${centre.lng}`);
  }
  p.push(`dropoff[nickname]=${enc(centre?.name || "CAT exam centre")}`, `dropoff[formatted_address]=${enc(centreQuery(centre))}`);
  return `https://m.uber.com/ul/?${p.join("&")}`;
}

const gcalStamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
export function gcalUrl({ title, start, end, details = "", location = "" }) {
  if (!start) return "";
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${enc(title)}&dates=${gcalStamp(start)}/${gcalStamp(end || addMin(start, 15))}&details=${enc(details)}&location=${enc(location)}&ctz=Asia/Kolkata`;
}

export const planUrl = (uid) => `${SITE}${PLANNER_PATH}/${uid}`;
export const centreUrl = (c) => `${SITE}${CENTRES_PATH}/${c.city_slug}/${c.slug}`;
export const cityUrl = (slug) => `${SITE}${CENTRES_PATH}/${slug}`;

// ── calendar file (.ics) with alarms ────────────────────────────────────
const icsEsc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
export function buildIcs(plan, centre, city) {
  const t = planTimes(plan, city);
  const where = centreQuery(centre);
  const link = planUrl(plan.uid);
  const now = gcalStamp(new Date());
  const ev = [];
  const add = (id, title, start, end, desc, alarms = [0]) => {
    if (!start) return;
    ev.push([
      "BEGIN:VEVENT",
      `UID:cat2026-${plan.uid}-${id}@ipmcareer.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${gcalStamp(start)}`,
      `DTEND:${gcalStamp(end || addMin(start, 15))}`,
      `SUMMARY:${icsEsc(title)}`,
      `DESCRIPTION:${icsEsc(desc + "\n\nYour plan: " + link)}`,
      where ? `LOCATION:${icsEsc(where)}` : "",
      ...alarms.map((m) => ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEsc(title)}`, `TRIGGER:${m === 0 ? "PT0M" : `-PT${m}M`}`, "END:VALARM"].join("\r\n")),
      "END:VEVENT",
    ].filter(Boolean).join("\r\n"));
  };
  add("night", "CAT tomorrow: pack your bag", t.nightBeforeAt, addMin(t.nightBeforeAt, 30),
    "Tick the checklist: printed admit card with photo pasted, original photo ID, 2 pens, transparent water bottle. Set two alarms. Sleep early.");
  if (t.leaveAt) add("leave", "Leave now for CAT", t.leaveAt, addMin(t.leaveAt, 15), `Leave for ${centre?.name || "your CAT centre"}. Reporting time ${fmtTime(t.reportingAt)}.`, [10, 0]);
  if (t.gateAt) add("gate", "CAT gate closes in 30 minutes", addMin(t.gateAt, -30), t.gateAt, `The gate closes at ${fmtTime(t.gateAt)}. No entry after that.`);
  if (t.startAt) add("exam", "CAT 2026 exam", t.startAt, t.endAt, `Slot ${plan.slot || ""}. All the best!`, []);
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//IPM Careers//CAT Exam Day Planner//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...ev, "END:VCALENDAR"].join("\r\n");
}

export const shortName = (n) => {
  const parts = String(n || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Anonymous";
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : parts[0];
};
