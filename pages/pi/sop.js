import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import styles from './PIPrep.module.css';
import { NextSeo } from 'next-seo';
import PIAuthGuard from '../../components/PIAuthGuard';

const SOP_SECTIONS = [
  {
    key: 'intro',
    title: 'Introduction & Hook',
    hint: 'Start with a compelling personal story or moment that shaped your ambition. Panels remember stories, not statements. (50-80 words)',
    maxWords: 80,
  },
  {
    key: 'why_mba',
    title: 'Why MBA at 18?',
    hint: 'Why not engineering/medicine/CA? What specifically about management excites you? Connect it to a real experience. (60-100 words)',
    maxWords: 100,
  },
  {
    key: 'why_iim',
    title: 'Why IIM Indore IPM?',
    hint: 'Be specific — mention the 5-year integrated structure, Indore campus, specific professors, clubs, or events you know about. Generic answers get caught. (60-100 words)',
    maxWords: 100,
  },
  {
    key: 'strengths',
    title: 'Your Strengths & Evidence',
    hint: 'Pick 2-3 strengths and back each with a concrete example. "I am a leader" means nothing without "I led my school debate team to nationals." (80-120 words)',
    maxWords: 120,
  },
  {
    key: 'career',
    title: 'Career Goals',
    hint: 'Short-term (5 years) and long-term (10-15 years). Be specific and realistic. Show how IPM is the bridge between where you are and where you want to be. (60-100 words)',
    maxWords: 100,
  },
  {
    key: 'conclusion',
    title: 'Closing Statement',
    hint: 'Tie everything together. What will you contribute to IIM Indore? End with conviction, not cliches. (40-60 words)',
    maxWords: 60,
  },
];

export default function SOPBuilder() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [sop, setSop] = useState({});
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState(null);
  const [traps, setTraps] = useState([]);
  const [sopStatus, setSopStatus] = useState('draft'); // draft, review, final
  const [geminiKey, setGeminiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Load saved SOP
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pi_sop');
      if (stored) setSop(JSON.parse(stored));
      const key = localStorage.getItem('gemini_api_key');
      if (key) setGeminiKey(key);
    } catch {}
  }, []);

  const updateSection = (key, value) => {
    const updated = { ...sop, [key]: value };
    setSop(updated);
    localStorage.setItem('pi_sop', JSON.stringify(updated));
  };

  const wordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w).length;
  };

  const totalWords = SOP_SECTIONS.reduce((sum, s) => sum + wordCount(sop[s.key]), 0);
  const completedSections = SOP_SECTIONS.filter(s => wordCount(sop[s.key]) >= 20).length;
  const fullSopText = SOP_SECTIONS.map(s => `## ${s.title}\n${sop[s.key] || ''}`).join('\n\n');

  const saveGeminiKey = (key) => {
    setGeminiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowKeyInput(false);
  };

  const reviewSOP = async () => {
    if (!geminiKey) {
      setShowKeyInput(true);
      return;
    }
    setReviewing(true);
    setReview(null);
    setTraps([]);

    try {
      // Load profile for context
      let profile = {};
      try { profile = JSON.parse(localStorage.getItem('pi_profile') || '{}'); } catch {}

      const res = await fetch('/api/pi/sop-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sop: fullSopText,
          profile,
          apiKey: geminiKey,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReview(data.feedback);
      setTraps(data.traps || []);
      setSopStatus('review');
    } catch (err) {
      setReview('Error: ' + err.message);
    }
    setReviewing(false);
  };

  const currentSection = SOP_SECTIONS[activeStep];

  return (
    <AppShell>
      <PIAuthGuard>
      <NextSeo title="SOP Builder — PI Prep | IPM Careers" />
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            SOP Builder
            <span className={`${styles.statusPill} ${styles['status' + sopStatus.charAt(0).toUpperCase() + sopStatus.slice(1)]}`} style={{ marginLeft: 12 }}>
              {sopStatus}
            </span>
          </h1>
          <p className={styles.pageSubtitle}>
            Your SOP is the #1 source of PI questions. Build it section by section — the AI will review it for traps and weak spots.
          </p>
        </div>

        {/* Progress */}
        <div className={styles.card} style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
              {completedSections}/{SOP_SECTIONS.length} sections done · {totalWords} words total
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {SOP_SECTIONS.map((s, i) => (
                <div
                  key={s.key}
                  style={{
                    width: 28, height: 6, borderRadius: 3,
                    background: wordCount(sop[s.key]) >= 20 ? '#22c55e' : i === activeStep ? '#6c63ff' : '#e5e7eb'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Wizard Steps */}
        <div className={styles.wizardSteps}>
          {SOP_SECTIONS.map((s, i) => (
            <div
              key={s.key}
              className={`${styles.wizardStep} ${i === activeStep ? styles.wizardStepActive : ''} ${wordCount(sop[s.key]) >= 20 ? styles.wizardStepDone : ''}`}
              onClick={() => setActiveStep(i)}
            >
              <span className={styles.wizardStepNum}>Step {i + 1}</span>
              {s.title.split(' ').slice(0, 2).join(' ')}
            </div>
          ))}
        </div>

        {/* Active Section */}
        <div className={styles.sopSection}>
          <div className={styles.sopSectionTitle}>{currentSection.title}</div>
          <div className={styles.sopSectionHint}>{currentSection.hint}</div>
          <textarea
            className={styles.textarea}
            style={{ minHeight: 150 }}
            placeholder={`Write your ${currentSection.title.toLowerCase()} here...`}
            value={sop[currentSection.key] || ''}
            onChange={e => updateSection(currentSection.key, e.target.value)}
          />
          <div className={`${styles.sopWordCount} ${wordCount(sop[currentSection.key]) > currentSection.maxWords ? styles.sopWordCountOver : ''}`}>
            {wordCount(sop[currentSection.key])}/{currentSection.maxWords} words
            {wordCount(sop[currentSection.key]) > currentSection.maxWords && ' — too long, trim it down'}
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.btnRow}>
          {activeStep > 0 && (
            <button className={styles.btnSecondary} onClick={() => setActiveStep(activeStep - 1)}>
              ← Previous
            </button>
          )}
          {activeStep < SOP_SECTIONS.length - 1 ? (
            <button className={styles.btnPrimary} onClick={() => setActiveStep(activeStep + 1)}>
              Next Section →
            </button>
          ) : (
            <button className={styles.btnPrimary} onClick={reviewSOP} disabled={reviewing || completedSections < 3}>
              {reviewing ? '🔍 Reviewing...' : '🤖 Get AI Review'}
            </button>
          )}
        </div>

        {/* Gemini API Key Input */}
        {showKeyInput && (
          <div className={styles.card} style={{ marginTop: '1rem' }}>
            <div className={styles.cardTitle}>🔑 Enter Your Gemini API Key</div>
            <div className={styles.cardSubtitle}>Get a free key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style={{ color: '#6c63ff' }}>Google AI Studio</a>. Your key stays in your browser only.</div>
            <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr auto', marginTop: 12 }}>
              <input
                className={styles.input}
                type="password"
                placeholder="AIza..."
                onChange={e => setGeminiKey(e.target.value)}
              />
              <button className={styles.btnPrimary} onClick={() => { saveGeminiKey(geminiKey); reviewSOP(); }}>
                Save & Review
              </button>
            </div>
          </div>
        )}

        {/* AI Review Results */}
        {review && (
          <div className={styles.aiFeedback}>
            <div className={styles.aiFeedbackHeader}>
              🤖 AI SOP Review
            </div>
            <p className={styles.aiFeedbackText}>{review}</p>
          </div>
        )}

        {/* Trap Warnings */}
        {traps.length > 0 && traps.map((trap, i) => (
          <div key={i} className={styles.trapWarning}>
            <span className={styles.trapIcon}>⚠️</span>
            <p className={styles.trapText}>{trap}</p>
          </div>
        ))}

        {/* Full SOP Preview */}
        {completedSections >= 4 && (
          <div className={styles.card} style={{ marginTop: '1.5rem' }}>
            <div className={styles.cardTitle}>📄 Full SOP Preview</div>
            <div className={styles.cardSubtitle}>{totalWords} words total · Copy or export when ready</div>
            <div style={{ marginTop: 12, padding: '1rem', background: '#f8fafc', borderRadius: 12, fontSize: '0.88rem', lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }}>
              {SOP_SECTIONS.map(s => sop[s.key] ? `${sop[s.key]}` : '').filter(Boolean).join('\n\n')}
            </div>
            <div className={styles.btnRow}>
              <button className={styles.btnSecondary} onClick={() => {
                const text = SOP_SECTIONS.map(s => sop[s.key] || '').filter(Boolean).join('\n\n');
                navigator.clipboard.writeText(text);
                alert('SOP copied to clipboard!');
              }}>
                📋 Copy SOP
              </button>
              <button className={styles.btnSecondary} onClick={() => router.push('/pi/mock')}>
                Next: AI Mock Interview →
              </button>
            </div>
          </div>
        )}
      </div>
    </PIAuthGuard>
    </AppShell>
  );
}
