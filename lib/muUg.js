// Masters' Union UG (2027 intake): programmes and Round 1 date, in one place.
// Every link goes through /go/<slug>?src=<where> so clicks are counted; the final URL is in lib/partnerLinks.js.
// Never call IPM Careers a partner of Masters' Union in any copy.

export const MU_ROUND1_END = "2026-12-15T23:59:59+05:30";

export const MU_PROGRAMMES = [
  { slug: "mu-tbm", label: "Tech & Business Mgmt" },
  { slug: "mu-fne", label: "Finance & Economics" },
  { slug: "mu-psm", label: "Psychology & Marketing" },
  { slug: "mu-dsai", label: "Data Science & AI" },
  { slug: "mu-robotics", label: "Robotics & AI" },
];

export const muHref = (slug, src) => `/go/${slug}?src=${encodeURIComponent(src || "site")}`;

// "Round 1 closes 15 Dec (20 days left)" before the deadline, a neutral line after it
export function muDeadline(now = Date.now()) {
  const end = new Date(MU_ROUND1_END).getTime();
  if (now > end) return { open: false, line: "2027 UG applications" };
  const days = Math.ceil((end - now) / 86400000) - 1;
  const left = days <= 0 ? "closes today" : days === 1 ? "1 day left" : `${days} days left`;
  return { open: true, days, line: `Round 1 closes 15 Dec · ${left}` };
}
