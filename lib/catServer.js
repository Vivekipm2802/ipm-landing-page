// Server-only helpers for the CAT score calculator (service-role Supabase).
// Never import this from a page component; only from pages/api/* or getServerSideProps.
import { createClient } from "@supabase/supabase-js";
import { EXAM_YEAR } from "./catScoring";

export function catDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

// { questionId: { answer, is_dropped } } for the given question IDs
export async function loadCatKeys(db, questionIds, year = EXAM_YEAR) {
  const ids = Array.from(new Set((questionIds || []).filter(Boolean)));
  const out = {};
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await db
      .from("cat_answer_keys")
      .select("question_id, answer, is_dropped")
      .eq("exam_year", year)
      .in("question_id", ids.slice(i, i + 200));
    if (error) throw error;
    (data || []).forEach((k) => { out[k.question_id] = { answer: k.answer, is_dropped: k.is_dropped }; });
  }
  return out;
}

// Columns written for a scored sheet
export function scoreColumns(result) {
  const sec = result.sections;
  return {
    score_total: result.total,
    score_varc: sec.VARC.score,
    score_dilr: sec.DILR.score,
    score_qa: sec.QA.score,
    correct: result.correct,
    wrong: result.wrong,
    unattempted: result.unattempted,
    pending_key: result.pendingKey,
    key_source: result.keySource,
    sections: sec,
    answers: result.answers.map(({ n, s, t, q, c, g, o, ks, k, r, m }) => ({ n, s, t, q, c, g, o, ks, k, r, m })),
  };
}

export const shortName = (n) => {
  const parts = String(n || "Anonymous").trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : parts[0];
};
