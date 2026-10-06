import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { toast } from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";
import AppShell from "../../components/AppShell";
import styles from "../Response.module.css";
import ui from "../IimbUg.module.css";
import { SECTIONS, MAX_SCORE, scoreAnswers, buildInsights } from "../../utils/iimbScoring";

const WHATSAPP_URL = "https://wa.me/918299470392?text=" + encodeURIComponent("IIMB - I just checked my IIM Bangalore UG score. Help me plan PI prep.");

export default function IimbReport({ report }) {
  if (!report) {
    return (
      <AppShell activePage="/response-v1" pageTitle="IIM-B UG Report">
        <NextSeo title="Report not found | IPM Careers" noindex nofollow />
        <div className={styles.page}>
          <div className={ui.notFound}>
            <div style={{ fontSize: "2.5rem" }}>🔍</div>
            <h1 className={styles.formTitle} style={{ fontSize: "1.4rem", margin: "12px 0 6px" }}>Report not found</h1>
            <p className={styles.formSubtitle}>This link may be wrong or the report was removed.</p>
            <Link href="/response-v1" className={styles.actionBtnPrimary}>Calculate your IIM-B UG score</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const { name, category, city, answers, legacy } = report;
  const scores = legacy ? null : scoreAnswers(answers);
  const insights = scores ? buildInsights(scores) : [];
  const total = scores ? scores.total : report.total;
  const secScore = (k) => (scores ? scores.sections[k].score : report.legacyScores[k]);
  const firstName = (name || "Student").split(" ")[0];
  const url = `https://register.ipmcareer.com/iimb-report/${report.uid}`;

  const shareText = `I scored ${total}/${MAX_SCORE} in the IIM Bangalore UG Test (VARC ${secScore("VARC")}, LR ${secScore("LR")}, QADI ${secScore("QADI")}). Check yours free: ${url}`;
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  return (
    <AppShell activePage="/response-v1" pageTitle="IIM-B UG Report">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title={`${firstName}'s IIM Bangalore UG Scorecard: ${total}/${MAX_SCORE} | IPM Careers`}
        description={`IIM Bangalore UG Test score report: VARC ${secScore("VARC")}, LR ${secScore("LR")}, QADI ${secScore("QADI")}, total ${total}/${MAX_SCORE}.`}
        noindex
        nofollow
        openGraph={{
          url,
          title: `${firstName} scored ${total}/${MAX_SCORE} in the IIM Bangalore UG Test`,
          description: "Check your own IIMB UG score free with the IPM Careers calculator.",
          images: [{ url: "https://register.ipmcareer.com/iimbug.png", width: 1200, height: 630, alt: "IIM Bangalore UG Scorecard" }],
        }}
      />

      <div className={styles.page}>
        <div className={styles.hero} style={{ paddingBottom: "1.5rem" }}>
          <div className={`${styles.heroGlow} ${styles.heroGlow1}`}></div>
          <div className={`${styles.heroGlow} ${styles.heroGlow2}`}></div>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowDot}></span>
            IIM Bangalore UG Test Report{category ? ` · ${category}` : ""}
          </div>
          <h1 className={styles.heroTitle} style={{ fontSize: "2.1rem" }}>
            Hey {firstName}, <span className={styles.heroTitleAccent}>here is your IIM-B UG scorecard.</span>
          </h1>
          {city && <p className={styles.heroSubtitle}>📍 {city}</p>}
        </div>

        <div className={ui.reportWrap}>
          <div className={styles.scorecardResult}>
            <div className={styles.scorecardBg}></div>
            <div className={styles.scorecardBg2}></div>
            <div className={styles.scorecardHeader}>
              <div className={styles.scorecardTitle}>Raw Score</div>
              <div className={styles.scorecardName}>👤 {name}</div>
            </div>
            <div className={styles.scoreGrid}>
              {SECTIONS.map((s) => (
                <div key={s.key} className={styles.scoreBox}>
                  <div className={styles.scoreBoxLabel}>{s.short}</div>
                  <div className={styles.scoreBoxValue}>
                    {secScore(s.key)}
                    <span className={ui.scoreBoxMax}>/{s.questions * 3}</span>
                  </div>
                </div>
              ))}
              <div className={`${styles.scoreBox} ${styles.scoreBoxTotal}`}>
                <div className={styles.scoreBoxLabel}>Total</div>
                <div className={styles.scoreBoxValue}>
                  {total}
                  <span className={ui.scoreBoxMax}>/{MAX_SCORE}</span>
                </div>
              </div>
            </div>
            {scores && (
              <div className={ui.scorecardMeta}>
                <span className={ui.metaChip}>✅ {scores.correct} correct</span>
                <span className={ui.metaChip}>❌ {scores.wrong} wrong</span>
                <span className={ui.metaChip}>⏭ {scores.unattempted} skipped</span>
                <span className={ui.metaChip}>🎯 {scores.accuracy}% accuracy</span>
              </div>
            )}
          </div>

          <div className={`${ui.shareRow} ${ui.noPrint}`}>
            <button className={styles.actionBtnPrimary} onClick={shareWhatsApp}>📲 Share on WhatsApp</button>
            <button className={styles.actionBtnSecondary} onClick={copyLink}>🔗 Copy link</button>
            <button className={styles.actionBtnSecondary} onClick={() => window.print()}>🖨️ Save as PDF</button>
            <Link href="/response-v1" className={styles.actionBtnSecondary}>🎯 Check another score</Link>
          </div>

          {scores && (
            <>
              <div className={ui.sectionList}>
                {SECTIONS.map((s) => {
                  const sec = scores.sections[s.key];
                  const pct = sec.max > 0 ? Math.max(0, (sec.score / sec.max) * 100) : 0;
                  return (
                    <div key={s.key} className={ui.sectionCard}>
                      <div className={ui.sectionHead}>
                        <div className={ui.sectionName}><span>{s.icon}</span> {s.name}</div>
                        <span className={`${ui.badge} ${sec.positive ? ui.badgeGood : ui.badgeBad}`}>{sec.positive ? "Positive ✓" : "Not positive"}</span>
                      </div>
                      <div className={ui.bar}><div className={ui.barFill} style={{ width: `${pct}%` }}></div></div>
                      <div className={ui.statRow}>
                        <span>Score <b>{sec.score}/{sec.max}</b></span>
                        <span>Correct <b className={ui.good}>{sec.correct}</b></span>
                        <span>Wrong <b className={ui.bad}>{sec.wrong}</b></span>
                        <span>Skipped <b>{sec.unattempted}</b></span>
                        <span>Accuracy <b>{sec.accuracy}%</b></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={ui.card}>
                <h2 className={ui.cardTitle}>💡 What this score tells you</h2>
                <ul className={ui.insightList}>
                  {insights.map((ins, i) => (
                    <li key={i} className={`${ui.insight} ${ins.tone === "good" ? ui.insightGood : ins.tone === "warn" ? ui.insightWarn : ""}`}>
                      <span>{ins.tone === "good" ? "✅" : ins.tone === "warn" ? "⚠️" : "📌"}</span>
                      <span>{ins.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={ui.card}>
                <h2 className={ui.cardTitle}>🧾 Question-wise map</h2>
                {SECTIONS.map((s) => {
                  const list = answers.filter((a) => a.s === s.key);
                  if (!list.length) return null;
                  return (
                    <div key={s.key}>
                      <div className={ui.qSecLabel}>{s.short}</div>
                      <div className={ui.qGrid}>
                        {list.map((a) => (
                          <div
                            key={a.n}
                            className={`${ui.qTile} ${a.r === "C" ? ui.qC : a.r === "W" ? ui.qW : a.r === "N" ? ui.qN : ui.qU}`}
                            title={`Q${a.n}: your answer ${a.c || "-"}, key ${a.k || "-"}`}
                          >
                            {a.n}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className={ui.legend}>
                  <span><i className={ui.legendDot} style={{ background: "#86efac" }}></i>Correct (+3)</span>
                  <span><i className={ui.legendDot} style={{ background: "#fca5a5" }}></i>Wrong (-1)</span>
                  <span><i className={ui.legendDot} style={{ background: "#E5C9EA" }}></i>Not attempted (0)</span>
                </div>
              </div>

              <div className={ui.card}>
                <h2 className={ui.cardTitle}>📋 Answer table</h2>
                <div className={ui.tableWrap} style={{ margin: 0 }}>
                  <table className={ui.table}>
                    <thead>
                      <tr><th>Q#</th><th>Section</th><th>Your answer</th><th>Key</th><th>Marks</th></tr>
                    </thead>
                    <tbody>
                      {answers.map((a) => (
                        <tr key={a.n}>
                          <td>{a.n}</td>
                          <td>{a.s}</td>
                          <td>{a.c || "-"}</td>
                          <td>{a.k || "-"}</td>
                          <td className={a.r === "C" ? ui.good : a.r === "W" ? ui.bad : ""}>{a.r === "C" ? "+3" : a.r === "W" ? "-1" : "0"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <div className={`${ui.ctaCard} ${ui.noPrint}`} style={{ marginBottom: "1.5rem" }}>
            <h3 className={ui.ctaTitle}>Next up: the IIMB personal interview</h3>
            <p className={ui.ctaText}>The interview carries 40 of 100 in IIMB's final score, as much as the test. Get a free PI plan from our mentors.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={ui.ctaBtn}>📲 WhatsApp "IIMB"</a>
          </div>

          <p className={ui.sourceNote} style={{ textAlign: "center" }}>
            Raw score from the response sheet using +3 / -1 / 0. IIMB standardises scores for shortlisting, so official results can differ.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

export async function getServerSideProps({ params, res }) {
  const uid = String(params?.uid || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) {
    return { props: { report: null } };
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const { data, error } = await supabase
    .from("response_sheet_uploads")
    .select("name, category, score_va, score_mcq, score_sa, score_total, raw_scores")
    .eq("raw_scores->>uuid", uid)
    .limit(1);

  if (error || !data || data.length === 0) {
    res.statusCode = 404;
    return { props: { report: null } };
  }

  const row = data[0];
  const raw = row.raw_scores || {};
  const answers = Array.isArray(raw.answers) ? raw.answers : [];

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  // Only public-safe fields leave the server. Never phone or email.
  return {
    props: {
      report: {
        uid,
        name: row.name || "Student",
        category: row.category || raw.category || "",
        city: raw.city || "",
        answers,
        legacy: answers.length === 0,
        total: row.score_total ?? 0,
        legacyScores: { VARC: row.score_va ?? 0, LR: row.score_mcq ?? 0, QADI: row.score_sa ?? 0 },
      },
    },
  };
}
