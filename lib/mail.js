// One place to send email through ZeptoMail. Tries ZEPTOMAIL_API_KEY (port 465) first, then SMTP_PASS (port 587),
// so one stale credential in Vercel cannot silently stop lead / alert emails. Server only.
import nodemailer from "nodemailer";

const creds = () => [
  process.env.ZEPTOMAIL_API_KEY && { pass: process.env.ZEPTOMAIL_API_KEY, port: 465, secure: true },
  process.env.SMTP_PASS && { pass: process.env.SMTP_PASS, port: 587, secure: false },
].filter(Boolean);

const transports = {};
export const mailConfigured = () => creds().length > 0;

export async function sendMail(msg) {
  let last = null;
  for (const c of creds()) {
    if (!transports[c.port]) {
      transports[c.port] = nodemailer.createTransport({ host: process.env.ZEPTOMAIL_SERVER || "smtp.zeptomail.in", port: c.port, secure: c.secure, auth: { user: "emailapikey", pass: c.pass } });
    }
    try {
      return await transports[c.port].sendMail(msg);
    } catch (e) {
      last = e;
      if (!/535|auth|invalid login|credential/i.test(String(e?.message || ""))) throw e; // only fall through on login problems
    }
  }
  throw last || new Error("Email is not configured");
}

export const sharedMailer = () => ({ sendMail });
