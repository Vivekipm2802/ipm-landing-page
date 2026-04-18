import React, { useState, useEffect, useRef } from 'react';
import s from '../pages/report/ReportModern.module.css';

// ═══════ ANIMATED COUNTER ═══════
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

// ═══════ GRADE SYSTEM ═══════
function getGrade(score, max) {
  const pct = (score / max) * 100;
  if (pct >= 80) return { letter: 'S+', vibe: 'Absolute legend status', emoji: '👑', color: '#ffd700' };
  if (pct >= 70) return { letter: 'S',  vibe: 'You cooked. IIM bound.', emoji: '🚀', color: '#06b6d4' };
  if (pct >= 60) return { letter: 'A+', vibe: 'Strong game. Lock in PI prep.', emoji: '💪', color: '#10b981' };
  if (pct >= 50) return { letter: 'A',  vibe: 'Solid. One more push.', emoji: '⚡', color: '#a855f7' };
  if (pct >= 40) return { letter: 'B',  vibe: 'In the fight. Refine strategy.', emoji: '🎯', color: '#f59e0b' };
  if (pct >= 25) return { letter: 'C',  vibe: 'Foundation laid. Time to level up.', emoji: '📈', color: '#ec4899' };
  return { letter: 'D', vibe: 'Every topper started here.', emoji: '🌱', color: '#6c63ff' };
}

// ═══════ CUTOFF DATA ═══════
const CUTOFFS = {
  'GEN':  { safe: 200, borderline: 170, label: 'General' },
  'OBC':  { safe: 170, borderline: 145, label: 'OBC-NCL' },
  'SC':   { safe: 140, borderline: 115, label: 'SC' },
  'ST':   { safe: 120, borderline: 95,  label: 'ST' },
  'EWS':  { safe: 185, borderline: 155, label: 'EWS' },
  'PwD':  { safe: 110, borderline: 85,  label: 'PwD' },
};

function getCutoffProbability(score, category) {
  const c = CUTOFFS[category] || CUTOFFS['GEN'];
  if (score >= c.safe + 30) return 95;
  if (score >= c.safe) return 80;
  if (score >= c.borderline + 10) return 55;
  if (score >= c.borderline) return 35;
  if (score >= c.borderline - 20) return 15;
  return 5;
}

function getStudentBucket(score, category) {
  const c = CUTOFFS[category] || CUTOFFS['GEN'];
  if (score >= c.safe) return 'HIGH';
  if (score >= c.borderline) return 'BORDERLINE';
  return 'LOW';
}

// ═══════ DONUT CHART ═══════
const DonutChart = ({ correct, incorrect, unattempted, total }) => {
  const circ = 2 * Math.PI * 46;
  const cPct = total > 0 ? (correct / total) * 100 : 0;
  const iPct = total > 0 ? (incorrect / total) * 100 : 0;
  const cDash = (cPct / 100) * circ;
  const iDash = (iPct / 100) * circ;
  const uDash = circ - cDash - iDash;

  return (
    <div className={`${s.bentoCard} ${s.donutCard}`}>
      <div className={s.bentoLabel}>Question Breakdown</div>
      <div className={s.donutWrap}>
        <svg viewBox="0 0 120 120" className={s.donutSvg}>
          <circle cx="60" cy="60" r="46" className={s.donutTrack} />
          <circle cx="60" cy="60" r="46" className={s.donutCorrect}
            style={{ strokeDasharray: `${cDash} ${circ}`, strokeDashoffset: 0 }} />
          <circle cx="60" cy="60" r="46" className={s.donutIncorrect}
            style={{ strokeDasharray: `${iDash} ${circ}`, strokeDashoffset: -cDash }} />
          <circle cx="60" cy="60" r="46" className={s.donutSkipped}
            style={{ strokeDasharray: `${uDash} ${circ}`, strokeDashoffset: -(cDash + iDash) }} />
          <text x="60" y="57" textAnchor="middle" className={s.donutCenter}>{correct}</text>
          <text x="60" y="73" textAnchor="middle" className={s.donutCenterSub}>correct</text>
        </svg>
      </div>
      <div className={s.donutLegend}>
        <div><span className={`${s.legendDot} ${s.legendCorrect}`}></span>Correct {correct}</div>
        <div><span className={`${s.legendDot} ${s.legendWrong}`}></span>Wrong {incorrect}</div>
        <div><span className={`${s.legendDot} ${s.legendSkipped}`}></span>Skipped {unattempted}</div>
      </div>
    </div>
  );
};

// ═══════ BENTO STAT ═══════
const BentoStat = ({ label, value, sub, emoji, tone = '' }) => (
  <div className={`${s.bentoCard} ${tone ? s['bento' + tone.charAt(0).toUpperCase() + tone.slice(1)] : ''}`}>
    <div className={s.bentoEmoji}>{emoji}</div>
    <div className={s.bentoValue}>{value}</div>
    <div className={s.bentoLabel}>{label}</div>
    {sub && <div className={s.bentoSub}>{sub}</div>}
  </div>
);

// ═══════ SUBJECT CARD ═══════
const SubjectCard = ({ title, subtitle, score, max, correct, total, color }) => {
  const pct = max > 0 ? Math.max(0, (score / max) * 100) : 0;
  const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className={s.subjectCard} style={{ '--subj-color': color }}>
      <div className={s.subjectCardHeader}>
        <div>
          <div className={s.subjectName}>{title}</div>
          <div className={s.subjectType}>{subtitle}</div>
        </div>
        <div>
          <span className={s.subjectScoreBig}>{score}</span>
          <span className={s.subjectScoreMax}>/{max}</span>
        </div>
      </div>
      <div className={s.subjectBarTrack}>
        <div className={s.subjectBarFill} style={{ width: `${pct}%` }}></div>
      </div>
      <div className={s.subjectMeta}>
        <span>🎯 {acc}% accuracy</span>
        <span>{correct}/{total} correct</span>
      </div>
    </div>
  );
};

// ═══════ FLASHCARDS ═══════
const FlashCards = ({ jsonData }) => {
  const wrong = [];
  if (jsonData?.sa) jsonData.sa.forEach((q, i) => {
    if (q.status !== 'Not Answered' && q.givenAnswer !== q.rightAnswer)
      wrong.push({ ...q, subject: 'Quant (SA)', num: i + 1, color: '#6c63ff' });
  });
  if (jsonData?.mcq) jsonData.mcq.forEach((q, i) => {
    if (q.status !== 'Not Answered' && q.givenAnswer !== q.rightAnswer)
      wrong.push({ ...q, subject: 'Quant (MCQ)', num: i + 1, color: '#06b6d4' });
  });
  if (jsonData?.va) jsonData.va.forEach((q, i) => {
    if (q.status !== 'Not Answered' && q.givenAnswer !== q.rightAnswer)
      wrong.push({ ...q, subject: 'Verbal', num: i + 1, color: '#ec4899' });
  });

  const top = wrong.slice(0, 8);
  const [flipped, setFlipped] = useState({});

  if (top.length === 0) {
    return (
      <div className={s.flashEmpty}>
        <div className={s.flashEmptyEmoji}>🏆</div>
        <div className={s.flashEmptyTitle}>Zero wrong attempts. Unreal.</div>
        <div className={s.flashEmptySub}>You either skipped smart or hit every target. Respect.</div>
      </div>
    );
  }

  return (
    <div className={s.flashSection}>
      <div className={s.flashHeader}>
        <div>
          <div className={s.sectionHeader} style={{ margin: 0 }}>
            <div className={s.sectionIcon}>🃏</div>
            <h2 className={s.sectionTitle}>Review Cards</h2>
          </div>
          <p className={s.sectionSub} style={{ margin: '4px 0 0 48px' }}>Tap any card to flip. Focus on these next.</p>
        </div>
        <span className={s.flashCount}>{top.length} to review</span>
      </div>
      <div className={s.flashGrid}>
        {top.map((q, i) => (
          <div
            key={i}
            className={`${s.flashCard} ${flipped[i] ? s.flashFlipped : ''}`}
            onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))}
            style={{ '--card-color': q.color }}
          >
            <div className={s.flashInner}>
              <div className={s.flashFront}>
                <div className={s.flashTag}>{q.subject}</div>
                <div className={s.flashQNum}>Q{q.num}</div>
                <div className={s.flashPrompt}>You answered:</div>
                <div className={s.flashYourAns}>{q.givenAnswer || '—'}</div>
                <div className={s.flashHint}>tap to reveal ↻</div>
              </div>
              <div className={s.flashBack}>
                <div className={s.flashBackLabel}>Correct Answer</div>
                <div className={s.flashCorrectAns}>{q.rightAnswer}</div>
                <div className={s.flashNote}>+4 marks up for grabs next time</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════ QUESTION ROW ═══════
const QuestionRow = ({ question, index }) => {
  const isCorrect = question.rightAnswer === question.givenAnswer;
  const isUnanswered = question.status === 'Not Answered';
  const isReview = question.status === 'Marked For Review';

  let badge, badgeClass;
  if (isUnanswered) { badge = 'Skipped'; badgeClass = s.badgeUnattempted; }
  else if (isReview) { badge = 'Review'; badgeClass = s.badgeReview; }
  else if (isCorrect) { badge = 'Correct'; badgeClass = s.badgeCorrect; }
  else { badge = 'Wrong'; badgeClass = s.badgeIncorrect; }

  return (
    <tr>
      <td>{index}</td>
      <td>{question.givenAnswer || '—'}</td>
      <td>{question.rightAnswer}</td>
      <td><span className={`${s.statusBadge} ${badgeClass}`}>{badge}</span></td>
      <td>
        {isUnanswered ? <span className={s.iconGray}>—</span> :
         isCorrect ? <span className={s.iconGreen}>✓</span> :
         <span className={s.iconRed}>✗</span>}
      </td>
    </tr>
  );
};

// ═══════ MAIN COMPONENT ═══════
const ReportModern = ({ data, scores, stats, jsonData, router }) => {
  const scoreNow = useCountUp(scores?.total?.score, 1800);
  const grade = scores ? getGrade(scores.total.score, scores.total.max) : null;
  const pct = scores ? (scores.total.score / scores.total.max) * 100 : 0;
  const firstName = (data?.name || 'Student').split(' ')[0];
  const category = data?.category || 'GEN';
  const cutoff = CUTOFFS[category] || CUTOFFS['GEN'];
  const bucket = scores ? getStudentBucket(scores.total.score, category) : 'LOW';
  const probability = scores ? getCutoffProbability(scores.total.score, category) : 0;
  const uid = router?.query?.uid;

  if (!scores || !stats) return null;

  return (
    <div className={s.modernReport}>
      {/* Ambient glow */}
      <div className={s.ambientGlow}>
        <div className={s.glowOrb1}></div>
        <div className={s.glowOrb2}></div>
        <div className={s.glowOrb3}></div>
      </div>

      {/* ═══ HERO ═══ */}
      <div className={s.hero} style={{ '--grade-color': grade.color }}>
        <div className={s.heroMesh}></div>
        <div className={s.heroInner}>
          <div className={s.heroMeta}>
            <span className={s.heroPill}>⚡ IPMAT 2024 &bull; {category}</span>
            <span className={s.heroDate}>
              {data?.created_at && new Date(data.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <h1 className={s.heroGreeting}>hey {firstName.toLowerCase()},</h1>
          <p className={s.heroSub}>here's your performance wrapped 👇</p>

          <div className={s.heroScoreRow}>
            <div className={s.gradeRingWrap} style={{ '--grade-color': grade.color }}>
              <svg viewBox="0 0 120 120" className={s.gradeRingSvg}>
                <circle cx="60" cy="60" r="52" className={s.ringTrack} />
                <circle cx="60" cy="60" r="52" className={s.ringProgress}
                  style={{ strokeDasharray: `${(pct / 100) * 326.7} 326.7` }} />
              </svg>
              <div className={s.gradeCenter}>
                <div className={s.gradeLetter}>{grade.letter}</div>
                <div className={s.gradeLabel}>Grade</div>
              </div>
            </div>

            <div className={s.heroScoreInfo}>
              <div className={s.heroScoreNum}>
                {scoreNow}<span className={s.heroScoreMax}>/{scores.total.max}</span>
              </div>
              <div className={s.heroVibe}>
                <span>{grade.emoji}</span> {grade.vibe}
              </div>
            </div>
          </div>

          <div className={s.heroChips}>
            <div className={s.heroChip}><span>🎯</span> {stats.accuracy}% accuracy</div>
            <div className={s.heroChip}><span>✅</span> {stats.totalCorrect} correct</div>
            <div className={s.heroChip}><span>📝</span> {stats.attempted}/{stats.total} attempted</div>
          </div>
        </div>
      </div>

      {/* ═══ BENTO STATS ═══ */}
      <div className={s.sectionHeader}>
        <div className={s.sectionIcon}>📊</div>
        <h2 className={s.sectionTitle}>The Breakdown</h2>
      </div>
      <div className={s.bentoGrid}>
        <DonutChart
          correct={stats.totalCorrect}
          incorrect={stats.totalIncorrect}
          unattempted={stats.totalUnattempted}
          total={stats.total}
        />
        <BentoStat tone="green" emoji="✅" label="Positive Marks" value={`+${stats.positiveScore}`} sub="from correct answers" />
        <BentoStat tone="pink" emoji="💔" label="Marks Lost" value={`-${stats.marksLost}`} sub="negative marking" />
        <BentoStat tone="violet" emoji="🎯" label="Accuracy" value={`${stats.accuracy}%`} sub={`${stats.totalCorrect}/${stats.attempted} attempted`} />
        <BentoStat tone="blue" emoji="📝" label="Attempted" value={`${stats.attempted}`} sub={`of ${stats.total} questions`} />
        <BentoStat tone="amber" emoji="⏭️" label="Skipped" value={`${stats.totalUnattempted}`} sub="left untouched" />
      </div>

      {/* ═══ SUBJECT PERFORMANCE ═══ */}
      <div className={s.sectionHeader}>
        <div className={s.sectionIcon}>🔬</div>
        <h2 className={s.sectionTitle}>Subject Deep-Dive</h2>
      </div>
      <div className={s.subjectGrid}>
        <SubjectCard title="Short Answer" subtitle="Quantitative (no negative)" score={scores.sa.score} max={scores.sa.max} correct={stats.sa.correct} total={stats.sa.total} color="#6c63ff" />
        <SubjectCard title="Multiple Choice" subtitle="Quantitative Ability" score={scores.mcq.score} max={scores.mcq.max} correct={stats.mcq.correct} total={stats.mcq.total} color="#06b6d4" />
        <SubjectCard title="Verbal Ability" subtitle="Reading Comprehension" score={scores.va.score} max={scores.va.max} correct={stats.va.correct} total={stats.va.total} color="#ec4899" />
      </div>

      {/* ═══ FLASHCARDS ═══ */}
      {jsonData && <FlashCards jsonData={jsonData} />}

      {/* ═══ TEST BREAKDOWN TABLE ═══ */}
      <div className={s.tableSection}>
        <div className={s.sectionHeader}>
          <div className={s.sectionIcon}>📋</div>
          <h2 className={s.sectionTitle}>Test Breakdown</h2>
        </div>
        <div className={s.tableWrap}>
          <table className={s.dataTable}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Correct</th>
                <th>Incorrect</th>
                <th>Skipped</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Overall</strong></td>
                <td><span className={`${s.statusBadge} ${s.badgeCorrect}`}>{stats.totalCorrect}</span></td>
                <td><span className={`${s.statusBadge} ${s.badgeIncorrect}`}>{stats.totalIncorrect}</span></td>
                <td><span className={`${s.statusBadge} ${s.badgeUnattempted}`}>{stats.totalUnattempted}</span></td>
                <td>{stats.total}</td>
              </tr>
              <tr>
                <td>Short Answer (SA)</td>
                <td><span className={`${s.statusBadge} ${s.badgeCorrect}`}>{stats.sa.correct}</span></td>
                <td><span className={`${s.statusBadge} ${s.badgeIncorrect}`}>{stats.sa.incorrect}</span></td>
                <td><span className={`${s.statusBadge} ${s.badgeUnattempted}`}>{stats.sa.unattempted}</span></td>
                <td>{stats.sa.total}</td>
              </tr>
              <tr>
                <td>Multiple Choice (MCQ)</td>
                <td><span className={`${s.statusBadge} ${s.badgeCorrect}`}>{stats.mcq.correct}</span></td>
                <td><span className={`${s.statusBadge} ${s.badgeIncorrect}`}>{stats.mcq.incorrect}</span></td>
                <td><span className={`${s.statusBadge} ${s.badgeUnattempted}`}>{stats.mcq.unattempted}</span></td>
                <td>{stats.mcq.total}</td>
              </tr>
              <tr>
                <td>Verbal Ability (VA)</td>
                <td><span className={`${s.statusBadge} ${s.badgeCorrect}`}>{stats.va.correct}</span></td>
                <td><span className={`${s.statusBadge} ${s.badgeIncorrect}`}>{stats.va.incorrect}</span></td>
                <td><span className={`${s.statusBadge} ${s.badgeUnattempted}`}>{stats.va.unattempted}</span></td>
                <td>{stats.va.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ DETAILED QUESTION-WISE ═══ */}
      {jsonData && (
        <div className={s.tableSection}>
          <div className={s.sectionHeader}>
            <div className={s.sectionIcon}>🔍</div>
            <h2 className={s.sectionTitle}>Detailed Question-Wise Analysis</h2>
          </div>

          {jsonData.sa && jsonData.sa.length > 0 && (
            <>
              <p className={s.sectionSub}>Short Answer (Quantitative Ability)</p>
              <div className={s.tableWrap}>
                <table className={s.dataTable}>
                  <thead><tr><th>Q No</th><th>Your Answer</th><th>Correct</th><th>Status</th><th>Result</th></tr></thead>
                  <tbody>
                    {jsonData.sa.map((q, i) => <QuestionRow key={`sa-${i}`} question={q} index={i + 1} />)}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {jsonData.mcq && jsonData.mcq.length > 0 && (
            <>
              <p className={s.sectionSub} style={{ marginTop: 24 }}>Multiple Choice (Quantitative Ability)</p>
              <div className={s.tableWrap}>
                <table className={s.dataTable}>
                  <thead><tr><th>Q No</th><th>Your Answer</th><th>Correct</th><th>Status</th><th>Result</th></tr></thead>
                  <tbody>
                    {jsonData.mcq.map((q, i) => <QuestionRow key={`mcq-${i}`} question={q} index={(jsonData.sa?.length || 0) + i + 1} />)}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {jsonData.va && jsonData.va.length > 0 && (
            <>
              <p className={s.sectionSub} style={{ marginTop: 24 }}>Verbal Ability (Reading Comprehension)</p>
              <div className={s.tableWrap}>
                <table className={s.dataTable}>
                  <thead><tr><th>Q No</th><th>Your Answer</th><th>Correct</th><th>Status</th><th>Result</th></tr></thead>
                  <tbody>
                    {jsonData.va.map((q, i) => <QuestionRow key={`va-${i}`} question={q} index={(jsonData.sa?.length || 0) + (jsonData.mcq?.length || 0) + i + 1} />)}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ CUTOFF ANALYSIS ═══ */}
      <div className={s.cutoffSection}>
        <div className={s.sectionHeader}>
          <div className={s.sectionIcon}>📈</div>
          <h2 className={s.sectionTitle}>Cutoff Analysis ({cutoff.label})</h2>
        </div>
        <div className={s.cutoffCard}>
          <div className={s.cutoffBarWrap}>
            <div className={s.cutoffTrack}>
              <div className={s.cutoffFill} style={{ width: `${Math.min(pct, 100)}%` }}></div>
            </div>
            {/* Borderline marker */}
            <div className={s.cutoffMarker} style={{ left: `${(cutoff.borderline / scores.total.max) * 100}%` }}>
              <div className={s.cutoffMarkerLine}></div>
              <div className={s.cutoffMarkerLabel}>Borderline</div>
              <div className={s.cutoffMarkerValue}>{cutoff.borderline}</div>
            </div>
            {/* Safe marker */}
            <div className={s.cutoffMarker} style={{ left: `${(cutoff.safe / scores.total.max) * 100}%` }}>
              <div className={s.cutoffMarkerLine}></div>
              <div className={s.cutoffMarkerLabel}>Safe Zone</div>
              <div className={s.cutoffMarkerValue}>{cutoff.safe}</div>
            </div>
            {/* Your score dot */}
            <div className={s.cutoffYouLabel} style={{ left: `${Math.min(pct, 100)}%` }}>
              You: {scores.total.score}
            </div>
            <div className={s.cutoffYouDot} style={{ left: `${Math.min(pct, 100)}%` }}></div>
          </div>

          <div className={s.probRow}>
            <div className={s.probLabel}>Interview Call Probability</div>
            <div className={s.probBarTrack}>
              <div className={`${s.probBarFill} ${probability >= 70 ? s.probHigh : probability >= 40 ? s.probMedium : s.probLow}`}
                style={{ width: `${probability}%` }}></div>
            </div>
            <div className={s.probValue}>{probability}%</div>
          </div>
          <div className={s.probNote}>Based on historical IPMAT Indore cutoffs for {cutoff.label} category</div>
        </div>
      </div>

      {/* ═══ WHAT THIS MEANS ═══ */}
      <div className={s.sectionHeader}>
        <div className={s.sectionIcon}>💡</div>
        <h2 className={s.sectionTitle}>What This Means For You</h2>
      </div>

      {bucket === 'HIGH' && (
        <div className={s.recCard}>
          <div className={s.recBanner}>
            <span className={s.recBannerEmoji}>🎉</span>
            <div>
              <h3 className={s.recBannerTitle}>Congratulations, {firstName}!</h3>
              <p className={s.recBannerSub}>You are in the <strong>safe zone</strong> for an interview call</p>
            </div>
          </div>
          <p className={s.recDescription}>
            Your score of <strong>{scores.total.score}/{scores.total.max}</strong> puts you well above the expected cutoff of {cutoff.safe} for {cutoff.label} category.
            Now focus on your <strong>Personal Interview (PI)</strong> preparation — this is where admissions are won or lost.
          </p>
          <div className={s.recActions}>
            <div className={s.recActionCard} onClick={() => router.push(`/interview-prep?uid=${uid}`)}>
              <div className={s.recActionIcon}>🤖</div>
              <div className={s.recActionTitle}>AI Mock Interview</div>
              <div className={s.recActionDesc}>Practice PI questions powered by AI. Get instant feedback.</div>
              <span className={s.recActionCta}>Start Practicing →</span>
            </div>
            <div className={s.recActionCard} onClick={() => router.push('/pi-batch')}>
              <div className={s.recActionIcon}>🎓</div>
              <div className={s.recActionTitle}>PI Preparation Batch</div>
              <div className={s.recActionDesc}>1-on-1 mentoring with IIM alumni. Mock interviews & SOP review.</div>
              <span className={s.recActionCta}>Enroll Now →</span>
            </div>
            <div className={s.recActionCard} onClick={() => window.open(`https://wa.me/918299470392?text=Hi%2C%20I%20scored%20${scores.total.score}%20in%20IPMAT.%20I%20want%20to%20know%20about%20PI%20preparation.`, '_blank')}>
              <div className={s.recActionIcon}>📞</div>
              <div className={s.recActionTitle}>Talk to a Mentor</div>
              <div className={s.recActionDesc}>Free 15-min strategy call with an IIM alumnus.</div>
              <span className={s.recActionCta}>Book Free Call →</span>
            </div>
          </div>
          <div className={s.recSocialProof}>
            <span>📊</span> 847 students above {cutoff.safe} have already started PI prep with IPM Careers
          </div>
        </div>
      )}

      {bucket === 'BORDERLINE' && (
        <div className={s.recCard}>
          <div className={s.recBanner}>
            <span className={s.recBannerEmoji}>🎯</span>
            <div>
              <h3 className={s.recBannerTitle}>You're in the borderline zone, {firstName}</h3>
              <p className={s.recBannerSub}>Your score is close to the cutoff — preparation is key</p>
            </div>
          </div>
          <p className={s.recDescription}>
            Your score of <strong>{scores.total.score}/{scores.total.max}</strong> is near the cutoff range of {cutoff.borderline}–{cutoff.safe} for {cutoff.label} category.
            There's a real chance you'll get the call. <strong>Don't wait</strong> — start PI prep now.
          </p>
          <div className={s.recActions}>
            <div className={s.recActionCard} onClick={() => router.push(`/interview-prep?uid=${uid}`)}>
              <div className={s.recActionIcon}>🤖</div>
              <div className={s.recActionTitle}>AI Mock Interview (Free)</div>
              <div className={s.recActionDesc}>2 free mock PI sessions to sharpen your answers.</div>
              <span className={s.recActionCta}>Try Free →</span>
            </div>
            <div className={s.recActionCard} onClick={() => window.open(`https://wa.me/918299470392?text=Hi%2C%20I%20scored%20${scores.total.score}%20in%20IPMAT.%20Am%20I%20likely%20to%20get%20a%20call%3F`, '_blank')}>
              <div className={s.recActionIcon}>📞</div>
              <div className={s.recActionTitle}>Free Strategy Call</div>
              <div className={s.recActionDesc}>Understand your chances and plan next steps.</div>
              <span className={s.recActionCta}>Book Now →</span>
            </div>
            <div className={s.recActionCard} onClick={() => router.push('/pi-batch')}>
              <div className={s.recActionIcon}>🎓</div>
              <div className={s.recActionTitle}>PI + Backup Package</div>
              <div className={s.recActionDesc}>PI prep with IIM alumni + backup college guidance.</div>
              <span className={s.recActionCta}>Explore →</span>
            </div>
          </div>
          <div className={s.recSocialProof}>
            <span>💡</span> Last year, 62% of borderline students who prepared for PI got through
          </div>
        </div>
      )}

      {bucket === 'LOW' && (
        <div className={s.recCard}>
          <div className={s.recBanner}>
            <span className={s.recBannerEmoji}>💪</span>
            <div>
              <h3 className={s.recBannerTitle}>This isn't the end, {firstName}</h3>
              <p className={s.recBannerSub}>Your IIM dream is still alive — here's your path forward</p>
            </div>
          </div>
          <p className={s.recDescription}>
            Your score of <strong>{scores.total.score}/{scores.total.max}</strong> is below the expected cutoff of {cutoff.borderline} for {cutoff.label} category.
            Many successful IIM students didn't crack it on their first attempt. You have two strong options.
          </p>
          <div className={s.recPaths}>
            <div className={s.recPathCard}>
              <h4 className={s.recPathTitle}><span>🔄</span> Path A: Strategic Drop</h4>
              <p className={s.recPathDesc}>Join comprehensive IPMAT prep. Structured coaching, daily practice, IIM alumni mentoring.</p>
              <div className={s.recActionCard} onClick={() => window.open(`https://wa.me/918299470392?text=Hi%2C%20I%20scored%20${scores.total.score}%20in%20IPMAT.%20I%20want%20to%20know%20about%20the%20drop%20year%20batch.`, '_blank')}>
                <div className={s.recActionIcon}>📚</div>
                <div className={s.recActionTitle}>IPMAT Full Prep</div>
                <div className={s.recActionDesc}>Complete course with personal mentoring.</div>
                <span className={s.recActionCta}>Learn More →</span>
              </div>
            </div>
            <div className={s.recOrDivider}>OR</div>
            <div className={s.recPathCard}>
              <h4 className={s.recPathTitle}><span>🏫</span> Path B: Top Colleges</h4>
              <p className={s.recPathDesc}>Excellent management programs beyond IIM Indore match your profile.</p>
              <div className={s.recActionCard} onClick={() => router.push('/call')}>
                <div className={s.recActionIcon}>🎯</div>
                <div className={s.recActionTitle}>College Predictor</div>
                <div className={s.recActionDesc}>Find colleges matching your IPMAT score.</div>
                <span className={s.recActionCta}>Check Now →</span>
              </div>
            </div>
          </div>
          <div className={s.recSocialProof}>
            <span>🌟</span> 340+ students below cutoff secured top admissions through IPM Careers guidance
          </div>
        </div>
      )}

      {/* ═══ HOW YOU COMPARE ═══ */}
      <div className={s.sectionHeader}>
        <div className={s.sectionIcon}>⚖️</div>
        <h2 className={s.sectionTitle}>How You Compare</h2>
      </div>
      <div className={s.compareGrid}>
        <div className={s.compareCard}>
          <div className={s.compareLabel}>Your Score</div>
          <div className={s.compareValue}>{scores.total.score}</div>
        </div>
        <div className={s.compareCard}>
          <div className={s.compareLabel}>{cutoff.label} Cutoff</div>
          <div className={s.compareValue}>{cutoff.safe}</div>
        </div>
        <div className={s.compareCard}>
          <div className={s.compareLabel}>Gap</div>
          <div className={`${s.compareValue} ${scores.total.score >= cutoff.safe ? s.comparePositive : s.compareNegative}`}>
            {scores.total.score >= cutoff.safe ? '+' : ''}{scores.total.score - cutoff.safe}
          </div>
        </div>
        <div className={s.compareCard}>
          <div className={s.compareLabel}>Accuracy</div>
          <div className={s.compareValue}>{stats.accuracy}%</div>
        </div>
      </div>

      {/* ═══ SHARE ═══ */}
      <div className={s.shareSection}>
        <div className={s.sectionHeader}>
          <div className={s.sectionIcon}>🔗</div>
          <h2 className={s.sectionTitle}>Share Your Score</h2>
        </div>
        <div className={s.shareCard}>
          <img src="/hd-logo.svg" alt="IPM Careers" style={{ height: 36, margin: '0 auto 12px', display: 'block', filter: 'brightness(10)' }} />
          <div className={s.shareCardName}>{data?.name || 'Student'}</div>
          <div className={s.shareCardScore}>
            <span>{scores.total.score}</span>
            <span className={s.shareCardScoreMax}>/{scores.total.max}</span>
          </div>
          <div className={s.shareCardBreakdown}>
            <div className={s.shareCardStat}>
              <span className={s.shareCardStatLabel}>SA</span>
              <span className={s.shareCardStatValue}>{scores.sa.score}</span>
            </div>
            <div className={s.shareCardStat}>
              <span className={s.shareCardStatLabel}>MCQ</span>
              <span className={s.shareCardStatValue}>{scores.mcq.score}</span>
            </div>
            <div className={s.shareCardStat}>
              <span className={s.shareCardStatLabel}>VA</span>
              <span className={s.shareCardStatValue}>{scores.va.score}</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '8px 0' }}>Accuracy: {stats.accuracy}%</div>
        </div>
        <div className={s.shareButtons}>
          <button className={`${s.shareBtn} ${s.shareBtnWhatsApp}`}
            onClick={() => {
              const text = `Hey! I scored ${scores.total.score}/${scores.total.max} in IPMAT 2024! 🎯\n\nSA: ${scores.sa.score} | MCQ: ${scores.mcq.score} | VA: ${scores.va.score}\nAccuracy: ${stats.accuracy}%\n\nCheck your score too 👉 https://register.ipmcareer.com/response\n\nMy report: https://register.ipmcareer.com/report/${uid}`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            }}>
            Share on WhatsApp
          </button>
          <button className={`${s.shareBtn} ${s.shareBtnCopy}`}
            onClick={() => {
              const text = `I scored ${scores.total.score}/${scores.total.max} in IPMAT 2024! SA: ${scores.sa.score} | MCQ: ${scores.mcq.score} | VA: ${scores.va.score} | Accuracy: ${stats.accuracy}%\n\nCheck yours: https://register.ipmcareer.com/response`;
              navigator.clipboard.writeText(text);
              alert('Score copied to clipboard!');
            }}>
            Copy Score
          </button>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className={s.footer}>
        <p className={s.footerText}>This report was generated by <span className={s.footerBold}>IPM CAREERS</span> Response Sheet Analyzer</p>
        <p className={s.footerText}>Used by 3000+ IPMAT aspirants to analyze their performance</p>
        <p className={s.footerText}>Questions? Call <span className={s.footerBold}>8299470392</span></p>
      </div>

      {/* Download */}
      <div className={s.downloadBar}>
        <button className={s.downloadBtn} onClick={() => { window.print(); }}>
          📥 Save as PDF
        </button>
      </div>
    </div>
  );
};

export default ReportModern;
