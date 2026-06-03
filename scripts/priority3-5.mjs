import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const get = k => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('NEXT_PUBLIC_SUPABASE_SERVICE_KEY') || get('SUPABASE_SERVICE_KEY'), { auth: { persistSession: false } });
marked.setOptions({ breaks: false, gfm: true, headerIds: true, mangle: false });

const ts = Date.now();
const backup = (slug, row) => fs.writeFileSync(`scripts/backup-${slug}-${ts}.json`, JSON.stringify(row, null, 2));

// ---------- Priority 3: IPMAT 2027 ultimate guide (u7uzx) ----------
{
  const SLUG = 'ipmat-2027-the-ultimate-guide-to-exams-iims-fees-placements-u7uzx';
  const { data: row, error } = await sb.from('blogs').select('*').eq('slug', SLUG).single();
  if (error) { console.error('P3 READ ERROR:', error.message); }
  else {
    backup(SLUG, row);
    let md = row.body_md || '';
    const before = md;
    md = md.replace(/\(e\.g\.,?\s*August 1, 2004,? for the 2024 cycle\)/gi, "(check that year's official notification for the exact cut-off date)");
    md = md.replace(/August 1, 2004,? for the 2024 cycle/gi, "the cut-off date set in that year's official notification");
    const dateFixed = md !== before;
    const upd = {
      title:           'IPMAT 2027: Complete Guide to Exam, IIMs, Fees & Placements',
      seo_title:       'IPMAT 2027 Guide: Exam, IIMs, Fees & Placements | IPMC',
      seo_description: 'Everything for IPMAT 2027 in one place: Indore vs Rohtak vs JIPMAT patterns, eligibility, 5-year IIM fees and real placement numbers. Start here.',
      body_md:         md,
      body_html:       marked.parse(md),
    };
    const { error: e2 } = await sb.from('blogs').update(upd).eq('slug', SLUG);
    console.log(e2 ? `P3 UPDATE ERROR: ${e2.message}` : `P3 ok: u7uzx title/meta updated | stale-date fixed: ${dateFixed}`);
  }
}

// ---------- Priority 5a: IIM Jammu (xqljk) — title/meta only ----------
{
  const SLUG = 'iim-jammu-ipm-admissions-2026-jipmat-cutoffs-fees-process-xqljk';
  const { data: row, error } = await sb.from('blogs').select('*').eq('slug', SLUG).single();
  if (error) { console.error('P5a READ ERROR:', error.message); }
  else {
    backup(SLUG, row);
    const upd = {
      title:           'IIM Jammu IPM 2026: JIPMAT Cutoff, Fees & Admission Process',
      seo_title:       'IIM Jammu IPM 2026: JIPMAT Cutoff, Fees & Process | IPMC',
      seo_description: 'IIM Jammu IPM 2026 admission guide: JIPMAT cutoffs, 5-year fees, eligibility and step-by-step application process. Everything an aspirant needs.',
    };
    const { error: e2 } = await sb.from('blogs').update(upd).eq('slug', SLUG);
    console.log(e2 ? `P5a UPDATE ERROR: ${e2.message}` : 'P5a ok: IIM Jammu title/meta updated');
  }
}

// ---------- Priority 5b: IIM Bodh Gaya — keep qxnc7, archive 1npq8 ----------
{
  const KEEP = 'iim-bodh-gaya-ipm-2026-jipmat-cutoffs-fees-placements-qxnc7';
  const DROP = 'iim-bodh-gaya-ipm-admission-2026-cutoffs-fees-placements-1npq8';
  const { data: row, error } = await sb.from('blogs').select('*').eq('slug', KEEP).single();
  if (error) { console.error('P5b READ ERROR:', error.message); }
  else {
    backup(KEEP, row);
    const upd = {
      title:           'IIM Bodh Gaya IPM 2026: JIPMAT Cutoff, Fees & Placements',
      seo_title:       'IIM Bodh Gaya IPM 2026: JIPMAT Cutoff, Fees | IPMC',
      seo_description: 'IIM Bodh Gaya IPM 2026: JIPMAT cutoffs, fee structure, eligibility and placement record. Your complete admission guide for the 5-year programme.',
    };
    const { error: e2 } = await sb.from('blogs').update(upd).eq('slug', KEEP);
    console.log(e2 ? `P5b UPDATE ERROR: ${e2.message}` : 'P5b ok: Bodh Gaya qxnc7 title/meta updated');
  }
  const { data: drow } = await sb.from('blogs').select('*').eq('slug', DROP).single();
  if (drow) {
    backup(DROP, drow);
    const { error: e3 } = await sb.from('blogs').update({ status: 'archived' }).eq('slug', DROP);
    console.log(e3 ? `P5b ARCHIVE ERROR: ${e3.message}` : `P5b ok: archived ${DROP}`);
  } else { console.log('P5b: 1npq8 not found (already gone?)'); }
}

// ---------- Internal-link cleanup: 1npq8 -> qxnc7 ----------
{
  const MAP = { 'iim-bodh-gaya-ipm-admission-2026-cutoffs-fees-placements-1npq8': 'iim-bodh-gaya-ipm-2026-jipmat-cutoffs-fees-placements-qxnc7' };
  const TARGETS = new Set(Object.values(MAP));
  const { data: all, error } = await sb.from('blogs').select('id, slug, body_md, body_html');
  if (error) { console.error('cleanup scan error:', error.message); }
  else {
    let fixed = 0;
    for (const r of all) {
      if (TARGETS.has(r.slug)) continue;
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
    console.log(`Internal-link cleanup done. ${fixed} blog(s) updated.`);
  }
}

console.log('\nALL DONE (Priority 3 + 5a Jammu + 5b Bodh Gaya).');
