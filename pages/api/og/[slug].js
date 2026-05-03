// Dynamic OG image generator: /api/og/[slug]
// Renders a branded 1200×630 cover at request time using @vercel/og.
// Used for og:image and twitter:image on blog posts.
//
// Notes for Satori (the SVG renderer behind @vercel/og):
//   - Every parent of mixed/multiple children needs `display: 'flex'`.
//   - Text inside an element with siblings must be wrapped in its own <span>/<div>.
//   - Don't reference custom fonts unless we load them explicitly — otherwise
//     Satori falls back silently and may emit empty bytes.
//
// We deliberately don't import Supabase here. Edge runtime + Supabase JS has
// occasionally produced empty responses; the slug already encodes the title
// (with hyphens) so we can render the cover without a DB lookup. Cover title
// can also be passed via ?title=, ?subtitle=, ?category= for previewing.

import { ImageResponse } from '@vercel/og';
import { gradientFor } from '../../../lib/gradients';

export const config = { runtime: 'edge' };

// Pull blog metadata from Supabase via REST (no SDK = no edge-runtime gotchas).
async function fetchBlogMeta(slug) {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || !slug) return null;
  try {
    const r = await fetch(
      `${url}/rest/v1/blogs?slug=eq.${encodeURIComponent(slug)}&select=cover_title,cover_subtitle,category&limit=1`,
      { headers: { apikey: anon, authorization: `Bearer ${anon}` } }
    );
    if (!r.ok) return null;
    const rows = await r.json();
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch { return null; }
}

// Slug "iim-indore-ipm-cutoffs-..." → "Iim Indore Ipm Cutoffs ..."
// Used as a fallback title when the blog row is missing.
function titleFromSlug(slug) {
  return (slug || '')
    .replace(/-[a-z0-9]{5}$/, '')        // strip random suffix
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default async function handler(req) {
  try {
    const { searchParams, pathname } = new URL(req.url);
    const slug = pathname.split('/').pop();

    let title    = searchParams.get('title')    || titleFromSlug(slug) || 'IPM Careers';
    let subtitle = searchParams.get('subtitle') || 'Built for the future IIMer';
    let category = searchParams.get('category') || 'IPMAT';

    if (!searchParams.get('title') && slug) {
      const meta = await fetchBlogMeta(slug);
      if (meta) {
        title    = meta.cover_title    || title;
        subtitle = meta.cover_subtitle || subtitle;
        category = meta.category       || category;
      }
    }

    const g = gradientFor(category);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', padding: '64px 72px',
            backgroundImage: `linear-gradient(135deg, ${g.stops[0]} 0%, ${g.stops[1]} 50%, ${g.stops[2]} 100%)`,
            color: 'white', position: 'relative',
          }}
        >
          {/* dot grid overlay */}
          <div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.18,
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)',
              backgroundSize: '28px 28px', display: 'flex',
            }}
          />

          {/* top row: category pill + brand mark */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div
              style={{
                display: 'flex', padding: '8px 18px', borderRadius: 999,
                border: `2px solid ${g.accent}`, backgroundColor: 'rgba(255,255,255,0.08)',
                color: g.accent, fontSize: 22, fontWeight: 800, letterSpacing: 4,
              }}
            >
              <span style={{ textTransform: 'uppercase' }}>{category}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 22, fontWeight: 700 }}>
              <div style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: g.accent, marginRight: 12, display: 'flex' }} />
              <span>ipmcareer.com</span>
            </div>
          </div>

          {/* center: title + subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div
              style={{
                display: 'flex', fontSize: title.length > 55 ? 60 : 76,
                fontWeight: 900, lineHeight: 1.05, color: 'white',
                textShadow: '0 4px 30px rgba(0,0,0,0.5)',
              }}
            >
              <span>{title}</span>
            </div>
            <div
              style={{
                display: 'flex', marginTop: 24, fontSize: 28, color: 'rgba(255,255,255,0.78)',
                fontWeight: 500, lineHeight: 1.3, maxWidth: 1000,
              }}
            >
              <span>{subtitle}</span>
            </div>
          </div>

          {/* bottom: brand footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 800 }}>
              <span>IPM</span>
              <span style={{ color: g.accent }}>Careers</span>
            </div>
            <div style={{ display: 'flex', fontSize: 18, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: 4 }}>Built for the future IIMer</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    // Fall back to a simple solid image with the error short-circuited so
    // we never serve content-length: 0 again.
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#0a0c14', color: '#f9a01b', padding: 60,
          }}
        >
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 900 }}><span>IPM Careers</span></div>
          <div style={{ display: 'flex', fontSize: 22, marginTop: 24, color: '#94a3b8' }}>
            <span>Built for the future IIMer</span>
          </div>
          <div style={{ display: 'flex', fontSize: 14, marginTop: 60, color: '#64748b' }}>
            <span>(cover render error: {String(err?.message || err).slice(0, 80)})</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
