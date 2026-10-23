import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import AppShell from "../../components/AppShell";
import IimbScorecard from "../../components/IimbScorecard";
import styles from "../Response.module.css";
import ui from "../IimbUg.module.css";
import { MAX_SCORE, scoreAnswers, buildInsights } from "../../utils/iimbScoring";

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

  const { name, category, city, answers, uid, stats, testDate } = report;
  const scores = scoreAnswers(answers);
  const insights = buildInsights(scores);
  const first = (name || "Student").split(" ")[0];
  const url = `https://register.ipmcareer.com/iimb-report/${uid}`;
  const s = scores.sections;
  const og = `https://register.ipmcareer.com/api/og-iimb?n=${encodeURIComponent(first)}&t=${scores.total}&v=${s.VARC.score}&l=${s.LR.score}&q=${s.QADI.score}&a=${scores.accuracy}`;

  return (
    <AppShell activePage="/response-v1" pageTitle="IIM-B UG Report">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title={`${first}'s IIM Bangalore UG Scorecard: ${scores.total}/${MAX_SCORE} | IPM Careers`}
        description={`IIM Bangalore UG Test score report: VARC ${s.VARC.score}, LR ${s.LR.score}, QADI ${s.QADI.score}, total ${scores.total}/${MAX_SCORE}, ${scores.accuracy}% accuracy.`}
        noindex
        nofollow
        openGraph={{
          url,
          title: `${first} scored ${scores.total}/${MAX_SCORE} in the IIM Bangalore UG Test`,
          description: "Check your own IIMB UG score free with the IPM Careers calculator.",
          images: [{ url: og, width: 1200, height: 630, alt: `${first}'s IIM Bangalore UG scorecard` }],
        }}
        twitter={{ cardType: "summary_large_image" }}
      />
      <div className={styles.page}>
        <div className={ui.reportWrap} style={{ paddingTop: "1.2rem" }}>
          <IimbScorecard name={name} category={category} city={city} testDate={testDate} scores={scores} answers={answers} insights={insights} uid={uid} stats={stats} isReportPage />
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
  try {
    const { iimbDb, iimbStats } = await import("../../lib/iimbServer");
    const db = iimbDb();
    const { data } = await db.from("iimb_ug_scorecards").select("uid, exam_year, name, category, city, test_date, score_total, answers").eq("uid", uid).maybeSingle();
    if (!data || !Array.isArray(data.answers) || !data.answers.length) {
      res.statusCode = 404;
      return { props: { report: null } };
    }
    const stats = await iimbStats(db, data.exam_year, data.score_total);
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
    // Only public-safe fields leave the server. Never phone or email.
    return {
      props: {
        report: { uid, name: data.name || "Student", category: data.category || "", city: data.city || "", testDate: data.test_date || "", answers: data.answers, stats },
      },
    };
  } catch {
    res.statusCode = 404;
    return { props: { report: null } };
  }
}
