// POST /api/publish-blog
// Inserts a pre-written blog post directly into Supabase.
// Self-contained: no shared lib imports so there are no dependency issues.
//
// Request:
//   POST /api/publish-blog
//   Headers: Authorization: Bearer <CONTENT_AUTOMATION_TOKEN>
//   Body (JSON): { title, excerpt, body_md, category, seo_title?, seo_description?,
//                  seo_keywords?, tags?, cover_title?, cover_subtitle?,
//                  faq?, author_slug?, slug_prefix? }
//
// Response: { ok, slug, url } | { ok: false, error }

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'POST only.' });
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  const expected = process.env.CONTENT_AUTOMATION_TOKEN;
  if (!expected) return res.status(500).json({ ok: false, error: 'CONTENT_AUTOMATION_TOKEN not set.' });
  const got = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (got !== expected) return res.status(401).json({ ok: false, error: 'Unauthorized.' });

  try {
    const {
      title, excerpt = '', body_md, category = 'general',
      seo_title, seo_description = '', seo_keywords = [],
      tags = [], cover_title = '', cover_subtitle = '',
      faq = [], author_slug = 'ipm-careers', slug_prefix,
    } = req.body || {};

    if (!title || !body_md) {
      return res.status(400).json({ ok: false, error: 'title and body_md are required.' });
    }

    // ── Slug ─────────────────────────────────────────────────────────────────
    const slugify = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
    const suffix  = Math.random().toString(36).slice(2, 7);
    const slug    = `${slug_prefix || slugify(title)}-${suffix}`;

    // ── Reading time (words / 220 wpm, min 3) ────────────────────────────────
    const words        = body_md.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const reading_time = Math.max(3, Math.ceil(words / 220));

    // ── Build row ─────────────────────────────────────────────────────────────
    const row = {
      slug,
      title,
      excerpt,
      body_md,
      body_html:       body_md,          // rendered client-side by the reader page
      cover_gradient:  category,
      cover_title:     cover_title || title.split(':')[0],
      cover_subtitle,
      category,
      tags,
      reading_time,
      seo_title:       seo_title || title,
      seo_description: seo_description || excerpt,
      seo_keywords:    Array.isArray(seo_keywords) ? seo_keywords : [seo_keywords],
      faq,
      schema_org:      null,
      internal_links:  null,
      author_slug,
      status:          'published',
      published_at:    new Date().toISOString(),
    };

    // ── Insert into Supabase via REST ─────────────────────────────────────────
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_KEY;
    if (!sbUrl || !sbKey) throw new Error('Missing Supabase env vars.');

    const sbRes = await fetch(`${sbUrl}/rest/v1/blogs`, {
      method:  'POST',
      headers: {
        'apikey':        sbKey,
        'Authorization': `Bearer ${sbKey}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=representation',
      },
      body: JSON.stringify(row),
    });

    if (!sbRes.ok) {
      const errText = await sbRes.text();
      throw new Error(`Supabase insert failed (${sbRes.status}): ${errText}`);
    }

    const inserted = await sbRes.json();
    const pubSlug  = Array.isArray(inserted) ? inserted[0]?.slug : inserted?.slug;

    return res.status(200).json({
      ok:   true,
      slug: pubSlug || slug,
      url:  `https://register.ipmcareer.com/magazine/${pubSlug || slug}`,
    });

  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
}
