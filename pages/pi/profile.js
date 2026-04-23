import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import styles from './PIPrep.module.css';
import { supabase } from '../../utils/supabaseClient';
import { NextSeo } from 'next-seo';
import PIAuthGuard from '../../components/PIAuthGuard';

const BOARDS = ['CBSE', 'ICSE/ISC', 'State Board', 'IB', 'IGCSE', 'Other'];
const STREAMS = ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Humanities', 'Other'];

export default function PIProfile() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [extInput, setExtInput] = useState('');
  const [achieveInput, setAchieveInput] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    school: '',
    board: '',
    stream: '',
    class10_pct: '',
    class12_pct: '',
    ipmat_score: '',
    ipmat_rank_est: '',
    jee_score: '',
    sat_score: '',
    other_exams: '',
    extracurriculars: [],
    achievements: [],
    why_mba: '',
    career_goal: '',
    strengths: '',
    weaknesses: '',
  });

  const update = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const addTag = (field, inputState, setInputState) => {
    const val = inputState.trim();
    if (val && !profile[field].includes(val)) {
      update(field, [...profile[field], val]);
      setInputState('');
    }
  };

  const removeTag = (field, idx) => {
    update(field, profile[field].filter((_, i) => i !== idx));
  };

  // Calculate readiness score
  const calcReadiness = () => {
    let score = 0;
    const max = 100;
    // Profile completeness (40 pts)
    if (profile.name) score += 4;
    if (profile.email) score += 2;
    if (profile.phone) score += 2;
    if (profile.city) score += 2;
    if (profile.school) score += 3;
    if (profile.board) score += 2;
    if (profile.stream) score += 2;
    if (profile.class10_pct) score += 3;
    if (profile.class12_pct) score += 3;
    if (profile.ipmat_score) score += 5;
    if (profile.extracurriculars.length > 0) score += 4;
    if (profile.achievements.length > 0) score += 3;
    if (profile.why_mba) score += 5;
    // Depth (60 pts) — placeholder for SOP + Mock scores
    // Will be filled when those modules are built
    return { score, max, profilePct: Math.round((score / 40) * 100) };
  };

  const readiness = calcReadiness();

  const handleSave = async () => {
    setSaving(true);
    // Save to localStorage for now (Supabase tables come in next task)
    try {
      localStorage.setItem('pi_profile', JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
    }
    setSaving(false);
  };

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pi_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(prev => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  return (
    <AppShell>
      <PIAuthGuard>
      <NextSeo title="My Profile — PI Prep | IPM Careers" />
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Profile</h1>
          <p className={styles.pageSubtitle}>Build your complete academic profile — the AI interviewer will use this to ask personalized questions</p>
        </div>

        {/* Readiness Score */}
        <div className={styles.readinessCard}>
          <div className={styles.readinessTitle}>Interview Readiness Score</div>
          <div className={styles.readinessScore}>
            {readiness.score}<span className={styles.readinessMax}>/100</span>
          </div>
          <div className={styles.readinessLabel}>
            {readiness.score < 20 ? 'Just getting started' :
             readiness.score < 40 ? 'Profile taking shape' :
             readiness.score < 60 ? 'Good foundation' :
             readiness.score < 80 ? 'Almost interview-ready' : 'Ready to ace it!'}
          </div>
          <div className={styles.readinessBreakdown}>
            <div className={styles.readinessStat}>
              <div className={styles.readinessStatValue}>{readiness.profilePct}%</div>
              <div className={styles.readinessStatLabel}>Profile</div>
            </div>
            <div className={styles.readinessStat}>
              <div className={styles.readinessStatValue}>—</div>
              <div className={styles.readinessStatLabel}>SOP</div>
            </div>
            <div className={styles.readinessStat}>
              <div className={styles.readinessStatValue}>—</div>
              <div className={styles.readinessStatLabel}>Mock Score</div>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><span className={styles.cardIcon}>👤</span> Personal Information</div>
          <div className={styles.cardSubtitle}>Basic details for your interview profile</div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input className={styles.input} placeholder="e.g. Arjun Sharma" value={profile.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" placeholder="arjun@email.com" value={profile.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone</label>
              <input className={styles.input} type="tel" placeholder="+91 98765 43210" value={profile.phone} onChange={e => update('phone', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>City</label>
              <input className={styles.input} placeholder="e.g. Mumbai" value={profile.city} onChange={e => update('city', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><span className={styles.cardIcon}>🎓</span> Academic Information</div>
          <div className={styles.cardSubtitle}>IIM panels always ask about your academic journey</div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>School Name</label>
              <input className={styles.input} placeholder="e.g. Delhi Public School" value={profile.school} onChange={e => update('school', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Board</label>
              <select className={styles.select} value={profile.board} onChange={e => update('board', e.target.value)}>
                <option value="">Select Board</option>
                {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Stream</label>
              <select className={styles.select} value={profile.stream} onChange={e => update('stream', e.target.value)}>
                <option value="">Select Stream</option>
                {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Class 10 (%)</label>
              <input className={styles.input} type="number" placeholder="e.g. 95.4" value={profile.class10_pct} onChange={e => update('class10_pct', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Class 12 (%) — Predicted/Actual</label>
              <input className={styles.input} type="number" placeholder="e.g. 92.0" value={profile.class12_pct} onChange={e => update('class12_pct', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>IPMAT Score</label>
              <input className={styles.input} type="number" placeholder="e.g. 289" value={profile.ipmat_score} onChange={e => update('ipmat_score', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Estimated Rank</label>
              <input className={styles.input} type="number" placeholder="e.g. 50" value={profile.ipmat_rank_est} onChange={e => update('ipmat_rank_est', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Other Exam Scores (JEE/SAT/etc.)</label>
              <input className={styles.input} placeholder="e.g. JEE Mains 98.5 percentile" value={profile.other_exams} onChange={e => update('other_exams', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Extracurriculars */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><span className={styles.cardIcon}>🏆</span> Extracurriculars & Achievements</div>
          <div className={styles.cardSubtitle}>Sports, clubs, olympiads, social work, leadership — panels love this section</div>

          <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
            <label className={styles.label}>Extracurricular Activities</label>
            <div className={styles.tagInput}>
              <input
                className={styles.input}
                placeholder="Type activity and press Add (e.g. School Cricket Captain)"
                value={extInput}
                onChange={e => setExtInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('extracurriculars', extInput, setExtInput))}
              />
              <button className={styles.btnSecondary} onClick={() => addTag('extracurriculars', extInput, setExtInput)} type="button">Add</button>
            </div>
            <div className={styles.tagRow}>
              {profile.extracurriculars.map((ext, i) => (
                <span key={i} className={styles.tag}>
                  {ext} <span className={styles.tagRemove} onClick={() => removeTag('extracurriculars', i)}>×</span>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Key Achievements & Awards</label>
            <div className={styles.tagInput}>
              <input
                className={styles.input}
                placeholder="e.g. State-level Science Olympiad Gold"
                value={achieveInput}
                onChange={e => setAchieveInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('achievements', achieveInput, setAchieveInput))}
              />
              <button className={styles.btnSecondary} onClick={() => addTag('achievements', achieveInput, setAchieveInput)} type="button">Add</button>
            </div>
            <div className={styles.tagRow}>
              {profile.achievements.map((ach, i) => (
                <span key={i} className={styles.tag}>
                  {ach} <span className={styles.tagRemove} onClick={() => removeTag('achievements', i)}>×</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Self-Awareness (PI Gold) */}
        <div className={styles.card}>
          <div className={styles.cardTitle}><span className={styles.cardIcon}>🧠</span> Self-Awareness</div>
          <div className={styles.cardSubtitle}>These are the most commonly asked PI questions — prepare them well</div>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Why do you want to pursue an MBA / IPM?</label>
              <textarea className={styles.textarea} placeholder="Be genuine. The panel can tell if you're saying what you think they want to hear..." value={profile.why_mba} onChange={e => update('why_mba', e.target.value)} />
            </div>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>What is your career goal?</label>
              <textarea className={styles.textarea} placeholder="Short-term and long-term. Be specific — 'I want to work in consulting' is better than 'I want to be successful'..." value={profile.career_goal} onChange={e => update('career_goal', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Your 3 biggest strengths</label>
              <textarea className={styles.textarea} placeholder="Back each strength with a real example..." value={profile.strengths} onChange={e => update('strengths', e.target.value)} style={{ minHeight: '80px' }} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Your weaknesses (and what you're doing about them)</label>
              <textarea className={styles.textarea} placeholder="Be honest but show self-awareness and improvement..." value={profile.weaknesses} onChange={e => update('weaknesses', e.target.value)} style={{ minHeight: '80px' }} />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className={styles.btnRow}>
          <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : saved ? '✓ Saved!' : '💾 Save Profile'}
          </button>
          <button className={styles.btnSecondary} onClick={() => router.push('/pi/sop')}>
            Next: Build Your SOP →
          </button>
        </div>
      </div>
    </PIAuthGuard>
    </AppShell>
  );
}
