import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const get = k => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();
const url = get('NEXT_PUBLIC_SUPABASE_URL');
const key = get('NEXT_PUBLIC_SUPABASE_SERVICE_KEY') || get('SUPABASE_SERVICE_KEY');
const sb  = createClient(url, key, { auth: { persistSession: false } });

const slug = 'best-bba-colleges-in-india-2026-placements-roi-fees-compared-jfzqj';
const { data, error } = await sb.from('blogs').select('*').eq('slug', slug).single();
if (error) { console.error('ERROR:', error.message); process.exit(1); }

console.log('COLUMNS:', Object.keys(data).join(', '));
console.log('\ntitle          :', data.title);
console.log('seo_title      :', data.seo_title);
console.log('seo_description:', data.seo_description);
console.log('category       :', data.category, '| author:', data.author_slug, '| status:', data.status);
console.log('cover_title    :', data.cover_title, '| cover_subtitle:', data.cover_subtitle);
console.log('tags           :', JSON.stringify(data.tags));
console.log('seo_keywords   :', JSON.stringify(data.seo_keywords));
console.log('\nfaq is array?  :', Array.isArray(data.faq), '| count:', data.faq?.length);
console.log('faq[0]         :', JSON.stringify(data.faq?.[0], null, 2));
console.log('\nbody_md length :', data.body_md?.length, '| has FAQ inside?:', /frequently asked|##\s*faq/i.test(data.body_md || ''));
console.log('body_html length:', data.body_html?.length);
console.log('\n--- body_md TAIL (last 500 chars) ---\n' + (data.body_md || '').slice(-500));
