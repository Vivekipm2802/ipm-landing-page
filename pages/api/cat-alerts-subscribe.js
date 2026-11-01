// POST /api/cat-alerts-subscribe { name, phone, email, city?, page?, utm? } → CAT 2026 "notify me" alerts.
// Saves the lead, emails the team instantly, sends the student a short confirmation.
import { catDb, cleanText, validPhone, normPhone } from "../../lib/catPlannerServer";
import { notifyLead } from "../../lib/leadNotify";
import { welcomeEmail } from "../../lib/catAlerts";
import { mailer } from "../../lib/mbaAlerts";
import { cityBySlug } from "../../lib/catPlanner";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const b = req.body || {};
  const name = cleanText(b.name, 80);
  const phone = normPhone(b.phone);
  const email = cleanText(b.email, 120).toLowerCase();
  if (name.length < 2) return res.status(400).json({ error: "Please enter your name." });
  if (!validPhone(phone)) return res.status(400).json({ error: "Please enter a valid 10-digit WhatsApp number." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: "Please enter a valid email address: alerts go there." });
  const city = b.city ? cityBySlug(String(b.city)) : null;
  const page = cleanText(b.page, 200).replace(/^https?:\/\/[^/]+/, "");
  const utm = b.utm && typeof b.utm === "object" ? b.utm : null;

  try {
    const db = catDb();
    const now = new Date().toISOString();
    const { data: ex } = await db.from("cat_alert_subscribers").select("id, token, city_slug").eq("phone", phone).maybeSingle();
    let sub;
    if (ex) {
      const { data, error } = await db.from("cat_alert_subscribers").update({ name, email, active: true, city_slug: city?.slug || ex.city_slug || null, updated_at: now }).eq("id", ex.id).select("id, token, name, city_slug").single();
      if (error) throw error;
      sub = data;
    } else {
      const { data, error } = await db.from("cat_alert_subscribers").insert({ name, phone, email, city_slug: city?.slug || null, page: page || null, utm }).select("id, token, name, city_slug").single();
      if (error) throw error;
      sub = data;
    }
    const cityName = sub.city_slug ? cityBySlug(sub.city_slug)?.name || "" : "";

    const jobs = [
      notifyLead("CAT 2026 Alerts", { name, phone, email, City: cityName, "Signed up on": page, Status: ex ? "Returning" : "New", ...(utm || {}) }, `https://register.ipmcareer.com${page || "/cat-score-calculator"}`),
    ];
    if (!ex && process.env.SMTP_PASS) {
      const w = welcomeEmail({ ...sub, name }, cityName);
      jobs.push(Promise.race([
        mailer().sendMail({ from: { name: "IPM Careers", address: "info@ipmcareer.com" }, to: email, subject: w.subject, html: w.html, text: w.text }),
        new Promise((r) => setTimeout(r, 6000)),
      ]).catch((e) => console.error("cat alerts welcome failed:", e?.message)));
    }
    await Promise.all(jobs);
    return res.status(200).json({ ok: true, returning: Boolean(ex) });
  } catch (e) {
    console.error("cat-alerts-subscribe:", e?.message);
    return res.status(500).json({ error: "Could not turn on alerts. Please try again." });
  }
}
