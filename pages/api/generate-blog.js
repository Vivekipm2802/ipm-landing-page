// POST /api/generate-blog
// Generates ONE fully-SEO blog and inserts it into Supabase.
// Called by the Cowork scheduled task twice a day.
//
// Request:
//   POST /api/generate-blog
//   Headers: Authorization: Bearer <CONTENT_AUTOMATION_TOKEN>
//   Body (optional JSON): { topic?: string, category?: string, angle?: string }
//     If body is empty, picks the next topic from blog_topic_pool (LRU).
//
// Response: { ok, slug, title, category, log_id } | { ok:false, error }
//
// Runtime config: bump function timeout to 60s (Vercel Hobby max). Needed because
// Gemini Pro can take 20–40s for a 1500-word blog, plus our retry backoff if Pro
// is throttled. Default is 10s which kills the function mid-generation.

export const config = { maxDuration: 60 };

import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { gemini, extractJson } from '../../lib/gemini';
import { mdToHtml, injectInternalLinks, readingTime } from '../../lib/markdown';
import { humanizeWithStats } from '../../lib/humanize';
import { requireAuth, slugify, randSuffix } from '../../lib/auth';

// ──────────────── Brand voice + competitor blocklist ────────────────
const BANNED_TERMS = ['physicswallah', 'physics wallah', 'pw ', ' pw,', 'toprankers', 'unacademy', 'byju', 'aakash', 'allen career'];

// ──────────────── Structural variation ────────────────
// Pick a different opener pattern each run so all blogs don't follow the same
// template (a major spam-classifier signal). The picked opener is injected
// into the SYSTEM_PROMPT.
const OPENER_PATTERNS = [
  'Open with a TL;DR box (3 short bullets) before the first H2.',
  'Open with a single dramatic question + a one-line answer, then the first H2.',
  'Open with a surprising stat or counter-intuitive number on its own line, then context.',
  'Open with a 2-sentence personal-perspective hook (still in Indian English) — e.g. "Most IPMAT aspirants get this wrong. Here\'s what the data actually says."',
  'Open with a quick-look comparison table at the very top (before any H2), then explain.',
  'Open with a numbered "What you\'ll learn" list (3 items), then dive in.',
];
const STRUCTURE_VARIANTS = [
  'Use 4–5 H2 sections with one H3 nested under each.',
  'Use 5–6 H2 sections, no H3s, but include a blockquote callout between sections 2 and 3.',
  'Use 4 H2 sections, with the second one being a comparison table at the start of the section.',
  'Use 5 H2 sections, and end the body (just before the FAQ) with a one-sentence "bottom line" pull-quote in a blockquote.',
];
function pickVariation() {
  return {
    opener:    OPENER_PATTERNS[Math.floor(Math.random() * OPENER_PATTERNS.length)],
    structure: STRUCTURE_VARIANTS[Math.floor(Math.random() * STRUCTURE_VARIANTS.length)],
  };
}

function buildSystemPrompt(variation) {
  return `
You are the senior content lead at IPM Careers (ipmcareer.com), India's most aspirant-first
coaching brand for IPMAT and IIM IPM admissions. You write for Class 11 and 12 students,
their parents, and current undergrads thinking about IPM/BBA programs.

Voice: punchy, confident, specific. Talk to the student as a "future IIMer".
Concrete numbers > vague claims. Real names of IIMs and exams. No fluff.

# Hard brand rules
- NEVER mention competitors by name: PhysicsWallah, PW, Toprankers, Unacademy, BYJU'S, Aakash, ALLEN.
  (When you would have said "vs PW", say "vs generic mass coaching" or just compare facts.)
- NEVER fabricate stats. If you state a placement figure or cutoff, mark it as "approximate
  based on past trends" or use a verifiable round number.
- ALWAYS write in Indian English.
- ALWAYS include at least one comparison table or data table.
- ALWAYS end with a 3-question FAQ designed to win Google featured snippets.
- ALWAYS keep paragraphs short (2–3 sentences) — this reads on mobile.
- The body must be valid GitHub-Flavored Markdown.

# This blog's structural variation (use exactly this — don't default to the standard template)
- Opener: ${variation.opener}
- Structure: ${variation.structure}

# Anti-AI writing rules (CRITICAL — this content must not read as machine-generated)
You MUST avoid these AI tells. They make content easy for Google's spam classifier to detect:

- NO em dashes (—). Use commas, periods, or parentheses.
- NO smart/curly quotes (" " ' '). Use straight quotes only (" ').
- NO words: "delve", "leverage", "robust", "seamless", "groundbreaking", "cutting-edge",
  "nestled", "vibrant", "bustling", "testament", "pivotal", "underscore", "highlight" (as verb),
  "interplay", "intricate", "tapestry", "in the realm of", "ever-evolving", "landscape" (figurative),
  "foster"/"fostering", "garner", "showcase".
- NO sentence starters: "In conclusion,", "In essence,", "Ultimately,", "Furthermore,",
  "Moreover,", "Additionally,", "It is important to note that", "Notably,", "That said,".
- NO negative parallelism: "It's not just X, it's Y", "Not only X, but Y".
- NO rule-of-three lists where 3 items have the same syntactic structure.
- NO superficial -ing endings: "highlighting...", "underscoring...", "reflecting...".
- NO copula avoidance: don't say "serves as / stands as / functions as" — say "is".
- NO inline-header bullets: bullets like "- **Speed:** Code generation is fast" — write as prose instead.
- NO title-case headings: write "## Sectional strategy" NOT "## Sectional Strategy".
- NO sycophantic openers: "Great question!", "Of course!", "Absolutely!".
- NO mechanical bolding — bold a term ONCE in the whole article max, not in every paragraph.
- NO knowledge-cutoff disclaimers: "as of my last update", "while specific details are limited".
- NO generic positive endings: "the future looks bright", "exciting times lie ahead".

# Have a voice
- Use "I" or "we" sparingly when it reads natural. Aspirants trust people, not assistants.
- Vary sentence length deliberately — short punchy ones next to longer specific ones.
- Acknowledge complexity. "It depends" is sometimes the most honest line.
- Use specific, verifiable numbers (cutoffs, fees, percentile cuts, placement averages).
- One pull-quote per article max — make it land.

# Output format
ONLY a single JSON object, no prose around it. Schema:
{
  "title":          string,        // 55–70 chars, SEO-optimised, include the primary keyword
  "cover_title":    string,        // SHORT, 4–9 words, bold-friendly headline for the cover image
  "cover_subtitle": string,        // ONE crisp line under the cover_title (≤ 70 chars)
  "excerpt":        string,        // 140–180 chars, the dek shown on the card and meta description
  "seo_title":      string,        // ≤ 60 chars, what shows in <title>
  "seo_description":string,        // ≤ 158 chars
  "seo_keywords":   string[],      // 5–10 phrase keywords
  "tags":           string[],      // 3–6 short tags
  "body_md":        string,        // 1100–1700 words, full markdown body
  "faq":            [{q,a}, ...],  // 3–5 FAQ items
  "internal_link_keywords": string[]  // 4–8 entity phrases worth auto-linking (e.g. "IIM Indore", "IPMAT Quant")
}
`.trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });
  if (!requireAuth(req, res)) return;

  const t0 = Date.now();
  let topic, category, angle, topicId;

  try {
    // 1. Pick a topic — caller-supplied or next LRU from pool
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    if (body.topic) {
      topic = body.topic;
      category = body.category || 'IPMAT';
      angle = body.angle || 'explainer';
    } else {
      const { data: row, error } = await supabaseAdmin
        .from('blog_topic_pool')
        .select('id, topic, category, angle')
        .order('last_used_at', { ascending: true, nullsFirst: true })
        .order('usage_count', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!row) throw new Error('blog_topic_pool is empty — seed it first.');
      topic = row.topic; category = row.category; angle = row.angle; topicId = row.id;
    }

    // 2. Pull a small context: existing blog slugs + tags for internal linking
    const { data: existing } = await supabaseAdmin
      .from('blogs')
      .select('slug, title, tags')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(40);
    const existingSummary = (existing || [])
      .map(b => `- "${b.title}" → /magazine/${b.slug}`)
      .join('\n')
      .slice(0, 4000);

    // 3. Generate
    const userMsg = `
Today's brief:
- Topic:    ${topic}
- Category: ${category}
- Angle:    ${angle}

Existing IPM Careers blogs you can link to (use only if naturally relevant):
${existingSummary || '(none yet)'}

Now write the JSON object per the schema in the system prompt.
`.trim();

    // Pick a structural variation for THIS blog (opener + section structure)
    // so all blogs don't follow the identical template — a major tell for
    // pattern-detection algorithms.
    const variation = pickVariation();

    const { text, modelUsed } = await gemini({
      model:         'gemini-2.5-pro',
      fallbackModel: 'gemini-2.5-flash', // when Pro is in capacity crunch, fall back so blogs still publish
      system:        buildSystemPrompt(variation),
      prompt:        userMsg,
      max_tokens:    8192,
      temperature:   0.75,
      json:          true,
    });
    console.log(`[generate-blog] used model: ${modelUsed} · opener: ${variation.opener.slice(0,40)}...`);

    const blog = extractJson(text);

    // 4. Brand-safety pass — reject if competitors slipped through
    const flat = JSON.stringify(blog).toLowerCase();
    const hit  = BANNED_TERMS.find(b => flat.includes(b));
    if (hit) throw new Error(`Brand-safety reject: contains banned term "${hit}".`);

    // 4b. Humanize the body — strips em-dashes, AI vocab, templated phrases,
    //     curly quotes, inline-header bullets, title-case headings, etc.
    //     What the upstream prompt rules don't catch, this regex pass does.
    const humanized = humanizeWithStats(blog.body_md);
    blog.body_md = humanized.text;
    console.log(`[generate-blog] humanizer: ${humanized.stats.delta_chars} chars delta, ${humanized.stats.em_dashes_before}→${humanized.stats.em_dashes_after} em-dashes`);

    // Also humanize the excerpt + title (lighter touch — title rarely has AI tells but excerpt sometimes does)
    if (blog.excerpt) blog.excerpt = humanizeWithStats(blog.excerpt).text;

    // 5. Render markdown → HTML + auto-link
    let body_html = mdToHtml(blog.body_md);
    if (existing?.length) {
      const links = existing.map(b => ({
        slug: b.slug,
        keywords: [b.title, ...(b.tags || [])].filter(Boolean),
      }));
      body_html = injectInternalLinks(body_html, links);
    }

    // 5b. Pick the author for this blog by category.
    //   Ashutosh (academic / IIM voice): IPMAT, IIM News, Boards, Govt Exams
    //   Vivek    (admissions / career voice): BBA/BMS, Career, Scholarships, Industry
    const ASHUTOSH_CATEGORIES = new Set(['IPMAT', 'IIM News', 'Boards', 'Govt Exams']);
    const author_slug = ASHUTOSH_CATEGORIES.has(category) ? 'ashutosh-mishra' : 'vivek-arora';

    // 6. Slug + insert
    const slug = `${slugify(blog.title)}-${randSuffix()}`;
    const insertRow = {
      slug,
      title:           blog.title,
      excerpt:         blog.excerpt,
      body_md:         blog.body_md,
      body_html,
      cover_gradient:  category,                   // gradient palette key matches category
      cover_title:     blog.cover_title,
      cover_subtitle:  blog.cover_subtitle,
      category,
      tags:            blog.tags || [],
      reading_time:    readingTime(blog.body_md),
      seo_title:       blog.seo_title,
      seo_description: blog.seo_description,
      seo_keywords:    blog.seo_keywords || [],
      faq:             blog.faq || [],
      schema_org:      null,                       // reader page builds JSON-LD on the fly
      internal_links:  null,
      author_slug,                                  // E-E-A-T — real Person author for schema.org
      status:          'published',
      published_at:    new Date().toISOString(),
    };

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('blogs')
      .insert(insertRow)
      .select('id, slug, title')
      .single();
    if (insErr) throw insErr;

    // 7. Update topic pool LRU
    if (topicId) {
      await supabaseAdmin
        .from('blog_topic_pool')
        .update({ last_used_at: new Date().toISOString(), usage_count: 1 })
        .eq('id', topicId);
    }

    // 8. Log
    const { data: log } = await supabaseAdmin
      .from('content_log')
      .insert({
        kind: 'blog_generate',
        status: 'ok',
        payload: { topic, category, angle, slug: inserted.slug, ms: Date.now() - t0 },
      })
      .select('id')
      .single();

    // 9. Best-effort: ping Google to re-fetch sitemap (no-await needed)
    fetch(`https://www.google.com/ping?sitemap=https://register.ipmcareer.com/sitemap.xml`).catch(() => {});

    return res.status(200).json({
      ok: true,
      slug: inserted.slug,
      title: inserted.title,
      category,
      url: `https://register.ipmcareer.com/magazine/${inserted.slug}`,
      log_id: log?.id,
      ms: Date.now() - t0,
    });
  } catch (err) {
    await supabaseAdmin.from('content_log').insert({
      kind: 'blog_generate',
      status: 'error',
      payload: { topic, category, angle },
      error: String(err.message || err),
    });
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
}
