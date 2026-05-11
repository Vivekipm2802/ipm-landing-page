// Regex-based AI-tell humanizer.
// Runs after Gemini writes the blog. Catches the deterministic, easy-to-detect
// patterns (em dashes, AI vocabulary, common templated phrases, curly quotes,
// inline-header bullets, title-case h2/h3, etc.) so the upstream prompt rules
// + this post-pass together strip ~80% of what spam classifiers like Originality
// look for.
//
// Based on Wikipedia "Signs of AI Writing" (the same source as the local
// humanizer skill — see /skills/humanizer/SKILL.md).
//
// Surgical, not generative — never invents facts, never paraphrases meaning,
// only swaps obvious tells for natural alternatives.

const HEADING_TITLE_CASE_RE = /^(#{2,4})\s+(.+)$/gm;

// AI vocab → human alternative. Map is intentionally conservative — only
// swap when the alternative reads cleanly in any sentence.
const VOCAB_SWAPS = [
  [/\bdelve into\b/gi,                  'look at'],
  [/\bdelving into\b/gi,                'looking at'],
  [/\bnavigate the\b/gi,                'work through the'],
  [/\bleverage\b/gi,                    'use'],
  [/\bleveraging\b/gi,                  'using'],
  [/\bembark on\b/gi,                   'start'],
  [/\brobust\b/gi,                      'solid'],
  [/\bseamless\b/gi,                    'smooth'],
  [/\bseamlessly\b/gi,                  'smoothly'],
  [/\bgroundbreaking\b/gi,              'major'],
  [/\bcutting[- ]edge\b/gi,             'modern'],
  [/\bstate[- ]of[- ]the[- ]art\b/gi,   'modern'],
  [/\bnestled\b/gi,                     'located'],
  [/\bvibrant\b/gi,                     'lively'],
  [/\bbustling\b/gi,                    'busy'],
  [/\btestament to\b/gi,                'sign of'],
  [/\ba pivotal moment\b/gi,            'a key moment'],
  [/\bpivotal\b/gi,                     'key'],
  [/\bunderscore[sd]?\b/gi,             'show'],
  [/\bunderscoring\b/gi,                'showing'],
  [/\bemphasiz(es?|ed|ing)\b/gi,        'shows'],
  [/\bhighlight(s|ed)?\b/gi,            'shows'],
  [/\bhighlighting\b/gi,                'showing'],
  [/\binterplay\b/gi,                   'mix'],
  [/\bintricate\b/gi,                   'detailed'],
  [/\bintricacies\b/gi,                 'details'],
  [/\btapestry of\b/gi,                 'mix of'],
  [/\bin the realm of\b/gi,             'in'],
  [/\bin today's (rapidly )?evolving (.+?)\b/gi, 'today, $2'],
  [/\bever[- ]evolving\b/gi,            'changing'],
  [/\blandscape of\b/gi,                'world of'],
  [/\bthe ([a-z]+) landscape\b/gi,      'the $1 space'],
  [/\bfostering\b/gi,                   'building'],
  [/\bfoster\b/gi,                      'build'],
  [/\bgarner\b/gi,                      'get'],
  [/\bgarnering\b/gi,                   'getting'],
  [/\bshowcase[sd]?\b/gi,               'show'],
  [/\bshowcasing\b/gi,                  'showing'],
  [/\benhance[sd]?\b/gi,                'improve'],
  [/\benhancing\b/gi,                   'improving'],
];

// Templated phrases → drop or simplify
const PHRASE_SWAPS = [
  // Filler sentence starters
  [/^In conclusion,\s*/gim,                  ''],
  [/^In essence,\s*/gim,                     ''],
  [/^Ultimately,\s*/gim,                     ''],
  [/^Furthermore,\s*/gim,                    ''],
  [/^Moreover,\s*/gim,                       ''],
  [/^Additionally,\s*/gim,                   ''],
  [/^It is important to note that\s*/gim,    ''],
  [/^It's important to (note|remember) that\s*/gim, ''],
  [/^Notably,\s*/gim,                        ''],
  [/^That said,\s*/gim,                      ''],

  // Hedging
  [/\bcould potentially\b/gi,                'could'],
  [/\bmay potentially\b/gi,                  'may'],
  [/\bmight possibly\b/gi,                   'might'],

  // Fluff connectors
  [/\bin order to\b/gi,                      'to'],
  [/\bdue to the fact that\b/gi,             'because'],
  [/\bat this point in time\b/gi,            'now'],
  [/\bin the event that\b/gi,                'if'],
  [/\bhas the ability to\b/gi,               'can'],

  // Generic positive endings
  [/\bThe future looks bright\.?\s*/gi,                                   ''],
  [/\bExciting times (lie|are) ahead\.?\s*/gi,                            ''],
  [/\bThis represents a major step in the right direction\.?\s*/gi,       ''],
  [/\bA bright future awaits\.?\s*/gi,                                    ''],

  // Negative parallelism — best done by Gemini, but this catches the worst
  [/\bIt's not just (about )?(.+?), it's (about )?(.+?)\./gi, 'It\'s about $2 and $4.'],
  [/\bNot only (.+?), but (also )?(.+?)\./gi, '$1, and $3.'],

  // Sycophantic / chatbot artifacts that occasionally slip through
  [/\bGreat question!\s*/gi,                                              ''],
  [/\bI hope this helps!\s*/gi,                                           ''],
  [/\bLet me know if you'd like[^.]*\.\s*/gi,                             ''],
  [/\bCertainly!\s*/gi,                                                   ''],
  [/\bAbsolutely!\s*/gi,                                                  ''],
];

// Em-dash + en-dash killer — hard strip, table-safe.
// Em dashes are an AI tell at any frequency, so we replace ALL of them with
// commas. CRITICAL: we process line-by-line and skip markdown table rows
// (lines starting with `|`) so we don't corrupt the `|---|---|` separator.
// We also leave plain hyphens (`-`) and `--` alone — those are valid markdown.
function tameEmDashes(s) {
  return s.split('\n').map(line => {
    // Markdown table rows / separators start with `|` — never touch them
    if (/^\s*\|/.test(line)) return line;
    // Replace true em-dash and en-dash with comma. Plain hyphens stay put.
    return line.replace(/[—–]/g, ',');
  }).join('\n');
}

// Curly quotes → straight quotes (preserves apostrophes inside words)
function straightenQuotes(s) {
  return s
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

// Title-case headings (## Strategic Partnerships) → sentence-case (## Strategic partnerships)
// Skip acronyms (IIM, IPMAT, BBA, etc.) and intentionally capitalised words.
const ACRONYMS = new Set(['IIM','IIMs','IPM','IPMAT','JIPMAT','MBA','BBA','BMS','CAT','CUET','SAT','GMAT','GRE','SC','ST','OBC','EWS','PI','WAT','RC','VA','LR','QA','XII','X','ROI','SI','CI','TSD','PI','UG','PGP','IIIT','NIT','IIT','NMIMS','SET','NPAT','NTA','UGC','AICTE','CBSE','ICSE','ISC','HDFC','SBI','I','II','III','IV','V']);

function sentenceCaseHeading(line) {
  return line.replace(HEADING_TITLE_CASE_RE, (m, hashes, text) => {
    const words = text.split(/(\s+)/);
    const out = words.map((w, idx) => {
      if (/^\s+$/.test(w)) return w;
      // First word — keep capitalised
      if (idx === 0) return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      // Acronym — keep as-is
      if (ACRONYMS.has(w.replace(/[^A-Za-z]/g, ''))) return w;
      // Word that is ALL UPPERCASE (likely acronym we don't know) — keep
      if (w === w.toUpperCase() && /[A-Z]/.test(w)) return w;
      // Otherwise lowercase
      return w.toLowerCase();
    }).join('');
    return `${hashes} ${out}`;
  });
}

// Detect "inline-header" bullet pattern and flatten the bold:colon part
//   - **User Experience:** description...   →   - description... (about user experience)
// Conservative: only flatten when bold+colon at very start of bullet
function flattenInlineHeaders(s) {
  return s.replace(/^([\-*]\s+)\*\*([^*]+)\*\*:\s*/gm, '$1');
}

// Reduce mechanical bold use: if more than ~1 bold per 200 chars, halve them.
function tameBolding(s) {
  const target = Math.ceil(s.length / 200);
  const matches = s.match(/\*\*[^*]+\*\*/g) || [];
  if (matches.length <= target) return s;
  let i = 0;
  return s.replace(/\*\*([^*]+)\*\*/g, (m, inner) => {
    i++;
    return i % 2 === 0 ? inner : m;
  });
}

// Collapse runs of ≥3 short sentences that follow the same syntactic pattern
// (Rule of Three). Heuristic: find ".X. Y. Z." where X/Y/Z each ≤ 4 words and
// shape similarly. Conservative — only triggers on very obvious cases.
function tameRuleOfThree(s) {
  return s.replace(
    /([A-Z][^.!?]{3,40}\.) ([A-Z][^.!?]{3,40}\.) ([A-Z][^.!?]{3,40}\.)/g,
    (m, a, b, c) => {
      const w = (x) => x.replace(/[.!?]$/, '').split(/\s+/).length;
      if (w(a) <= 5 && w(b) <= 5 && w(c) <= 5 && w(a) === w(b) && w(b) === w(c)) {
        return `${a.replace(/\.$/, '')}, ${b.replace(/\.$/, '').toLowerCase()}, and ${c.replace(/\.$/, '').toLowerCase()}.`;
      }
      return m;
    }
  );
}

// Collapse double spaces / triple newlines that may appear after substitutions
function tidyWhitespace(s) {
  return s
    .replace(/ /g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/^[ \t]+$/gm, '')
    .trim();
}

export function humanize(md = '') {
  if (!md) return md;
  let out = md;

  // 1. Quote/dash normalisation first (so later regex don't trip on smart chars)
  out = straightenQuotes(out);
  out = tameEmDashes(out);

  // 2. Vocabulary swaps
  for (const [re, sub] of VOCAB_SWAPS) out = out.replace(re, sub);

  // 3. Templated-phrase swaps
  for (const [re, sub] of PHRASE_SWAPS) out = out.replace(re, sub);

  // 4. Markdown structure de-AI-ing
  out = sentenceCaseHeading(out);
  out = flattenInlineHeaders(out);
  out = tameBolding(out);
  out = tameRuleOfThree(out);

  // 5. Tidy
  out = tidyWhitespace(out);

  return out;
}

// Quick stats for the content_log payload — useful for tracking what the
// humanizer changed over time.
export function humanizeWithStats(md = '') {
  const before = md;
  const after  = humanize(md);
  return {
    text: after,
    stats: {
      chars_before: before.length,
      chars_after:  after.length,
      delta_chars:  after.length - before.length,
      em_dashes_before: (before.match(/—/g) || []).length,
      em_dashes_after:  (after.match(/—/g) || []).length,
    },
  };
}
