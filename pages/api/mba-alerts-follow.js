// POST /api/mba-alerts-follow { token, formId?, on?, all? } → follow / unfollow one form, or toggle "all forms"
import { catDb } from "../../lib/catPlannerServer";
import { formById, isSoon } from "../../lib/mbaAlerts";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const { token, formId, on, all } = req.body || {};
  if (!/^[a-f0-9]{24}$/.test(String(token || ""))) return res.status(404).json({ error: "Please sign up again." });
  try {
    const db = catDb();
    const { data: sub } = await db.from("mba_alert_subscribers").select("id, all_forms").eq("token", token).maybeSingle();
    if (!sub) return res.status(404).json({ error: "Please sign up again." });
    if (typeof all === "boolean") await db.from("mba_alert_subscribers").update({ all_forms: all, active: true, updated_at: new Date().toISOString() }).eq("id", sub.id);
    if (formId) {
      const form = formById(String(formId));
      if (!form) return res.status(400).json({ error: "Unknown form." });
      if (on === false) await db.from("mba_alert_follows").delete().eq("subscriber_id", sub.id).eq("form_id", form.id);
      else {
        await db.from("mba_alert_follows").upsert({ subscriber_id: sub.id, form_id: form.id, wait_open: isSoon(form) }, { onConflict: "subscriber_id,form_id" });
        await db.from("mba_alert_subscribers").update({ active: true }).eq("id", sub.id);
      }
    }
    const { data: f } = await db.from("mba_alert_follows").select("form_id").eq("subscriber_id", sub.id);
    const { data: s2 } = await db.from("mba_alert_subscribers").select("all_forms").eq("id", sub.id).single();
    return res.status(200).json({ ok: true, all: s2?.all_forms || false, follows: (f || []).map((x) => x.form_id) });
  } catch {
    return res.status(500).json({ error: "Could not update alerts. Please try again." });
  }
}
