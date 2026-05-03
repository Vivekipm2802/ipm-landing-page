// POST /api/aggregate-news
// Pulls fresh news items from approved RSS feeds, dedupes, classifies,
// summarises in IPM Careers voice, and inserts into Supabase.
//
// Designed to be safe to run hourly — uses URL-hash dedupe.

import crypto from 'crypto';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { anthropic, extractJson } from '../../lib/anthropic';
import { requireAuth } from '../../lib/auth';
import { FEEDS, COMPETITOR_DOMAINS, RELEVANCE_KEYWORDS, CATEGORIES } from '../../lib/feeds';

// ───────── tiny RSS/Atom parser (no deps) ─────────
function parseFeed(xml, sourceName) {
  const items = [];
  // Try RSS <item>
  const itemRe = /<item\b[\s\S]*?<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    items.push(parseRssItem(m[0], sourceName));
  }
  // If none, try Atom <entry>
  if (items.length === 0) {
    const entryRe = /<entry\b[\s\S]*?<\/entry>/gi;
    while ((m = entryRe.exec(xml)) !== null) {
      items.push(parseAtomEntry(m[0], sourceName));
    }
  }
  return items.filter(Boolean);
}

function parseRssItem(blob, sourceName) {
  const title = pick(blob, 'title');
  const link  = pick(blob, 'link') || pickAttr(blob, 'guid');
  const desc  = pick(blob, 'description') || pick(blob, 'content:encoded');
  const date  = pick(blob, 'pubDate') || pick(blob, 'dc:date');
  const img   = pickEnclosureUrl(blob) || pickFirstImg(desc || '');
  if (!title || !link) return null;
  return {
    title: stripHtml(title),
    summary_raw: stripHtml(desc).slice(0, 800),
    source_url: link.trim(),
    image_url: img,
    published_at: date ? new Date(date).toISOString() : new Date().toISOString(),
    source_name: sourceName,
  };
}

function parseAtomEntry(blob, sourceName) {
  const title = pick(blob, 'title');
  const linkM = blob.match(/<link[^>]*href=["']([^"']+)["']/i);
  const summary = pick(blob, 'summary') || pick(blob, 'content');
  const date  = pick(blob, 'updated') || pick(blob, 'published');
  if (!title || !linkM) return null;
  return {
    title: stripHtml(title),
    summary_raw: stripHtml(summary).slice(0, 800),
    source_url: linkM[1].trim(),
    image_url: pickFirstImg(summary || ''),
    published_at: date ? new Date(date).toISOString() : new Date().toISOString(),
    source_name: sourceName,
  };
}

function pick(blob, tag) {
  // Handle CDATA + nested
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = blob.match(re);
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim();
}
function pickAttr(blob, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>([^<]+)<`, 'i');
  const m = blob.match(re);
  return m ? m[1].trim() : '';
}
function pickEnclosureUrl(blob) {
  const m = blob.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
  return m ? m[1] : '';
}
function pickFirstImg(html) {
  const m = html.match(/<img[^>]*src=["']([^"']+)["']/i);
  return m ? m[1] : '';
}
function stripHtml(s = '') { return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

// ───────── filters ─────────
function isCompetitor(url) {
  try {
    const host = new URL(url).host.toLowerCase().replace(/^www\./, '');
    return COMPETITOR_DOMAINS.some(d => host === d || host.endsWith('.' + d));
  } catch { return false; }
}
function isRelevant(item) {
  const blob = (item.title + ' ' + item.summary_raw).toLowerCase();
  return RELEVANCE_KEYWORDS.some(k => blob.includes(k));
}
function hashUrl(url) {
  return crypto.createHash('sha256').update(url).digest('hex').slice(0, 24);
}

// ───────── batched classification + summary via Claude Haiku ─────────
async function summariseBatch(items) {
  if (items.length === 0) return [];
  const prompt = `
You are the news editor for IPM Careers (ipmcareer.com). For EACH news item below, output:
- category: one of ${CATEGORIES.join(' | ')}
- summary: 2 short sentences, neutral journalistic tone, ≤ 280 chars
- why_it_matters: ONE punchy line addressing the reader as "you, future IIMer" (or just "you" / "your prep") — what should they do or know? ≤ 160 chars

Hard rules:
- Never name competitors (PhysicsWallah, PW, Toprankers, Unacademy, BYJU'S, Aakash, ALLEN). If the source mentions them, omit the brand and refer to "a major coaching brand".
- If an item is irrelevant to IPMAT/IIM/BBA/management/board exams/govt exams aspirants, set category="SKIP".
- Output ONLY a JSON array. Same order as the input. Length must equal input length.

Schema per item: {"category": string, "summary": string, "why_it_matters": string}

INPUT (numbered):
${items.map((it, i) => `[${i + 1}] TITLE: ${it.title}\nSOURCE: ${it.source_name}\nRAW: ${it.summary_raw.slice(0, 400)}`).join('\n\n')}
`.trim();

  const { text } = await anthropic({
    model: 'claude-haiku-4-5-20251001',
    system: 'You are a precise news classifier. Output ONLY valid JSON arrays.',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
    temperature: 0.3,
  });

  // Extract JSON array (Claude sometimes wraps with ```)
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const start = cleaned.indexOf('[');
  const end   = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('No JSON array in classifier response.');
  return JSON.parse(cleaned.slice(start, end + 1));
}

// ───────── handler ─────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });
  if (!requireAuth(req, res)) return;

  const t0 = Date.now();
  let stats = { fetched: 0, kept: 0, inserted: 0, skipped: 0, errors: [] };

  try {
    // 1. Pull all feeds in parallel (with per-feed error isolation)
    const fetched = await Promise.all(
      FEEDS.map(async f => {
        try {
          const r = await fetch(f.url, { headers: { 'user-agent': 'IPMCareersBot/1.0 (+https://ipmcareer.com)' } });
          if (!r.ok) { stats.errors.push(`${f.name}: HTTP ${r.status}`); return []; }
          const xml = await r.text();
          const items = parseFeed(xml, f.name);
          return items.map(it => ({ ...it, default_category: f.default_category }));
        } catch (e) { stats.errors.push(`${f.name}: ${e.message}`); return []; }
      })
    );
    let items = fetched.flat();
    stats.fetched = items.length;

    // 2. Filter: competitors + relevance + must have hash
    items = items.filter(it => !isCompetitor(it.source_url) && isRelevant(it));

    // 3. Dedupe against DB
    const hashes = items.map(it => hashUrl(it.source_url));
    const { data: existing } = await supabaseAdmin
      .from('news_articles')
      .select('hash')
      .in('hash', hashes);
    const seen = new Set((existing || []).map(r => r.hash));
    items = items.filter(it => !seen.has(hashUrl(it.source_url)));
    // Cap per run to keep Claude cost predictable
    items = items.slice(0, 25);
    stats.kept = items.length;

    if (items.length === 0) {
      await supabaseAdmin.from('content_log').insert({
        kind: 'news_aggregate', status: 'ok', payload: { ...stats, ms: Date.now() - t0 },
      });
      return res.status(200).json({ ok: true, ...stats, ms: Date.now() - t0 });
    }

    // 4. Classify + summarise in one batched LLM call
    const enriched = await summariseBatch(items);
    if (enriched.length !== items.length) throw new Error(`Classifier returned ${enriched.length} for ${items.length} inputs.`);

    // 5. Build rows; drop SKIPs; final brand-safety check
    const banned = ['physicswallah', 'pw.live', 'toprankers', 'unacademy', 'byju', 'aakash', 'allen career'];
    const rows = [];
    for (let i = 0; i < items.length; i++) {
      const e = enriched[i];
      const it = items[i];
      const cat = e.category;
      if (cat === 'SKIP' || !CATEGORIES.includes(cat)) { stats.skipped++; continue; }
      const blob = (e.summary + ' ' + e.why_it_matters).toLowerCase();
      if (banned.some(b => blob.includes(b))) { stats.skipped++; continue; }
      rows.push({
        hash: hashUrl(it.source_url),
        title: it.title,
        summary: e.summary,
        why_it_matters: e.why_it_matters,
        category: cat,
        source_name: it.source_name,
        source_url: it.source_url,
        image_url: it.image_url || null,
        published_at: it.published_at,
      });
    }

    // 6. Insert (ignore unique-violation conflicts silently)
    if (rows.length) {
      const { error } = await supabaseAdmin
        .from('news_articles')
        .upsert(rows, { onConflict: 'hash', ignoreDuplicates: true });
      if (error) throw error;
      stats.inserted = rows.length;
    }

    await supabaseAdmin.from('content_log').insert({
      kind: 'news_aggregate', status: 'ok', payload: { ...stats, ms: Date.now() - t0 },
    });

    return res.status(200).json({ ok: true, ...stats, ms: Date.now() - t0 });
  } catch (err) {
    await supabaseAdmin.from('content_log').insert({
      kind: 'news_aggregate', status: 'error', payload: stats, error: String(err.message || err),
    });
    return res.status(500).json({ ok: false, error: String(err.message || err), stats });
  }
}
