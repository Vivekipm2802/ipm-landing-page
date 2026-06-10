import nodemailer from "nodemailer";

/**
 * POST /api/jipmat-notify
 *
 * Emails every JIPMAT calculator submission to the team via Gmail SMTP.
 * Acts as the lead-capture channel when Supabase is unavailable (and as a
 * real-time notification when it is).
 *
 * Required env vars (set in Vercel → Project → Settings → Environment Variables):
 *   GMAIL_USER          — the Gmail address used to send (e.g. yourname@gmail.com)
 *   GMAIL_APP_PASSWORD  — 16-character Google App Password (NOT the account password)
 * Optional:
 *   JIPMAT_LEAD_EMAIL   — recipient address; defaults to GMAIL_USER
 *
 * To create an app password: Google Account → Security → enable 2-Step
 * Verification → App passwords → generate for "Mail".
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, city, category, scores, link, student } =
    req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error("[jipmat-notify] GMAIL_USER / GMAIL_APP_PASSWORD not set");
    return res.status(500).json({ error: "Email not configured" });
  }
  const to = process.env.JIPMAT_LEAD_EMAIL || user;

  const s = scores || {};
  const st = student || {};
  const subjectScore = s.total != null ? `${s.total}/400` : "score pending";

  const row = (label, value) =>
    `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc">${label}</td><td style="padding:6px 12px;border:1px solid #e2e8f0">${value || "—"}</td></tr>`;

  const html = `
    <h2 style="font-family:sans-serif">New JIPMAT Calculator Submission</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      ${row("Name (form)", name)}
      ${row("Name (NTA sheet)", st.participantName)}
      ${row("Phone", phone)}
      ${row("Email", email)}
      ${row("City", city)}
      ${row("Category", (category || "").toUpperCase())}
      ${row("Roll No", st.rollNo)}
      ${row("Application No", st.applicationNo)}
      ${row("Exam Date / Slot", `${st.examDate || "—"} / ${st.slot || "—"}`)}
      ${row("QA", s.qa)}
      ${row("DILR", s.lrdi)}
      ${row("VARC", s.varc)}
      ${row("<strong>Total</strong>", `<strong>${subjectScore}</strong>`)}
      ${row("Response sheet", link ? `<a href="${link}">${link}</a>` : "—")}
    </table>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"JIPMAT Calculator" <${user}>`,
      to,
      subject: `JIPMAT Lead: ${name} — ${subjectScore}`,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[jipmat-notify] Send failed:", err?.message || err);
    return res.status(500).json({ error: "Failed to send notification" });
  }
}
