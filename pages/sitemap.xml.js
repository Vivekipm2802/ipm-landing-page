// Dynamic sitemap.xml — built from Supabase on every request.
// Includes /, /magazine, /news, /air1commandcenter, and every published magazine slug.
// (Note: /blogs is the legacy file-based system — its sitemap entries should come
// from that system separately, not from here.)
// Cache for 6 hours at the edge.

import { createClient } from '@supabase/supabase-js';

const SITE = 'https://register.ipmcareer.com';

function urlNode({ loc, lastmod, changefreq = 'weekly', priority = '0.7' }) {
  return `<url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function getServerSideProps({ res }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1000);

  const today = new Date().toISOString();
  const urls = [
    urlNode({ loc: `${SITE}/`,                  lastmod: today, changefreq: 'daily',  priority: '1.0' }),
    urlNode({ loc: `${SITE}/magazine`,          lastmod: today, changefreq: 'daily',  priority: '0.9' }),
    urlNode({ loc: `${SITE}/news`,              lastmod: today, changefreq: 'hourly', priority: '0.9' }),
    urlNode({ loc: `${SITE}/air1commandcenter`, lastmod: today, changefreq: 'weekly', priority: '0.7' }),
    ...(blogs || []).map(b => urlNode({
      loc: `${SITE}/magazine/${b.slug}`,
      lastmod: (b.updated_at || b.published_at || today),
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function Sitemap() { return null; }
