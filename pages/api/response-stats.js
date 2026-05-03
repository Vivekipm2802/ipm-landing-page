import { getSupabaseServer } from "../../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const supabase = getSupabaseServer();

    // Get total count
    const { data: countData, error: countError } = await supabase.rpc("get_total_responses");

    // Get top 10
    const { data: toppers, error: toppersError } = await supabase.rpc("get_top_10");

    if (countError || toppersError) {
      return res.status(500).json({ message: "Failed to fetch stats" });
    }

    return res.status(200).json({
      count: countData || 0,
      toppers: (toppers || []).slice(0, 3),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}
