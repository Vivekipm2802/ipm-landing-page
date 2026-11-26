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
  // UG (2027 intake). Links as sent by Masters' Union on 26 Nov 2026, with discount code UGIPO (see lib/muUg.js)
  "mu-tbm": { name: "Masters' Union UG: Technology & Business Management", url: "https://mastersunion.org/ug-technology-and-business-management?utm_source=IPM_Kanpur&utm_medium=Whatsapp&utm_campaign=Invite&utm_content=" },
  "mu-psm": { name: "Masters' Union UG: Psychology & Marketing", url: "https://mastersunion.org/ug-psychology-and-marketing?utm_source=IPM_Kanpur&utm_medium=Whatsapp&utm_campaign=Invite&utm_content=" },
  "mu-fne": { name: "Masters' Union UG: Finance & Economics", url: "https://mastersunion.org/ug-finance-and-economics?utm_source=IPM_Kanpur&utm_medium=Whatsapp&utm_campaign=Invite&utm_content=" },
  "mu-dsai": { name: "Masters' Union UG: Data Science & AI", url: "https://mastersunion.org/ug-data-science-and-artificial-intelligence?utm_source=IPM_Kanpur&utm_medium=Whatsapp&utm_campaign=Invite&utm_content=" },
  "mu-robotics": { name: "Masters' Union UG: Robotics & AI", url: "https://robotics.mastersunion.org/?utm_source=IPM_Kanpur&utm_medium=Whatsapp&utm_campaign=Invite&utm_content=" },
};

export const isPartner = (slug) => Boolean(slug && PARTNER_LINKS[slug]);

// Relative link for pages on this site; absolute for emails and WhatsApp
export const goHref = (slug, src, absolute = false) =>
  `${absolute ? SITE : ""}/go/${slug}${src ? `?src=${encodeURIComponent(src)}` : ""}`;
