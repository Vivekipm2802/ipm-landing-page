import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import AppShell from "../../components/AppShell";
import { CatAlertsInline } from "../../components/CatAlerts";
import s from "../CatPlanner.module.css";
import { MARKS, MARK_MIN, MARK_MAX, marksPath, parseMarksSlug, marksInfo, fmtPct, fmtN } from "../../lib/catMarks";

const SITE = "https://register.ipmcareer.com";

export async function getStaticPaths() {
  return { paths: MARKS.map((m) => ({ params: { marks: `${m}-marks` } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const m = parseMarksSlug(params.marks);
  if (m == null) return { notFound: true };
  return { props: { info: marksInfo(m) } };
}

const verdict = (p) => (p == null ? "" : p >= 99 ? "a top score: it clears the overall minimum of every IIM that sets one" : p >= 95 ? "a strong score: it clears the overall minimum of most IIMs" : p >= 90 ? "a good score: about the overall minimum many IIMs set for General candidates" : p >= 85 ? "a fair score: it clears the minimum of a few IIMs and many good B-schools" : "below most IIM minimums for General candidates, though many B-schools and reserved-category cutoffs are lower");

export default function MarksPage({ info }) {
  const { m, y25, y24, main, rank, clears, iimTotal, appeared } = info;
  const url = `${SITE}${marksPath(m)}`;
  const p25 = y25 && !y25.below ? fmtPct(y25.pct) : null;
  const p24 = y24 && !y24.below ? fmtPct(y24.pct) : null;
  const head = p25 ? `~${p25} percentile` : "below the lowest reported point";
  const near = [m - 10, m - 5, m - 2, m - 1, m + 1, m + 2, m + 5, m + 10].filter((x) => x >= MARK_MIN && x <= MARK_MAX);
  const steps = MARKS.filter((x) => x % 5 === 0);
  const bracketTxt = (y, yr) => {
    if (!y) return "";
    if (y.exact) return `Students reported ${y.lo[0]} marks = ${y.lo[1]} percentile in CAT ${yr}.`;
    if (y.below) return `CAT ${yr} data starts at ${y.hi[0]} marks (${y.hi[1]} percentile), so ${m} marks is below that.`;
    if (y.above) return `CAT ${yr} data ends at ${y.lo[0]} marks (${y.lo[1]} percentile), so ${m} marks is at least that.`;
    return `Between the reported points ${y.lo[0]} marks (${y.lo[1]} %ile) and ${y.hi[0]} marks (${y.hi[1]} %ile) in CAT ${yr}.`;
  };
  const faqs = [
    { q: `What percentile is ${m} marks in CAT?`, a: p25 ? `Going by CAT 2025 scores students reported from their scorecards, ${m} marks out of 204 works out to about ${p25} percentile${p24 ? `, and about ${p24} percentile by CAT 2024 data` : ""}. Your real percentile depends on this year's paper and your slot's normalisation.` : `${m} marks is below the lowest point in the CAT 2025 data students reported, which starts at 20 marks for about 55 percentile.` },
    { q: `Is ${m} a good score in CAT?`, a: main != null ? `At about ${p25} percentile, ${m} marks is ${verdict(main)}. ${clears.length} of the ${iimTotal} IIMs that set an overall minimum ask for ${main >= 99 ? "this or less" : `${Math.floor(main)} percentile or less`} for General candidates; sectional minimums and profile scores also count.` : `It is below the range where the data is reliable.` },
    { q: `What rank is ${m} marks in CAT?`, a: rank ? `With about ${(appeared / 100000).toFixed(2)} lakh test-takers in CAT 2025, ${p25} percentile means roughly ${fmtN(rank)} candidates scored higher. The IIMs do not publish ranks, so this is an estimate.` : `Not enough data at this score to estimate a rank.` },
  ];
  const ld = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "CAT Percentile Predictor", item: `${SITE}/cat-percentile-predictor` },
      { "@type": "ListItem", position: 2, name: "CAT marks vs percentile", item: `${SITE}/cat-percentile` },
      { "@type": "ListItem", position: 3, name: `${m} marks in CAT`, item: url },
    ] },
  ];
  return (
    <AppShell activePage="/cat-percentile-predictor" pageTitle={`${m} marks in CAT`}>
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </Head>
      <NextSeo
        title={`${m} Marks in CAT Percentile 2026: ${p25 ? `~${p25} %ile` : "Estimate"}`}
        description={`${m} marks in CAT ≈ ${p25 ? `${p25} percentile` : "below 55 percentile"} by CAT 2025 data${p24 ? ` (${p24} in CAT 2024)` : ""}${rank ? `, rank about ${fmtN(rank)}` : ""}. See which IIMs ${m} marks clears and check yours free.`}
        canonical={url}
        openGraph={{ url, title: `${m} marks in CAT: ${p25 ? `about ${p25} percentile` : "percentile estimate"}`, siteName: "IPM Careers" }}
      />
      <div className={s.page}>
        <div className={s.wrap}>
          <div className={s.crumbs}><Link href="/cat-percentile-predictor">CAT percentile predictor</Link> › <Link href="/cat-percentile">Marks vs percentile</Link> › {m} marks</div>
        </div>
        <section className={s.hero} style={{ paddingTop: "1.2rem" }}>
          <h1 className={s.title}>{m} Marks in CAT: <span className={s.accent}>{head}</span></h1>
          <p className={s.sub}>{p25 ? `By the scores students reported after CAT 2025, ${m} out of 204 is about ${p25} percentile${p24 ? ` (about ${p24} by CAT 2024 data)` : ""}.` : `${m} marks is below the CAT 2025 data range.`} Estimates, not official IIM figures.</p>
          <div className={s.stats}>
            <div className={s.stat}><div className={s.statNum}>{p25 || "–"}</div><div className={s.statLabel}>%ile (CAT 2025 data)</div></div>
            <div className={s.stat}><div className={s.statNum}>{p24 || "–"}</div><div className={s.statLabel}>%ile (CAT 2024 data)</div></div>
            <div className={s.stat}><div className={s.statNum}>{rank ? `~${fmtN(rank)}` : "–"}</div><div className={s.statLabel}>approx. rank</div></div>
          </div>
        </section>

        <div className={s.narrow}>
          <div className={`${s.card} ${s.cardGold}`}>
            <div className={s.cta}>
              <div><div className={s.tlTitle}>Have your section-wise marks?</div><div className={s.note}>Get overall and sectional percentiles, then check which IIMs may call you.</div></div>
              <Link href="/cat-percentile-predictor" className={s.btn}>Predict my percentile →</Link>
            </div>
          </div>

          <div className={s.card}>
            <h2 className={s.cardTitle}>How we got this number</h2>
            <p className={s.cardSub}>{bracketTxt(y25, 2025)} {bracketTxt(y24, 2024)} Values in between are estimated on a straight line. Scores are scaled scores out of 204.</p>
          </div>

          <div className={s.card}>
            <h2 className={s.cardTitle}>Which IIMs {m} marks clears (General, overall minimum)</h2>
            {main != null ? (
              <p className={s.cardSub}>At about {p25} percentile you clear the overall minimum of <b style={{ color: "#f4f1ea" }}>{clears.length} of {iimTotal}</b> IIMs that publish one{clears.length ? `: ${clears.map((x) => x.replace("IIM ", "")).join(", ")}` : ""}. Clearing the minimum makes you eligible to be considered; sectional minimums and the profile score decide calls.</p>
            ) : <p className={s.cardSub}>Below the data range.</p>}
            <Link href="/iim-call-predictor" className={s.link}>Check your IIM calls with your full profile →</Link>
          </div>

          <CatAlertsInline title="Wrote CAT 2026? Get your exact score on day one" text="We email you the minute the response sheet is out, with a 1-minute score check, then the answer key and result." />

          <div className={s.card}>
            <h2 className={s.cardTitle}>Nearby scores</h2>
            <div className={s.chips || ""} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {near.map((x) => <Link key={x} href={marksPath(x)} className={s.pill || s.link}>{x} marks</Link>)}
            </div>
          </div>
        </div>

        <article className={s.article}>
          <h2>CAT marks vs percentile: every 5 marks</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Marks</th><th>%ile (CAT 2025 data)</th><th>%ile (CAT 2024 data)</th></tr></thead>
              <tbody>{steps.map((x) => { const i = marksInfo(x); return <tr key={x}><td><Link href={marksPath(x)} className={s.link}>{x} marks</Link></td><td>{i.y25 && !i.y25.below ? fmtPct(i.y25.pct) : "–"}</td><td>{i.y24 && !i.y24.below ? fmtPct(i.y24.pct) : "–"}</td></tr>; })}</tbody>
            </table>
          </div>
          <h2>Frequently asked questions</h2>
          {faqs.map((x) => <details key={x.q} className={s.faq}><summary>{x.q}</summary><p>{x.a}</p></details>)}
        </article>
        <div className={s.disclaimer}>⚠️ Estimates from score and percentile pairs students reported after CAT 2025 and CAT 2024 (compiled by cracku.in, cross-checked with iquanta.in). The IIMs do not publish a marks-to-percentile table, and every slot is normalised separately.</div>
      </div>
    </AppShell>
  );
}
