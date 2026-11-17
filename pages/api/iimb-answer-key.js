// GET /api/iimb-answer-key?year=2026 → IIMB's official answer key once we load it (public once IIMB releases it).
// Empty until then; the calculator falls back to the ticks on the response sheet.
import { iimbDb, loadIimbKeys } from "../../lib/iimbServer";
import { EXAM_YEAR } from "../../utils/iimbScoring";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Only GET allowed" });
  const year = Number(req.query.year) || EXAM_YEAR;
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
  try {
    const out = await loadIimbKeys(iimbDb(), year);
    return res.status(200).json({ year, ...out });
  } catch {
    return res.status(200).json({ year, keys: {}, status: null, count: 0 });
  }
}
