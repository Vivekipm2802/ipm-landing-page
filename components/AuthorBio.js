// Larger author bio card, shown between FAQ and the inquiry form.
// Builds reader trust before the lead-capture ask.

import { gradientFor } from '../lib/gradients';

export default function AuthorBio({ blog }) {
  const g = gradientFor(blog.cover_gradient || blog.category);
  const name      = blog.author_name;
  const title     = blog.author_title;
  const quali     = blog.author_qualification;
  const photo     = blog.author_photo;
  const bio       = blog.author_bio;
  const linkedin  = blog.author_linkedin;

  // If we have no author info, render nothing — page stays clean
  if (!name || !bio) return null;

  return (
    <aside
      className="mt-14 rounded-2xl p-6 sm:p-8 border bg-[#0f1117]"
      style={{ borderColor: '#1e2533' }}
    >
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
        <a
          href={linkedin || '#'}
          target={linkedin ? '_blank' : undefined}
          rel={linkedin ? 'noopener noreferrer' : undefined}
          className="shrink-0 mx-auto sm:mx-0"
          aria-label={`${name} on LinkedIn`}
        >
          <img
            src={photo}
            alt={name}
            width={108}
            height={108}
            loading="lazy"
            style={{
              width: 108, height: 108, borderRadius: '999px',
              objectFit: 'cover', objectPosition: 'center top',
              border: `3px solid ${g.accent}`,
            }}
          />
        </a>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#f9a01b] mb-1">
            About the author
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#f1f5f9] leading-tight">
            {name}
          </h3>
          <div className="mt-1 text-sm text-[#94a3b8]">
            {title}{quali ? ` · ${quali}` : ''}
          </div>
          <p className="mt-3 text-[14.5px] text-[#cbd5e1] leading-relaxed">
            {bio}
          </p>
          {linkedin && (
            <a
              href={linkedin}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-[12.5px] font-semibold text-[#f9a01b] hover:underline"
            >
              Connect on LinkedIn
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
