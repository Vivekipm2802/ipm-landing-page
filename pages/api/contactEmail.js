import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { fullname, email, phone, year, city } = req.body;

  if (!fullname || !email || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { error } = await supabase.from("landing_leads").insert([
    {
      fullname,
      email,
      phone,
      year: year || null,
      city: city || null,
    },
  ]);

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: "Failed to save submission" });
  }

  return res.status(200).json({ msg: "Submitted successfully" });
}
