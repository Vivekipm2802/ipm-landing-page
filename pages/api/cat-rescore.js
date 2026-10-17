// POST /api/cat-rescore   (Authorization: Bearer <CONTENT_AUTOMATION_TOKEN>)
// Run after loading or changing rows in cat_answer_keys. Re-scores every saved
// CAT 2026 scorecard from its stored answers with the current key.
// Optional body: { onlyPending: true } to touch only sheets still waiting for a key.
import { requireAuth } from "../../lib/auth";
import { catDb, loadCatKeys, scoreColumns } from "../../lib/catServer";
import { scoreCat, EXAM_YEAR } from "../../lib/catScoring";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Only POST allowed" });
  if (!requireAuth(req, res)) return;

  const db = catDb();
  const onlyPending = !!(req.body && req.body.onlyPending);
  const PAGE = 300;
  let lastId = 0, updated = 0, scanned = 0;

  try {
    for (;;) {
      let q = db.from("cat_responses").select("id, answers").eq("exam_year", EXAM_YEAR).gt("id", lastId).order("id").limit(PAGE);
      if (onlyPending) q = q.gt("pending_key", 0);
      const { data, error } = await q;
      if (error) throw error;
      if (!data || data.length === 0) break;

      const ids = data.flatMap((r) => (r.answers || []).map((a) => a.q)).filter(Boolean);
      const keys = await loadCatKeys(db, ids);

      for (const r of data) {
        scanned += 1;
        // keep only the key printed on the sheet (ks); the table key is re-applied fresh
        const base = (r.answers || []).map((a) => ({ ...a, k: a.ks || "" }));
        const result = scoreCat(base, keys);
        const { error: upErr } = await db.from("cat_responses").update(scoreColumns(result)).eq("id", r.id);
        if (!upErr) updated += 1;
      }
      lastId = data[data.length - 1].id;
      if (data.length < PAGE) break;
    }
    return res.status(200).json({ ok: true, scanned, updated });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Rescore failed", scanned, updated });
  }
}

export const config = { maxDuration: 60 };
