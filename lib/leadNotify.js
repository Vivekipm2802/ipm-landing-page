// Instant email to the team for every CAT / MBA lead. Server only. Never throws, never waits more than ~6s.
// If the email cannot be sent right now (mail down, timeout), the lead is queued in lead_notify_queue and
// /api/lead-notify-retry (every 10 min via Supabase pg_cron) keeps trying until it is delivered.
import { createClient } from "@supabase/supabase-js";
import { sharedMailer, mailConfigured } from "./mail";

const TO = () => process.env.LEAD_NOTIFY_TO || "vivekgurumantra2@gmail.com";
const mailer = () => sharedMailer();
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const istTime = (d) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(d ? new Date(d) : new Date());

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

// The email itself (also used when re-sending from the queue, with the original time)
export function buildLeadEmail(source, lead = {}, page = "", to = "", at = null) {
  const { name, phone, email, ...rest } = lead;
  const rows = [["Name", name], ["WhatsApp", phone ? `+91 ${phone}` : ""], ["Email", email], ...Object.entries(rest).map(([k, v]) => [k, typeof v === "object" && v !== null ? JSON.stringify(v) : v])]
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "");
  const wa = phone ? `https://wa.me/91${phone}` : "";
  const when = `${istTime(at)} IST${at ? " (delivered late: email was down)" : ""}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;">
  <h2 style="margin:0 0 4px;font-size:18px;">New lead: ${esc(source)}</h2>
  <div style="color:#666;font-size:13px;margin-bottom:12px;">${esc(when)}${page ? ` · <a href="${esc(page)}">${esc(page.replace(/^https?:\/\//, ""))}</a>` : ""}</div>
  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:14px;width:100%;">
  ${rows.map(([k, v]) => `<tr><td style="border-bottom:1px solid #eee;color:#666;white-space:nowrap;vertical-align:top;">${esc(k)}</td><td style="border-bottom:1px solid #eee;"><b>${esc(v)}</b></td></tr>`).join("")}
  </table>
  ${wa ? `<p style="margin-top:14px;"><a href="${wa}" style="background:#25D366;color:#fff;padding:9px 14px;border-radius:8px;text-decoration:none;font-weight:bold;">Message on WhatsApp</a></p>` : ""}
</div>`;
  const text = `New lead: ${source}\n${when}\n${page}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}${wa ? `\n\nWhatsApp: ${wa}` : ""}`;
  return {
    from: { name: "IPM Careers Leads", address: "info@ipmcareer.com" },
    to: to || TO(),
    replyTo: email || undefined,
    subject: `New ${source} lead: ${name || phone || "student"}${rest.City ? ` (${rest.City})` : ""}`,
    html, text,
  };
}

async function sendWithin(msg, ms = 6000) {
  return Promise.race([mailer().sendMail(msg), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}

/**
 * source: e.g. "CAT Score Calculator"
 * lead:   { name, phone, email, ...anything else to show }
 * page:   URL of the page the lead came from
 * to:     optional recipient (defaults to LEAD_NOTIFY_TO / vivekgurumantra2@gmail.com)
 */
export async function notifyLead(source, lead = {}, page = "", to = "") {
  const msg = buildLeadEmail(source, lead, page, to);
  let error = "Email is not configured";
  if (mailConfigured()) {
    try { await sendWithin(msg); return true; } catch (e) { error = String(e?.message || e).slice(0, 300); }
  }
  console.error("lead notify failed, queued:", source, error);
  try {
    const c = db();
    if (c) await c.from("lead_notify_queue").insert({ source, lead, page: page || null, to_addr: msg.to, attempts: 1, last_error: error });
  } catch (e) { console.error("lead queue insert failed:", e?.message); }
  return false;
}

// Re-send queued lead emails (oldest first). Returns { sent, failed, pending }.
export async function resendQueued(limit = 40) {
  const c = db();
  if (!c) return { error: "no database" };
  const { data, error } = await c.from("lead_notify_queue").select("id, source, lead, page, to_addr, attempts, created_at").eq("status", "pending").order("created_at").limit(limit);
  if (error) return { error: error.message };
  let sent = 0, failed = 0, lastError = null;
  for (const q of data || []) {
    const msg = buildLeadEmail(q.source, q.lead || {}, q.page || "", q.to_addr, q.created_at);
    try {
      await sendWithin(msg, 8000);
      await c.from("lead_notify_queue").update({ status: "sent", sent_at: new Date().toISOString(), attempts: q.attempts + 1 }).eq("id", q.id);
      sent++;
    } catch (e) {
      failed++;
      lastError = String(e?.message || e).slice(0, 300);
      await c.from("lead_notify_queue").update({ attempts: q.attempts + 1, last_error: lastError, status: q.attempts + 1 >= 2000 ? "gave_up" : "pending" }).eq("id", q.id);
      if (/535|auth|invalid login|not configured/i.test(lastError)) break; // mail is down: stop for this run
    }
  }
  const { count } = await c.from("lead_notify_queue").select("id", { count: "exact", head: true }).eq("status", "pending");
  return { sent, failed, pending: count || 0, lastError };
}
