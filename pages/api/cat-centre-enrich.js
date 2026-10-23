// POST /api/cat-centre-enrich { city_slug, slug } → locate a new centre on the map and find
// nearby stations and parking (OpenStreetMap). Fired by the planner right after a plan is saved.
import { catDb, ensureCentreEnriched } from "../../lib/catPlannerServer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const { city_slug, slug } = req.body || {};
  if (!/^[a-z0-9-]{1,80}$/.test(city_slug || "") || !/^[a-z0-9-]{1,80}$/.test(slug || "")) return res.status(400).json({ error: "Bad centre" });
  try {
    const db = catDb();
    const { data: c } = await db.from("cat_centres").select("*").eq("city_slug", city_slug).eq("slug", slug).maybeSingle();
    if (!c) return res.status(404).json({ error: "Not found" });
    const out = await ensureCentreEnriched(db, c, 50000);
    return res.status(200).json({ ok: true, geo: out?.geo_precision || null, status: out?.geo_status || null });
  } catch {
    return res.status(200).json({ ok: false });
  }
}

export const config = { maxDuration: 60 };
