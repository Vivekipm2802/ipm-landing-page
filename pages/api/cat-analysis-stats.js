// GET /api/cat-analysis-stats → slot-wise picture from students who used /cat-2026-analysis on or after exam day:
// per slot, how many answered, the most common difficulty per section and the median attempts per section.
// No personal data leaves this route. Cached for 2 minutes.
import { catDb } from "../../lib/catServer";

const SECS = ["VARC", "DILR", "QA"];
const median = (arr) => {
  if (!arr.length) return null;
  const v = [...arr].sort((x, y) => x - y), m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : Math.round((v[m - 1] + v[m]) / 2);
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
  try {
    const { data, error } = await catDb().from("cat_predictor_leads").select("inputs").eq("tool", "analysis").gte("created_at", "2026-11-29T00:00:00+05:30").limit(5000);
    if (error) throw error;
    const by = {};
    for (const r of data || []) {
      const i = r.inputs || {};
      const n = Number(i.slot);
      if (![1, 2, 3].includes(n)) continue;
      (by[n] ||= []).push(i);
    }
    const slots = {};
    for (const [n, rows] of Object.entries(by)) {
      const o = { n: rows.length };
      for (const k of SECS) {
        const votes = {};
        const atts = [];
        for (const r of rows) {
          const x = r[k] || {};
          if (x.lvl) votes[x.lvl] = (votes[x.lvl] || 0) + 1;
          if (Number.isFinite(x.att) && x.att >= 0 && x.att <= 24) atts.push(x.att);
        }
        const top = Object.entries(votes).sort((p, q) => q[1] - p[1])[0];
        o[k] = { level: top ? top[0] : null, medianAtt: median(atts) };
      }
      slots[n] = o;
    }
    return res.status(200).json({ slots });
  } catch (e) {
    return res.status(200).json({ slots: {} });
  }
}
