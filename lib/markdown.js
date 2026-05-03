// Minimal markdown → HTML converter.
// We use `marked` because it's tiny, dependency-free, and renders the few
// things we actually need (h2/h3, lists, tables, blockquotes, links, code).
//
// Install once:  npm i marked

import { marked } from 'marked';

marked.setOptions({
  breaks: false,
  gfm: true,
  headerIds: true,
  mangle: false,
});

export function mdToHtml(md = '') {
  return marked.parse(md);
}

// Auto-link known IPM/IIM entities back to existing blogs.
// `links` is [{ slug, title, keywords: [..] }] — produced from the blogs table.
// Matches each keyword once per article (case-insensitive) and only when the
// surrounding text isn't already inside an <a> tag.
export function injectInternalLinks(html, links) {
  if (!links?.length) return html;
  let out = html;
  const used = new Set();
  for (const { slug, keywords } of links) {
    for (const kw of (keywords || [])) {
      if (used.has(kw.toLowerCase())) continue;
      const re = new RegExp(`(?<!<a [^>]*>[^<]*)\\b(${escapeRegex(kw)})\\b(?![^<]*</a>)`, 'i');
      if (re.test(out)) {
        out = out.replace(re, `<a href="/magazine/${slug}">$1</a>`);
        used.add(kw.toLowerCase());
        break; // one link per blog target
      }
    }
  }
  return out;
}

// Compute reading time (words / 220 wpm), rounded up, min 3.
export function readingTime(md = '') {
  const words = md.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 220));
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
