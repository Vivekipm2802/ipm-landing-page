// GET /api/iimb-rescore?year=2026  (Authorization: Bearer CRON_SECRET, or &secret=)
// Re-scores every saved IIMB UG scorecard of that year with the official key in iimb_ug_answer_keys,
// so totals, the leaderboard and "your rank" stay right after IIMB releases or revises the key. &dry=1 to preview.
import { iimbDb, loadIimbKeys } from "../../lib/iimbServer";
import { EXAM_YEAR, applyOfficialKey, scoreAnswers, SECTIONS } from "../../utils/iimbScoring";

export const config = { maxDuration: 60 };

function authorised(req) {
  const got = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const ok = [process.env.CRON_SECRET, process.env.CONTENT_AUTOMATION_TOKEN].filter(Boolean);
  return ok.includes(got) || (process.env.CRON_SECRET && req.query.secret === process.env.CRON_SECRET);
}

export default async function handler(req, res) {
  if (!authorised(req)) return res.status(401).json({ error: "Unauthorized" });
  const year = Number(req.query.year) || EXAM_YEAR;
  const dry = req.query.dry === "1";
  const db = iimbDb();
  const { keys, status, count } = await loadIimbKeys(db, year);
  if (!count) return res.status(200).json({ year, keyRows: 0, note: "No official key loaded for this year yet." });

  let checked = 0, changed = 0;
  for (let from = 0; ; from += 500) {
    const { data, error } = await db.from("iimb_ug_scorecards").select("id, score_total, answers").eq("exam_year", year).order("id").range(from, from + 499);
    if (error) return res.status(500).json({ error: error.message });
    for (const row of data || []) {
      checked++;
      const { answers } = applyOfficialKey(Array.isArray(row.answers) ? row.answers : [], keys);
      const sc = scoreAnswers(answers);
      if (sc.total === row.score_total && !req.query.force) continue;
      changed++;
      if (dry) continue;
      const sections = {};
      SECTIONS.forEach((s) => { const x = sc.sections[s.key]; sections[s.key] = { score: x.score, correct: x.correct, wrong: x.wrong, unattempted: x.unattempted, accuracy: x.accuracy, max: x.max, positive: x.positive }; });
      await db.from("iimb_ug_scorecards").update({
        answers, sections, score_varc: sc.s1, score_lr: sc.s2, score_qadi: sc.s3, score_total: sc.total,
        correct: sc.correct, wrong: sc.wrong, unattempted: sc.unattempted, accuracy: sc.accuracy, updated_at: new Date().toISOString(),
      }).eq("id", row.id);
    }
    if (!data || data.length < 500) break;
  }
  return res.status(200).json({ year, keyStatus: status, keyRows: count, checked, changed, dry });
}
