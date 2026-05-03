// News card for /news grid.
// Visual: top stripe in category color, title, summary, "Why this matters for you,
// future IIMer" callout, source + ago badge.

import { gradientFor, timeAgo } from '../lib/gradients';

export default function NewsCard({ article, pinned = false }) {
  const g = gradientFor(article.category);
  return (
    <a
      href={article.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className={
        'group block rounded-2xl border border-[#1e2533] bg-[#0f1117] overflow-hidden ' +
        'hover:border-[rgba(249,160,27,0.4)] hover:shadow-[0_18px_40px_-22px_rgba(249,160,27,0.25)] ' +
        'transition-all relative ' +
        (pinned ? 'md:col-span-3' : '')
      }
    >
      {/* Color stripe at top — category signature */}
      <div className="h-1 w-full" style={{ background: g.accent }} />

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className="text-[10.5px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full"
            style={{ color: g.accent, background: g.accent + '14', border: `1px solid ${g.accent}40` }}
          >
            {pinned && '★ '}{article.category}
          </span>
          <span className="text-[11px] text-[#64748b] font-semibold">
            {timeAgo(article.published_at)}
          </span>
        </div>

        <h4
          className={
            'font-bold leading-snug text-[#f1f5f9] group-hover:text-[#f9a01b] transition-colors ' +
            (pinned ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg')
          }
        >
          {article.title}
        </h4>

        <p className={'mt-2 text-[#94a3b8] ' + (pinned ? 'text-[15px]' : 'text-sm') + ' line-clamp-' + (pinned ? '4' : '3')}>
          {article.summary}
        </p>

        {/* Why this matters callout — the differentiator */}
        {article.why_it_matters && (
          <div
            className="mt-4 rounded-xl p-3 border"
            style={{
              borderColor: g.accent + '33',
              background:  g.accent + '0d',
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1" style={{ color: g.accent }}>
              Why this matters for you, future IIMer
            </div>
            <p className="text-[13px] text-[#cbd5e1] leading-snug">
              {article.why_it_matters}
            </p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-[#1e2533] flex items-center justify-between">
          <span className="text-[11.5px] text-[#64748b] font-semibold">
            {article.source_name}
          </span>
          <span className="text-[11.5px] font-semibold text-[#f9a01b] opacity-0 group-hover:opacity-100 transition-all">
            Read →
          </span>
        </div>
      </div>
    </a>
  );
}
