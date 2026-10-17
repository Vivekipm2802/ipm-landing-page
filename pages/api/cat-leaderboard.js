// GET /api/cat-leaderboard → top 10 fully-scored CAT 2026 sheets + total count.
// Public data only: first name + last initial, city, score. Never phone/email.
import { catDb, shortName } from "../../lib/catServer";
import { EXAM_YEAR } from "../../lib/catScoring";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Only GET allowed" });
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
  try {
    const db = catDb();
    const [top, total] = await Promise.all([
      db.from("cat_responses")
        .select("name, city, score_total")
        .eq("exam_year", EXAM_YEAR)
        .eq("pending_key", 0)
        .not("score_total", "is", null)
        .order("score_total", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(10),
      db.from("cat_responses").select("id", { count: "exact", head: true }).eq("exam_year", EXAM_YEAR),
    ]);
    if (top.error) return res.status(500).json({ error: "Failed to fetch leaderboard" });
    return res.status(200).json({
      leaderboard: (top.data || []).map((r) => ({ name: shortName(r.name), city: r.city || "", total: Number(r.score_total) || 0 })),
      count: total.count || 0,
    });
  } catch {
    return res.status(500).json({ error: "Unexpected error" });
  }
}
