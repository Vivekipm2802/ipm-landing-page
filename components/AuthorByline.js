// Small byline shown below the blog hero header.
// Renders: photo + "By {name}, {title} · {qualification} · {date} · {min} read"
// Designed to be the first E-E-A-T signal a reader sees.

import { gradientFor } from '../lib/gradients';

function formatDate(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AuthorByline({ blog }) {
  const g = gradientFor(blog.cover_gradient || blog.category);
  const name      = blog.author_name      || 'IPM Careers Team';
  const title     = blog.author_title     || '';
  const quali     = blog.author_qualification || '';
  const photo     = blog.author_photo     || 'https://register.ipmcareer.com/favicon_ipm.svg';
  const linkedin  = blog.author_linkedin;
  const date      = formatDate(blog.published_at) || formatDate(blog.created_at);
  const reading   = blog.reading_time || 5;

  return (
    <div className="flex items-center gap-4 mt-8 pb-2">
      <a
        href={linkedin || '#'}
        target={linkedin ? '_blank' : undefined}
        rel={linkedin ? 'noopener noreferrer' : undefined}
        className="shrink-0"
        aria-label={`Author: ${name}`}
      >
        <img
          src={photo}
          alt={name}
          width={56}
          height={56}
          loading="lazy"
          style={{
            width: 56, height: 56, borderRadius: '999px',
            objectFit: 'cover', objectPosition: 'center top',
            border: `2px solid ${g.accent}`,
          }}
        />
      </a>
      <div className="flex-1 min-w-0">
        <div className="text-[#f1f5f9] font-semibold leading-tight">
          By{' '}
          {linkedin ? (
            <a
              href={linkedin}
              target="_blank" rel="noopener noreferrer"
              className="text-[#f9a01b] hover:underline"
            >
              {name}
            </a>
          ) : (
            <span className="text-[#f9a01b]">{name}</span>
          )}
          {title && <span className="text-[#94a3b8] font-normal">, {title}</span>}
        </div>
        <div className="text-[12px] text-[#64748b] mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {quali && <span>{quali}</span>}
          {quali && <span className="text-[#475569]">·</span>}
          {date && <span>{date}</span>}
          <span className="text-[#475569]">·</span>
          <span>{reading} min read</span>
        </div>
      </div>
    </div>
  );
}
