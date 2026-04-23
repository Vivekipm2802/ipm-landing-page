import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import styles from './PIPrep.module.css';
import { NextSeo } from 'next-seo';
import PIAuthGuard from '../../components/PIAuthGuard';

// ── Question Bank Data ──
// REPLACE with parsed PDF content. Each question needs: category, text, answer, difficulty
const QUESTIONS = [
  // ── SOP / Personal ──
  { id: 1, category: 'SOP', text: 'Walk us through your SOP. What is the central theme?', answer: 'Pick the ONE core thread that connects your intro, why-MBA, and career goals. Don\'t just summarize — highlight the "red thread." E.g., "My SOP is built around the idea that exposure to diverse perspectives drives better decisions — which is why I want IPM\'s 5-year integrated structure."', difficulty: 'medium' },
  { id: 2, category: 'SOP', text: 'You mentioned [specific strength] in your SOP. Give me a concrete example where this strength was tested.', answer: 'Use the STAR method: Situation → Task → Action → Result. Be specific with numbers and outcomes. If you wrote "leadership," don\'t just say "I led my team" — say "I led a 12-member debate team, increased participation by 40%, and we reached nationals for the first time in 5 years."', difficulty: 'hard' },
  { id: 3, category: 'SOP', text: 'Your SOP says you want to be [career goal]. What specifically will you do in Year 1 vs Year 5 vs Year 10?', answer: 'Show a clear progression. Year 1: Learn fundamentals, get exposure. Year 5: Mid-level role with specific responsibilities. Year 10: Leadership role or entrepreneurship. Be realistic — don\'t say "CEO of Google" but also don\'t be vague. Connect each stage back to skills IPM will give you.', difficulty: 'hard' },
  { id: 4, category: 'SOP', text: 'If we reject your SOP and ask you to rewrite it in 5 minutes, what would you change?', answer: 'This tests self-awareness. Acknowledge one genuine weakness (e.g., "I\'d add more specific data to support my claims" or "I\'d make my career goal more concrete"). Never say "nothing" — that shows lack of reflection.', difficulty: 'hard' },
  { id: 5, category: 'SOP', text: 'You wrote that IIM Indore is your dream college. What if you also get IIM Rohtak or NALSAR?', answer: 'Show you\'ve researched IIM Indore specifically — mention the 5-year integrated structure, Indore campus, specific clubs/fests, faculty, or alumni you\'ve looked up. Then honestly discuss how you\'d decide, showing mature thinking.', difficulty: 'medium' },
  { id: 6, category: 'SOP', text: 'What is the biggest risk in your career plan?', answer: 'Show you\'ve thought about what could go wrong. E.g., "The consulting industry is evolving with AI — my risk is that traditional strategy roles may shrink. That\'s why I want to combine management with tech skills during IPM." Shows maturity.', difficulty: 'medium' },
  { id: 7, category: 'SOP', text: 'Your SOP mentions [extracurricular]. What did you learn from it that is NOT obvious?', answer: 'Go beyond surface learning. If you played cricket, don\'t just say "teamwork." Say "I learned that the best captain isn\'t the best player — it\'s the one who makes others perform. I once dropped our top batsman from a match because his attitude was toxic, and we still won."', difficulty: 'medium' },
  { id: 8, category: 'SOP', text: 'Tell me something about yourself that is NOT in your SOP or application.', answer: 'This is a gift question — use it to show personality. Share something interesting: a hobby, a belief, a childhood story, a skill. Make it memorable. "I collect vintage maps" is better than "I\'m hardworking."', difficulty: 'easy' },

  // ── Academics ──
  { id: 9, category: 'Academics', text: 'Why did your score drop/improve between Class 10 and Class 12?', answer: 'Be honest. If it dropped: acknowledge it, explain what happened (e.g., health, new subjects, overconfidence), and what you learned. If it improved: explain what changed in your approach. Never blame teachers or the system — take ownership.', difficulty: 'medium' },
  { id: 10, category: 'Academics', text: 'What is your favorite subject and why? Teach me something from it in 2 minutes.', answer: 'Pick a subject you genuinely enjoy. Then TEACH — don\'t just describe. E.g., "I love Economics. Let me explain the paradox of thrift: when everyone saves more during a recession, total savings actually decrease because spending drops, businesses suffer, and incomes fall."', difficulty: 'medium' },
  { id: 11, category: 'Academics', text: 'You scored X in IPMAT. What was your preparation strategy?', answer: 'Be specific: how many months, daily routine, resources used, weak areas, mock test scores, what you\'d do differently. Shows discipline and self-awareness.', difficulty: 'easy' },
  { id: 12, category: 'Academics', text: 'If you could remove one subject from your school curriculum, which one and why?', answer: 'This tests critical thinking, not the "right" answer. Pick any subject and build a logical argument. E.g., "I\'d restructure Social Studies to include financial literacy — knowing about the Mughal empire is useful but knowing about compound interest and taxes is immediately practical."', difficulty: 'medium' },
  { id: 13, category: 'Academics', text: 'Explain a concept from Mathematics/Physics that has a real-world application most people don\'t know about.', answer: 'Show depth. E.g., "Game Theory from Math is used by telecom companies to decide pricing — if Jio drops prices, Airtel has to decide whether to match or differentiate. The Nash Equilibrium explains why they often end up at similar prices."', difficulty: 'hard' },
  { id: 14, category: 'Academics', text: 'Why MBA at 18? Why not engineering or CA?', answer: 'Don\'t trash other careers. Instead, explain what specifically draws you to management: decision-making, working across functions, building organizations. Connect to a personal experience that made you realize this. "After organizing my school fest and managing a ₹2L budget across 8 events, I realized I\'m energized by coordination and strategy, not deep technical work."', difficulty: 'hard' },

  // ── GK / Current Affairs ──
  { id: 15, category: 'GK', text: 'What is the current GDP growth rate of India? Is it good or bad?', answer: 'State the number (check latest RBI/IMF data). Then analyze: compare with last year, compare with China/US, discuss what\'s driving it (consumption, investment, govt spending). Show you can think beyond the number.', difficulty: 'medium' },
  { id: 16, category: 'GK', text: 'Explain the Union Budget in 3 sentences. What was the most important announcement?', answer: 'Keep it crisp. Cover: total expenditure, fiscal deficit target, and 1-2 key announcements relevant to education/youth (like changes in income tax slabs or education spending). Show you actually read it, not just headlines.', difficulty: 'hard' },
  { id: 17, category: 'GK', text: 'Should India have a Uniform Civil Code? Give arguments for and against.', answer: 'This tests balanced thinking. FOR: equality, simplification, gender justice. AGAINST: diversity, federalism, religious freedom. Then state YOUR view with reasoning. Panels respect nuanced opinions, not extreme positions.', difficulty: 'hard' },
  { id: 18, category: 'GK', text: 'Name 3 government schemes launched in the last year. Explain any one.', answer: 'Pick schemes you actually understand. For each: name, ministry, objective, target group. For the detailed one, add: budget allocation, implementation status, criticism if any. Shows you follow policy, not just news.', difficulty: 'medium' },
  { id: 19, category: 'GK', text: 'What is the difference between fiscal policy and monetary policy? Give an example of each from recent news.', answer: 'Fiscal = government (taxes, spending, budget). Monetary = RBI (interest rates, repo rate, CRR). Example: "The FM reduced income tax slabs (fiscal). RBI kept repo rate unchanged at 6.5% to control inflation (monetary)." Connect to current context.', difficulty: 'medium' },
  { id: 20, category: 'GK', text: 'Who is the current RBI Governor? What is the repo rate right now and why does it matter?', answer: 'State the name and repo rate (verify latest). Explain simply: "Repo rate is the rate at which RBI lends to banks. When it\'s high, loans become expensive, people borrow less, and inflation cools. When low, borrowing increases and economy grows faster."', difficulty: 'easy' },
  { id: 21, category: 'GK', text: 'What is the Russia-Ukraine war about? How does it affect India?', answer: 'Brief context: NATO expansion, Crimea annexation, Feb 2022 invasion. India impact: crude oil prices, defense imports, diplomatic balancing (abstaining at UN), rupee-ruble trade. Show geopolitical awareness.', difficulty: 'hard' },

  // ── Situational / HR ──
  { id: 22, category: 'Situational', text: 'Tell me about a time you failed. What did you learn?', answer: 'Pick a REAL failure (not a humble brag like "I worked too hard"). Describe what happened, why it went wrong, what you did after, and specifically how you changed. E.g., "I promised to deliver a school magazine in 2 weeks, underestimated the printing timeline, and missed the deadline by 5 days. I learned to always add buffer time and communicate delays early."', difficulty: 'medium' },
  { id: 23, category: 'Situational', text: 'You\'re leading a team of 5 for a college project. Two members aren\'t contributing. What do you do?', answer: 'Show leadership + empathy. Step 1: Understand WHY they\'re not contributing (personal issues? lack of interest? unclear roles?). Step 2: Redistribute work based on strengths. Step 3: Set clear deadlines with accountability. Step 4: If still not working, escalate honestly but fairly. Never say "I\'d do their work myself."', difficulty: 'medium' },
  { id: 24, category: 'Situational', text: 'Your best friend asks you to help them cheat in an exam. What do you do?', answer: 'This tests integrity. Be clear: "I wouldn\'t help them cheat." But show empathy: "I\'d offer to help them study, share my notes, or find them a tutor. I\'d explain that cheating hurts them more than it helps." Don\'t be preachy — be human.', difficulty: 'easy' },
  { id: 25, category: 'Situational', text: 'If you don\'t get into any IIM, what is your Plan B?', answer: 'Show you\'ve thought about this maturely. Have a genuine backup: "I\'d take a gap year and reappear, while also preparing for CAT / CLAT / studying abroad." Or: "I\'d join [specific college] and build my profile for MBA later." Never say "I haven\'t thought about it" or "I only want IIM."', difficulty: 'medium' },
  { id: 26, category: 'Situational', text: 'Your parents want you to do engineering but you want IPM. How did you convince them?', answer: 'Show the process: "I researched IIM Indore placement data, showed them the ROI comparison (5 years IPM vs 4+2 years BTech+MBA), arranged a call with an alumni, and addressed their concerns about security." Be respectful about parents — never criticize them.', difficulty: 'easy' },
  { id: 27, category: 'Situational', text: 'You discover your company is doing something unethical but profitable. What do you do?', answer: 'Show ethical reasoning: "I\'d first verify the facts independently. Then raise it internally through proper channels. If ignored, I\'d escalate to compliance or whistleblower mechanisms." Show you understand the complexity — it\'s not always black and white.', difficulty: 'hard' },
  { id: 28, category: 'Situational', text: 'What is your biggest weakness? How are you working on it?', answer: 'Pick a REAL weakness (not "I\'m a perfectionist"). Be specific and show active improvement. E.g., "I tend to procrastinate on tasks I find boring. I\'ve started using the Pomodoro technique and breaking large tasks into smaller milestones — my Class 12 prep was much more organized because of this."', difficulty: 'medium' },

  // ── Why IIM / Why MBA ──
  { id: 29, category: 'Why IIM', text: 'Why IIM Indore specifically? Not IIM Ahmedabad or Bangalore?', answer: 'Focus on what\'s UNIQUE to IIM Indore: the 5-year IPM program structure, Indore campus, specific faculty research, clubs, exchange programs, placement sectors. Mention something specific: "I know Prof. X\'s work on behavioral economics" or "The Udan festival combines management and culture."', difficulty: 'hard' },
  { id: 30, category: 'Why IIM', text: 'What do you know about the IPM curriculum? What excites you most?', answer: 'Show you\'ve done homework. Mention: the 3+2 structure (3 years undergrad + 2 years MBA), foundation courses in Year 1-3 (economics, sociology, math, humanities), electives in Year 4-5, summer internships, exchange programs. Pick a specific course/area that excites you and explain why.', difficulty: 'medium' },
  { id: 31, category: 'Why IIM', text: 'What will you contribute to IIM Indore that other candidates won\'t?', answer: 'This is YOUR unique value proposition. Think about: your city\'s perspective, your unique hobby/skill, your extracurricular, your professional exposure through parents, your cultural background. Be specific: "I can bring my experience in competitive quiz — I\'ll contribute to the Quiz Club and help organize inter-IIM quiz events."', difficulty: 'hard' },
  { id: 32, category: 'Why IIM', text: 'IPM is 5 years. What if you realize MBA isn\'t for you after Year 2?', answer: 'Show you\'ve considered this: "The first 3 years give me a broad foundation including humanities and social sciences — even if I pivot, those skills are valuable. But I\'ve chosen IPM deliberately after exploring other options, so I\'m confident this is the right path. The 5-year structure actually gives me time to explore before specializing."', difficulty: 'medium' },
  { id: 33, category: 'Why IIM', text: 'Do you know the fees for the IPM program? Is it worth it?', answer: 'Know the number (currently ~₹30-35 lakhs for 5 years). Then build the ROI case: average placement package, loan options, scholarship possibilities. Compare with alternatives (4 years BTech + 2 years MBA = higher total cost + more time). Show financial maturity.', difficulty: 'easy' },

  // ── More SOP ──
  { id: 34, category: 'SOP', text: 'If I read your SOP to your best friend, would they say it sounds like you?', answer: 'This checks authenticity. Be honest: "My friend would recognize my career goal but might say my intro is more formal than how I actually talk. I tried to balance authenticity with professionalism." Shows self-awareness.', difficulty: 'medium' },
  { id: 35, category: 'SOP', text: 'What is the one thing in your SOP that you\'re most proud of?', answer: 'Pick something genuine — a real achievement, a moment of growth, or a decision you made. Don\'t pick "I wrote a great SOP." Pick "I\'m proud that I mentioned my failure with [X] because it took courage to be honest about it in an interview context."', difficulty: 'easy' },

  // ── More GK ──
  { id: 36, category: 'GK', text: 'What is your opinion on AI replacing jobs in India?', answer: 'Show nuance. "AI will automate repetitive tasks but create new roles we can\'t imagine yet. The risk is inequality — English-speaking, tech-savvy urban youth will benefit while rural workers may suffer. India needs to invest in reskilling. For management graduates, AI is an opportunity — understanding AI strategy will be a competitive advantage."', difficulty: 'hard' },
  { id: 37, category: 'GK', text: 'Name the Finance Minister, Home Minister, and Education Minister of India.', answer: 'Factual question — you MUST know this. Also know: Chief Justice of India, RBI Governor, SEBI Chairman, WHO head, UN Secretary General. These are basic PI facts. Getting these wrong is a red flag.', difficulty: 'easy' },
  { id: 38, category: 'GK', text: 'What is the National Education Policy 2020? How does it affect you?', answer: 'Key points: 5+3+3+4 structure, multidisciplinary approach, mother tongue instruction, academic credit bank, 4-year UG degree option. Personal impact: "NEP encourages integrated programs like IPM — the policy recognizes that management education shouldn\'t be limited to postgraduates."', difficulty: 'medium' },

  // ── More Situational ──
  { id: 39, category: 'Situational', text: 'If you had ₹10 lakhs right now, how would you invest it?', answer: 'Show financial awareness. Don\'t say "save it all" or "spend it all." Diversify: "₹4L in mutual funds (SIP for long-term growth), ₹2L in fixed deposits (emergency fund), ₹2L in a skill development course or business idea, ₹2L for education loans repayment or travel for learning." Explain your reasoning.', difficulty: 'medium' },
  { id: 40, category: 'Situational', text: 'Describe a day in your life 10 years from now.', answer: 'Be vivid but realistic. Show ambition + work-life balance. "I wake up at 6 AM, review my team\'s quarterly targets, have a strategy meeting at 9, mentor a new hire at lunch, work on a client presentation in the afternoon, leave by 7 PM to spend time with family, and read for 30 minutes before bed." Make it specific to your career goal.', difficulty: 'easy' },
];

const CATEGORIES = [
  { key: 'All', icon: '📋', color: '#6c63ff' },
  { key: 'SOP', icon: '📝', color: '#f5a623' },
  { key: 'Academics', icon: '🎓', color: '#22c55e' },
  { key: 'GK', icon: '📰', color: '#ef4444' },
  { key: 'Situational', icon: '🧩', color: '#8b5cf6' },
  { key: 'Why IIM', icon: '🏛️', color: '#06b6d4' },
];

export default function QuestionBank() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQ, setExpandedQ] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Load bookmarks
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pi_bookmarks') || '[]');
      setBookmarks(saved);
    } catch {}
  }, []);

  const toggleBookmark = (id) => {
    const updated = bookmarks.includes(id)
      ? bookmarks.filter(b => b !== id)
      : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem('pi_bookmarks', JSON.stringify(updated));
  };

  const filteredQuestions = useMemo(() => {
    let qs = QUESTIONS;
    if (activeCategory !== 'All') {
      qs = qs.filter(q => q.category === activeCategory);
    }
    if (showBookmarksOnly) {
      qs = qs.filter(q => bookmarks.includes(q.id));
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      qs = qs.filter(q =>
        q.text.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query) ||
        q.category.toLowerCase().includes(query)
      );
    }
    return qs;
  }, [activeCategory, searchQuery, showBookmarksOnly, bookmarks]);

  const categoryCounts = useMemo(() => {
    const counts = { All: QUESTIONS.length };
    CATEGORIES.forEach(c => {
      if (c.key !== 'All') counts[c.key] = QUESTIONS.filter(q => q.category === c.key).length;
    });
    return counts;
  }, []);

  return (
    <AppShell>
      <PIAuthGuard>
      <NextSeo title="Question Bank — PI Prep | IPM Careers" />
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Question Bank</h1>
          <p className={styles.pageSubtitle}>
            {QUESTIONS.length} curated PI questions with model answers — organized by category, searchable, and bookmarkable
          </p>
        </div>

        {/* Category Tabs */}
        <div className={styles.tabBar} style={{ flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`${styles.tab} ${activeCategory === cat.key ? styles.tabActive : ''}`}
              onClick={() => { setActiveCategory(cat.key); setShowBookmarksOnly(false); }}
              style={activeCategory === cat.key ? { color: cat.color } : {}}
            >
              {cat.icon} {cat.key}
              <span className={styles.tabCount}>{categoryCounts[cat.key] || 0}</span>
            </button>
          ))}
        </div>

        {/* Search + Bookmark Filter */}
        <div className={styles.searchBar}>
          <input
            className={styles.searchInput}
            placeholder="Search questions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button
            className={`${styles.btnSecondary} ${showBookmarksOnly ? styles.tabActive : ''}`}
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            style={showBookmarksOnly ? { background: '#f5a62320', borderColor: '#f5a623', color: '#f5a623' } : {}}
          >
            {showBookmarksOnly ? '⭐ Bookmarked' : '☆ Bookmarks'} ({bookmarks.length})
          </button>
        </div>

        {/* Results count */}
        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem', fontWeight: 600 }}>
          Showing {filteredQuestions.length} of {QUESTIONS.length} questions
          {showBookmarksOnly && ' (bookmarked only)'}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {/* Question List */}
        <div className={styles.questionList}>
          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className={`${styles.questionItem} ${expandedQ === q.id ? styles.questionItemExpanded : ''}`}
            >
              <div
                className={styles.questionHeader}
                onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.questionNum}>{q.id}</div>
                <div className={styles.questionText}>{q.text}</div>
                <span className={`${styles.questionDifficulty} ${
                  q.difficulty === 'easy' ? styles.diffEasy :
                  q.difficulty === 'medium' ? styles.diffMedium :
                  styles.diffHard
                }`}>
                  {q.difficulty}
                </span>
                <button
                  className={styles.questionBookmark}
                  onClick={(e) => { e.stopPropagation(); toggleBookmark(q.id); }}
                  title={bookmarks.includes(q.id) ? 'Remove bookmark' : 'Bookmark this question'}
                >
                  {bookmarks.includes(q.id) ? '⭐' : '☆'}
                </button>
              </div>

              {/* Category Tag */}
              <div style={{ marginLeft: 44, marginTop: 4 }}>
                <span
                  className={styles.questionCategoryTag}
                  style={{
                    background: (CATEGORIES.find(c => c.key === q.category)?.color || '#6c63ff') + '15',
                    color: CATEGORIES.find(c => c.key === q.category)?.color || '#6c63ff',
                  }}
                >
                  {CATEGORIES.find(c => c.key === q.category)?.icon} {q.category}
                </span>
              </div>

              {/* Expanded Answer */}
              {expandedQ === q.id && (
                <div className={styles.questionAnswer}>
                  <div className={styles.answerLabel}>💡 Model Answer Strategy</div>
                  <p className={styles.answerText}>{q.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <div className={styles.emptyTitle}>No questions found</div>
            <div className={styles.emptyDesc}>
              {showBookmarksOnly
                ? 'You haven\'t bookmarked any questions yet. Browse and bookmark questions you want to revise later.'
                : 'Try a different search term or category.'}
            </div>
          </div>
        )}

        {/* Practice CTA */}
        <div className={styles.card} style={{ textAlign: 'center', marginTop: '2rem', background: 'linear-gradient(135deg, #6c63ff10, #8b5cf610)', border: '1px solid #6c63ff20' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎙️</div>
          <div className={styles.cardTitle} style={{ textAlign: 'center' }}>Ready to practice?</div>
          <div className={styles.cardSubtitle} style={{ textAlign: 'center' }}>
            Take these questions to the AI Mock Interview and practice answering them with real-time feedback
          </div>
          <div className={styles.btnRow} style={{ justifyContent: 'center', marginTop: '1rem' }}>
            <button className={styles.btnPrimary} onClick={() => router.push('/pi/mock')}>
              🤖 Start AI Mock Interview
            </button>
            <button className={styles.btnSecondary} onClick={() => router.push('/pi/booking')}>
              📅 Book Expert Session
            </button>
          </div>
        </div>
      </div>
    </PIAuthGuard>
    </AppShell>
  );
}
