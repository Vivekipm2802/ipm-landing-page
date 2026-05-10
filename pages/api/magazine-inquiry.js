// POST /api/magazine-inquiry
// Server-only handler that validates and stores a magazine reader's inquiry.
// Uses the Supabase service-role client so RLS doesn't need to allow public
// inserts (less spam surface).
//
// Body (JSON):
//   { name, email, mobile, target_year, blog_slug, blog_title, blog_category, hp }
//
// 'hp' is a honeypot field — if filled by a bot, we silently 200 and discard.

import crypto from 'crypto';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export const config = { maxDuration: 10 };

// 10 inquiries per IP per hour — keeps casual spam out without burdening real users
const RATE_LIMIT_PER_HOUR = 10;

function clean(s, max = 200) {
  return String(s ?? '').trim().slice(0, max);
}
function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}
function isValidMobile(s) {
  // Accept 10-digit Indian numbers, optionally +91 / 91 / 0 prefix
  const digits = String(s).replace(/[^\d]/g, '');
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91')) || (digits.length === 11 && digits.startsWith('0'));
}
function normaliseMobile(s) {
  const digits = String(s).replace(/[^\d]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0'))  return digits.slice(1);
  return digits;
}

const VALID_TARGET_YEARS = new Set(['2026', '2027', '2028', '2029', 'exploring']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'POST only' });
  }

  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};

    // Honeypot — bots fill hidden fields, real humans don't see them
    if (body.hp) {
      // Silently succeed so the bot thinks it worked
      return res.status(200).json({ ok: true });
    }

    const name        = clean(body.name, 100);
    const email       = clean(body.email, 200).toLowerCase();
    const mobile_raw  = clean(body.mobile, 30);
    const target_year = clean(body.target_year, 30);
    const blog_slug   = clean(body.blog_slug, 200);
    const blog_title  = clean(body.blog_title, 300);
    const blog_category = clean(body.blog_category, 60);

    // ─────── validation ───────
    if (!name || name.length < 2) {
      return res.status(400).json({ ok: false, error: 'Please enter your name.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }
    if (!isValidMobile(mobile_raw)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!VALID_TARGET_YEARS.has(target_year)) {
      return res.status(400).json({ ok: false, error: 'Please pick your IPMAT target year.' });
    }

    const mobile  = normaliseMobile(mobile_raw);
    const ip      = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.socket?.remoteAddress || '';
    const ip_hash = ip ? crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32) : null;
    const user_agent = clean(req.headers['user-agent'], 400);

    // ─────── rate-limit per IP ───────
    if (ip_hash) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from('magazine_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('ip_hash', ip_hash)
        .gte('created_at', oneHourAgo);
      if ((count || 0) >= RATE_LIMIT_PER_HOUR) {
        return res.status(429).json({ ok: false, error: 'Too many submissions from this network. Try again in an hour.' });
      }
    }

    // ─────── dedupe: same email + same blog within 24h → return success without inserting ───────
    if (blog_slug) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: dupe } = await supabaseAdmin
        .from('magazine_inquiries')
        .select('id')
        .eq('email', email)
        .eq('blog_slug', blog_slug)
        .gte('created_at', oneDayAgo)
        .limit(1)
        .maybeSingle();
      if (dupe) {
        return res.status(200).json({ ok: true, dedup: true });
      }
    }

    // ─────── insert ───────
    const { data, error } = await supabaseAdmin
      .from('magazine_inquiries')
      .insert({
        name, email, mobile, target_year,
        blog_slug:    blog_slug    || null,
        blog_title:   blog_title   || null,
        blog_category: blog_category || null,
        source:       'magazine',
        user_agent,
        ip_hash,
      })
      .select('id')
      .single();

    if (error) throw error;

    return res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    console.error('[magazine-inquiry] error:', err);
    return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' });
  }
}
