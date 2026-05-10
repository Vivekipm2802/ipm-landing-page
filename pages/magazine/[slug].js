// /magazine/[slug] — full blog reader.
// SSR — pulls a single blog by slug. 404s if not found / not published.
// Includes: hero cover, TOC, sticky reading progress, schema.org JSON-LD,
// FAQ accordion, related-posts, "Discuss on WhatsApp" CTA.

import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabaseServer } from '../../utils/supabaseClient';
import IPMNav from '../../components/IPMNav';
import MagazineCard from '../../components/MagazineCard';
import MagazineInquiryForm from '../../components/MagazineInquiryForm';
import AuthorByline from '../../components/AuthorByline';
import AuthorBio from '../../components/AuthorBio';
import LastReviewedFooter from '../../components/LastReviewedFooter';
import { gradientCss, gradientFor } from '../../lib/gradients';

export async function getServerSideProps({ params, res }) {
  const supabase = getSupabaseServer();
  const { data: blog } = await supabase
    .from('blog_with_author')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!blog) return { notFound: true };

  // Related: same category, last 6, excluding current
  const { data: related } = await supabase
    .from('recent_blogs')
    .select('*')
    .eq('category', blog.category)
    .neq('id', blog.id)
    .limit(3);

  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
  return { props: { blog, related: related || [] } };
}

export default function BlogReader({ blog, related }) {
  const g = gradientFor(blog.cover_gradient || blog.category);
  const [progress, setProgress] = useState(0);

  // Sticky reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const article = document.getElementById('blog-body');
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.max(0, Math.min(1, scrolled / total)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const canonical = `https://register.ipmcareer.com/magazine/${blog.slug}`;

  // Build JSON-LD if not provided
  const jsonLd = blog.schema_org || {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.seo_description || blog.excerpt,
    datePublished: blog.published_at,
    author: { '@type': 'Organization', name: 'IPM Careers' },
    publisher: {
      '@type': 'Organization',
      name: 'IPM Careers',
      logo: { '@type': 'ImageObject', url: 'https://register.ipmcareer.com/favicon_ipm.svg' },
    },
    mainEntityOfPage: canonical,
  };
  const faqLd = blog.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: blog.faq.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`${blog.title} — ${canonical}`)}`;

  return (
    <>
      <Head>
        <title>{blog.seo_title || `${blog.title} · IPM Careers`}</title>
        <meta name="description" content={blog.seo_description || blog.excerpt} />
        <meta name="keywords" content={(blog.seo_keywords || []).join(', ')} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={`https://register.ipmcareer.com/api/og/${blog.slug}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`https://register.ipmcareer.com/api/og/${blog.slug}`} />
        <link rel="icon" href="https://register.ipmcareer.com/favicon_ipm.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Source+Serif+4:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      </Head>

      <div style={{ background: '#05070a', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
        <IPMNav />

        {/* Sticky reading progress */}
        <div className="sticky top-16 z-30 h-[3px] bg-transparent">
          <div
            style={{ width: (progress * 100).toFixed(1) + '%', background: '#f9a01b', transition: 'width 0.05s' }}
            className="h-full"
          />
        </div>

        {/* Hero cover */}
        <header
          className="relative w-full"
          style={{ backgroundImage: gradientCss(blog.cover_gradient || blog.category) }}
        >
          <div
            className="absolute inset-0 opacity-[0.18] mix-blend-screen pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
            <div className="flex items-center gap-3 mb-5">
              <Link href="/magazine" className="text-xs text-white/70 hover:text-white">← All articles</Link>
              <span className="text-white/30">·</span>
              <span
                className="text-[10.5px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full"
                style={{ color: g.accent, background: 'rgba(255,255,255,0.08)', border: `1px solid ${g.accent}55` }}
              >
                {blog.category}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              {blog.title}
            </h1>
            {blog.excerpt && (
              <p className="mt-5 text-lg text-white/80 leading-snug">{blog.excerpt}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-[12px] uppercase tracking-widest text-white/55 font-semibold">
              <span>{new Date(blog.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>·</span>
              <span>{blog.reading_time} min read</span>
              <span>·</span>
              <span>ipmcareer.com</span>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <AuthorByline blog={blog} />
        </div>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div
            id="blog-body"
            className="ipm-blog-body prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.body_html }}
          />

          <LastReviewedFooter blog={blog} />

          {/* FAQ accordion */}
          {blog.faq?.length > 0 && (
            <section className="mt-14 pt-10 border-t border-[#1e2533]">
              <h2 className="text-2xl font-extrabold text-[#f1f5f9] mb-5">FAQs</h2>
              <div className="space-y-3">
                {blog.faq.map((f, i) => (
                  <details key={i} className="group rounded-xl border border-[#1e2533] bg-[#0f1117] p-5 open:border-[#f9a01b]/40 transition-colors">
                    <summary className="flex items-center justify-between cursor-pointer list-none text-[#f1f5f9] font-semibold">
                      <span>{f.q}</span>
                      <span className="text-[#f9a01b] text-xl group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="mt-3 text-[#94a3b8] text-[15px] leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <AuthorBio blog={blog} />

          <MagazineInquiryForm blog={blog} />

          {/* WhatsApp CTA */}
          <aside className="mt-14 rounded-2xl p-6 sm:p-8 border" style={{
            borderColor: '#25d36633',
            background: 'linear-gradient(135deg, rgba(37,211,102,0.06), rgba(37,211,102,0.0))'
          }}>
            <div className="flex items-start gap-4">
              <div className="text-3xl">💬</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#f1f5f9]">Talk to other future IIMers</h3>
                <p className="mt-1 text-sm text-[#94a3b8]">
                  Share this with your IPMAT prep buddies, or join our WhatsApp community to discuss live.
                </p>
                <a
                  href={whatsappShare}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex mt-4 items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-[#0a0c14] text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Share on WhatsApp →
                </a>
              </div>
            </div>
          </aside>
        </article>

        {/* Related */}
        {related?.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
            <h2 className="text-2xl font-extrabold text-[#f1f5f9] mb-6">More in {blog.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {related.map(b => <MagazineCard key={b.id} blog={b} />)}
            </div>
          </section>
        )}

        <footer className="border-t border-[#1e2533] py-8 text-center text-xs text-[#64748b]">
          © {new Date().getFullYear()} IPM Careers · Built for the future IIMer
        </footer>
      </div>

      <style jsx global>{`
        .ipm-blog-body { color: #cbd5e1; font-size: 17px; line-height: 1.78; font-family: 'Source Serif 4', Georgia, serif; }
        .ipm-blog-body h2 { font-family: 'Inter', sans-serif; color: #f1f5f9; font-size: 1.6rem; font-weight: 800; margin: 2.4rem 0 1rem; letter-spacing: -0.01em; }
        .ipm-blog-body h3 { font-family: 'Inter', sans-serif; color: #f1f5f9; font-size: 1.25rem; font-weight: 700; margin: 1.8rem 0 0.6rem; }
        .ipm-blog-body p  { margin: 0.9rem 0; }
        .ipm-blog-body a  { color: #f9a01b; text-decoration: underline; text-underline-offset: 3px; }
        .ipm-blog-body a:hover { color: #ffb43d; }
        .ipm-blog-body strong { color: #f1f5f9; }
        .ipm-blog-body ul, .ipm-blog-body ol { padding-left: 1.4rem; margin: 0.9rem 0; }
        .ipm-blog-body li { margin: 0.4rem 0; }
        .ipm-blog-body blockquote { border-left: 3px solid #f9a01b; padding: 0.4rem 1rem; margin: 1.4rem 0; color: #e2e8f0; font-style: italic; background: rgba(249,160,27,0.05); border-radius: 0 12px 12px 0; }
        .ipm-blog-body table { width: 100%; border-collapse: collapse; margin: 1.4rem 0; font-family: 'Inter', sans-serif; font-size: 14.5px; }
        .ipm-blog-body th, .ipm-blog-body td { padding: 10px 12px; border: 1px solid #1e2533; text-align: left; }
        .ipm-blog-body th { background: #0f1117; color: #f1f5f9; font-weight: 700; }
        .ipm-blog-body code { background: #0f1117; border: 1px solid #1e2533; padding: 2px 6px; border-radius: 6px; font-size: 0.92em; color: #f9a01b; }
      `}</style>
    </>
  );
}
