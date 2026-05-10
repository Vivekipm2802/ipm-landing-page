// Tiny line shown at the very bottom of the article body.
// Trust signal that mirrors what major publishers (NYT, Healthline) do —
// "Last reviewed by [Name] on [date]". Quick to implement, big E-E-A-T jump.

function formatDate(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function LastReviewedFooter({ blog }) {
  const name = blog.author_name || 'IPM Careers Editorial';
  // Use updated_at if present and newer than published_at, else published_at
  const reviewedAt = blog.updated_at && new Date(blog.updated_at) > new Date(blog.published_at)
    ? blog.updated_at
    : blog.published_at;
  const date = formatDate(reviewedAt);
  if (!date) return null;

  return (
    <div
      className="mt-10 pt-6 border-t border-[#1e2533] text-[12.5px] text-[#64748b] leading-relaxed"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div>
        <span className="text-[#94a3b8] font-semibold">Last reviewed by {name}</span> on {date}.
      </div>
      <div className="mt-1.5">
        Have a question about this? WhatsApp us at{' '}
        <a
          href="https://wa.me/918299470392"
          target="_blank" rel="noopener noreferrer"
          className="text-[#f9a01b] font-semibold hover:underline"
        >
          +91 82994 70392
        </a>
        {' '}— Vivek or Ashutosh will reply personally.
      </div>
    </div>
  );
}
