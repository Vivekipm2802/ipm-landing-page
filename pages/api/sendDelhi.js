// pages/api/sendDelhi.js
// Env vars required in Vercel:
//   MAIL_USER_DELHI  = ipmcareersdelhi25@gmail.com
//   MAIL_PASS_DELHI  = <16-char Gmail app password>

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER_DELHI,
    pass: process.env.MAIL_PASS_DELHI,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { candidateName, whatsappNumber, emailAddress, targetYear, city } = req.body;

  const rows = [
    ['Name', candidateName || '-'],
    ['WhatsApp', whatsappNumber || '-'],
    ['Email', emailAddress || '-'],
    ['Target Year', targetYear || '-'],
    ['City', city || '-'],
    ['Source', 'register.ipmcareer.com/new-delhi'],
  ];

  const tableRows = rows.map(([k, v]) =>
    `<tr><td style="font-weight:bold;background:#f5f5f5;border:1px solid #ddd;padding:8px">${k}</td>` +
    `<td style="border:1px solid #ddd;padding:8px">${v}</td></tr>`
  ).join('');

  const html = `<html><body style="font-family:Arial,sans-serif;color:#111">
    <h2 style="color:#E89624">New Lead — IPM Careers New Delhi</h2>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:500px">
      ${tableRows}
    </table>
    <p style="margin-top:20px;color:#888;font-size:12px">Also saved to Supabase leads table.</p>
  </body></html>`;

  try {
    await transporter.sendMail({
      from: 'IPM Careers Delhi <ipmcareersdelhi25@gmail.com>',
      to: 'ipmcareersdelhi25@gmail.com',
      subject: 'New Lead: ' + (candidateName || 'Unknown') + ' (' + (city || '-') + ') - ' + (targetYear || ''),
      html,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('sendDelhi error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
