import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf8');
const get = k => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('NEXT_PUBLIC_SUPABASE_SERVICE_KEY') || get('SUPABASE_SERVICE_KEY'), { auth: { persistSession: false } });

const dupes = [
  'best-bba-colleges-in-india-2026-a-guide-to-placements-fees-roi-1lj0c',
  'best-bba-colleges-in-india-2026-a-guide-to-placements-fees-roi-8owt6',
];
for (const slug of dupes) {
  const { data: cur } = await sb.from('blogs').select('*').eq('slug', slug).single();
  if (!cur) { console.log('NOT FOUND:', slug); continue; }
  fs.writeFileSync(`scripts/backup-${slug}-${Date.now()}.json`, JSON.stringify(cur, null, 2));
  const { error } = await sb.from('blogs').update({ status: 'archived' }).eq('slug', slug);
  console.log(error ? `ERROR ${slug}: ${error.message}` : `archived: ${slug}`);
}
