// Dynamic OG image generator: /api/og/[slug]
// Renders an EduNext-style branded cover (1200×630) at request time using
// @vercel/og — no static image storage required. Used for og:image and
// twitter:image on blog posts and (optionally) for /news article fallbacks.
//
// Install once:   npm i @vercel/og

import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';
import { gradientFor } from '../../../lib/gradients';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams, pathname } = new URL(req.url);
  // pathname e.g. /api/og/my-blog-slug
  const slug = pathname.split('/').pop();

  // Allow overrides via query string for previewing / news cards
  const overrideTitle    = searchParams.get('title');
  const overrideSubtitle = searchParams.get('subtitle');
  const overrideCategory = searchParams.get('category') || 'IPMAT';

  let title    = overrideTitle    || 'IPM Careers';
  let subtitle = overrideSubtitle || 'Built for the future IIMer';
  let category = overrideCategory;

  if (slug && slug !== 'default' && !overrideTitle) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data } = await supabase
        .from('blogs')
        .select('cover_title, cover_subtitle, category')
        .eq('slug', slug)
        .maybeSingle();
      if (data) {
        title    = data.cover_title || title;
        subtitle = data.cover_subtitle || subtitle;
        category = data.category || category;
      }
    } catch (_) { /* fall through with defaults */ }
  }

  const g = gradientFor(category);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          backgroundImage: `linear-gradient(135deg, ${g.stops[0]} 0%, ${g.stops[1]} 50%, ${g.stops[2]} 100%)`,
          fontFamily: 'Inter, system-ui',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Dot grid overlay */}
        <div
          style={{
            position: 'absolute', inset: 0, opacity: 0.18,
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Top: category pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div
            style={{
              display: 'flex', padding: '8px 18px', borderRadius: 999,
              border: `1px solid ${g.accent}55`, background: 'rgba(255,255,255,0.08)',
              color: g.accent, fontSize: 22, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase',
            }}
          >
            {category}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.7)', fontSize: 22, fontWeight: 700 }}>
            <div style={{ width: 14, height: 14, borderRadius: 999, background: g.accent }} />
            ipmcareer.com
          </div>
        </div>

        {/* Center: bold title + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div
            style={{
              fontSize: title.length > 55 ? 64 : 80,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: 'white',
              textShadow: '0 4px 30px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ marginTop: 24, fontSize: 30, color: 'rgba(255,255,255,0.78)', fontWeight: 500, lineHeight: 1.3, maxWidth: '88%' }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom: branded footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
            IPM<span style={{ color: g.accent }}>Careers</span>
          </div>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 4, fontWeight: 700 }}>
            Built for the future IIMer
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
