import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const get = k => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('NEXT_PUBLIC_SUPABASE_SERVICE_KEY') || get('SUPABASE_SERVICE_KEY'), { auth: { persistSession: false } });
marked.setOptions({ breaks: false, gfm: true, headerIds: true, mangle: false });

const ts = Date.now();
const backup = (slug, row) => fs.writeFileSync(`scripts/backup-${slug}-${ts}.json`, JSON.stringify(row, null, 2));

const PILLAR = 'iim-indore-interview-strategy-2026-a-guide-for-future-iimers-5pbwg';
const PILLAR_PATH = `/magazine/${PILLAR}`;

// Articles that mention wat-pi but serve a DIFFERENT intent — never fold these in.
const PROTECT = new Set([
  'ipmat-result-2026-iim-indore-shortlist-date-wat-pi-what-to-do-next',
]);

// 1. Discover every interview-prep duplicate (slug contains "interview"), excluding the pillar + protected + already archived.
const { data: all, error } = await sb.from('blogs').select('id, slug, status, body_md, body_html');
if (error) { console.error('SCAN ERROR:', error.message); process.exit(1); }

const cluster = all.filter(b =>
  b.slug.includes('interview') &&
  b.slug !== PILLAR &&
  !PROTECT.has(b.slug) &&
  b.status !== 'archived'
);

console.log(`Found ${cluster.length} interview articles to fold into the pillar:`);
cluster.forEach(b => console.log('  -', b.slug));
console.log('');

// 2. Archive each + build redirect entries
const interviewRedirects = [];
for (const b of cluster) {
  backup(b.slug, b);
  const { error: e } = await sb.from('blogs').update({ status: 'archived' }).eq('id', b.id);
  console.log(e ? `  ARCHIVE ERROR ${b.slug}: ${e.message}` : `  archived: ${b.slug}`);
  if (!e) interviewRedirects.push({ source: `/magazine/${b.slug}`, destination: PILLAR_PATH, permanent: true });
}

// 3. Retitle the pillar (evergreen, CTR-focused)
{
  const { data: prow, error: pe } = await sb.from('blogs').select('*').eq('slug', PILLAR).single();
  if (pe) { console.error('PILLAR READ ERROR:', pe.message); }
  else {
    backup(PILLAR, prow);
    const upd = {
      title:           'IIM Indore IPM Interview: The Complete WAT-PI Strategy Guide',
      seo_title:       'IIM Indore IPM Interview: WAT-PI Strategy Guide | IPMC',
      seo_description: 'Cleared the IPMAT cutoff? Master the IIM Indore IPM WAT-PI: the process, common questions, evaluation criteria and a proven strategy to convert your call.',
    };
    const { error: pue } = await sb.from('blogs').update(upd).eq('slug', PILLAR);
    console.log(pue ? `PILLAR UPDATE ERROR: ${pue.message}` : '\npillar retitled: ' + PILLAR);
  }
}

// 4. Internal-link cleanup: repoint links from every archived interview slug -> pillar
{
  const MAP = {};
  for (const b of cluster) MAP[b.slug] = PILLAR;
  let fixed = 0;
  for (const r of all) {
    if (r.slug === PILLAR) continue;
    let md = r.body_md || '', html = r.body_html || '', t = false;
    for (const [o, n] of Object.entries(MAP)) {
      if (md.includes(o) || html.includes(o)) { md = md.split(o).join(n); html = html.split(o).join(n); t = true; }
    }
    if (t) {
      const { error: e } = await sb.from('blogs').update({ body_md: md, body_html: html }).eq('id', r.id);
      if (!e) fixed++;
      console.log(e ? `  link-fix ERROR ${r.slug}: ${e.message}` : `  link-fixed: ${r.slug}`);
    }
  }
  console.log(`\nInternal-link cleanup done. ${fixed} blog(s) updated.`);
}

// 5. Write the full redirects.json (existing 4 + the interview redirects)
const BASE = [
  { source: '/magazine/best-bba-colleges-in-india-2026-a-guide-to-placements-fees-roi-1lj0c', destination: '/magazine/best-bba-colleges-in-india-2026-placements-roi-fees-compared-jfzqj', permanent: true },
  { source: '/magazine/best-bba-colleges-in-india-2026-a-guide-to-placements-fees-roi-8owt6', destination: '/magazine/best-bba-colleges-in-india-2026-placements-roi-fees-compared-jfzqj', permanent: true },
  { source: '/magazine/free-ipmat-2027-study-material-best-books-pdfs-online-resources-fllix', destination: '/magazine/free-ipmat-2027-study-material-best-books-pdfs-resources-30ra2', permanent: true },
  { source: '/magazine/iim-bodh-gaya-ipm-admission-2026-cutoffs-fees-placements-1npq8', destination: '/magazine/iim-bodh-gaya-ipm-2026-jipmat-cutoffs-fees-placements-qxnc7', permanent: true },
];
const full = [...BASE, ...interviewRedirects];
fs.writeFileSync('redirects.json', JSON.stringify(full, null, 2));
console.log(`\nredirects.json written with ${full.length} total redirects (${interviewRedirects.length} interview + ${BASE.length} prior).`);
console.log('DONE — interview cluster consolidated into the pillar.');
