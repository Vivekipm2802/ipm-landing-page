import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { toast } from "react-hot-toast";
import AppShell from "../../components/AppShell";
import styles from "../Response.module.css";
import ui from "../IimbUg.module.css";
import { SECTIONS, MAX_SCORE, scoreCat, buildCatInsights } from "../../lib/catScoring";

const WHATSAPP_URL = "https://wa.me/918299470392?text=" + encodeURIComponent("CAT - I just checked my CAT 2026 score. Please guide me on next steps.");

const TILE = { C: ui.qC, W: ui.qW, N: ui.qN, B: ui.qC, U: ui.qU };

export default function CatReport({ report }) {
  if (!report) {
    return (
      <AppShell activePage="/cat-score-calculator" pageTitle="CAT 2026 Report">
        <NextSeo title="Report not found | IPM Careers" noindex nofollow />
        <div className={styles.page}>
          <div className={ui.notFound}>
            <div style={{ fontSize: "2.5rem" }}>🔍</div>
            <h1 className={styles.formTitle} style={{ fontSize: "1.4rem", margin: "12px 0 6px" }}>Report not found</h1>
            <p className={styles.formSubtitle}>This link may be wrong or the report was removed.</p>
            <Link href="/cat-score-calculator" className={styles.actionBtnPrimary}>Calculate your CAT 2026 score</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const { name, category, city, slot, result } = report;
  const insights = buildCatInsights(result);
  const firstName = (name || "Student").split(" ")[0];
  const url = `https://register.ipmcareer.com/cat-report/${report.uid}`;
  const sec = result.sections;
  const shareText = `I scored ${result.total}/${MAX_SCORE} in CAT 2026 (VARC ${sec.VARC.score}, DILR ${sec.DILR.score}, QA ${sec.QA.score}). Check yours free: ${url}`;
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); toast.success("Link copied!"); }
    catch { toast.error("Could not copy the link."); }
  };

  return (
    <AppShell activePage="/cat-score-calculator" pageTitle="CAT 2026 Report">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title={`${firstName}'s CAT 2026 Scorecard: ${result.total}/${MAX_SCORE} | IPM Careers`}
        description={`CAT 2026 raw score: VARC ${sec.VARC.score}, DILR ${sec.DILR.score}, QA ${sec.QA.score}, total ${result.total}/${MAX_SCORE}.`}
        noindex
        nofollow
        openGraph={{
          url,
          title: `${firstName} scored ${result.total}/${MAX_SCORE} in CAT 2026`,
          description: "Check your own CAT 2026 score free with the IPM Careers calculator.",
        }}
      />

      <div className={styles.page}>
        <div className={styles.hero} style={{ paddingBottom: "1.5rem" }}>
          <div className={`${styles.heroGlow} ${styles.heroGlow1}`}></div>
          <div className={`${styles.heroGlow} ${styles.heroGlow2}`}></div>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowDot}></span>
            CAT 2026 Report{slot ? ` · Slot ${slot}` : ""}{category ? ` · ${category}` : ""}
          </div>
          <h1 className={styles.heroTitle} style={{ fontSize: "2.1rem" }}>
            Hey {firstName}, <span className={styles.heroTitleAccent}>here is your CAT 2026 scorecard.</span>
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
                  <div className={styles.scoreBoxValue}>{sec[s.key].score}<span className={ui.scoreBoxMax}>/{s.max}</span></div>
                </div>
              ))}
              <div className={`${styles.scoreBox} ${styles.scoreBoxTotal}`}>
                <div className={styles.scoreBoxLabel}>Total</div>
                <div className={styles.scoreBoxValue}>{result.total}<span className={ui.scoreBoxMax}>/{MAX_SCORE}</span></div>
              </div>
            </div>
            <div className={ui.scorecardMeta}>
              <span className={ui.metaChip}>✅ {result.correct} correct</span>
              <span className={ui.metaChip}>❌ {result.wrong} wrong</span>
              <span className={ui.metaChip}>⏭ {result.unattempted} skipped</span>
              {result.pendingKey > 0 && <span className={ui.metaChip}>⏳ {result.pendingKey} waiting for key</span>}
            </div>
          </div>

          <div className={ui.shareRow}>
            <button className={styles.actionBtnPrimary} onClick={shareWhatsApp}>📲 Share on WhatsApp</button>
            <button className={styles.actionBtnSecondary} onClick={copyLink}>🔗 Copy link</button>
            <button className={styles.actionBtnSecondary} onClick={() => window.print()}>🖨️ Save as PDF</button>
            <Link href="/cat-score-calculator" className={styles.actionBtnSecondary}>🎯 Check another score</Link>
          </div>

          <div className={ui.sectionList}>
            {SECTIONS.map((s) => {
              const x = sec[s.key];
              const pct = x.max > 0 ? Math.max(0, (x.score / x.max) * 100) : 0;
              return (
                <div key={s.key} className={ui.sectionCard}>
                  <div className={ui.sectionHead}>
                    <div className={ui.sectionName}><span>{s.icon}</span> {s.name}</div>
                    <span className={`${ui.badge} ${x.score > 0 ? ui.badgeGood : ui.badgeBad}`}>{x.score}/{x.max}</span>
                  </div>
                  <div className={ui.bar}><div className={ui.barFill} style={{ width: `${pct}%` }}></div></div>
                  <div className={ui.statRow}>
                    <span>Correct <b className={ui.good}>{x.correct}</b></span>
                    <span>Wrong <b className={ui.bad}>{x.wrong}</b></span>
                    <span>Skipped <b>{x.unattempted}</b></span>
                    <span>MCQ <b>{x.mcq.correct}/{x.mcq.attempted}</b></span>
                    <span>TITA <b>{x.tita.correct}/{x.tita.attempted}</b></span>
                    <span>Accuracy <b>{x.accuracy}%</b></span>
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
              const list = result.answers.filter((a) => a.s === s.key);
              if (!list.length) return null;
              return (
                <div key={s.key}>
                  <div className={ui.qSecLabel}>{s.short}</div>
                  <div className={ui.qGrid}>
                    {list.map((a) => (
                      <div key={a.n} className={`${ui.qTile} ${TILE[a.r] || ui.qU}`} title={`Q${a.n} (${a.t}): your answer ${(a.t === "TITA" ? a.g : a.c) || "-"}, key ${a.k || "-"}`}>
                        {a.n}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className={ui.legend}>
              <span><i className={ui.legendDot} style={{ background: "#86efac" }}></i>Correct (+3)</span>
              <span><i className={ui.legendDot} style={{ background: "#fca5a5" }}></i>Wrong (MCQ -1, TITA 0)</span>
              <span><i className={ui.legendDot} style={{ background: "#fde68a" }}></i>Waiting for key</span>
              <span><i className={ui.legendDot} style={{ background: "rgba(236,232,225,0.25)" }}></i>Not attempted</span>
            </div>
          </div>

          <div className={ui.card}>
            <h2 className={ui.cardTitle}>📋 Answer table</h2>
            <div className={ui.tableWrap} style={{ margin: 0 }}>
              <table className={ui.table}>
                <thead>
                  <tr><th>Q#</th><th>Section</th><th>Type</th><th>Your answer</th><th>Key</th><th>Marks</th></tr>
                </thead>
                <tbody>
                  {result.answers.map((a) => (
                    <tr key={a.n}>
                      <td>{a.n}</td>
                      <td>{a.s}</td>
                      <td>{a.t}</td>
                      <td>{(a.t === "TITA" ? a.g : a.c) || "-"}</td>
                      <td>{a.r === "B" ? "Dropped" : a.k || (a.r === "N" ? "Awaited" : "-")}</td>
                      <td className={a.m > 0 ? ui.good : a.m < 0 ? ui.bad : ""}>{a.m > 0 ? `+${a.m}` : a.m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={ui.ctaCard} style={{ marginBottom: "1.5rem" }}>
            <h3 className={ui.ctaTitle}>Got your score? Plan the next step.</h3>
            <p className={ui.ctaText}>Talk to our IIM alumni mentors about calls, WAT-PI prep and which colleges to target.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={ui.ctaBtn}>📲 WhatsApp "CAT"</a>
          </div>

          <p className={ui.sourceNote} style={{ textAlign: "center" }}>
            Raw score from the response sheet: MCQ +3 / -1, TITA +3 / 0. The IIMs normalise scores across slots, so official results can differ.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

export async function getServerSideProps({ params, res }) {
  const uid = String(params?.uid || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) {
    res.statusCode = 404;
    return { props: { report: null } };
  }
  // server-only imports stay out of the browser bundle
  const { catDb, loadCatKeys } = await import("../../lib/catServer");
  let db;
  try { db = catDb(); } catch { return { props: { report: null } }; }

  const { data, error } = await db
    .from("cat_responses")
    .select("uid, name, candidate_name, category, city, slot, answers")
    .eq("uid", uid)
    .limit(1);
  if (error || !data || !data.length) {
    res.statusCode = 404;
    return { props: { report: null } };
  }
  const row = data[0];
  const stored = Array.isArray(row.answers) ? row.answers : [];

  // Re-score with the latest answer key so the link updates when the key is released
  let keys = {};
  try { keys = await loadCatKeys(db, stored.map((a) => a.q)); } catch {}
  const result = scoreCat(stored.map((a) => ({ ...a, k: a.ks || "" })), keys);

  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");

  // Only public-safe fields leave the server. Never phone or email.
  return {
    props: {
      report: {
        uid: row.uid,
        name: row.candidate_name || row.name || "Student",
        category: row.category || "",
        city: row.city || "",
        slot: row.slot || null,
        result: {
          total: result.total,
          sections: result.sections,
          correct: result.correct,
          wrong: result.wrong,
          unattempted: result.unattempted,
          pendingKey: result.pendingKey,
          answers: result.answers.map(({ n, s, t, c, g, k, r, m }) => ({ n, s, t, c, g, k, r, m })),
        },
      },
    },
  };
}
