// Blog card used on /magazine grid.
// Cover is a real PNG rendered by /api/og/[slug] (cached forever by Vercel
// after first generation, so subsequent loads are instant). The PNG already
// contains the category pill, title, brand mark, and tagline — we just
// surround it with a hover frame and the body (excerpt, tags, date).

import Link from 'next/link';
import { gradientFor } from '../lib/gradients';

export default function BlogCard({ blog, featured = false }) {
  const g = gradientFor(blog.cover_gradient || blog.category);

  // Build OG image URL with category param so the gradient + accent match
  const ogParams = new URLSearchParams();
  if (blog.category)        ogParams.set('category', blog.category);
  if (blog.cover_title)     ogParams.set('title', blog.cover_title);
  if (blog.cover_subtitle)  ogParams.set('subtitle', blog.cover_subtitle);
  const ogUrl = `/api/og/${blog.slug}?${ogParams.toString()}`;

  return (
    <Link
      href={`/magazine/${blog.slug}`}
      className={
        'group block rounded-2xl overflow-hidden border border-[#1e2533] ' +
        'bg-[#0f1117] hover:border-[rgba(249,160,27,0.45)] transition-all ' +
        'hover:shadow-[0_0_0_1px_rgba(249,160,27,0.12),0_18px_40px_-20px_rgba(249,160,27,0.25)] ' +
        (featured ? 'md:col-span-2 md:row-span-2' : '')
      }
    >
      {/* Cover — real PNG via /api/og.
          Aspect locked to 1200/630 (the OG image's native ratio) so the title
          and brand mark never get clipped on either featured or regular cards. */}
      <div
        className="relative w-full overflow-hidden aspect-[1200/630]"
        style={{ backgroundColor: g.stops[0] }}
      >
        <img
          src={ogUrl}
          alt={blog.cover_title || blog.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded-full"
            style={{ color: g.accent, background: g.accent + '14', border: `1px solid ${g.accent}40` }}
          >
            {blog.category}
          </span>
          <span className="text-[11px] text-[#64748b] font-semibold">
            {blog.reading_time || 5} min read
          </span>
        </div>
        <h4 className="text-[#f1f5f9] font-bold text-base sm:text-lg leading-snug group-hover:text-[#f9a01b] transition-colors">
          {blog.title}
        </h4>
        <p className="mt-2 text-sm text-[#94a3b8] line-clamp-3">
          {blog.excerpt}
        </p>
        {blog.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {blog.tags.slice(0, 3).map(t => (
              <span
                key={t}
                className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(249,160,27,0.08)] border border-[rgba(249,160,27,0.2)] text-[#f9a01b]/90"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 pt-3 border-t border-[#1e2533] flex items-center justify-between text-[11px] text-[#64748b]">
          <span>{new Date(blog.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className="text-[#f9a01b] font-semibold opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all">Read →</span>
        </div>
      </div>
    </Link>
  );
}
