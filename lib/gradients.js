// Category-themed gradient palette for blog covers + news category badges.
// Each entry is used by:
//   - the static cards in /blogs and /news (CSS background-image)
//   - the dynamic OG image at /api/og/[slug] (SVG <linearGradient>)
//
// Keeping a single source of truth means a category re-skin is one edit.

export const GRADIENTS = {
  'orange-noir':   { stops: ['#0a0c14', '#1a0d05', '#3d1f08'], accent: '#f9a01b', label: 'Default' },
  'IPMAT':         { stops: ['#0a0c14', '#2b0e0a', '#4d1408'], accent: '#f9a01b', label: 'IPMAT' },
  'IIM News':      { stops: ['#070b1a', '#0d1638', '#1a2a6b'], accent: '#7aa2ff', label: 'IIM News' },
  'BBA/BMS':       { stops: ['#06141a', '#0a2a36', '#0d4854'], accent: '#34d2cc', label: 'BBA / BMS' },
  'Boards':        { stops: ['#150a1c', '#2a0e3a', '#4a1a66'], accent: '#c084fc', label: 'Boards' },
  'Govt Exams':    { stops: ['#0a1408', '#0e2a14', '#184a1f'], accent: '#4ade80', label: 'Govt Exams' },
  'Career':        { stops: ['#0e1408', '#1d2a08', '#3a4a0d'], accent: '#facc15', label: 'Career' },
  'Scholarships':  { stops: ['#1a0a0d', '#3a0d1a', '#660d2a'], accent: '#fb7185', label: 'Scholarships' },
  'Industry':      { stops: ['#0a0e14', '#101a2a', '#1a2a4a'], accent: '#94a3b8', label: 'Industry' },
};

export const CATEGORY_ORDER = [
  'IPMAT', 'IIM News', 'BBA/BMS', 'Boards', 'Govt Exams', 'Career', 'Scholarships', 'Industry'
];

export function gradientFor(key) {
  return GRADIENTS[key] || GRADIENTS['orange-noir'];
}

// CSS string used in inline styles on cards
export function gradientCss(key) {
  const g = gradientFor(key);
  return `linear-gradient(135deg, ${g.stops[0]} 0%, ${g.stops[1]} 50%, ${g.stops[2]} 100%)`;
}

// "1h ago" / "3d ago" / "2w ago"
export function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const now  = Date.now();
  const s = Math.max(0, Math.floor((now - then) / 1000));
  if (s < 60)         return `${s}s ago`;
  if (s < 3600)       return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)      return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7)  return `${Math.floor(s / 86400)}d ago`;
  if (s < 86400 * 30) return `${Math.floor(s / (86400 * 7))}w ago`;
  return `${Math.floor(s / (86400 * 30))}mo ago`;
}
