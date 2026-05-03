import { getSupabaseServer } from "../../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const supabase = getSupabaseServer();
    const { count, error } = await supabase
      .from("predictor")
      .select("id", { count: "exact", head: true });

    if (error) {
      return res.status(500).json({ message: "Failed to fetch count" });
    }

    return res.status(200).json({ count: count || 0 });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}
