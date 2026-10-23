import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import AppShell from "../../components/AppShell";
import CatScorecard from "../../components/CatScorecard";
import styles from "../Response.module.css";
import ui from "../IimbUg.module.css";
import { MAX_SCORE, scoreCat, buildCatInsights } from "../../lib/catScoring";
import { predictAll } from "../../lib/catPercentile";

export default function CatReport({ report }) {
  if (!report) {
    return (
      <AppShell activePage="/cat-score-calculator" pageTitle="CAT Report">
        <NextSeo title="Report not found | IPM Careers" noindex nofollow />
        <div className={styles.page}>
          <div className={ui.notFound}>
            <div style={{ fontSize: "2.5rem" }}>🔍</div>
            <h1 className={styles.formTitle} style={{ fontSize: "1.4rem", margin: "12px 0 6px" }}>Report not found</h1>
            <p className={styles.formSubtitle}>This link may be wrong or the report was removed.</p>
            <Link href="/cat-score-calculator" className={styles.actionBtnPrimary}>Calculate your CAT score</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const { name, category, city, slot, result, examYear, rank, count } = report;
  const insights = buildCatInsights(result);
  const first = String(name || "Student").split(" ")[0];
  const nice = first === first.toUpperCase() ? first.charAt(0) + first.slice(1).toLowerCase() : first;
  const url = `https://register.ipmcareer.com/cat-report/${report.uid}`;
  const sec = result.sections;
  const pred = predictAll({ VARC: sec.VARC.score, DILR: sec.DILR.score, QA: sec.QA.score });
  const p = pred.overall.main != null && !pred.overall.below ? pred.overall.main.toFixed(2) : "";
  const og = `https://register.ipmcareer.com/api/og-cat?n=${encodeURIComponent(nice)}&t=${result.total}&v=${sec.VARC.score}&d=${sec.DILR.score}&q=${sec.QA.score}&y=${examYear || ""}${p ? `&p=${p}` : ""}`;

  return (
    <AppShell activePage="/cat-score-calculator" pageTitle="CAT Report">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title={`${nice}'s CAT ${examYear || ""} Scorecard: ${result.total}/${MAX_SCORE} | IPM Careers`}
        description={`CAT raw score: VARC ${sec.VARC.score}, DILR ${sec.DILR.score}, QA ${sec.QA.score}, total ${result.total}/${MAX_SCORE}.${p ? ` Estimated percentile ~${p}.` : ""}`}
        noindex
        nofollow
        openGraph={{
          url,
          title: `${nice} scored ${result.total}/${MAX_SCORE} in CAT ${examYear || ""}`,
          description: "Check your own CAT score and estimated percentile free with the IPM Careers calculator.",
          images: [{ url: og, width: 1200, height: 630, alt: `${nice}'s CAT scorecard` }],
        }}
        twitter={{ cardType: "summary_large_image" }}
      />
      <div className={styles.page}>
        <div className={ui.reportWrap} style={{ paddingTop: "1.2rem" }}>
          <CatScorecard name={name} category={category} city={city} slot={slot} examYear={examYear} result={{ ...result, insights }} uid={report.uid} rank={rank} count={count} isReportPage />
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
    .select("uid, exam_year, name, candidate_name, category, city, slot, answers")
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

  let rank = null, count = null;
  try {
    const { data: st } = await db.rpc("cat_score_stats", { p_year: row.exam_year, p_score: result.total });
    if (st && st[0]) {
      count = Number(st[0].total_students) || null;
      rank = st[0].better_than_you != null ? Number(st[0].better_than_you) + 1 : null;
    }
  } catch {}

  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");

  // Only public-safe fields leave the server. Never phone or email.
  return {
    props: {
      report: {
        uid: row.uid,
        examYear: row.exam_year || null,
        name: row.candidate_name || row.name || "Student",
        category: row.category || "",
        city: row.city || "",
        slot: row.slot || null,
        rank,
        count,
        result: {
          total: result.total,
          sections: result.sections,
          correct: result.correct,
          wrong: result.wrong,
          unattempted: result.unattempted,
          pendingKey: result.pendingKey,
          answers: result.answers.map(({ n, s, t, c, g, k, r, m }) => ({ n, s, t, c, g, k: r === "N" ? "" : k, r, m })),
        },
      },
    },
  };
}
