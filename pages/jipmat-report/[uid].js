import { useEffect, useState } from "react";
import styles from "../Jipmat.module.css";
import { supabase } from "../../utils/supabaseClient";
import { NextSeo } from "next-seo";
import Head from "next/head";
import { useRouter } from "next/router";
import AppShell from "../../components/AppShell";
import { applyJipmatAnswerKey } from "../../lib/jipmat-answer-key";

// ═══════ ANIMATED COUNTER HOOK ═══════
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

// ═══════ GRADE HELPER ═══════
function getGrade(score, max) {
  const pct = (score / max) * 100;
  if (pct >= 80) return { letter: "S+", vibe: "Absolute legend status", color: "#ffd700" };
  if (pct >= 70) return { letter: "S", vibe: "IIM bound. Lock it in.", color: "#00d4ff" };
  if (pct >= 60) return { letter: "A+", vibe: "Strong game. You made it count.", color: "#00ff88" };
  if (pct >= 50) return { letter: "A", vibe: "Solid performance. Great effort.", color: "#a855f7" };
  if (pct >= 40) return { letter: "B", vibe: "In the fight. Room to grow.", color: "#ff8c42" };
  if (pct >= 25) return { letter: "C", vibe: "Foundation built. Keep pushing.", color: "#ff5e7e" };
  return { letter: "D", vibe: "Every journey starts somewhere. Rise up.", color: "#833589" };
}

// ═══════ SECTION CALCULATOR ═══════
// Dropped questions (isCorrect === "dropped") are excluded from scoring & max.
function calcSection(questions, isAnswerKeyAvailable) {
  if (!questions || !Array.isArray(questions)) {
    return { score: 0, correct: 0, wrong: 0, skipped: 0, total: 0, max: 0, attempted: 0 };
  }
  let correct = 0, wrong = 0, skipped = 0, dropped = 0;
  for (const q of questions) {
    if (q.isCorrect === "dropped") {
      dropped++;
      continue;
    }
    if (!q.chosenOption || q.chosenOption === "" || q.status === "Not Answered") {
      skipped++;
    } else if (isAnswerKeyAvailable) {
      if (q.isCorrect === true) correct++;
      else if (q.isCorrect === false) wrong++;
    }
  }
  const total = questions.length;
  const scorable = total - dropped;
  const score = isAnswerKeyAvailable ? correct * 4 - wrong * 1 : 0;
  const max = scorable * 4;
  return { score, correct, wrong, skipped, total, max, attempted: total - dropped - skipped, dropped };
}

// ═══════════════════════════════════════════════════════════════
// Main page component — handles loading / not-found states only.
// All score hooks live in <ReportBody/> so hook order stays stable.
// ═══════════════════════════════════════════════════════════════
export default function JipmatReport({ data: rawData, isFound }) {
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFound || !rawData) {
      setLoading(false);
      return;
    }

    try {
      const d = typeof rawData.data === "string" ? JSON.parse(rawData.data) : rawData.data;

      // ── Re-score against the current official answer key ──
      // This means stored responses automatically pick up the key (and any
      // future revisions to it) every time the report is opened.
      let keyMatches = 0;
      for (const sectionKey of ["qa", "lrdi", "varc"]) {
        if (Array.isArray(d[sectionKey])) {
          keyMatches += applyJipmatAnswerKey(d[sectionKey]);
        }
      }
      if (keyMatches > 0) d.answerKeyAvailable = true;

      setParsedData({
        ...d,
        studentName: rawData.name || d.StudentData?.participantName || d.formName || "Student",
        category: rawData.category || "gen",
        total: rawData.total || 0,
        createdAt: rawData.created_at,
      });
    } catch (e) {
      console.error("[JipmatReport] Parse error:", e);
    }
    setLoading(false);
  }, [rawData, isFound]);

  // ─── Loading State ───
  if (loading) {
    return (
      <AppShell activePage="/jipmat" pageTitle="JIPMAT Report">
        <div className={styles.reportPage}>
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <div className={styles.loadingText}>Loading your JIPMAT report...</div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ─── Not Found ───
  if (!isFound || !parsedData) {
    return (
      <AppShell activePage="/jipmat" pageTitle="JIPMAT Report">
        <div className={styles.reportPage}>
          <div className={styles.loadingOverlay}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
            <div className={styles.loadingText}>
              Report not found. This link may be invalid or expired.
            </div>
            <a
              href="/jipmat"
              style={{
                marginTop: "1.5rem",
                color: "#833589",
                fontSize: "0.88rem",
                fontWeight: 700,
              }}
            >
              ← Generate a new scorecard
            </a>
          </div>
        </div>
      </AppShell>
    );
  }

  return <ReportBody parsedData={parsedData} />;
}

// ═══════════════════════════════════════════════════════════════
// Report body — rendered only when data exists, hooks are safe here
// ═══════════════════════════════════════════════════════════════
function ReportBody({ parsedData }) {
  const router = useRouter();

  const isAnswerKeyAvailable = parsedData.answerKeyAvailable === true;

  const qa = calcSection(parsedData.qa, isAnswerKeyAvailable);
  const lrdi = calcSection(parsedData.lrdi, isAnswerKeyAvailable);
  const varc = calcSection(parsedData.varc, isAnswerKeyAvailable);

  const totalScore = qa.score + lrdi.score + varc.score;
  const totalMax = qa.max + lrdi.max + varc.max;
  const totalCorrect = qa.correct + lrdi.correct + varc.correct;
  const totalWrong = qa.wrong + lrdi.wrong + varc.wrong;
  const totalSkipped = qa.skipped + lrdi.skipped + varc.skipped;
  const totalQuestions = qa.total + lrdi.total + varc.total;
  const totalAttempted = qa.attempted + lrdi.attempted + varc.attempted;
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const grade = isAnswerKeyAvailable ? getGrade(totalScore, totalMax) : null;
  const scoreAnimated = useCountUp(isAnswerKeyAvailable ? totalScore : null, 1800);
  const pct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

  const firstName = (parsedData.studentName || "Student").split(" ")[0].toLowerCase();

  // Section data for rendering
  const sections = [
    {
      name: "Quantitative Aptitude (QA)",
      data: qa,
      questions: parsedData.qa || [],
      color: "#833589",
    },
    {
      name: "Data Interpretation & LR (DILR)",
      data: lrdi,
      questions: parsedData.lrdi || [],
      color: "#a855b5",
    },
    {
      name: "Verbal Ability & RC (VARC)",
      data: varc,
      questions: parsedData.varc || [],
      color: "#8b5cf6",
    },
  ];

  // ─── Share Handler ───
  const handleShare = () => {
    const shareUrl = `https://register.ipmcareer.com${router.asPath}`;
    if (navigator.share) {
      navigator.share({
        title: `My JIPMAT Score: ${isAnswerKeyAvailable ? totalScore : "Pending"}`,
        text: isAnswerKeyAvailable
          ? `I scored ${totalScore}/${totalMax} in JIPMAT 2026! Check yours:`
          : `I just submitted my JIPMAT response. Check yours:`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Link copied to clipboard!");
      });
    }
  };

  // ─── WhatsApp Share ───
  const handleWhatsApp = () => {
    const shareUrl = `https://register.ipmcareer.com${router.asPath}`;
    const text = isAnswerKeyAvailable
      ? `Hey! I scored ${totalScore}/${totalMax} in JIPMAT 2026 (QA: ${qa.score}, DILR: ${lrdi.score}, VARC: ${varc.score}). Check your score here: ${shareUrl}`
      : `I just submitted my JIPMAT 2026 response sheet on IPM Careers! Check yours: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <AppShell activePage="/jipmat" pageTitle="JIPMAT Report">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title={`JIPMAT Score Report — ${parsedData.studentName} | IPM Careers`}
        description={
          isAnswerKeyAvailable
            ? `${parsedData.studentName} scored ${totalScore}/${totalMax} in JIPMAT 2026. QA: ${qa.score}, DILR: ${lrdi.score}, VARC: ${varc.score}.`
            : `${parsedData.studentName}'s JIPMAT 2026 response recorded. Score pending answer key release.`
        }
        noindex={true}
      />

      <div className={styles.reportPage}>
        {/* ── Hero ── */}
        <div className={styles.reportHero}>
          <div className={styles.reportBadge}>
            JIPMAT 2026 • {(parsedData.category || "GEN").toUpperCase()}
          </div>

          <h1 className={styles.reportGreeting}>hey {firstName},</h1>
          <p className={styles.reportSub}>
            {isAnswerKeyAvailable
              ? "here's your JIPMAT scorecard"
              : "your response has been recorded"}
          </p>

          {/* Score Ring */}
          {isAnswerKeyAvailable ? (
            <div className={styles.scoreRing}>
              <svg viewBox="0 0 140 140" className={styles.ringSvg}>
                <circle cx="70" cy="70" r="60" className={styles.ringBg} />
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  className={styles.ringFg}
                  style={{
                    strokeDasharray: `${(Math.max(0, pct) / 100) * 2 * Math.PI * 60} ${2 * Math.PI * 60}`,
                  }}
                />
              </svg>
              <div className={styles.ringCenter}>
                <div className={styles.ringScore}>{scoreAnimated}</div>
                <div className={styles.ringMax}>/{totalMax}</div>
                {grade && (
                  <div className={styles.ringGrade} style={{ color: grade.color }}>
                    {grade.letter}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⏳</div>
              <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.88rem" }}>
                Score Pending
              </div>
              <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: "0.3rem" }}>
                Waiting for official answer key
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {isAnswerKeyAvailable && grade && (
            <div
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "0.82rem",
                marginTop: "0.5rem",
              }}
            >
              {grade.vibe} • {accuracy}% accuracy • {totalAttempted}/{totalQuestions} attempted
            </div>
          )}
        </div>

        {/* ── Report Content ── */}
        <div className={styles.reportContent}>
          {/* ── Section Cards ── */}
          {sections.map((sec, i) => (
            <div className={styles.sectionCard} key={i}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionName}>{sec.name}</div>
                <div className={styles.sectionScore}>
                  {isAnswerKeyAvailable
                    ? `${sec.data.score}/${sec.data.max}`
                    : `${sec.data.attempted}/${sec.data.total} attempted`}
                </div>
              </div>

              {isAnswerKeyAvailable && (
                <>
                  <div className={styles.sectionBar}>
                    <div
                      className={styles.sectionBarFill}
                      style={{
                        width: `${sec.data.max > 0 ? Math.max(0, (sec.data.score / sec.data.max) * 100) : 0}%`,
                        background: sec.color,
                      }}
                    ></div>
                  </div>

                  <div className={styles.sectionStats}>
                    <span className={styles.sectionStat}>
                      Correct:{" "}
                      <span className={`${styles.sectionStatVal} ${styles.sectionStatCorrect}`}>
                        {sec.data.correct}
                      </span>
                    </span>
                    <span className={styles.sectionStat}>
                      Wrong:{" "}
                      <span className={`${styles.sectionStatVal} ${styles.sectionStatWrong}`}>
                        {sec.data.wrong}
                      </span>
                    </span>
                    <span className={styles.sectionStat}>
                      Skipped:{" "}
                      <span className={`${styles.sectionStatVal} ${styles.sectionStatSkipped}`}>
                        {sec.data.skipped}
                      </span>
                    </span>
                    <span className={styles.sectionStat}>
                      Accuracy:{" "}
                      <span className={styles.sectionStatVal}>
                        {sec.data.attempted > 0
                          ? Math.round((sec.data.correct / sec.data.attempted) * 100)
                          : 0}
                        %
                      </span>
                    </span>
                  </div>
                </>
              )}

              {!isAnswerKeyAvailable && (
                <div className={styles.sectionStats}>
                  <span className={styles.sectionStat}>
                    Answered:{" "}
                    <span className={styles.sectionStatVal}>{sec.data.attempted}</span>
                  </span>
                  <span className={styles.sectionStat}>
                    Skipped:{" "}
                    <span className={`${styles.sectionStatVal} ${styles.sectionStatSkipped}`}>
                      {sec.data.skipped}
                    </span>
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* ── Detail Tables (only when answer key available) ── */}
          {isAnswerKeyAvailable &&
            sections.map((sec, i) => (
              <div className={styles.detailSection} key={`detail-${i}`}>
                <div className={styles.detailTitle}>{sec.name} — Question Details</div>
                <div className={styles.detailTableWrap}>
                  <table className={styles.detailTable}>
                    <thead>
                      <tr>
                        <th>Q#</th>
                        <th>Your Ans</th>
                        <th>Correct</th>
                        <th>Result</th>
                        <th>Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.questions.map((q, j) => {
                        const isDropped = q.isCorrect === "dropped";
                        const isCorrect = q.isCorrect === true;
                        const isWrong = q.isCorrect === false;
                        const isSkipped = !q.chosenOption || q.chosenOption === "";
                        const rowClass = isCorrect
                          ? styles.correctRow
                          : isWrong
                          ? styles.wrongRow
                          : styles.skippedRow;
                        return (
                          <tr key={j} className={rowClass}>
                            <td>{q.questionNo || j + 1 + (i === 0 ? 0 : i === 1 ? 33 : 66)}</td>
                            <td>{q.chosenOption || "—"}</td>
                            <td>{isDropped ? "Dropped" : q.correctAnswer || "—"}</td>
                            <td>
                              {isDropped
                                ? "◌ Dropped"
                                : isCorrect
                                ? "✓ Correct"
                                : isWrong
                                ? "✗ Wrong"
                                : "— Skipped"}
                            </td>
                            <td>{isDropped ? "0" : isCorrect ? "+4" : isWrong ? "-1" : "0"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

          {/* ── Actions ── */}
          <div className={styles.reportActions}>
            <button className={styles.reportBtnPrimary} onClick={handleWhatsApp}>
              📱 Share on WhatsApp
            </button>
            <button className={styles.reportBtnSecondary} onClick={handleShare}>
              📤 Copy Link
            </button>
          </div>

          {/* ── CTA Banner ── */}
          <div className={styles.ctaBanner}>
            <div className={styles.ctaTitle}>
              What Next After JIPMAT?
            </div>
            <div className={styles.ctaText}>
              Check your eligibility for all 10 IIM IPM programmes, explore
              cutoffs, and see which IIMs you can get into with the AIR 1
              Command Center.
            </div>
            <a
              href="https://register.ipmcareer.com/air1commandcenter"
              className={styles.ctaBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open AIR 1 Command Center →
            </a>
          </div>

          {/* ── Answer Key Pending Info ── */}
          {!isAnswerKeyAvailable && (
            <div className={styles.pendingBanner} style={{ marginTop: "1.5rem" }}>
              <div className={styles.pendingBannerIcon}>📋</div>
              <div className={styles.pendingBannerTitle}>
                Your Response is Saved
              </div>
              <div className={styles.pendingBannerText}>
                Once NTA releases the official JIPMAT 2026 answer key, this
                page will automatically update with your exact scores and
                question-level breakdown. Bookmark this page and check back
                soon.
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export async function getServerSideProps(context) {
  const { data } = await supabase.rpc("get_response_data", {
    uuid_arg: context.query.uid,
  });
  return {
    props: {
      data: data?.length > 0 ? data[0] : "",
      isFound: data?.length > 0,
      error: data?.length > 0 ? false : true,
    },
  };
}
