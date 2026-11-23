// Referral apply links, kept in one place. Pages link to /go/<slug>?src=<where>, which logs the click
// (table partner_clicks, no personal data) and sends the student to the exact link below, unchanged.
// Never edit a URL here without the school sending a new one: the query string is how they credit us.

export const SITE = "https://register.ipmcareer.com";

export const PARTNER_LINKS = {
  // MBA (2027 intake)
  atlas: { name: "ATLAS ISME, Mumbai (MBA)", url: "https://www.atlasuniversity.edu.in/applicationform/admissions/9900036" },
  dbs: { name: "DBS Global University, Dehradun (MBA)", url: "https://bit.ly/40Jb8pM" },
  itm: { name: "ITM Business School, Navi Mumbai (MBA iConnect)", url: "https://sh.itm.edu/35" },
  upes: { name: "UPES School of Business, Dehradun (MBA)", url: "https://admission.upes.ac.in/Login?BCode=ysApp0gAXIDFHAhVkG75bw%3D%3D" },
};

export const isPartner = (slug) => Boolean(slug && PARTNER_LINKS[slug]);

// Relative link for pages on this site; absolute for emails and WhatsApp
export const goHref = (slug, src, absolute = false) =>
  `${absolute ? SITE : ""}/go/${slug}${src ? `?src=${encodeURIComponent(src)}` : ""}`;
