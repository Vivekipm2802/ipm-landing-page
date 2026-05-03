// Shared top nav for /blogs and /news pages.
// Matches the air1commandcenter brand: dark surface, orange accent, Inter font.
// Sticky, mobile-first.

import Link from 'next/link';
import { useRouter } from 'next/router';

const NAV_LINKS = [
  { href: '/',                  label: 'Home' },
  { href: '/air1commandcenter', label: 'AIR 1 Command Center' },
  { href: '/magazine',          label: 'Magazine' },
  { href: '/news',              label: 'News' },
];

export default function IPMNav() {
  const router = useRouter();
  const path = router.pathname;
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[rgba(5,7,10,0.78)] border-b border-[#1e2533]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="https://register.ipmcareer.com/favicon_ipm.svg"
            alt="IPM Careers"
            className="w-7 h-7"
          />
          <span className="font-extrabold tracking-tight text-[#f1f5f9] text-lg group-hover:text-[#f9a01b] transition-colors">
            IPM<span className="text-[#f9a01b]">Careers</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(l => {
            const active = path === l.href || (l.href !== '/' && path.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  'px-2.5 sm:px-3.5 py-1.5 rounded-full text-[13px] sm:text-sm font-semibold transition-all ' +
                  (active
                    ? 'bg-[rgba(249,160,27,0.12)] text-[#f9a01b] border border-[rgba(249,160,27,0.35)]'
                    : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[rgba(255,255,255,0.04)] border border-transparent')
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
