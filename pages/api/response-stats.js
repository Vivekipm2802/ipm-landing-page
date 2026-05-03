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

    // SECURITY: Only return name + total — never expose emails, phones, or full data
    const safeToppers = (toppers || []).slice(0, 3).map((t) => ({
      name: t.name || "Anonymous",
      total: t.total || 0,
    }));

    return res.status(200).json({
      count: countData || 0,
      toppers: safeToppers,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}
