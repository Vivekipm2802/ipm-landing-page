import { useEffect, useState } from 'react';
import styles from './Report.module.css';
import { supabase } from '../../utils/supabaseClient';
import { NextSeo } from 'next-seo';
import 'tailwindcss/tailwind.css';
import { Button, Divider, Spacer, Card, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';

function Report({ data, error, isFound }) {
  const [jsonData, setJsonData] = useState(null);
  const [scores, setScores] = useState(null);
  const [stats, setStats] = useState(null);
  const router = useRouter();

  // Score calculation function
  const calculateScores = (d, subtractScore, addScore, special) => {
    if (!d || !Array.isArray(d)) {
      return 0;
    }
    return d.reduce((sum, i) => {
      if (i.status === 'Answered' || i.status === 'Marked For Review') {
        if (i.rightAnswer == i.givenAnswer) {
          return sum + addScore;
        } else if (i.rightAnswer != i.givenAnswer && subtractScore > 0 && !(special == true && i.givenAnswer.length > 1)) {
          return sum - subtractScore;
        }
      }
      return sum;
    }, 0);
  };

  // Count questions
  const countQuestions = (d, type) => {
    if (!d || !Array.isArray(d)) return { correct: 0, incorrect: 0, unattempted: 0, attempted: 0 };

    let correct = 0, incorrect = 0, unattempted = 0, attempted = 0;
    const subtractScore = type === 'sa' ? 0 : 1;

    d.forEach(i => {
      if (i.status === 'Not Answered') {
        unattempted++;
      } else {
        attempted++;
        if (i.rightAnswer == i.givenAnswer) {
          correct++;
        } else if (subtractScore > 0 && !(type === 'va' && i.givenAnswer.length > 1)) {
          incorrect++;
        } else if (type === 'va' && i.givenAnswer.length > 1) {
          incorrect++;
        }
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

        setJsonData({
          sa: saData,
          mcq: mcqData,
          va: vaData,
        });

        // Calculate scores
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

        // Calculate stats
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
        const marksLost = Math.abs((totalIncorrect * 1)); // Negative marking

        setStats({
          attempted: totalAttempted,
          total: totalQuestions,
          accuracy: accuracy,
          positiveScore: positiveScore,
          marksLost: marksLost,
          sa: saStats,
          mcq: mcqStats,
          va: vaStats,
          totalCorrect,
          totalIncorrect,
          totalUnattempted,
        });
      } catch (e) {
        console.error('Error parsing data:', e);
      }
    }
  }, [data, isFound]);

  if (isFound === false) {
    return (
      <div className="flex flex-col bg-gray-100 h-screen w-full justify-center items-center">
        <div className="flex flex-row font-sans text-center">We are unable to find your report
          <br />
          Please check your email for valid link
        </div>
        <Spacer y={2}></Spacer>
        {router.query.uid?.length < 5 ?
          <>
            <h2 className="border-1 border-red-500 px-2 py-1 rounded-xl bg-red-50 text-red-500 font-sans">Old Links are Expired Now</h2>
          </>
          : ''}
      </div>
    );
  }

  return (
    <AppShell activePage="/report">
    <div className={styles.reportPage}>
      <NextSeo
        title={'IPMAT Detailed Report | IPM Careers Premium IPMAT Coaching'}
        description={'Comprehensive IPMAT performance report generated from response sheet analysis. Detailed question-wise breakdown and performance metrics.'}
        openGraph={{
          title: 'IPMAT Detailed Report | IPM Careers Premium IPMAT Coaching',
          description: 'Comprehensive IPMAT performance report generated from response sheet analysis.',
          images: [
            {
              url: '/scorecard_ss.png',
              width: 1200,
              height: 630,
              alt: 'IPM Careers IPMAT Report'
            }
          ]
        }}
      />

      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.logoArea}>
          <img src="/hd-logo.svg" alt="IPM Careers" className={styles.logo} />
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.welcomeText}>Welcome, {data?.name || 'Student'}</h1>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Test Date</span>
              <span className={styles.value}>{new Date(data?.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Category</span>
              <span className={styles.value}>{data?.category || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Exam</span>
              <span className={styles.value}>IPMAT 2024</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Tool</span>
              <span className={styles.value}>Response Sheet Analyzer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Banner */}
      {scores && (
        <div className={styles.scoreBanner}>
          <div className={styles.scoreCircle}>
            <div className={styles.scoreValue}>{scores.total.score}</div>
            <div className={styles.scoreMax}>/ {scores.total.max}</div>
          </div>
          <div className={styles.scoreDescription}>
            <p className={styles.descriptionTitle}>Your Overall Score</p>
            <p className={styles.descriptionText}>Your score is calculated based on your uploaded response sheet and official answer key</p>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      {stats && (
        <div className={styles.overviewSection}>
          <h2 className={styles.sectionTitle}>Performance Overview</h2>
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.statCard1}`}>
              <div className={styles.statIcon}>📝</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.attempted}</div>
                <div className={styles.statLabel}>Questions Attempted</div>
                <div className={styles.statSubtext}>out of {stats.total}</div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.statCard2}`}>
              <div className={styles.statIcon}>🎯</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.accuracy}%</div>
                <div className={styles.statLabel}>Accuracy Rate</div>
                <div className={styles.statSubtext}>{stats.totalCorrect} correct answers</div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.statCard3}`}>
              <div className={styles.statIcon}>✓</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>+{stats.positiveScore}</div>
                <div className={styles.statLabel}>Positive Score</div>
                <div className={styles.statSubtext}>from correct answers</div>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.statCard4}`}>
              <div className={styles.statIcon}>✗</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>-{stats.marksLost}</div>
                <div className={styles.statLabel}>Marks Lost</div>
                <div className={styles.statSubtext}>from incorrect answers</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject-wise Performance */}
      {scores && stats && (
        <div className={styles.performanceSection}>
          <h2 className={styles.sectionTitle}>Subject-Wise Performance</h2>
          <div className={styles.scoreCardsGrid}>
            <div className={`${styles.scoreCard} ${styles.scoreCardOverall}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Overall Score</span>
              </div>
              <div className={styles.cardScore}>
                <span className={styles.score}>{scores.total.score}</span>
                <span className={styles.maxScore}>/ {scores.total.max}</span>
              </div>
              <div className={styles.cardStats}>
                <div className={styles.cardStat}>
                  <span className={styles.correct}>{stats.totalCorrect} Correct</span>
                </div>
                <div className={styles.cardStat}>
                  <span className={styles.incorrect}>{stats.totalIncorrect} Incorrect</span>
                </div>
              </div>
            </div>

            <div className={`${styles.scoreCard} ${styles.scoreCardSA}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Short Answer (SA)</span>
                <span className={styles.cardSubtitle}>Quantitative</span>
              </div>
              <div className={styles.cardScore}>
                <span className={styles.score}>{scores.sa.score}</span>
                <span className={styles.maxScore}>/ {scores.sa.max}</span>
              </div>
              <div className={styles.cardStats}>
                <div className={styles.cardStat}>
                  <span className={styles.correct}>{stats.sa.correct}/{stats.sa.total}</span>
                </div>
              </div>
            </div>

            <div className={`${styles.scoreCard} ${styles.scoreCardMCQ}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Multiple Choice (MCQ)</span>
                <span className={styles.cardSubtitle}>Quantitative</span>
              </div>
              <div className={styles.cardScore}>
                <span className={styles.score}>{scores.mcq.score}</span>
                <span className={styles.maxScore}>/ {scores.mcq.max}</span>
              </div>
              <div className={styles.cardStats}>
                <div className={styles.cardStat}>
                  <span className={styles.correct}>{stats.mcq.correct}/{stats.mcq.total}</span>
                </div>
              </div>
            </div>

            <div className={`${styles.scoreCard} ${styles.scoreCardVA}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Verbal Ability</span>
                <span className={styles.cardSubtitle}>Reading Comprehension</span>
              </div>
              <div className={styles.cardScore}>
                <span className={styles.score}>{scores.va.score}</span>
                <span className={styles.maxScore}>/ {scores.va.max}</span>
              </div>
              <div className={styles.cardStats}>
                <div className={styles.cardStat}>
                  <span className={styles.correct}>{stats.va.correct}/{stats.va.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Breakdown Table */}
      {stats && (
        <div className={styles.breakdownSection}>
          <h2 className={styles.sectionTitle}>Test Breakdown</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.breakdownTable}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Correct</th>
                  <th>Incorrect</th>
                  <th>Unattempted</th>
                  <th>Total</th>
                </tr>
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

      {/* Detailed Question-wise Analysis */}
      {jsonData && (
        <div className={styles.detailedSection}>
          <h2 className={styles.sectionTitle}>Detailed Question-Wise Analysis</h2>

          {/* SA Questions */}
          {jsonData.sa && jsonData.sa.length > 0 && (
            <div className={styles.sectionBlock}>
              <h3 className={styles.subsectionTitle}>Short Answer (Quantitative Ability)</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.detailTable}>
                  <thead>
                    <tr>
                      <th>Q No</th>
                      <th>Your Answer</th>
                      <th>Correct Answer</th>
                      <th>Status</th>
                      <th>Evaluation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jsonData.sa.map((q, idx) => (
                      <QuestionRow key={`sa-${idx}`} question={q} index={idx + 1} type="SA" />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MCQ Questions */}
          {jsonData.mcq && jsonData.mcq.length > 0 && (
            <div className={styles.sectionBlock}>
              <h3 className={styles.subsectionTitle}>Multiple Choice (Quantitative Ability)</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.detailTable}>
                  <thead>
                    <tr>
                      <th>Q No</th>
                      <th>Your Answer</th>
                      <th>Correct Answer</th>
                      <th>Status</th>
                      <th>Evaluation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jsonData.mcq.map((q, idx) => (
                      <QuestionRow key={`mcq-${idx}`} question={q} index={jsonData.sa.length + idx + 1} type="MCQ" />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VA Questions */}
          {jsonData.va && jsonData.va.length > 0 && (
            <div className={styles.sectionBlock}>
              <h3 className={styles.subsectionTitle}>Verbal Ability (Reading Comprehension)</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.detailTable}>
                  <thead>
                    <tr>
                      <th>Q No</th>
                      <th>Your Answer</th>
                      <th>Correct Answer</th>
                      <th>Status</th>
                      <th>Evaluation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jsonData.va.map((q, idx) => (
                      <QuestionRow key={`va-${idx}`} question={q} index={jsonData.sa.length + jsonData.mcq.length + idx + 1} type="VA" />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ SMART RECOMMENDATION ENGINE ═══════ */}
      {scores && stats && (
        <SmartRecommendation
          scores={scores}
          stats={stats}
          category={data?.category || 'GEN'}
          studentName={data?.name || 'Student'}
          router={router}
          uid={router.query.uid}
        />
      )}

      {/* ═══════ SHAREABLE SCORE CARD ═══════ */}
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
              <Button
                className={styles.shareWhatsApp}
                onPress={() => {
                  const text = `Hey! I scored ${scores.total.score}/${scores.total.max} in IPMAT 2024! 🎯\n\nSA: ${scores.sa.score} | MCQ: ${scores.mcq.score} | VA: ${scores.va.score}\nAccuracy: ${stats.accuracy}%\n\nCheck your score too 👉 https://register.ipmcareer.com/response\n\nMy detailed report: https://register.ipmcareer.com/report/${router.query.uid}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                }}
              >
                Share on WhatsApp
              </Button>
              <Button
                className={styles.shareCopy}
                onPress={() => {
                  const text = `I scored ${scores.total.score}/${scores.total.max} in IPMAT 2024! SA: ${scores.sa.score} | MCQ: ${scores.mcq.score} | VA: ${scores.va.score} | Accuracy: ${stats.accuracy}%\n\nCheck yours: https://register.ipmcareer.com/response`;
                  navigator.clipboard.writeText(text);
                  alert('Score copied to clipboard!');
                }}
              >
                Copy Score
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ FOOTER ═══════ */}
      <div className={styles.footerInfo}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>This report was generated by IPM CAREERS Response Sheet Analyzer Tool</p>
          <p className={styles.contactText}>Used by 3000+ IPMAT aspirants to analyze their performance</p>
          <p className={styles.phoneText}>Questions? Call <strong>8299470392</strong></p>
        </div>
      </div>

      {/* Download PDF Button */}
      <div className={styles.downloadBar}>
        <Button
          className={styles.downloadBtn}
          onPress={() => {
            const uid = window.location.pathname.split('/').pop();
            window.open(`/api/generateReportPDF?uid=${encodeURIComponent(uid)}`, '_blank');
          }}
        >
          📥 Download as PDF
        </Button>
      </div>
    </div>
    </AppShell>
  );
}

// ═══════ CUTOFF DATA (Historical IPMAT Indore) ═══════
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

// ═══════ SMART RECOMMENDATION COMPONENT ═══════
const SmartRecommendation = ({ scores, stats, category, studentName, router, uid }) => {
  const bucket = getStudentBucket(scores.total.score, category);
  const probability = getCutoffProbability(scores.total.score, category);
  const cutoff = CUTOFFS[category] || CUTOFFS['GEN'];
  const firstName = studentName.split(' ')[0];

  return (
    <div className={styles.smartSection}>
      {/* ── Cutoff Comparison ── */}
      <h2 className={styles.sectionTitle}>Cutoff Analysis ({cutoff.label} Category)</h2>
      <div className={styles.cutoffContainer}>
        <div className={styles.cutoffBar}>
          <div className={styles.cutoffTrack}>
            <div
              className={styles.cutoffFill}
              style={{ width: `${Math.min((scores.total.score / scores.total.max) * 100, 100)}%` }}
            ></div>
            <div
              className={styles.cutoffMarker}
              style={{ left: `${(cutoff.borderline / scores.total.max) * 100}%` }}
            >
              <span className={styles.cutoffMarkerLabel}>Borderline<br />{cutoff.borderline}</span>
            </div>
            <div
              className={`${styles.cutoffMarker} ${styles.cutoffMarkerSafe}`}
              style={{ left: `${(cutoff.safe / scores.total.max) * 100}%` }}
            >
              <span className={styles.cutoffMarkerLabel}>Safe Zone<br />{cutoff.safe}</span>
            </div>
          </div>
          <div className={styles.cutoffScoreIndicator} style={{ left: `${(scores.total.score / scores.total.max) * 100}%` }}>
            <span className={styles.cutoffYourScore}>Your Score: {scores.total.score}</span>
          </div>
        </div>

        {/* Probability Meter */}
        <div className={styles.probabilityBox}>
          <div className={styles.probabilityLabel}>Interview Call Probability</div>
          <div className={styles.probabilityMeter}>
            <div
              className={`${styles.probabilityFill} ${
                probability >= 70 ? styles.probHigh :
                probability >= 40 ? styles.probMedium : styles.probLow
              }`}
              style={{ width: `${probability}%` }}
            ></div>
          </div>
          <div className={styles.probabilityValue}>{probability}%</div>
          <div className={styles.probabilityNote}>
            Based on historical IPMAT Indore cutoffs for {cutoff.label} category
          </div>
        </div>
      </div>

      {/* ── What This Means For You ── */}
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
            Now is the time to focus on your <strong>Personal Interview (PI)</strong> preparation — this is where admissions are won or lost.
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
            There's a real chance you'll get the interview call. <strong>Don't wait</strong> — start PI prep now so you're ready if the call comes.
            Also explore backup options to keep your bases covered.
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
            But many successful IIM students didn't crack it on their first attempt. You have two strong options — and we'll help you with both.
          </p>

          <div className={styles.recPathsContainer}>
            <div className={styles.recPath}>
              <div className={styles.recPathHeader}>
                <span className={styles.recPathIcon}>🔄</span>
                <h4>Path A: Take a Strategic Drop</h4>
              </div>
              <p className={styles.recPathDescription}>
                Join our comprehensive IPMAT preparation batch. Structured coaching, daily practice, and mentoring from IIM alumni.
              </p>
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

            <div className={styles.recPathDividerOr}>
              <span>OR</span>
            </div>

            <div className={styles.recPath}>
              <div className={styles.recPathHeader}>
                <span className={styles.recPathIcon}>🏫</span>
                <h4>Path B: Explore Top Colleges</h4>
              </div>
              <p className={styles.recPathDescription}>
                There are excellent management programs beyond IIM Indore. Explore colleges that match your profile and score.
              </p>
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

      {/* ── Quick Stats Comparison ── */}
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

// Question Row Component
const QuestionRow = ({ question, index, type }) => {
  const isCorrect = question.rightAnswer === question.givenAnswer;
  const isUnanswered = question.status === 'Not Answered';
  const isReview = question.status === 'Marked For Review';

  let statusBadge = '';
  let statusColor = '';
  if (isUnanswered) {
    statusBadge = 'Unattempted';
    statusColor = 'status-unattempted';
  } else if (isReview) {
    statusBadge = 'Marked for Review';
    statusColor = 'status-review';
  } else if (isCorrect) {
    statusBadge = 'Correct';
    statusColor = 'status-correct';
  } else {
    statusBadge = 'Incorrect';
    statusColor = 'status-incorrect';
  }

  return (
    <tr className={styles[statusColor]}>
      <td>{index}</td>
      <td>{question.givenAnswer || '-'}</td>
      <td>{question.rightAnswer}</td>
      <td><span className={`${styles.statusBadge} ${styles[statusColor]}`}>{statusBadge}</span></td>
      <td className={styles.evaluation}>
        {isUnanswered ? (
          <span className={styles.iconGray}>–</span>
        ) : isCorrect ? (
          <span className={styles.iconGreen}>✓</span>
        ) : (
          <span className={styles.iconRed}>✗</span>
        )}
      </td>
    </tr>
  );
};

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
