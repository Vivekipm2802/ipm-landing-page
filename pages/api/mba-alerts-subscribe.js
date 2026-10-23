// POST /api/mba-alerts-subscribe { name, phone, email, formId?, all? } → turn on deadline alerts.
// Returns { token, follows, all } which the page keeps on the device so later bells are one tap.
import { catDb, cleanText, validPhone, normPhone } from "../../lib/catPlannerServer";
import { formById, isSoon } from "../../lib/mbaAlerts";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const b = req.body || {};
  const name = cleanText(b.name, 80);
  const phone = normPhone(b.phone);
  const email = cleanText(b.email, 120).toLowerCase();
  if (name.length < 2) return res.status(400).json({ error: "Please enter your name." });
  if (!validPhone(phone)) return res.status(400).json({ error: "Please enter a valid 10-digit WhatsApp number." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: "Please enter a valid email address: reminders go there." });
  const form = b.formId ? formById(String(b.formId)) : null;
  if (b.formId && !form) return res.status(400).json({ error: "Unknown form." });

  try {
    const db = catDb();
    const { data: ex } = await db.from("mba_alert_subscribers").select("id, token, all_forms").eq("email", email).maybeSingle();
    let sub;
    if (ex) {
      const { data, error } = await db.from("mba_alert_subscribers").update({ name, phone, active: true, all_forms: ex.all_forms || Boolean(b.all), updated_at: new Date().toISOString() }).eq("id", ex.id).select("id, token, all_forms").single();
      if (error) throw error;
      sub = data;
    } else {
      const utm = b.utm && typeof b.utm === "object" ? b.utm : null;
      const { data, error } = await db.from("mba_alert_subscribers").insert({ name, phone, email, all_forms: Boolean(b.all), utm }).select("id, token, all_forms").single();
      if (error) throw error;
      sub = data;
    }
    if (form) {
      await db.from("mba_alert_follows").upsert({ subscriber_id: sub.id, form_id: form.id, wait_open: isSoon(form) }, { onConflict: "subscriber_id,form_id" });
    }
    const { data: f } = await db.from("mba_alert_follows").select("form_id").eq("subscriber_id", sub.id);
    return res.status(200).json({ ok: true, token: sub.token, all: sub.all_forms, follows: (f || []).map((x) => x.form_id) });
  } catch {
    return res.status(500).json({ error: "Could not turn on alerts. Please try again." });
  }
}
