// POST /api/cat-predictor-lead → save a lead from the CAT percentile predictor or IIM call predictor.
// Results are computed in the browser; this only stores who used the tool and what they entered.
import { catDb, cleanText, validPhone, normPhone } from "../../lib/catPlannerServer";

const small = (o) => {
  try {
    const s = JSON.stringify(o ?? null);
    return s.length > 4000 ? null : JSON.parse(s);
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const b = req.body || {};
  const tool = b.tool === "call" ? "call" : b.tool === "percentile" ? "percentile" : null;
  const name = cleanText(b.name, 80);
  const phone = normPhone(b.phone);
  const email = cleanText(b.email, 120).toLowerCase();
  if (!tool) return res.status(400).json({ error: "Unknown tool." });
  if (name.length < 2) return res.status(400).json({ error: "Please enter your name." });
  if (!validPhone(phone)) return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: "Please check your email address." });
  try {
    const db = catDb();
    const row = { tool, name, phone, email: email || null, category: cleanText(b.category, 10) || null, inputs: small(b.inputs), outputs: small(b.outputs), updated_at: new Date().toISOString() };
    const { data: ex } = await db.from("cat_predictor_leads").select("id, uses").eq("tool", tool).eq("phone", phone).eq("exam_year", 2026).maybeSingle();
    if (ex) await db.from("cat_predictor_leads").update({ ...row, uses: (ex.uses || 1) + 1 }).eq("id", ex.id);
    else await db.from("cat_predictor_leads").insert({ ...row, utm: small(b.utm) });
    return res.status(200).json({ ok: true });
  } catch {
    // never block the result because storage failed
    return res.status(200).json({ ok: false });
  }
}
