import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const get = k => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('NEXT_PUBLIC_SUPABASE_SERVICE_KEY') || get('SUPABASE_SERVICE_KEY'), { auth: { persistSession: false } });
marked.setOptions({ breaks: false, gfm: true, headerIds: true, mangle: false });

const SLUG = 'free-ipmat-2027-study-material-best-books-pdfs-resources-30ra2';

const body_md = `> **TL;DR: your free IPMAT prep plan**
>
> - **For Quant:** Start with your Class 9, 10, 11, and 12 NCERT textbooks. Master the fundamentals before touching any advanced book.
> - **For Verbal:** Read essays on aeon.co and summarise them. If you are a beginner, start with editorials from *The Indian Express* or *The Times of India*.
> - **For Practice:** Use Arun Sharma's Quant book for LOD 1 and 2 questions, but cross-check the answer keys against a reliable source.

## Your IIM dream does not need a 2 lakh price tag

Everyone thinks you need to spend a fortune on coaching to crack IPMAT. That is a myth. With the right strategy and a list of quality resources, you can build a powerful preparation plan for IIM Indore without spending a single rupee on classes.

The internet is full of free material, but most of it is junk. This guide cuts through the noise. It gives you the exact, actionable list of free resources that our own top-ranking students use to build their foundation. Here is the whole plan in one view:

| Section | Foundational Resource | Advanced Resource |
| --- | --- | --- |
| **Quantitative Aptitude** | NCERT Maths (Class 9-12) | Free sectional mocks |
| **Verbal Ability** | *The Indian Express* / *TOI* editorials | aeon.co essays |
| **Logical Reasoning** | IPM Careers YouTube channel | Previous year question papers |

## Quantitative aptitude: start with your school books

Future IIMer, your journey into IPMAT Quant begins at your own study table. Before you even think about complex problem-solving books, go back to the basics. Pick up your NCERT mathematics textbooks from Class 9, 10, 11, and 12.

Seriously. The entire IPMAT Indore syllabus is built on these fundamentals. Work through every chapter relevant to the syllabus, from arithmetic and algebra to geometry and modern maths. This builds a rock-solid conceptual foundation that no coaching centre's shortcut tricks can replace.

> Your Class 10 NCERT book is a better starting point for IPMAT Quant than any expensive coaching module. Master the basics first.

## Verbal ability: read smart, not just more

Improving your Verbal Ability and Reading Comprehension score is not about memorising word lists. It is about building a genuine reading habit, and what you read matters immensely.

If you find reading difficult, start with the editorial sections of *The Indian Express* or *The Times of India*. They are well-written and cover relevant topics. Once you are comfortable, or if your English is already strong, level up: go to aeon.co. It publishes long, thought-provoking essays on science, philosophy, and culture, exactly the kind of passages you can expect in IPMAT.

Here is the most important part: after you read an article, write a short summary in your own words. This forces you to identify the main idea, arguments, and tone. It is the single best way to improve comprehension and retention for free, and it doubles as practice for the WAT round at the interview stage.

## Logical reasoning: puzzles and patterns

Logical Reasoning for IPMAT Rohtak and JIPMAT is about pattern recognition and mental agility. (Note: IPMAT Indore itself does not have a separate LR section, but the skill still sharpens your quant and verbal speed.) While there is no single book for this, the best resources are past exam papers and online puzzle platforms.

Start by solving the LR sections from the last 5 years of IPMAT Rohtak papers. This gives you a clear idea of the question types, from arrangements and blood relations to syllogisms. For daily practice, websites offering Sudoku, KenKen, and other logic puzzles sharpen the exact mental muscles you need.

## The best books (and a word of caution)

Once your fundamentals are clear, you will need a good source of practice questions. One book that often comes up is Arun Sharma's Quantitative Aptitude for CAT. It is a decent resource, but use it correctly.

Focus only on the Level of Difficulty 1 (LOD 1) and Level of Difficulty 2 (LOD 2) exercises. LOD 3 questions are typically beyond the scope of IPMAT. A critical warning: many students have found errors in the answer keys. So if you get an answer wrong, do not panic, solve it again or cross-check with a reliable source. Never trust a single book blindly.

Here is a quick reference table for your free resource toolkit:

| Resource Type | Best For | Pro-Tip |
| --- | --- | --- |
| NCERT Textbooks (9-12) | Quant fundamentals | Do not skip the solved examples, they are the most direct application of concepts. |
| aeon.co essays | Advanced RC practice | Summarise each essay in 100 words to train for the WAT section too. |
| Newspapers (TOI, IE) | Basic reading habit | Read editorials daily. Note 5 new words and their usage in a sentence. |
| Arun Sharma (Quant) | Practice questions | Stick to LOD 1 and 2. Cross-check answers from other sources if stuck. |
| IPM Careers YouTube | Strategy and analysis | Watch previous-year paper solutions to understand patterns and time management. |

## Build your free IPMAT 2027 study plan

Knowledge is useless without a plan. Here is a simple weekly checklist to structure your preparation using only free resources.

- **Daily (non-negotiable):** Read one newspaper editorial or one aeon.co essay, write a 100-word summary of it, and learn 10 new vocabulary words from your reading.
- **Quantitative Aptitude (3-4 days a week):** Pick one NCERT chapter (e.g. Percentages), solve all examples and exercises, then attempt 10-15 objective questions on that topic from a free online quiz.
- **Logical Reasoning (2-3 days a week):** Solve one set of arrangements or puzzles from a reliable source, and watch one concept video on a topic you find difficult.
- **Mocks (bi-weekly, then weekly):** Take one full-length mock every 15 days, increasing to one per week in the last 3 months. Spend double the test time analysing your mistakes, analysis matters more than the test itself.

## Beyond books: mocks and community support

Self-study is powerful, but you cannot do it in a vacuum. You need two more things: realistic mock tests and a community of serious aspirants.

Mock tests are non-negotiable. They simulate exam pressure and show you the mirror, telling you where you stand and what to fix. Without mocks, your entire preparation is just theory.

Being part of a community of fellow future IIMers keeps you motivated and updated. You can clear doubts, learn from others' mistakes, and stay ahead of the curve. Preparation is a marathon, and having fellow runners alongside makes it easier.

Ready to see where you stand? Do not prepare in the dark. A single mock test can give you more clarity than a month of random studying.

**[Get a free IPMAT full-length mock test, contact us on WhatsApp](https://wa.me/918299470392)**

> The best IPMAT resource is not the most expensive one. It is the one you use consistently.

If you have any questions or need personalised guidance, do not hesitate to reach out. You can talk to one of our senior mentors by sending a WhatsApp message to +91 82994 70392.`;

const faq = [
  { q: 'Can I prepare for IPMAT 2027 using only free resources?', a: 'Yes, it is absolutely possible if you are disciplined. Combine NCERTs for Quant, daily reading from quality sources like aeon.co for Verbal, and previous year papers for practice. The key is consistent effort and high-quality free material, supplemented by regular mock tests to track progress.' },
  { q: 'Which NCERT chapters are most important for IPMAT Quant?', a: 'Focus on Arithmetic (Percentages, Time-Speed-Distance, Work), Algebra (Equations, Inequalities, Functions), Number Systems, and Permutations and Combinations from Class 9-11 NCERTs. For the short-answer section, basic Matrices, Determinants, and Limits from Class 12 are also useful.' },
  { q: "Is Arun Sharma's CAT book good for IPMAT preparation?", a: 'It can be a good additional practice resource, especially for LOD 1 and LOD 2 questions. But be cautious: many students report errors in the answer keys. Use it for the questions, but solve from first principles and cross-verify answers if they seem incorrect.' },
  { q: 'How can I get free mock tests for IPMAT?', a: 'Many platforms offer one or two free diagnostic mocks. At IPM Careers, we provide a full-length free mock so you can benchmark your preparation against thousands of other aspirants and understand the exam pattern and time pressure. Contact our team on WhatsApp to get access.' },
];

const words = body_md.split(/\s+/).filter(Boolean).length;
const update = {
  title:           'Free IPMAT 2027 Study Material: Best Books, PDFs & Mock Tests',
  seo_title:       'Free IPMAT 2027 Study Material: Books, PDFs & Mocks | IPMC',
  seo_description: 'Crack IPMAT 2027 without coaching: the best free books, NCERT PDFs, online resources and a week-by-week self-study plan for Quant, Verbal & LR.',
  body_md,
  body_html:       marked.parse(body_md),
  faq,
  reading_time:    Math.max(1, Math.round(words / 200)),
};

const { data: current, error: readErr } = await sb.from('blogs').select('*').eq('slug', SLUG).single();
if (readErr) { console.error('READ ERROR:', readErr.message); process.exit(1); }
fs.writeFileSync(`scripts/backup-studymat-${Date.now()}.json`, JSON.stringify(current, null, 2));

const { data: updated, error: updErr } = await sb.from('blogs').update(update).eq('slug', SLUG).select('id, slug, title, seo_title, reading_time').single();
if (updErr) { console.error('UPDATE ERROR:', updErr.message); process.exit(1); }
console.log('UPDATED OK');
console.log('  title     :', updated.title);
console.log('  seo_title :', updated.seo_title, `(${updated.seo_title.length} chars)`);
console.log('  read time :', updated.reading_time, 'min |', words, 'words');
console.log('  faq items :', faq.length);
