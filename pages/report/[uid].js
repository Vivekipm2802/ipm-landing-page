import { useEffect, useState, useRef } from 'react';
import styles from './Report.module.css';
import modernStyles from './ReportModern.module.css';
import { supabase } from '../../utils/supabaseClient';
import { NextSeo } from 'next-seo';
import 'tailwindcss/tailwind.css';
import { Button, Divider, Spacer, Card, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import ReportModern from '../../components/ReportModern';

// ═══════ VIEW TOGGLE COMPONENT ═══════
const ViewToggle = ({ view, setView }) => (
  <div className={modernStyles.viewToggle}>
    <div className={modernStyles.togglePill}>
      <button
        className={`${modernStyles.toggleBtn} ${view === 'modern' ? modernStyles.toggleBtnActive : ''}`}
        onClick={() => setView('modern')}
      >
        ✨ Modern
      </button>
      <button
        className={`${modernStyles.toggleBtn} ${view === 'classic' ? modernStyles.toggleBtnActive : ''}`}
        onClick={() => setView('classic')}
      >
        📋 Classic
      </button>
    </div>
  </div>
);

// ═══════ CLASSIC VIEW COMPONENTS ═══════

// Animated Counter Hook
function useCountUp(target, duration = 1600) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target == null) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

// Grade & Vibe Helpers
function getGrade(score, max) {
  const pct = (score / max) * 100;
  if (pct >= 80) return { letter: 'S+', vibe: 'Absolute legend status 🔥', emoji: '👑', color: '#ffd700' };
  if (pct >= 70) return { letter: 'S',  vibe: 'You cooked. IIM bound.', emoji: '🚀', color: '#00d4ff' };
  if (pct >= 60) return { letter: 'A+', vibe: 'Strong game. Lock in PI prep.', emoji: '💪', color: '#00ff88' };
  if (pct >= 50) return { letter: 'A',  vibe: 'Solid. One more push.', emoji: '⚡', color: '#a855f7' };
  if (pct >= 40) return { letter: 'B',  vibe: 'In the fight. Refine strategy.', emoji: '🎯', color: '#ff8c42' };
  if (pct >= 25) return { letter: 'C',  vibe: 'Foundation laid. Time to level up.', emoji: '📈', color: '#ff5e7e' };
  return { letter: 'D', vibe: 'Every topper started here. Let\'s build.', emoji: '🌱', color: '#6c63ff' };
}

// Hero Reveal (Classic)
const HeroReveal = ({ scores, stats, studentName, testDate, category }) => {
  const scoreNow = useCountUp(scores.total.score, 1800);
  const pct = (scores.total.score / scores.total.max) * 100;
  const grade = getGrade(scores.total.score, scores.total.max);
  const firstName = (studentName || 'Student').split(' ')[0];

  return (
    <div className={styles.hero} style={{ '--grade-color': grade.color }}>
      <div className={styles.heroBlobs}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>
      </div>
      <div className={styles.heroContent}>
        <div className={styles.heroTop}>
          <span className={styles.heroBadge}>⚡ IPMAT 2024 • {category || 'GEN'}</span>
          <span className={styles.heroDate}>{new Date(testDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <h1 className={styles.heroGreeting}>hey {firstName.toLowerCase()},</h1>
        <p className={styles.heroSub}>here's your wrapped 👇</p>

        <div className={styles.heroScoreBlock}>
          <div className={styles.heroGradeRing}>
            <svg viewBox="0 0 120 120" className={styles.ringSvg}>
              <circle cx="60" cy="60" r="52" className={styles.ringBg} />
              <circle
                cx="60" cy="60" r="52"
                className={styles.ringFg}
                style={{ strokeDasharray: `${(pct / 100) * 326.7} 326.7` }}
              />
            </svg>
            <div className={styles.heroGradeLetter}>{grade.letter}</div>
          </div>
          <div className={styles.heroScoreRight}>
            <div className={styles.heroScoreValue}>
              {scoreNow}<span className={styles.heroScoreMax}>/{scores.total.max}</span>
            </div>
            <div className={styles.heroVibe}>
              <span className={styles.heroVibeEmoji}>{grade.emoji}</span> {grade.vibe}
            </div>
          </div>
        </div>

        <div className={styles.heroChips}>
          <div className={styles.heroChip}><span>🎯</span> {stats.accuracy}% accuracy</div>
          <div className={styles.heroChip}><span>✅</span> {stats.totalCorrect} correct</div>
          <div className={styles.heroChip}><span>📝</span> {stats.attempted}/{stats.total} attempted</div>
        </div>
      </div>
    </div>
  );
};

// Bento Donut Chart (Classic)
const BentoDonut = ({ correct, incorrect, unattempted, total }) => {
  const cPct = total > 0 ? (correct / total) * 100 : 0;
  const iPct = total > 0 ? (incorrect / total) * 100 : 0;
  const uPct = total > 0 ? (unattempted / total) * 100 : 0;
  const circ = 2 * Math.PI * 46;
  const cDash = (cPct / 100) * circ;
  const iDash = (iPct / 100) * circ;
  const uDash = (uPct / 100) * circ;
  return (
    <div className={styles.bentoCard + ' ' + styles.bentoDonut}>
      <div className={styles.bentoLabel}>Question Breakdown</div>
      <div className={styles.donutWrap}>
        <svg viewBox="0 0 120 120" className={styles.donutSvg}>
          <circle cx="60" cy="60" r="46" className={styles.donutTrack} />
          <circle cx="60" cy="60" r="46" className={styles.donutCorrect}
            style={{ strokeDasharray: `${cDash} ${circ}`, strokeDashoffset: 0 }} />
          <circle cx="60" cy="60" r="46" className={styles.donutIncorrect}
            style={{ strokeDasharray: `${iDash} ${circ}`, strokeDashoffset: -cDash }} />
          <circle cx="60" cy="60" r="46" className={styles.donutUnatt}
            style={{ strokeDasharray: `${uDash} ${circ}`, strokeDashoffset: -(cDash + iDash) }} />
          <text x="60" y="57" textAnchor="middle" className={styles.donutCenterNum}>{correct}</text>
          <text x="60" y="73" textAnchor="middle" className={styles.donutCenterLbl}>correct</text>
        </svg>
      </div>
      <div className={styles.donutLegend}>
        <div><span className={styles.dotCorrect}></span>Correct {correct}</div>
        <div><span className={styles.dotIncorrect}></span>Wrong {incorrect}</div>
        <div><span className={styles.dotUnatt}></span>Skipped {unattempted}</div>
      </div>
    </div>
  );
};

// Bento Stat Card (Classic)
const BentoStat = ({ label, value, sub, emoji, tone = 'default' }) => (
  <div className={`${styles.bentoCard} ${styles['bentoTone_' + tone]}`}>
    <div className={styles.bentoEmoji}>{emoji}</div>
    <div className={styles.bentoValue}>{value}</div>
    <div className={styles.bentoLabel}>{label}</div>
    {sub && <div className={styles.bentoSub}>{sub}</div>}
  </div>
);

// Subject Bar Card (Classic)
const SubjectBar = ({ title, subtitle, score, max, correct, total, color }) => {
  const pct = Math.max(0, (score / max) * 100);
  const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className={styles.subjectCard} style={{ '--subj-color': color }}>
      <div className={styles.subjectHead}>
        <div>
          <div className={styles.subjectTitle}>{title}</div>
          <div className={styles.subjectSubtitle}>{subtitle}</div>
        </div>
        <div className={styles.subjectScore}>
          <span>{score}</span>
          <small>/{max}</small>
        </div>
      </div>
      <div className={styles.subjectBarTrack}>
        <div className={styles.subjectBarFill} style={{ width: `${pct}%` }}></div>
      </div>
      <div className={styles.subjectFoot}>
        <span>🎯 {acc}% accuracy</span>
        <span>{correct}/{total} correct</span>
      </div>
    </div>
  );
};

// Flashcards (Classic)
const Flashcards = ({ jsonData }) => {
  const wrong = [];
  if (jsonData?.sa) jsonData.sa.forEach((q, i) => {
    if (q.status !== 'Not Answered' && q.givenAnswer !== q.rightAnswer)
      wrong.push({ ...q, type: 'SA', subject: 'Quant (SA)', num: i + 1, color: '#6c63ff' });
  });
  if (jsonData?.mcq) jsonData.mcq.forEach((q, i) => {
    if (q.status !== 'Not Answered' && q.givenAnswer !== q.rightAnswer)
      wrong.push({ ...q, type: 'MCQ', subject: 'Quant (MCQ)', num: i + 1, color: '#00d4ff' });
  });
  if (jsonData?.va) jsonData.va.forEach((q, i) => {
    if (q.status !== 'Not Answered' && q.givenAnswer !== q.rightAnswer)
      wrong.push({ ...q, type: 'VA', subject: 'Verbal Ability', num: i + 1, color: '#ff5e7e' });
  });
  const top = wrong.slice(0, 8);
  const [flipped, setFlipped] = useState({});

  if (top.length === 0) {
    return (
      <div className={styles.flashEmpty}>
        <div className={styles.flashEmptyEmoji}>🏆</div>
        <div className={styles.flashEmptyTitle}>Zero wrong attempts. Unreal.</div>
        <div className={styles.flashEmptySub}>You either skipped smart or hit every target. Respect.</div>
      </div>
    );
  }

  return (
    <div className={styles.flashSection}>
      <div className={styles.flashHeader}>
        <div>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Review Cards 🃏</h2>
          <p className={styles.flashSubtitle}>Tap any card to flip. Focus on these in your next mock.</p>
        </div>
        <span className={styles.flashCount}>{top.length} to review</span>
      </div>
      <div className={styles.flashGrid}>
        {top.map((q, i) => (
          <div
            key={i}
            className={`${styles.flashCard} ${flipped[i] ? styles.flashFlipped : ''}`}
            onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))}
            style={{ '--card-color': q.color }}
          >
            <div className={styles.flashInner}>
              <div className={styles.flashFront}>
                <div className={styles.flashTag}>{q.subject}</div>
                <div className={styles.flashQNum}>Q{q.num}</div>
                <div className={styles.flashPrompt}>You answered:</div>
                <div className={styles.flashYourAns}>{q.givenAnswer || '—'}</div>
                <div className={styles.flashFlipHint}>tap to reveal ↻</div>
              </div>
              <div className={styles.flashBack}>
                <div className={styles.flashBackLabel}>Correct answer</div>
                <div className={styles.flashRightAns}>{q.rightAnswer}</div>
                <div className={styles.flashNote}>+4 marks up for grabs next time 💰</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════ CUTOFF DATA ═══════
const CUTOFFS = {
  'GEN':    { safe: 200, borderline: 170, label: 'General' },
  'OBC':    { safe: 170, borderline: 145, label: 'OBC-NCL' },
  'SC':     { safe: 140, borderline: 115, label: 'SC' },
  'ST':     { safe: 120, borderline: 95,  label: 'ST' },
  'EWS':    { safe: 185, borderline: 155, label: 'EWS' },
  'PwD':    { safe: 110, borderline: 85,  label: 'PwD' },
};

function getStudentBucket(score, category) {
  const cutoff = CUTOFFS[category] || CUTOFFS['GEN'];
  if (score >= cutoff.safe) return 'HIGH';
  if (score >= cutoff.borderline) return 'BORDERLINE';
  return 'LOW';
}

function getCutoffProbability(score, category) {
  const cutoff = CUTOFFS[category] || CUTOFFS['GEN'];
  if (score >= cutoff.safe + 30) return 95;
  if (score >= cutoff.safe) return 80;
  if (score >= cutoff.borderline + 10) return 55;
  if (score >= cutoff.borderline) return 35;
  if (score >= cutoff.borderline - 20) return 15;
  return 5;
}

// Smart Recommendation (Classic)
const SmartRecommendation = ({ scores, stats, category, studentName, router, uid }) => {
  const bucket = getStudentBucket(scores.total.score, category);
  const probability = getCutoffProbability(scores.total.score, category);
  const cutoff = CUTOFFS[category] || CUTOFFS['GEN'];
  const firstName = studentName.split(' ')[0];

  return (
    <div className={styles.smartSection}>
      <h2 className={styles.sectionTitle}>Cutoff Analysis ({cutoff.label} Category)</h2>
      <div className={styles.cutoffContainer}>
        <div className={styles.cutoffBar}>
          <div className={styles.cutoffTrack}>
            <div className={styles.cutoffFill} style={{ width: `${Math.min((scores.total.score / scores.total.max) * 100, 100)}%` }}></div>
            <div className={styles.cutoffMarker} style={{ left: `${(cutoff.borderline / scores.total.max) * 100}%` }}>
              <span className={styles.cutoffMarkerLabel}>Borderline<br />{cutoff.borderline}</span>
            </div>
            <div className={`${styles.cutoffMarker} ${styles.cutoffMarkerSafe}`} style={{ left: `${(cutoff.safe / scores.total.max) * 100}%` }}>
              <span className={styles.cutoffMarkerLabel}>Safe Zone<br />{cutoff.safe}</span>
            </div>
          </div>
          <div className={styles.cutoffScoreIndicator} style={{ left: `${(scores.total.score / scores.total.max) * 100}%` }}>
            <span className={styles.cutoffYourScore}>Your Score: {scores.total.score}</span>
          </div>
        </div>

        <div className={styles.probabilityBox}>
          <div className={styles.probabilityLabel}>Interview Call Probability</div>
          <div className={styles.probabilityMeter}>
            <div className={`${styles.probabilityFill} ${probability >= 70 ? styles.probHigh : probability >= 40 ? styles.probMedium : styles.probLow}`}
              style={{ width: `${probability}%` }}></div>
          </div>
          <div className={styles.probabilityValue}>{probability}%</div>
          <div className={styles.probabilityNote}>Based on historical IPMAT Indore cutoffs for {cutoff.label} category</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>What This Means For You</h2>

      {bucket === 'HIGH' && (
        <div className={`${styles.recommendationCard} ${styles.recHigh}`}>
          <div className={styles.recHeader}>
            <span className={styles.recEmoji}>🎉</span>
            <div>
              <h3 className={styles.recTitle}>Congratulations, {firstName}!</h3>
              <p className={styles.recSubtitle}>You are in the <strong>safe zone</strong> for an interview call</p>
            </div>
          </div>
          <p className={styles.recDescription}>
            Your score of <strong>{scores.total.score}/{scores.total.max}</strong> puts you well above the expected cutoff of {cutoff.safe} for {cutoff.label} category.
            Now is the time to focus on your <strong>Personal Interview (PI)</strong> preparation.
          </p>
          <div className={styles.recActions}>
            <div className={styles.recActionCard} onClick={() => router.push(`/interview-prep?uid=${uid}`)}>
              <div className={styles.recActionIcon}>🤖</div>
              <div className={styles.recActionContent}>
                <h4>AI Mock Interview</h4>
                <p>Practice PI questions powered by AI. Get instant feedback on your answers.</p>
                <span className={styles.recActionCta}>Start Practicing →</span>
              </div>
            </div>
            <div className={styles.recActionCard} onClick={() => router.push('/pi-batch')}>
              <div className={styles.recActionIcon}>🎓</div>
              <div className={styles.recActionContent}>
                <h4>PI Preparation Batch</h4>
                <p>1-on-1 mentoring with IIM alumni. Mock interviews, SOP review & WAT prep.</p>
                <span className={styles.recActionCta}>Enroll Now →</span>
              </div>
            </div>
            <div className={styles.recActionCard} onClick={() => window.open('https://wa.me/918299470392?text=Hi%2C%20I%20scored%20' + scores.total.score + '%20in%20IPMAT.%20I%20want%20to%20know%20about%20PI%20preparation.', '_blank')}>
              <div className={styles.recActionIcon}>📞</div>
              <div className={styles.recActionContent}>
                <h4>Talk to a Mentor</h4>
                <p>Get a free 15-min strategy call with an IIM alumnus about your PI preparation.</p>
                <span className={styles.recActionCta}>Book Free Call →</span>
              </div>
            </div>
          </div>
          <div className={styles.socialProof}>
            <span>📊</span> 847 students who scored above {cutoff.safe} have already started PI prep with IPM Careers
          </div>
        </div>
      )}

      {bucket === 'BORDERLINE' && (
        <div className={`${styles.recommendationCard} ${styles.recBorderline}`}>
          <div className={styles.recHeader}>
            <span className={styles.recEmoji}>🎯</span>
            <div>
              <h3 className={styles.recTitle}>You're in the borderline zone, {firstName}</h3>
              <p className={styles.recSubtitle}>Your score is close to the cutoff — preparation is key</p>
            </div>
          </div>
          <p className={styles.recDescription}>
            Your score of <strong>{scores.total.score}/{scores.total.max}</strong> is near the expected cutoff range of {cutoff.borderline}–{cutoff.safe} for {cutoff.label} category.
            There's a real chance you'll get the interview call. <strong>Don't wait</strong> — start PI prep now.
          </p>
          <div className={styles.recActions}>
            <div className={styles.recActionCard} onClick={() => router.push(`/interview-prep?uid=${uid}`)}>
              <div className={styles.recActionIcon}>🤖</div>
              <div className={styles.recActionContent}>
                <h4>AI Mock Interview (Free Trial)</h4>
                <p>Start preparing now. 2 free mock PI sessions to sharpen your answers.</p>
                <span className={styles.recActionCta}>Try Free →</span>
              </div>
            </div>
            <div className={styles.recActionCard} onClick={() => window.open('https://wa.me/918299470392?text=Hi%2C%20I%20scored%20' + scores.total.score + '%20in%20IPMAT.%20Am%20I%20likely%20to%20get%20a%20call%3F', '_blank')}>
              <div className={styles.recActionIcon}>📞</div>
              <div className={styles.recActionContent}>
                <h4>Free Strategy Call</h4>
                <p>Speak with a counsellor to understand your chances and plan next steps.</p>
                <span className={styles.recActionCta}>Book Now →</span>
              </div>
            </div>
            <div className={styles.recActionCard} onClick={() => router.push('/pi-batch')}>
              <div className={styles.recActionIcon}>🎓</div>
              <div className={styles.recActionContent}>
                <h4>PI + Backup Plan Package</h4>
                <p>PI prep with IIM alumni + guidance on backup college options.</p>
                <span className={styles.recActionCta}>Explore →</span>
              </div>
            </div>
          </div>
          <div className={styles.socialProof}>
            <span>💡</span> Last year, 62% of students in the borderline range who prepared for PI got through
          </div>
        </div>
      )}

      {bucket === 'LOW' && (
        <div className={`${styles.recommendationCard} ${styles.recLow}`}>
          <div className={styles.recHeader}>
            <span className={styles.recEmoji}>💪</span>
            <div>
              <h3 className={styles.recTitle}>This isn't the end, {firstName}</h3>
              <p className={styles.recSubtitle}>Your IIM dream is still alive — here's your path forward</p>
            </div>
          </div>
          <p className={styles.recDescription}>
            Your score of <strong>{scores.total.score}/{scores.total.max}</strong> is below the expected cutoff of {cutoff.borderline} for {cutoff.label} category.
            But many successful IIM students didn't crack it on their first attempt.
          </p>
          <div className={styles.recPathsContainer}>
            <div className={styles.recPath}>
              <div className={styles.recPathHeader}>
                <span className={styles.recPathIcon}>🔄</span>
                <h4>Path A: Take a Strategic Drop</h4>
              </div>
              <p className={styles.recPathDescription}>Join our comprehensive IPMAT preparation batch.</p>
              <div className={styles.recPathActions}>
                <div className={styles.recActionCard} onClick={() => router.push('/crash-course')}>
                  <div className={styles.recActionIcon}>📚</div>
                  <div className={styles.recActionContent}>
                    <h4>IPMAT Full Prep Course</h4>
                    <p>Complete course covering Quant, VA, and mock tests with personal mentoring.</p>
                    <span className={styles.recActionCta}>View Course →</span>
                  </div>
                </div>
                <div className={styles.recActionCard} onClick={() => window.open('https://wa.me/918299470392?text=Hi%2C%20I%20scored%20' + scores.total.score + '%20in%20IPMAT.%20I%20want%20to%20know%20about%20the%20drop%20year%20batch.', '_blank')}>
                  <div className={styles.recActionIcon}>📞</div>
                  <div className={styles.recActionContent}>
                    <h4>Talk to a Mentor</h4>
                    <p>Free counselling call to plan your drop year strategy.</p>
                    <span className={styles.recActionCta}>Book Free Call →</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.recPathDividerOr}><span>OR</span></div>
            <div className={styles.recPath}>
              <div className={styles.recPathHeader}>
                <span className={styles.recPathIcon}>🏫</span>
                <h4>Path B: Explore Top Colleges</h4>
              </div>
              <p className={styles.recPathDescription}>There are excellent management programs beyond IIM Indore.</p>
              <div className={styles.recPathActions}>
                <div className={styles.recActionCard} onClick={() => router.push('/call')}>
                  <div className={styles.recActionIcon}>🎯</div>
                  <div className={styles.recActionContent}>
                    <h4>College Predictor</h4>
                    <p>Find colleges you can get into based on your IPMAT score.</p>
                    <span className={styles.recActionCta}>Check Now →</span>
                  </div>
                </div>
                <div className={styles.recActionCard} onClick={() => window.open('https://wa.me/918299470392?text=Hi%2C%20I%20scored%20' + scores.total.score + '%20in%20IPMAT.%20Can%20you%20suggest%20good%20colleges%20for%20my%20score%3F', '_blank')}>
                  <div className={styles.recActionIcon}>💬</div>
                  <div className={styles.recActionContent}>
                    <h4>College Guidance</h4>
                    <p>Get personalized college recommendations from our experts.</p>
                    <span className={styles.recActionCta}>Get Recommendations →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.socialProof}>
            <span>🌟</span> 340+ students who scored below cutoff last year secured admissions in top colleges through IPM Careers guidance
          </div>
        </div>
      )}

      <h2 className={styles.sectionTitle}>How You Compare</h2>
      <div className={styles.compareGrid}>
        <div className={styles.compareCard}>
          <div className={styles.compareLabel}>Your Score</div>
          <div className={styles.compareValue}>{scores.total.score}</div>
        </div>
        <div className={styles.compareCard}>
          <div className={styles.compareLabel}>{cutoff.label} Cutoff (Expected)</div>
          <div className={styles.compareValue}>{cutoff.safe}</div>
        </div>
        <div className={styles.compareCard}>
          <div className={styles.compareLabel}>Gap</div>
          <div className={`${styles.compareValue} ${scores.total.score >= cutoff.safe ? styles.comparePositive : styles.compareNegative}`}>
            {scores.total.score >= cutoff.safe ? '+' : ''}{scores.total.score - cutoff.safe}
          </div>
        </div>
        <div className={styles.compareCard}>
          <div className={styles.compareLabel}>Your Accuracy</div>
          <div className={styles.compareValue}>{stats.accuracy}%</div>
        </div>
      </div>
    </div>
  );
};

// Question Row (Classic)
const QuestionRow = ({ question, index, type }) => {
  const isCorrect = question.rightAnswer === question.givenAnswer;
  const isUnanswered = question.status === 'Not Answered';
  const isReview = question.status === 'Marked For Review';

  let statusBadge = '';
  let statusColor = '';
  if (isUnanswered) { statusBadge = 'Unattempted'; statusColor = 'status-unattempted'; }
  else if (isReview) { statusBadge = 'Marked for Review'; statusColor = 'status-review'; }
  else if (isCorrect) { statusBadge = 'Correct'; statusColor = 'status-correct'; }
  else { statusBadge = 'Incorrect'; statusColor = 'status-incorrect'; }

  return (
    <tr className={styles[statusColor]}>
      <td>{index}</td>
      <td>{question.givenAnswer || '-'}</td>
      <td>{question.rightAnswer}</td>
      <td><span className={`${styles.statusBadge} ${styles[statusColor]}`}>{statusBadge}</span></td>
      <td className={styles.evaluation}>
        {isUnanswered ? <span className={styles.iconGray}>–</span> :
         isCorrect ? <span className={styles.iconGreen}>✓</span> :
         <span className={styles.iconRed}>✗</span>}
      </td>
    </tr>
  );
};

// ═══════ MAIN REPORT PAGE ═══════
function Report({ data, error, isFound }) {
  const [jsonData, setJsonData] = useState(null);
  const [scores, setScores] = useState(null);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('modern'); // 'modern' or 'classic'
  const router = useRouter();

  // Score calculation
  const calculateScores = (d, subtractScore, addScore, special) => {
    if (!d || !Array.isArray(d)) return 0;
    return d.reduce((sum, i) => {
      if (i.status === 'Answered' || i.status === 'Marked For Review') {
        if (i.rightAnswer == i.givenAnswer) return sum + addScore;
        else if (i.rightAnswer != i.givenAnswer && subtractScore > 0 && !(special == true && i.givenAnswer.length > 1))
          return sum - subtractScore;
      }
      return sum;
    }, 0);
  };

  const countQuestions = (d, type) => {
    if (!d || !Array.isArray(d)) return { correct: 0, incorrect: 0, unattempted: 0, attempted: 0 };
    let correct = 0, incorrect = 0, unattempted = 0, attempted = 0;
    const subtractScore = type === 'sa' ? 0 : 1;
    d.forEach(i => {
      if (i.status === 'Not Answered') { unattempted++; }
      else {
        attempted++;
        if (i.rightAnswer == i.givenAnswer) correct++;
        else if (subtractScore > 0 && !(type === 'va' && i.givenAnswer.length > 1)) incorrect++;
        else if (type === 'va' && i.givenAnswer.length > 1) incorrect++;
      }
    });
    return { correct, incorrect, unattempted, attempted, total: d.length };
  };

  useEffect(() => {
    if (isFound && data) {
      try {
        const parsedData = JSON.parse(data.data);
        const saData = parsedData.sa || [];
        const mcqData = parsedData.mcq || [];
        const vaData = parsedData.va || [];
        setJsonData({ sa: saData, mcq: mcqData, va: vaData });

        const saScore = calculateScores(saData, 0, 4);
        const mcqScore = calculateScores(mcqData, 1, 4);
        const vaScore = calculateScores(vaData, 1, 4, true);
        const totalScore = saScore + mcqScore + vaScore;
        const saMax = saData.length * 4;
        const mcqMax = mcqData.length * 4;
        const vaMax = vaData.length * 4;
        const totalMax = saMax + mcqMax + vaMax;
        setScores({
          sa: { score: saScore, max: saMax },
          mcq: { score: mcqScore, max: mcqMax },
          va: { score: vaScore, max: vaMax },
          total: { score: totalScore, max: totalMax },
        });

        const saStats = countQuestions(saData, 'sa');
        const mcqStats = countQuestions(mcqData, 'mcq');
        const vaStats = countQuestions(vaData, 'va');
        const totalAttempted = saStats.attempted + mcqStats.attempted + vaStats.attempted;
        const totalQuestions = saStats.total + mcqStats.total + vaStats.total;
        const totalCorrect = saStats.correct + mcqStats.correct + vaStats.correct;
        const totalIncorrect = saStats.incorrect + mcqStats.incorrect + vaStats.incorrect;
        const totalUnattempted = saStats.unattempted + mcqStats.unattempted + vaStats.unattempted;
        const accuracy = totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(2) : 0;
        const positiveScore = (saStats.correct * 4) + (mcqStats.correct * 4) + (vaStats.correct * 4);
        const marksLost = Math.abs(totalIncorrect * 1);

        setStats({
          attempted: totalAttempted, total: totalQuestions, accuracy,
          positiveScore, marksLost, sa: saStats, mcq: mcqStats, va: vaStats,
          totalCorrect, totalIncorrect, totalUnattempted,
        });
      } catch (e) {
        console.error('Error parsing data:', e);
      }
    }
  }, [data, isFound]);

  if (isFound === false) {
    return (
      <div className="flex flex-col bg-gray-100 h-screen w-full justify-center items-center">
        <div className="flex flex-row font-sans text-center">We are unable to find your report<br />Please check your email for valid link</div>
        <Spacer y={2}></Spacer>
        {router.query.uid?.length < 5 ? <h2 className="border-1 border-red-500 px-2 py-1 rounded-xl bg-red-50 text-red-500 font-sans">Old Links are Expired Now</h2> : ''}
      </div>
    );
  }

  return (
    <AppShell activePage="/report">
      <NextSeo
        title={'IPMAT Detailed Report | IPM Careers Premium IPMAT Coaching'}
        description={'Comprehensive IPMAT performance report generated from response sheet analysis.'}
        openGraph={{
          title: 'IPMAT Detailed Report | IPM Careers Premium IPMAT Coaching',
          description: 'Comprehensive IPMAT performance report generated from response sheet analysis.',
          images: [{ url: '/scorecard_ss.png', width: 1200, height: 630, alt: 'IPM Careers IPMAT Report' }]
        }}
      />

      {/* ═══ VIEW TOGGLE ═══ */}
      <ViewToggle view={view} setView={setView} />

      {/* ═══ MODERN VIEW ═══ */}
      {view === 'modern' && (
        <ReportModern
          data={data}
          scores={scores}
          stats={stats}
          jsonData={jsonData}
          router={router}
        />
      )}

      {/* ═══ CLASSIC VIEW ═══ */}
      {view === 'classic' && (
        <div className={styles.reportPage}>
          {/* Hero */}
          {scores && stats && (
            <HeroReveal scores={scores} stats={stats} studentName={data?.name} testDate={data?.created_at} category={data?.category} />
          )}

          {/* Bento Grid */}
          {scores && stats && (
            <div className={styles.bentoSection}>
              <h2 className={styles.sectionTitle}>The Breakdown 📊</h2>
              <div className={styles.bentoGrid}>
                <BentoDonut correct={stats.totalCorrect} incorrect={stats.totalIncorrect} unattempted={stats.totalUnattempted} total={stats.total} />
                <BentoStat tone="green" emoji="✅" label="Positive marks" value={`+${stats.positiveScore}`} sub="from correct answers" />
                <BentoStat tone="pink" emoji="💔" label="Marks lost" value={`-${stats.marksLost}`} sub="negative marking" />
                <BentoStat tone="violet" emoji="🎯" label="Accuracy" value={`${stats.accuracy}%`} sub={`${stats.totalCorrect}/${stats.attempted} attempted`} />
                <BentoStat tone="blue" emoji="📝" label="Attempted" value={`${stats.attempted}`} sub={`of ${stats.total} questions`} />
                <BentoStat tone="amber" emoji="⏭️" label="Skipped" value={`${stats.totalUnattempted}`} sub="left untouched" />
              </div>
            </div>
          )}

          {/* Subject Bars */}
          {scores && stats && (
            <div className={styles.performanceSection}>
              <h2 className={styles.sectionTitle}>Subject Deep-Dive 🔬</h2>
              <div className={styles.subjectGrid}>
                <SubjectBar title="Short Answer" subtitle="Quantitative Ability (no negative)" score={scores.sa.score} max={scores.sa.max} correct={stats.sa.correct} total={stats.sa.total} color="#6c63ff" />
                <SubjectBar title="Multiple Choice" subtitle="Quantitative Ability" score={scores.mcq.score} max={scores.mcq.max} correct={stats.mcq.correct} total={stats.mcq.total} color="#00d4ff" />
                <SubjectBar title="Verbal Ability" subtitle="Reading Comprehension" score={scores.va.score} max={scores.va.max} correct={stats.va.correct} total={stats.va.total} color="#ff5e7e" />
              </div>
            </div>
          )}

          {/* Flashcards */}
          {jsonData && <Flashcards jsonData={jsonData} />}

          {/* Test Breakdown Table */}
          {stats && (
            <div className={styles.breakdownSection}>
              <h2 className={styles.sectionTitle}>Test Breakdown</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.breakdownTable}>
                  <thead>
                    <tr><th>Subject</th><th>Correct</th><th>Incorrect</th><th>Unattempted</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={styles.tdLabel}>Overall</td>
                      <td><span className={`${styles.badge} ${styles.badgeCorrect}`}>{stats.totalCorrect}</span></td>
                      <td><span className={`${styles.badge} ${styles.badgeIncorrect}`}>{stats.totalIncorrect}</span></td>
                      <td><span className={`${styles.badge} ${styles.badgeUnattempted}`}>{stats.totalUnattempted}</span></td>
                      <td>{stats.total}</td>
                    </tr>
                    <tr>
                      <td className={styles.tdLabel}>Short Answer (SA)</td>
                      <td><span className={`${styles.badge} ${styles.badgeCorrect}`}>{stats.sa.correct}</span></td>
                      <td><span className={`${styles.badge} ${styles.badgeIncorrect}`}>{stats.sa.incorrect}</span></td>
                      <td><span className={`${styles.badge} ${styles.badgeUnattempted}`}>{stats.sa.unattempted}</span></td>
                      <td>{stats.sa.total}</td>
                    </tr>
                    <tr>
                      <td className={styles.tdLabel}>Multiple Choice (MCQ)</td>
                      <td><span className={`${styles.badge} ${styles.badgeCorrect}`}>{stats.mcq.correct}</span></td>
                      <td><span className={`${styles.badge} ${styles.badgeIncorrect}`}>{stats.mcq.incorrect}</span></td>
                      <td><span className={`${styles.badge} ${styles.badgeUnattempted}`}>{stats.mcq.unattempted}</span></td>
                      <td>{stats.mcq.total}</td>
                    </tr>
                    <tr>
                      <td className={styles.tdLabel}>Verbal Ability (VA)</td>
                      <td><span className={`${styles.badge} ${styles.badgeCorrect}`}>{stats.va.correct}</span></td>
                      <td><span className={`${styles.badge} ${styles.badgeIncorrect}`}>{stats.va.incorrect}</span></td>
                      <td><span className={`${styles.badge} ${styles.badgeUnattempted}`}>{stats.va.unattempted}</span></td>
                      <td>{stats.va.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detailed Question-wise */}
          {jsonData && (
            <div className={styles.detailedSection}>
              <h2 className={styles.sectionTitle}>Detailed Question-Wise Analysis</h2>
              {jsonData.sa && jsonData.sa.length > 0 && (
                <div className={styles.sectionBlock}>
                  <h3 className={styles.subsectionTitle}>Short Answer (Quantitative Ability)</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.detailTable}>
                      <thead><tr><th>Q No</th><th>Your Answer</th><th>Correct Answer</th><th>Status</th><th>Evaluation</th></tr></thead>
                      <tbody>{jsonData.sa.map((q, idx) => <QuestionRow key={`sa-${idx}`} question={q} index={idx + 1} type="SA" />)}</tbody>
                    </table>
                  </div>
                </div>
              )}
              {jsonData.mcq && jsonData.mcq.length > 0 && (
                <div className={styles.sectionBlock}>
                  <h3 className={styles.subsectionTitle}>Multiple Choice (Quantitative Ability)</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.detailTable}>
                      <thead><tr><th>Q No</th><th>Your Answer</th><th>Correct Answer</th><th>Status</th><th>Evaluation</th></tr></thead>
                      <tbody>{jsonData.mcq.map((q, idx) => <QuestionRow key={`mcq-${idx}`} question={q} index={jsonData.sa.length + idx + 1} type="MCQ" />)}</tbody>
                    </table>
                  </div>
                </div>
              )}
              {jsonData.va && jsonData.va.length > 0 && (
                <div className={styles.sectionBlock}>
                  <h3 className={styles.subsectionTitle}>Verbal Ability (Reading Comprehension)</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.detailTable}>
                      <thead><tr><th>Q No</th><th>Your Answer</th><th>Correct Answer</th><th>Status</th><th>Evaluation</th></tr></thead>
                      <tbody>{jsonData.va.map((q, idx) => <QuestionRow key={`va-${idx}`} question={q} index={jsonData.sa.length + jsonData.mcq.length + idx + 1} type="VA" />)}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Smart Recommendation */}
          {scores && stats && (
            <SmartRecommendation scores={scores} stats={stats} category={data?.category || 'GEN'} studentName={data?.name || 'Student'} router={router} uid={router.query.uid} />
          )}

          {/* Share */}
          {scores && stats && (
            <div className={styles.shareSection}>
              <h2 className={styles.sectionTitle}>Share Your Score</h2>
              <div className={styles.shareCardContainer}>
                <div className={styles.shareCard} id="share-card">
                  <div className={styles.shareCardHeader}>
                    <img src="/hd-logo.svg" alt="IPM Careers" className={styles.shareCardLogo} />
                    <span className={styles.shareCardBadge}>IPMAT 2024</span>
                  </div>
                  <div className={styles.shareCardBody}>
                    <div className={styles.shareCardName}>{data?.name || 'Student'}</div>
                    <div className={styles.shareCardScore}>
                      <span className={styles.shareCardScoreValue}>{scores.total.score}</span>
                      <span className={styles.shareCardScoreMax}>/{scores.total.max}</span>
                    </div>
                    <div className={styles.shareCardBreakdown}>
                      <div className={styles.shareCardStat}>
                        <span className={styles.shareCardStatLabel}>SA</span>
                        <span className={styles.shareCardStatValue}>{scores.sa.score}</span>
                      </div>
                      <div className={styles.shareCardDivider}></div>
                      <div className={styles.shareCardStat}>
                        <span className={styles.shareCardStatLabel}>MCQ</span>
                        <span className={styles.shareCardStatValue}>{scores.mcq.score}</span>
                      </div>
                      <div className={styles.shareCardDivider}></div>
                      <div className={styles.shareCardStat}>
                        <span className={styles.shareCardStatLabel}>VA</span>
                        <span className={styles.shareCardStatValue}>{scores.va.score}</span>
                      </div>
                    </div>
                    <div className={styles.shareCardAccuracy}>Accuracy: {stats.accuracy}%</div>
                  </div>
                  <div className={styles.shareCardFooter}>
                    <span>Generated by IPM Careers</span>
                    <span>ipmcareer.com/response</span>
                  </div>
                </div>
                <div className={styles.shareButtons}>
                  <Button className={styles.shareWhatsApp} onPress={() => {
                    const text = `Hey! I scored ${scores.total.score}/${scores.total.max} in IPMAT 2024! 🎯\n\nSA: ${scores.sa.score} | MCQ: ${scores.mcq.score} | VA: ${scores.va.score}\nAccuracy: ${stats.accuracy}%\n\nCheck your score too 👉 https://register.ipmcareer.com/response\n\nMy detailed report: https://register.ipmcareer.com/report/${router.query.uid}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}>Share on WhatsApp</Button>
                  <Button className={styles.shareCopy} onPress={() => {
                    const text = `I scored ${scores.total.score}/${scores.total.max} in IPMAT 2024! SA: ${scores.sa.score} | MCQ: ${scores.mcq.score} | VA: ${scores.va.score} | Accuracy: ${stats.accuracy}%\n\nCheck yours: https://register.ipmcareer.com/response`;
                    navigator.clipboard.writeText(text);
                    alert('Score copied to clipboard!');
                  }}>Copy Score</Button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={styles.footerInfo}>
            <div className={styles.footerContent}>
              <p className={styles.footerText}>This report was generated by IPM CAREERS Response Sheet Analyzer Tool</p>
              <p className={styles.contactText}>Used by 3000+ IPMAT aspirants to analyze their performance</p>
              <p className={styles.phoneText}>Questions? Call <strong>8299470392</strong></p>
            </div>
          </div>

          {/* Download */}
          <div className={styles.downloadBar}>
            <Button className={styles.downloadBtn} onPress={() => { window.print(); }}>📥 Save as PDF</Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default Report;

export async function getServerSideProps(context) {
  const { data, error } = await supabase.rpc('get_response_data', { uuid_arg: context.query.uid });
  return {
    props: {
      data: data?.length > 0 ? data[0] : '',
      isFound: data?.length > 0,
      error: data?.length > 0 ? false : true,
    }
  };
}
