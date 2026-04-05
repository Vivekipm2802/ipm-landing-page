/**
 * GET /api/send-exam-alerts?secret=YOUR_CRON_SECRET
 *
 * Called daily by a cron job / Vercel cron.
 * Checks Supabase for subscriptions whose deadline is approaching,
 * sends reminder emails at: 7 days, 3 days, 1 day, and 0 days before.
 *
 * Protect with a secret to prevent public access.
 */

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

const CRON_SECRET = process.env.CRON_SECRET || 'ipm-cron-2026';

// ── Email config (ZeptoMail) ─────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.zeptomail.in',
    port: 587,
    secure: false,
    auth: {
      user: 'emailapikey',
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Email template ───────────────────────────────────────────────────────────
function buildEmailHTML({ examName, lastDate, daysLeft, commandCenterUrl }) {
  const urgencyColor = daysLeft === 0 ? '#ef4444' : daysLeft === 1 ? '#f97316' : '#f9a01b';
  const urgencyLabel =
    daysLeft === 0 ? '🚨 TODAY is the Last Day!'
    : daysLeft === 1 ? '⚠️ Tomorrow is the Last Day!'
    : `⏰ ${daysLeft} Days Left to Apply`;

  const ctaText = daysLeft <= 1 ? 'Apply RIGHT NOW →' : 'Apply Before It Closes →';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#05070a;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="480" cellpadding="0" cellspacing="0"
        style="background:#0f1117;border:1px solid #1e2533;border-radius:20px;overflow:hidden;max-width:480px;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a0f00,#0f1117);padding:28px 32px;text-align:center;">
            <img src="https://register.ipmcareer.com/whitelogoipm.svg"
              alt="IPM Careers" height="36" style="margin-bottom:16px;"/>
            <div style="display:inline-block;padding:8px 20px;border-radius:999px;
              background:${urgencyColor}22;border:1px solid ${urgencyColor}55;">
              <span style="color:${urgencyColor};font-weight:700;font-size:14px;">${urgencyLabel}</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;font-weight:800;">
              ${examName}
            </h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
              Application deadline reminder from IPM Careers
            </p>

            <!-- Deadline card -->
            <div style="background:#0a0c14;border:1px solid ${urgencyColor}44;
              border-radius:14px;padding:20px 24px;margin-bottom:24px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="color:#64748b;font-size:13px;font-weight:600;">LAST DATE TO APPLY</span>
                <span style="color:${urgencyColor};font-size:15px;font-weight:800;">${lastDate}</span>
              </div>
              ${daysLeft === 0 ? `
              <div style="margin-top:12px;padding:10px 14px;background:${urgencyColor}15;
                border-radius:8px;text-align:center;">
                <span style="color:${urgencyColor};font-size:13px;font-weight:700;">
                  This is your FINAL reminder. Apply today or miss out!
                </span>
              </div>` : ''}
            </div>

            <!-- Steps reminder -->
            <p style="margin:0 0 12px;color:#94a3b8;font-size:13px;font-weight:600;">
              WHAT TO DO NOW:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              ${['Visit the official application page', 'Keep documents ready (marksheets, ID proof, photo)', 'Pay the application fee', 'Download the confirmation receipt'].map((step, i) => `
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <span style="display:inline-block;width:22px;height:22px;border-radius:50%;
                    background:#f9a01b22;color:#f9a01b;font-size:11px;font-weight:700;
                    text-align:center;line-height:22px;margin-right:10px;">${i + 1}</span>
                  <span style="color:#cbd5e1;font-size:13px;">${step}</span>
                </td>
              </tr>`).join('')}
            </table>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${commandCenterUrl}"
                style="display:inline-block;padding:14px 32px;background:#f9a01b;
                color:#0a0c14;font-size:15px;font-weight:800;border-radius:12px;
                text-decoration:none;">${ctaText}</a>
            </div>

            <!-- Footer note -->
            <p style="margin:0;color:#334155;font-size:12px;text-align:center;line-height:1.6;">
              You subscribed to deadline reminders on the
              <a href="${commandCenterUrl}" style="color:#f9a01b;text-decoration:none;">AIR 1 Command Center</a>.<br/>
              To stop reminders, simply ignore future emails — no spam, we promise.
            </p>
          </td>
        </tr>

        <!-- Footer brand -->
        <tr>
          <td style="background:#0a0c14;padding:16px 32px;text-align:center;
            border-top:1px solid #1e2533;">
            <span style="color:#334155;font-size:11px;">
              © IPM Careers · India's #1 IPMAT Coaching · ipmcareer.com
            </span>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Send one email ────────────────────────────────────────────────────────────
async function sendReminderEmail({ to, examName, lastDate, daysLeft }) {
  const transporter = createTransporter();
  const commandCenterUrl = 'https://register.ipmcareer.com/air1commandcenter';

  const subjects = {
    7: `📅 7 Days Left — Apply for ${examName} by ${lastDate}`,
    3: `⚡ 3 Days Left — Don't Miss ${examName} Deadline!`,
    1: `⚠️ Tomorrow is the Last Day! Apply for ${examName} NOW`,
    0: `🚨 TODAY is the LAST DAY to Apply for ${examName}!`,
  };

  await transporter.sendMail({
    from: { name: 'IPM Careers', address: 'info@ipmcareer.com' },
    to,
    subject: subjects[daysLeft] || `Deadline Reminder: ${examName}`,
    html: buildEmailHTML({ examName, lastDate, daysLeft, commandCenterUrl }),
  });
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  // Auth check
  if (req.query.secret !== CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const results = { sent: [], errors: [], skipped: 0 };

  // Fetch all active subscriptions that have a parsed deadline
  const { data: subs, error: fetchError } = await supabase
    .from('exam_notifications')
    .select('*')
    .eq('is_active', true)
    .not('last_date_parsed', 'is', null);

  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return res.status(500).json({ error: 'Database fetch failed' });
  }

  for (const sub of subs || []) {
    const deadline = new Date(sub.last_date_parsed);
    deadline.setHours(0, 0, 0, 0);
    const daysLeft = Math.round((deadline - today) / (1000 * 60 * 60 * 24));

    // Check each reminder window
    const reminders = [
      { days: 7, field: 'notified_7d' },
      { days: 3, field: 'notified_3d' },
      { days: 1, field: 'notified_1d' },
      { days: 0, field: 'notified_0d' },
    ];

    for (const { days, field } of reminders) {
      if (daysLeft === days && !sub[field]) {
        try {
          await sendReminderEmail({
            to: sub.email,
            examName: sub.exam_name,
            lastDate: sub.last_date,
            daysLeft: days,
          });

          // Mark as sent
          await supabase
            .from('exam_notifications')
            .update({ [field]: true })
            .eq('id', sub.id);

          results.sent.push({ email: sub.email, exam: sub.exam_name, daysLeft: days });
          console.log(`✓ Sent ${days}d reminder to ${sub.email} for ${sub.exam_name}`);
        } catch (err) {
          console.error(`✗ Failed for ${sub.email} / ${sub.exam_name}:`, err.message);
          results.errors.push({ email: sub.email, exam: sub.exam_name, error: err.message });
        }
      }
    }

    // Deactivate if deadline has passed by more than 2 days
    if (daysLeft < -2 && sub.is_active) {
      await supabase
        .from('exam_notifications')
        .update({ is_active: false })
        .eq('id', sub.id);
      results.skipped++;
    }
  }

  console.log(`Done. Sent: ${results.sent.length}, Errors: ${results.errors.length}`);
  return res.status(200).json({
    success: true,
    date: today.toISOString().split('T')[0],
    ...results,
  });
}
