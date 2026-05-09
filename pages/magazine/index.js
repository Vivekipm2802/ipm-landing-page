// /blogs — public blog index.
// Server-rendered (SSR via getServerSideProps) for fresh content + SEO.
// Reads from the `recent_blogs` view in Supabase using the anon client.

import Head from 'next/head';
import { useState, useMemo } from 'react';
import { getSupabaseServer } from '../../utils/supabaseClient';
import IPMNav from '../../components/IPMNav';
import MagazineCard from '../../components/MagazineCard';
import { CATEGORY_ORDER } from '../../lib/gradients';

export async function getServerSideProps({ res }) {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('recent_blogs')
    .select('*')
    .limit(60);

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
  return { props: { blogs: data || [], error: error?.message || null } };
}

export default function BlogsIndex({ blogs }) {
  const [category, setCategory] = useState('All');
  const [query, setQuery]       = useState('');

  const filtered = useMemo(() => {
    let list = blogs;
    if (category !== 'All') list = list.filter(b => b.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.excerpt || '').toLowerCase().includes(q) ||
        (b.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [blogs, category, query]);

  const featured = filtered[0];
  const rest     = filtered.slice(1);

  return (
    <>
      <Head>
        <title>Magazine · IPM Careers — Built for IPMAT aspirants</title>
        <meta
          name="description"
          content="The IPM Careers Magazine — daily long reads on IPMAT prep, IIM Indore IPM, IIM Rohtak, BBA admissions and careers after IPM. Honest. Aspirant-first. Updated every day."
        />
        <meta property="og:title" content="IPM Careers Magazine" />
        <meta property="og:description" content="Daily long reads on IPMAT, IIM IPM and careers in management." />
        <meta property="og:type" content="website" />
        <link rel="icon" href="https://register.ipmcareer.com/favicon_ipm.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div style={{ background: '#05070a', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
        <IPMNav />

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-[#f9a01b] animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#f9a01b]">
              Updated daily · 2 fresh blogs every morning
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#f1f5f9]">
            The IPM<span className="text-[#f9a01b]">Careers</span> Magazine
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#94a3b8] max-w-2xl">
            Hard-earned playbooks on IPMAT, IIM IPM admissions, and what life
            looks like once you crack it. Built for the future IIMer.
          </p>

          {/* Search + filter row */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search blogs by topic, IIM, or exam..."
                className="w-full bg-[#0f1117] border border-[#1e2533] focus:border-[#f9a01b] text-[#f1f5f9] placeholder-[#64748b] rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-colors"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
          </div>

          <div className="mt-5 -mx-1 flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
            {['All', ...CATEGORY_ORDER].map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={
                  'shrink-0 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-all whitespace-nowrap mx-1 ' +
                  (category === c
                    ? 'bg-[#f9a01b] text-[#0a0c14] shadow-[0_4px_18px_-4px_rgba(249,160,27,0.6)]'
                    : 'bg-[#0f1117] text-[#94a3b8] border border-[#1e2533] hover:text-[#f1f5f9] hover:border-[#f9a01b]/40')
                }
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-[#64748b]">
              <p className="text-lg">No blogs match that filter — yet.</p>
              <p className="text-sm mt-2">New posts publish every day at 6 AM IST.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {featured && <MagazineCard blog={featured} featured />}
              {rest.map(b => <MagazineCard key={b.id} blog={b} />)}
            </div>
          )}
        </section>

        <footer className="border-t border-[#1e2533] py-8 text-center text-xs text-[#64748b]">
          © {new Date().getFullYear()} IPM Careers · Built for the future IIMer
        </footer>
      </div>
    </>
  );
}
