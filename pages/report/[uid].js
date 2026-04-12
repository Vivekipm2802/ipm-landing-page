import { useEffect, useState } from 'react';
import styles from './Report.module.css';
import { supabase } from '../../utils/supabaseClient';
import { NextSeo } from 'next-seo';
import 'tailwindcss/tailwind.css';
import { Button, Divider, Spacer, Card, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';
import { useRouter } from 'next/router';

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

      {/* Footer Information */}
      <div className={styles.footerInfo}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>This report was generated by IPM CAREERS Response Sheet Analyzer Tool</p>
          <p className={styles.contactText}>For Interview Preparations & Doubt Clearing Sessions</p>
          <p className={styles.phoneText}>Call at <strong>8299470392</strong></p>
        </div>
        <Button
          className={styles.enrollBtn}
          color="default"
          onPress={() => router.push('/pi-batch')}
        >
          Enroll in PI Batch Now
        </Button>
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
          <span>📥</span> Download as PDF
        </Button>
      </div>
    </div>
  );
}

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
