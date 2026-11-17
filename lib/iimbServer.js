// Server-only helpers for the IIM Bangalore UG score calculator.
import { createClient } from "@supabase/supabase-js";

export function iimbDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

// { count, rank, topPct, buckets: [{ from, n }] } among students who used the calculator for that year
export async function iimbStats(db, year, score) {
  try {
    const { data, error } = await db.rpc("iimb_ug_stats", { p_year: year, p_score: score });
    if (error || !data || !data[0]) return null;
    const r = data[0];
    const count = Number(r.total_students) || 0;
    const rank = Number(r.better_than_you) + 1;
    const raw = r.buckets || {};
    const buckets = Object.keys(raw).map((k) => ({ from: Number(k), n: Number(raw[k]) })).sort((a, b) => a.from - b.from);
    return { count, rank, topPct: count ? Math.max(1, Math.round((rank / count) * 100)) : null, buckets };
  } catch {
    return null;
  }
}

export const shortName = (n) => {
  const parts = String(n || "Student").trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : parts[0];
};

// Official answer key for a test year → { keys: { [questionId]: { id, n, dropped } }, status, count }
export async function loadIimbKeys(db, year) {
  try {
    const { data, error } = await db.from("iimb_ug_answer_keys")
      .select("question_id, correct_option_id, correct_option, dropped, status")
      .eq("exam_year", year).limit(2000);
    if (error || !data) return { keys: {}, status: null, count: 0 };
    const keys = {};
    let final = data.length > 0;
    data.forEach((r) => {
      keys[String(r.question_id)] = { id: r.correct_option_id ? String(r.correct_option_id) : "", n: r.correct_option || null, dropped: Boolean(r.dropped) };
      if (r.status !== "final") final = false;
    });
    return { keys, status: data.length ? (final ? "final" : "provisional") : null, count: data.length };
  } catch {
    return { keys: {}, status: null, count: 0 };
  }
}
