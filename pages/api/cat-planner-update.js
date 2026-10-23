// POST /api/cat-planner-update → small edits from the plan page (travel time, start area, carpool, reminders).
// The 12-character plan uid acts as the key; phones are never returned.
import { catDb, cleanText } from "../../lib/catPlannerServer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const b = req.body || {};
  const uid = String(b.uid || "");
  if (!/^[A-Za-z0-9]{8,16}$/.test(uid)) return res.status(400).json({ error: "Bad plan link." });
  const patch = { updated_at: new Date().toISOString() };
  if (b.startArea !== undefined) patch.start_area = cleanText(b.startArea, 160) || null;
  if (b.travelMins !== undefined) patch.travel_mins = Math.min(600, Math.max(5, parseInt(b.travelMins, 10) || 0)) || null;
  if (b.carpoolOptIn !== undefined) patch.carpool_opt_in = Boolean(b.carpoolOptIn);
  if (b.carpoolArea !== undefined) patch.carpool_area = cleanText(b.carpoolArea, 120) || null;
  if (b.waOptIn !== undefined) patch.wa_opt_in = Boolean(b.waOptIn);
  try {
    const db = catDb();
    const { data, error } = await db.from("cat_planner").update(patch).eq("uid", uid).select("id, centre_id, slot, carpool_opt_in").maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Plan not found." });
    let carpoolMatches = 0;
    if (data.carpool_opt_in && data.centre_id) {
      const { count } = await db.from("cat_planner").select("id", { count: "exact", head: true })
        .eq("centre_id", data.centre_id).eq("slot", data.slot).eq("carpool_opt_in", true).neq("id", data.id);
      carpoolMatches = count || 0;
    }
    return res.status(200).json({ ok: true, carpoolMatches });
  } catch {
    return res.status(500).json({ error: "Could not save. Please try again." });
  }
}
