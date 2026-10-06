import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET allowed" });
  }

  // Short CDN cache keeps the page fast without going stale
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  try {
    const [top, total] = await Promise.all([
      supabase
        .from("response_sheet_uploads")
        .select("name, score_total, raw_scores, created_at")
        .not("score_total", "is", null)
        .order("score_total", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(10),
      supabase.from("response_sheet_uploads").select("*", { count: "exact", head: true }),
    ]);

    if (top.error) {
      return res.status(500).json({ error: "Failed to fetch leaderboard" });
    }

    // Only first name + last initial and city are public. Never phone/email.
    const shortName = (n) => {
      const parts = String(n || "Anonymous").trim().split(/\s+/);
      return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : parts[0];
    };

    const leaderboard = (top.data ?? []).map((row) => ({
      name: shortName(row?.name),
      total: row?.score_total ?? 0,
      city: row?.raw_scores?.city ?? "",
    }));

    return res.status(200).json({ leaderboard, count: total.count ?? 0 });
  } catch (e) {
    return res.status(500).json({ error: "Unexpected error" });
  }
}
