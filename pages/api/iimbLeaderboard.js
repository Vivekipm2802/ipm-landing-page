import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET allowed" });
  }

  // Prevent caching so leaderboard stays fresh
  res.setHeader("Cache-Control", "no-store, max-age=0");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from("response_sheet_uploads")
      .select("name, score_total, raw_scores, created_at")
      .order("score_total", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) {
      return res.status(500).json({ error: "Failed to fetch leaderboard" });
    }

    const leaderboard = (data ?? []).map((row) => ({
      name: row?.name ?? "Anonymous",
      total: row?.score_total ?? 0,
      city: row?.raw_scores?.city ?? "",
      createdAt: row?.created_at ?? null,
    }));

    return res.status(200).json({ leaderboard });
  } catch (e) {
    return res.status(500).json({ error: "Unexpected error" });
  }
}
