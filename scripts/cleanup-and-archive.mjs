import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';
import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const get = k => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('NEXT_PUBLIC_SUPABASE_SERVICE_KEY') || get('SUPABASE_SERVICE_KEY'), { auth: { persistSession: false } });
marked.setOptions({ breaks: false, gfm: true, headerIds: true, mangle: false });

// 1. Archive the fllix duplicate
const FLLIX = 'free-ipmat-2027-study-material-best-books-pdfs-online-resources-fllix';
const { data: cur } = await sb.from('blogs').select('*').eq('slug', FLLIX).single();
if (cur) {
  fs.writeFileSync(`scripts/backup-${FLLIX}-${Date.now()}.json`, JSON.stringify(cur, null, 2));
  const { error } = await sb.from('blogs').update({ status: 'archived' }).eq('slug', FLLIX);
  console.log(error ? `ARCHIVE ERROR: ${error.message}` : `archived: ${FLLIX}`);
}

// 2. Repoint internal links from archived slugs to their canonical targets
const MAP = {
  'best-bba-colleges-in-india-2026-a-guide-to-placements-fees-roi-1lj0c': 'best-bba-colleges-in-india-2026-placements-roi-fees-compared-jfzqj',
  'best-bba-colleges-in-india-2026-a-guide-to-placements-fees-roi-8owt6': 'best-bba-colleges-in-india-2026-placements-roi-fees-compared-jfzqj',
  'free-ipmat-2027-study-material-best-books-pdfs-online-resources-fllix': 'free-ipmat-2027-study-material-best-books-pdfs-resources-30ra2',
};
const TARGETS = new Set(Object.values(MAP));
const { data: all, error: allErr } = await sb.from('blogs').select('id, slug, body_md, body_html');
if (allErr) { console.error('SCAN ERROR:', allErr.message); process.exit(1); }

let fixed = 0;
for (const row of all) {
  if (TARGETS.has(row.slug)) continue;           // never self-link the canonical pages
  let md = row.body_md || '', html = row.body_html || '', touched = false;
  for (const [oldSlug, newSlug] of Object.entries(MAP)) {
    if (md.includes(oldSlug) || html.includes(oldSlug)) {
      md = md.split(oldSlug).join(newSlug);
      html = html.split(oldSlug).join(newSlug);
      touched = true;
    }
  }
  if (touched) {
    const { error } = await sb.from('blogs').update({ body_md: md, body_html: html }).eq('id', row.id);
    console.log(error ? `  link-fix ERROR ${row.slug}: ${error.message}` : `  link-fixed: ${row.slug}`);
    if (!error) fixed++;
  }
}
console.log(`\nInternal-link cleanup done. ${fixed} blog(s) updated.`);
