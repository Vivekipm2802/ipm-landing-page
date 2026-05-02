// IPMAT Indore Call Predictor — Supabase-powered
// Reads cutoffs from `college_cutoffs` table
// Columns: college_name, category, min_sa, min_qa, min_va, min_total
// A student qualifies if they meet ALL non-zero cutoffs for that college+category row

import { getSupabaseServer } from "../../utils/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { category, sa, va, qa } = req.body;
  const saScore = parseFloat(sa);   // QA Short Answer — out of 60
  const mcqScore = parseFloat(qa);  // QA MCQ — out of 120
  const vaScore = parseFloat(va);   // Verbal Ability — out of 180
  const total = saScore + mcqScore + vaScore; // out of 360

  const cat = (category || "").toLowerCase();

  // Fetch all cutoff rows for this category
  const supabase = getSupabaseServer();
  const { data: rows, error } = await supabase
    .from("college_cutoffs")
    .select("college_name, min_sa, min_qa, min_va, min_total")
    .eq("category", cat);

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ message: "Failed to fetch cutoffs" });
  }

  // Check each college: student must meet ALL non-zero cutoffs
  const colleges = [];
  for (const row of rows) {
    const meetsSA = row.min_sa === 0 || row.min_sa === null || saScore >= row.min_sa;
    const meetsMCQ = row.min_qa === 0 || row.min_qa === null || mcqScore >= row.min_qa;
    const meetsVA = row.min_va === 0 || row.min_va === null || vaScore >= row.min_va;
    const meetsTotal = row.min_total === 0 || row.min_total === null || total >= row.min_total;

    if (meetsSA && meetsMCQ && meetsVA && meetsTotal) {
      colleges.push(row.college_name);
    }
  }

  return res.status(200).json({ colleges });
}
