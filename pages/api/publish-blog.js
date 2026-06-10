// POST /api/publish-blog
// Inserts a pre-written blog post directly into Supabase (no AI generation).
// Use for manually-written posts where you already have the markdown.
//
// Request:
//   POST /api/publish-blog
//   Headers: Authorization: Bearer <CONTENT_AUTOMATION_TOKEN>
//   Body (JSON): {
//     title, excerpt, body_md, category,
//     seo_title?, seo_description?, seo_keywords?,
//     tags?, cover_title?, cover_subtitle?,
//     faq?, author_slug?, slug_prefix?
//   }
//
// Response: { ok, slug, url } | { ok: false, error }

export const config = { maxDuration: 30 };

import { supabaseAdmin }            from '../../lib/supabaseAdmin';
import { mdToHtml, readingTime }    from '../../lib/markdown';
import { requireAuth, slugify, randSuffix } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only.' });
  if (!requireAuth(req, res)) return;

  try {
    const {
      title, excerpt, body_md, category = 'general',
      seo_title, seo_description, seo_keywords = [],
      tags = [], cover_title = '', cover_subtitle = '',
      faq = [], author_slug = 'ipm-careers',
      slug_prefix,
    } = req.body || {};

    if (!title || !body_md) {
      return res.status(400).json({ ok: false, error: 'title and body_md are required.' });
    }

    const body_html   = mdToHtml(body_md);
    const prefix      = slug_prefix || slugify(title);
    const slug        = `${prefix}-${randSuffix()}`;
    const reading_time = readingTime(body_md);

    const insertRow = {
      slug,
      title,
      excerpt:         excerpt || '',
      body_md,
      body_html,
      cover_gradient:  category,
      cover_title:     cover_title || title.split(':')[0] || title,
      cover_subtitle:  cover_subtitle || '',
      category,
      tags,
      reading_time,
      seo_title:       seo_title   || title,
      seo_description: seo_description || excerpt || '',
      seo_keywords:    Array.isArray(seo_keywords) ? seo_keywords : [seo_keywords],
      faq,
      schema_org:      null,
      internal_links:  null,
      author_slug,
      status:          'published',
      published_at:    new Date().toISOString(),
    };

    const { data: inserted, error } = await supabaseAdmin
      .from('blogs')
      .insert(insertRow)
      .select('id, slug, title')
      .single();

    if (error) throw error;

    // Ping Google sitemap (best-effort)
    fetch('https://www.google.com/ping?sitemap=https://register.ipmcareer.com/sitemap.xml').catch(() => {});

    return res.status(200).json({
      ok:   true,
      slug: inserted.slug,
      url:  `https://register.ipmcareer.com/magazine/${inserted.slug}`,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
}
