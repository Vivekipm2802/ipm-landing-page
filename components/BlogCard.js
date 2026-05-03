// Blog card used on /blogs grid.
// Visual: dark glassy card, gradient cover (CSS only, no image asset),
// bold title, small tagline, "ipmcareer.com" mark in cover bottom-right,
// category pill, tag chips, reading time + date in footer.

import Link from 'next/link';
import { gradientCss, gradientFor, timeAgo } from '../lib/gradients';

export default function BlogCard({ blog, featured = false }) {
  const g = gradientFor(blog.cover_gradient || blog.category);
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
      {/* Cover */}
      <div
        className={'relative w-full ' + (featured ? 'aspect-[16/9]' : 'aspect-[16/10]')}
        style={{ backgroundImage: gradientCss(blog.cover_gradient || blog.category) }}
      >
        {/* faint noise / grid overlay for "magazine" feel */}
        <div
          className="absolute inset-0 opacity-[0.18] mix-blend-screen pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
          <span
            className="self-start text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
            style={{ color: g.accent, background: 'rgba(255,255,255,0.06)', border: `1px solid ${g.accent}55` }}
          >
            {blog.category}
          </span>
          <div>
            <h3
              className={
                'font-extrabold leading-tight text-white ' +
                (featured ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl')
              }
              style={{ textShadow: '0 2px 18px rgba(0,0,0,0.55)' }}
            >
              {blog.cover_title || blog.title}
            </h3>
            {blog.cover_subtitle && (
              <p className="mt-1.5 text-xs sm:text-[13px] text-white/70 max-w-[90%]">
                {blog.cover_subtitle}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-white/55 font-semibold">
                ipmcareer.com
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white/55 font-semibold">
                {blog.reading_time || 5} min read
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6">
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
