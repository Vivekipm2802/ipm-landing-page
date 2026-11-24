import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import AppShell from "../../components/AppShell";
import ScoreCheckLink from "../../components/ScoreCheckLink";
import s from "../CatPlanner.module.css";
import { MARKS, marksPath, marksInfo, fmtPct } from "../../lib/catMarks";

const SITE = "https://register.ipmcareer.com";
const URL = `${SITE}/cat-percentile`;

export async function getStaticProps() {
  const rows = MARKS.slice().reverse().map((m) => { const i = marksInfo(m); return { m, p25: i.y25 && !i.y25.below ? i.y25.pct : null, p24: i.y24 && !i.y24.below ? i.y24.pct : null }; });
  return { props: { rows } };
}

export default function MarksHub({ rows }) {
  return (
    <AppShell activePage="/cat-percentile-predictor" pageTitle="CAT marks vs percentile">
      <Head><link rel="icon" href="/favicon_ipm.svg" /></Head>
      <NextSeo
        title="CAT Marks vs Percentile 2026: Every Score 20 to 130"
        description="CAT marks vs percentile for every score from 20 to 130 out of 204, from CAT 2025 and 2024 data. Tap your marks for the percentile, rank estimate and IIMs it clears."
        canonical={URL}
      />
      <div className={s.page}>
        <section className={s.hero}>
          <h1 className={s.title}>CAT Marks vs Percentile. <span className={s.accent}>Tap your score.</span></h1>
          <p className={s.sub}>Estimated from the scores students reported after CAT 2025 and CAT 2024. Each score has its own page with the rank estimate and the IIMs it clears.</p>
        </section>
        <div className={s.narrow}>
          <div className={`${s.card} ${s.cardGold}`}>
            <div className={s.cta}>
              <div><div className={s.tlTitle}>Know your section-wise marks?</div><div className={s.note}>Get overall and sectional percentiles in one go.</div></div>
              <Link href="/cat-percentile-predictor" className={s.btn}>Percentile predictor →</Link>
            </div>
          </div>
          <ScoreCheckLink />
          <div className={s.card}>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Marks (out of 204)</th><th>%ile (CAT 2025 data)</th><th>%ile (CAT 2024 data)</th></tr></thead>
                <tbody>{rows.map((r) => <tr key={r.m}><td><Link href={marksPath(r.m)} className={s.link}>{r.m} marks in CAT</Link></td><td>{fmtPct(r.p25)}</td><td>{fmtPct(r.p24)}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
        <div className={s.disclaimer}>⚠️ Estimates, not official IIM figures. Source: score and percentile pairs students reported from CAT 2025 and 2024 scorecards (cracku.in, cross-checked with iquanta.in).</div>
      </div>
    </AppShell>
  );
}
