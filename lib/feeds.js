// RSS / Atom feed list — vetted, no competitor brands.
// Each entry: { name, url, default_category }
// Categories must match the CATEGORY_ORDER in lib/gradients.js.

export const FEEDS = [
  // Indian Express — education vertical
  { name: 'Indian Express Education', url: 'https://indianexpress.com/section/education/feed/', default_category: 'Boards' },
  // Hindu — education feed
  { name: 'The Hindu Education',      url: 'https://www.thehindu.com/education/feeder/default.rss', default_category: 'Boards' },
  // NTA notifications (official)
  { name: 'NTA News',                 url: 'https://nta.ac.in/Notice/RSS', default_category: 'Govt Exams' },
  // IIM Indore press
  { name: 'IIM Indore News',          url: 'https://www.iimidr.ac.in/feed/', default_category: 'IIM News' },
  // IIM Rohtak news (RSS may be flaky — fallback handled in fetcher)
  { name: 'IIM Rohtak News',          url: 'https://www.iimrohtak.ac.in/feed/', default_category: 'IIM News' },
  // Add more here as they're verified.
];

// Hard blocklist — never pull from these even if a feed cross-references them.
export const COMPETITOR_DOMAINS = [
  'physicswallah.com', 'pw.live', 'penpencil.com',
  'toprankers.com', 'unacademy.com', 'byjus.com', 'aakash.ac.in', 'allen.ac.in',
];

// Relevance keywords — at least one must appear in title/summary for the article
// to enter the pipeline. Cuts noise (movie reviews etc.).
export const RELEVANCE_KEYWORDS = [
  'ipmat', 'ipm ', 'iim', 'mba', 'bba', 'cuet', 'cat exam', 'jipmat', 'npat', 'set ',
  'symbiosis', 'christ university', 'management entrance', 'bms',
  'cbse', 'icse', 'isc', 'class 12', 'class 11', 'board exam',
  'nta', 'jee', 'neet', 'ugc', 'aicte', 'scholarship',
  'placement', 'admission', 'cutoff', 'result',
];

// Classification taxonomy fed to Claude Haiku
export const CATEGORIES = ['IPMAT', 'IIM News', 'BBA/BMS', 'Boards', 'Govt Exams', 'Career', 'Scholarships', 'Industry'];
