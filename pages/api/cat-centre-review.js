// POST /api/cat-centre-review → a candidate's review of a CAT test centre
import { catDb, cleanText, validPhone, normPhone } from "../../lib/catPlannerServer";
import { shortName } from "../../lib/catPlanner";

const pick = (v, allowed) => (allowed.includes(v) ? v : null);
const EXAMS = ["CAT 2026", "CAT 2025", "CAT 2024", "Another exam at this centre"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const b = req.body || {};
  const centreId = parseInt(b.centreId, 10);
  const name = cleanText(b.name, 60);
  const phone = normPhone(b.phone);
  const overall = parseInt(b.overall, 10);
  if (!centreId) return res.status(400).json({ error: "Missing centre." });
  if (name.length < 2) return res.status(400).json({ error: "Please enter your name." });
  if (!validPhone(phone)) return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
  if (!(overall >= 1 && overall <= 5)) return res.status(400).json({ error: "Please give an overall rating." });
  const exam = EXAMS.includes(b.exam) ? b.exam : "CAT 2026";
  if (exam === "CAT 2026" && Date.now() < new Date("2026-11-29T08:30:00+05:30").getTime()) {
    return res.status(400).json({ error: "CAT 2026 reviews open after your slot on 29 November. If you took an earlier exam here, pick that instead." });
  }
  const comment = cleanText(b.comment, 600).replace(/https?:\/\/\S+|www\.\S+/gi, "");
  const reach = cleanText(b.reachTip, 200).replace(/https?:\/\/\S+|www\.\S+/gi, "");
  try {
    const db = catDb();
    const { data: c } = await db.from("cat_centres").select("id, city_slug, slug").eq("id", centreId).maybeSingle();
    if (!c) return res.status(404).json({ error: "Centre not found." });
    const row = {
      centre_id: centreId,
      exam,
      slot: [1, 2, 3].includes(Number(b.slot)) ? Number(b.slot) : null,
      overall,
      lab_temp: pick(b.labTemp, ["cold", "fine", "hot"]),
      system_lag: pick(b.systemLag, ["none", "some", "bad"]),
      noise: pick(b.noise, ["quiet", "some", "noisy"]),
      frisking: pick(b.frisking, ["relaxed", "normal", "strict"]),
      reach_tip: reach || null,
      comment: comment || null,
      display_name: shortName(name),
      phone,
    };
    const { error } = await db.from("cat_centre_reviews").upsert(row, { onConflict: "centre_id,phone,exam" });
    if (error) throw error;
    try { await res.revalidate(`/cat-exam-centres/${c.city_slug}/${c.slug}`); } catch {}
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Could not save your review. Please try again." });
  }
}
