// One place to send email. Tries ZeptoMail first (ZEPTOMAIL_API_KEY on port 465, then SMTP_PASS on port 587),
// then falls back to Gmail (GMAIL_USER + GMAIL_APP_PASSWORD, a Google "App password"), so one stale credential
// in Vercel cannot silently stop lead / alert / reminder emails. Server only.
import nodemailer from "nodemailer";

const GMAIL_USER = () => (process.env.GMAIL_USER || "ipmcareeronline@gmail.com").trim();
const GMAIL_PASS = () => String(process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

const creds = () => [
  process.env.ZEPTOMAIL_API_KEY && { id: "zepto465", host: process.env.ZEPTOMAIL_SERVER || "smtp.zeptomail.in", user: "emailapikey", pass: process.env.ZEPTOMAIL_API_KEY, port: 465, secure: true },
  process.env.SMTP_PASS && { id: "zepto587", host: process.env.ZEPTOMAIL_SERVER || "smtp.zeptomail.in", user: "emailapikey", pass: process.env.SMTP_PASS, port: 587, secure: false },
  GMAIL_PASS() && { id: "gmail", host: "smtp.gmail.com", user: GMAIL_USER(), pass: GMAIL_PASS(), port: 465, secure: true, gmail: true },
].filter(Boolean);

const transports = {};
export const mailConfigured = () => creds().length > 0;

// Gmail only sends as the signed-in address, so keep the display name, send from the Gmail address
// and point replies at the original sender.
function asGmail(msg, user) {
  const from = msg.from || {};
  const name = typeof from === "object" ? from.name : String(from).replace(/<.*>/, "").trim();
  const orig = typeof from === "object" ? from.address : (String(from).match(/<([^>]+)>/) || [])[1];
  return { ...msg, from: { name: name || "IPM Careers", address: user }, replyTo: msg.replyTo || orig || undefined };
}

export async function sendMail(msg) {
  let last = null;
  for (const c of creds()) {
    if (!transports[c.id]) {
      transports[c.id] = nodemailer.createTransport({ host: c.host, port: c.port, secure: c.secure, auth: { user: c.user, pass: c.pass } });
    }
    try {
      return await transports[c.id].sendMail(c.gmail ? asGmail(msg, c.user) : msg);
    } catch (e) {
      last = e;
      // fall through to the next sender on login problems; on the last sender, give up
      if (!/535|534|auth|invalid login|credential|username and password/i.test(String(e?.message || ""))) throw e;
    }
  }
  throw last || new Error("Email is not configured");
}

export const sharedMailer = () => ({ sendMail });
