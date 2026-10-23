// GET /api/cat-planner-stats → public counts only (no personal data)
import { catDb } from "../../lib/catPlannerServer";
import { EXAM_YEAR } from "../../lib/catPlanner";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  try {
    const db = catDb();
    const [plans, centres] = await Promise.all([
      db.from("cat_planner").select("id", { count: "exact", head: true }).eq("exam_year", EXAM_YEAR),
      db.from("cat_centres").select("id", { count: "exact", head: true }),
    ]);
    return res.status(200).json({ plans: plans.count || 0, centres: centres.count || 0 });
  } catch {
    return res.status(200).json({ plans: 0, centres: 0 });
  }
}
