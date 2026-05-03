// Dynamic OG image generator: /api/og/[slug]
// Renders a branded 1200×630 cover at request time using @vercel/og.
// Used for og:image and twitter:image on blog posts.
//
// Design notes:
//   - Built progressively from the proven /api/og-test pattern that we know
//     renders cleanly. Removed the Supabase REST fetch — it was suspected of
//     hanging silently in edge runtime, and we don't actually need it: the
//     slug already encodes the title (with hyphens), and category we read
//     from a query param when needed.
//   - Every parent of mixed/multiple children has display:flex (Satori req).
//   - All text wrapped in <span> with parent display:flex.
//   - No custom fontFamily — Satori uses its default sans, which renders fine.

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// Category gradients duplicated inline so we don't import from outside.
// Edge runtime is happiest when the route is fully self-contained.
const GRADIENTS = {
  'IPMAT':        { stops: ['#0a0c14', '#2b0e0a', '#4d1408'], accent: '#f9a01b' },
  'IIM News':     { stops: ['#070b1a', '#0d1638', '#1a2a6b'], accent: '#7aa2ff' },
  'BBA/BMS':      { stops: ['#06141a', '#0a2a36', '#0d4854'], accent: '#34d2cc' },
  'Boards':       { stops: ['#150a1c', '#2a0e3a', '#4a1a66'], accent: '#c084fc' },
  'Govt Exams':   { stops: ['#0a1408', '#0e2a14', '#184a1f'], accent: '#4ade80' },
  'Career':       { stops: ['#0e1408', '#1d2a08', '#3a4a0d'], accent: '#facc15' },
  'Scholarships': { stops: ['#1a0a0d', '#3a0d1a', '#660d2a'], accent: '#fb7185' },
  'Industry':     { stops: ['#0a0e14', '#101a2a', '#1a2a4a'], accent: '#94a3b8' },
  'default':      { stops: ['#0a0c14', '#1a0d05', '#3d1f08'], accent: '#f9a01b' },
};

// Slug "iim-rohtak-ipm-placements-2025-...-cp8ib" → "Iim Rohtak Ipm Placements 2025 ..."
function titleFromSlug(slug) {
  return (slug || '')
    .replace(/-[a-z0-9]{5}$/, '') // strip 5-char random suffix
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function handler(req) {
  const { searchParams, pathname } = new URL(req.url);
  const slug = pathname.split('/').pop();

  const titleParam    = searchParams.get('title');
  const subtitleParam = searchParams.get('subtitle');
  const categoryParam = searchParams.get('category');

  const title    = titleParam    || titleFromSlug(slug) || 'IPM Careers';
  const subtitle = subtitleParam || 'Built for the future IIMer';
  const category = categoryParam || 'IPMAT';
  const g = GRADIENTS[category] || GRADIENTS['default'];

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
          color: 'white',
        }}
      >
        {/* Top: category pill + brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: 999,
              border: `2px solid ${g.accent}`,
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: g.accent,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 4,
            }}
          >
            <span style={{ textTransform: 'uppercase' }}>{category}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: g.accent,
                marginRight: 12,
                display: 'flex',
              }}
            />
            <span>ipmcareer.com</span>
          </div>
        </div>

        {/* Middle: title + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: title.length > 55 ? 60 : 76,
              fontWeight: 900,
              lineHeight: 1.05,
              color: 'white',
            }}
          >
            <span>{title}</span>
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 24,
              fontSize: 28,
              color: 'rgba(255,255,255,0.78)',
              fontWeight: 500,
              lineHeight: 1.3,
              maxWidth: 1000,
            }}
          >
            <span>{subtitle}</span>
          </div>
        </div>

        {/* Bottom: brand */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 800 }}>
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
}
