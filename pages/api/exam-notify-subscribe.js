/**
 * POST /api/exam-notify-subscribe
 * Saves a student's email + exam + deadline to Supabase
 * so they get reminder emails 7d, 3d, 1d, and 0d before the last date to apply.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY   // service key to bypass RLS
);

// Parses date strings like "14th March '2026", "26th May'2026", "06 April '26", "April 15, 2026"
function parseIndianDate(str) {
  if (!str || str === 'To be announced' || str === 'Coming Soon') return null;

  // Normalize: remove ordinal suffixes, smart apostrophes, extra spaces
  let s = str
    .replace(/(\d+)(st|nd|rd|th)/gi, '$1')
    .replace(/['\u2019]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Handle "26th May2026" → "26 May 2026" (missing space before year)
  s = s.replace(/([A-Za-z])(\d{4})/, '$1 $2');

  // Handle 2-digit years like "26" → "2026"
  s = s.replace(/\b(\d{2})\s*$/, (m, y) => (parseInt(y) < 50 ? '20' + y : '19' + y));

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]; // YYYY-MM-DD
}

export default async function handler(req, res) {
  // Allow CORS from register.ipmcareer.com
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, examName, lastDate } = req.body || {};

  if (!email || !examName) {
    return res.status(400).json({ error: 'email and examName are required' });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const lastDateParsed = parseIndianDate(lastDate);

  // Upsert — don't create duplicate subscriptions for same email+exam
  const { error } = await supabase
    .from('exam_notifications')
    .upsert(
      {
        email: email.toLowerCase().trim(),
        exam_name: examName,
        last_date: lastDate || 'To be announced',
        last_date_parsed: lastDateParsed,
        notified_7d: false,
        notified_3d: false,
        notified_1d: false,
        notified_0d: false,
        is_active: true,
      },
      { onConflict: 'email,exam_name' }
    );

  if (error) {
    console.error('Supabase upsert error:', error);
    return res.status(500).json({ error: 'Failed to save subscription' });
  }

  return res.status(200).json({ success: true, message: 'Subscribed successfully' });
}
