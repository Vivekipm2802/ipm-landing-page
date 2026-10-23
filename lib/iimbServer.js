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
