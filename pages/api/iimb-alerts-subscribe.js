// POST /api/iimb-alerts-subscribe { name, phone, email, page?, utm? } → IIMB UG 2026 alerts (response sheet, answer key, result).
// Saves the lead, emails the team instantly, sends the student a short confirmation.
import { catDb, cleanText, validPhone, normPhone } from "../../lib/catPlannerServer";
import { mailConfigured } from "../../lib/mail";
import { notifyLead } from "../../lib/leadNotify";
import { iimbWelcome } from "../../lib/iimbAlerts";
import { mailer } from "../../lib/mbaAlerts";

const TEAM = "ipmcareeronline@gmail.com"; // same inbox as IIMB UG scorecards

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const b = req.body || {};
  const name = cleanText(b.name, 80);
  const phone = normPhone(b.phone);
  const email = cleanText(b.email, 120).toLowerCase();
  if (name.length < 2) return res.status(400).json({ error: "Please enter your name." });
  if (!validPhone(phone)) return res.status(400).json({ error: "Please enter a valid 10-digit WhatsApp number." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: "Please enter a valid email address: alerts go there." });
  const page = cleanText(b.page, 200).replace(/^https?:\/\/[^/]+/, "");
  const utm = b.utm && typeof b.utm === "object" ? b.utm : null;

  try {
    const db = catDb();
    const { data: ex } = await db.from("iimb_alert_subscribers").select("id").eq("phone", phone).maybeSingle();
    let sub;
    if (ex) {
      const { data, error } = await db.from("iimb_alert_subscribers").update({ name, email, active: true, updated_at: new Date().toISOString() }).eq("id", ex.id).select("id, token, name").single();
      if (error) throw error;
      sub = data;
    } else {
      const { data, error } = await db.from("iimb_alert_subscribers").insert({ name, phone, email, page: page || null, utm }).select("id, token, name").single();
      if (error) throw error;
      sub = data;
    }
    const jobs = [notifyLead("IIMB UG Alerts", { name, phone, email, "Signed up on": page, Status: ex ? "Returning" : "New", ...(utm || {}) }, `https://register.ipmcareer.com${page || "/response-v1"}`, TEAM)];
    if (!ex && mailConfigured()) {
      const w = iimbWelcome({ ...sub, name });
      jobs.push(Promise.race([
        mailer().sendMail({ from: { name: "IPM Careers", address: "info@ipmcareer.com" }, to: email, subject: w.subject, html: w.html, text: w.text }),
        new Promise((r) => setTimeout(r, 6000)),
      ]).catch((e) => console.error("iimb alerts welcome failed:", e?.message)));
    }
    await Promise.all(jobs);
    return res.status(200).json({ ok: true, returning: Boolean(ex) });
  } catch (e) {
    console.error("iimb-alerts-subscribe:", e?.message);
    return res.status(500).json({ error: "Could not turn on alerts. Please try again." });
  }
}
