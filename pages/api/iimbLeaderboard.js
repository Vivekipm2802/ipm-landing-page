import { iimbDb, shortName } from "../../lib/iimbServer";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET allowed" });
  }

  // Short CDN cache keeps the page fast without going stale
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");


  try {
    const supabase = iimbDb();
    const year = Number(req.query.year) || null;
    let topQ = supabase.from("iimb_ug_scorecards").select("name, score_total, city, created_at").order("score_total", { ascending: false }).order("created_at", { ascending: true }).limit(10);
    let countQ = supabase.from("iimb_ug_scorecards").select("id", { count: "exact", head: true });
    if (year) { topQ = topQ.eq("exam_year", year); countQ = countQ.eq("exam_year", year); }
    const [top, total] = await Promise.all([topQ, countQ]);
    if (top.error) {
      return res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
    // Only first name + last initial and city are public. Never phone/email.
    const leaderboard = (top.data ?? []).map((row) => ({ name: shortName(row?.name), total: row?.score_total ?? 0, city: row?.city ?? "" }));
    return res.status(200).json({ leaderboard, count: total.count ?? 0 });
  } catch (e) {
    return res.status(500).json({ error: "Unexpected error" });
  }
}
