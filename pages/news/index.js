// /news — public news index.
// Server-rendered for fresh content + SEO. Reads from the `recent_news` view.

import Head from 'next/head';
import { useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import IPMNav from '../../components/IPMNav';
import NewsCard from '../../components/NewsCard';
import { CATEGORY_ORDER, gradientFor, timeAgo } from '../../lib/gradients';

export async function getServerSideProps({ res }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data } = await supabase
    .from('recent_news')
    .select('*')
    .limit(80);

  res.setHeader('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=600');
  return { props: { articles: data || [] } };
}

export default function NewsIndex({ articles }) {
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    if (category === 'All') return articles;
    return articles.filter(a => a.category === category);
  }, [articles, category]);

  const pinned = filtered.find(a => a.is_pinned);
  const list   = pinned ? filtered.filter(a => a.id !== pinned.id) : filtered;

  return (
    <>
      <Head>
        <title>Education News for IPMAT &amp; IIM aspirants · IPM Careers</title>
        <meta
          name="description"
          content="Curated daily news on IPMAT, IIM IPM, BBA admissions, government exams, and management careers — every story tagged with what it means for you, future IIMer."
        />
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

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-[#f9a01b] animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#f9a01b]">
              Refreshed every 2 hours · curated for IPMAT aspirants
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#f1f5f9]">
            Education <span className="text-[#f9a01b]">News</span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#94a3b8] max-w-2xl">
            IPMAT, IIM, BBA, Boards &amp; govt exam updates — filtered, summarised,
            and translated into "what this means for you, future IIMer."
          </p>

          <div className="mt-8 -mx-1 flex gap-2 overflow-x-auto pb-2">
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

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-[#64748b]">
              <p className="text-lg">Nothing in this category yet.</p>
              <p className="text-sm mt-2">News refreshes every 2 hours during the day.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {pinned && <NewsCard article={pinned} pinned />}
              {list.map(a => <NewsCard key={a.id} article={a} />)}
            </div>
          )}
        </section>

        <footer className="border-t border-[#1e2533] py-8 text-center text-xs text-[#64748b]">
          © {new Date().getFullYear()} IPM Careers · News curated by AI, vetted for relevance
        </footer>
      </div>
    </>
  );
}
