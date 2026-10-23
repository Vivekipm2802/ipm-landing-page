// Instant email to the team for every CAT / MBA lead. Server only. Never throws, never waits more than ~6s.
import nodemailer from "nodemailer";

const TO = () => process.env.LEAD_NOTIFY_TO || "piyushwwx@gmail.com";
let transporter = null;
function mailer() {
  if (!transporter) transporter = nodemailer.createTransport({ host: "smtp.zeptomail.in", port: 587, secure: false, auth: { user: "emailapikey", pass: process.env.SMTP_PASS } });
  return transporter;
}
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const istNow = () => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date());

/**
 * source: e.g. "CAT Score Calculator"
 * lead:   { name, phone, email, ...anything else to show }
 * page:   URL of the page the lead came from
 */
export async function notifyLead(source, lead = {}, page = "") {
  if (!process.env.SMTP_PASS) return false;
  const { name, phone, email, ...rest } = lead;
  const rows = [["Name", name], ["WhatsApp", phone ? `+91 ${phone}` : ""], ["Email", email], ...Object.entries(rest).map(([k, v]) => [k, typeof v === "object" && v !== null ? JSON.stringify(v) : v])]
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "");
  const wa = phone ? `https://wa.me/91${phone}` : "";
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;">
  <h2 style="margin:0 0 4px;font-size:18px;">New lead: ${esc(source)}</h2>
  <div style="color:#666;font-size:13px;margin-bottom:12px;">${esc(istNow())} IST${page ? ` · <a href="${esc(page)}">${esc(page.replace(/^https?:\/\//, ""))}</a>` : ""}</div>
  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:14px;width:100%;">
  ${rows.map(([k, v]) => `<tr><td style="border-bottom:1px solid #eee;color:#666;white-space:nowrap;vertical-align:top;">${esc(k)}</td><td style="border-bottom:1px solid #eee;"><b>${esc(v)}</b></td></tr>`).join("")}
  </table>
  ${wa ? `<p style="margin-top:14px;"><a href="${wa}" style="background:#25D366;color:#fff;padding:9px 14px;border-radius:8px;text-decoration:none;font-weight:bold;">Message on WhatsApp</a></p>` : ""}
</div>`;
  const text = `New lead: ${source}\n${istNow()} IST\n${page}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}${wa ? `\n\nWhatsApp: ${wa}` : ""}`;
  try {
    await Promise.race([
      mailer().sendMail({ from: { name: "IPM Careers Leads", address: "info@ipmcareer.com" }, to: TO(), replyTo: email || undefined, subject: `New ${source} lead: ${name || phone || "student"}${rest.City ? ` (${rest.City})` : ""}`, html, text }),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 6000)),
    ]);
    return true;
  } catch (e) {
    console.error("lead notify failed:", source, e?.message);
    return false;
  }
}
