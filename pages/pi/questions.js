import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import styles from './PIPrep.module.css';
import { NextSeo } from 'next-seo';
import PIAuthGuard from '../../components/PIAuthGuard';
import { supabase } from '../../utils/supabaseClient';

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
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch questions from Supabase
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const { data, error } = await supabase
          .from('pi_questions')
          .select('*')
          .eq('is_published', true)
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped = data.map(q => ({
            id: q.id,
            category: q.category,
            text: q.question_text,
            answer: q.model_answer,
            difficulty: q.difficulty,
          }));
          setQuestions(mapped);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

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
    let qs = questions;
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
  }, [activeCategory, searchQuery, showBookmarksOnly, bookmarks, questions]);

  const categoryCounts = useMemo(() => {
    const counts = { All: questions.length };
    CATEGORIES.forEach(c => {
      if (c.key !== 'All') counts[c.key] = questions.filter(q => q.category === c.key).length;
    });
    return counts;
  }, [questions]);

  return (
    <AppShell>
      <PIAuthGuard>
      <NextSeo title="Question Bank — PI Prep | IPM Careers" />
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Question Bank</h1>
          <p className={styles.pageSubtitle}>
            {questions.length} curated PI questions with model answers — organized by category, searchable, and bookmarkable
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
          Showing {filteredQuestions.length} of {questions.length} questions
          {showBookmarksOnly && ' (bookmarked only)'}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⏳</div>
            <div className={styles.emptyTitle}>Loading questions...</div>
          </div>
        )}

        {/* Question List */}
        {!loading && (
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
                  <div className={styles.questionNum}>{idx + 1}</div>
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
        )}

        {!loading && filteredQuestions.length === 0 && (
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
