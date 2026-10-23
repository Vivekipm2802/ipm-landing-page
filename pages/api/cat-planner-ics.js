// GET /api/cat-planner-ics?uid=… → calendar file with exam-day alarms
import { catDb } from "../../lib/catPlannerServer";
import { buildIcs, cityBySlug } from "../../lib/catPlanner";

export default async function handler(req, res) {
  const uid = String(req.query.uid || "");
  if (!/^[A-Za-z0-9]{8,16}$/.test(uid)) return res.status(400).send("Bad plan link");
  try {
    const db = catDb();
    const { data: plan } = await db.from("cat_planner")
      .select("uid, slot, exam_date, exam_start, exam_end, reporting_time, gate_time, travel_mins, city_slug, centre_id")
      .eq("uid", uid).maybeSingle();
    if (!plan) return res.status(404).send("Plan not found");
    let centre = null;
    if (plan.centre_id) {
      const { data } = await db.from("cat_centres").select("name, address").eq("id", plan.centre_id).maybeSingle();
      centre = data;
    }
    const ics = buildIcs(plan, centre, cityBySlug(plan.city_slug));
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="CAT-2026-exam-day.ics"');
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(ics);
  } catch {
    return res.status(500).send("Could not build the calendar file");
  }
}
