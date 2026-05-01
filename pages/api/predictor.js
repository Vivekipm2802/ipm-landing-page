import { supabase } from "../../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { category, sa, va, qa } = req.body;

  if (!category || sa === undefined || va === undefined || qa === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const { data, error } = await supabase.rpc("predict_colleges", {
    p_category: category,
    p_qa: parseFloat(qa),
    p_va: parseFloat(va),
    p_sa: parseFloat(sa),
  });

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.status(200).json({ colleges: data });
}