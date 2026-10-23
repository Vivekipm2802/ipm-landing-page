import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import AppShell from "../components/AppShell";
import s from "./CatPlanner.module.css";
import { sendLeadToCrm } from "../lib/crm";
import { PATTERN, MAX_TOTAL, APPEARED, CURVES, TARGETS, predictAll, marksNeeded } from "../lib/catPercentile";
import { CATEGORIES } from "../lib/iimCallData";

const SITE = "https://register.ipmcareer.com";
const PAGE_URL = `${SITE}/cat-percentile-predictor`;
const SECS = ["VARC", "DILR", "QA"];
const fmtPct = (x) => (x == null ? "–" : x >= 99.99 ? "99.99+" : x.toFixed(2));

const FAQS = [
  { q: "How many marks are needed for 99 percentile in CAT?", a: `In CAT 2025, about ${marksNeeded(2025, "overall", 99)} marks (scaled score, out of 204) were needed for the 99th percentile, going by scores students reported from their scorecards. In CAT 2024 it was about ${marksNeeded(2024, "overall", 99)}. The number moves every year with paper difficulty.` },
  { q: "How many marks are needed for 95 percentile in CAT?", a: `About ${marksNeeded(2025, "overall", 95)} marks in CAT 2025 and about ${marksNeeded(2024, "overall", 95)} in CAT 2024.` },
  { q: "How accurate is this CAT percentile predictor?", a: "It is an estimate. It maps your marks onto the score-to-percentile curves students reported after the CAT 2025 and CAT 2024 results, and shows both, so you see a range. Your real percentile depends on your slot's normalisation and how everyone else did this year. The IIMs do not publish a score-to-percentile table." },
  { q: "What is the difference between raw score and scaled score in CAT?", a: "Your raw score is 3 marks per correct answer minus 1 per wrong MCQ (wrong TITA answers cost nothing). Because CAT runs in three slots with different papers, the IIMs normalise raw scores into scaled scores, and percentiles are calculated on scaled scores. The scorecard shows scaled scores, which is what the curves here use." },
  { q: "What is the CAT 2026 exam pattern and marking scheme?", a: "CAT 2025 had 68 questions in 120 minutes: VARC 24 questions (72 marks), DILR 22 (66 marks) and QA 22 (66 marks), with 40 minutes per section. Each correct answer is +3, a wrong MCQ is -1 and a wrong TITA answer has no penalty. Check the CAT 2026 notification for any change." },
  { q: "How many candidates took CAT 2025?", a: `About ${(APPEARED[2025] / 100000).toFixed(2)} lakh candidates appeared for CAT 2025 (about ${(APPEARED[2024] / 100000).toFixed(2)} lakh in CAT 2024), as reported from the IIMs' result announcements. The rank shown here is an estimate based on the 2025 number.` },
  { q: "Can I use my mock test score?", a: "Mock tests are scored on their own scale, so a SIMCAT or AIMCAT score does not convert one-to-one. Enter the marks you expect in the real CAT, or use your mock's attempts and accuracy as a guide." },
];

export default function CatPercentilePredictor() {
  const router = useRouter();
  const resRef = useRef(null);
  const [mode, setMode] = useState("marks");
  const [marks, setMarks] = useState({ VARC: "", DILR: "", QA: "" });
  const [att, setAtt] = useState({ VARC: { c: "", w: "" }, DILR: { c: "", w: "" }, QA: { c: "", w: "" } });
  const [lead, setLead] = useState({ name: "", phone: "", email: "", category: "" });
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    if (q.v || q.d || q.q) setMarks({ VARC: q.v || "", DILR: q.d || "", QA: q.q || "" });
  }, [router.isReady, router.query]);

  const scores = useMemo(() => {
    const o = {};
    SECS.forEach((k) => {
      if (mode === "marks") o[k] = marks[k] === "" ? null : Number(marks[k]);
      else { const c = Number(att[k].c) || 0, w = Number(att[k].w) || 0; o[k] = att[k].c === "" && att[k].w === "" ? null : 3 * c - w; }
    });
    return o;
  }, [mode, marks, att]);
  const total = SECS.reduce((n, k) => n + (scores[k] || 0), 0);

  const validate = () => {
    for (const k of SECS) {
      const v = scores[k];
      if (v == null || Number.isNaN(v)) return `Enter your ${k} ${mode === "marks" ? "marks" : "correct answers and wrong MCQs"}.`;
      if (v > PATTERN[k].max) return `${k} cannot be more than ${PATTERN[k].max} marks.`;
      if (v < -PATTERN[k].questions) return `${k} marks look too low.`;
      if (mode === "attempts") {
        const c = Number(att[k].c) || 0, w = Number(att[k].w) || 0;
        if (c + w > PATTERN[k].questions) return `${k} has only ${PATTERN[k].questions} questions.`;
      }
    }
    if (lead.name.trim().length < 2) return "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(lead.phone)) return "Please enter a valid 10-digit mobile number (without +91 or 0).";
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email.trim())) return "Please check your email address.";
    return "";
  };

  const predict = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setError("");
    setBusy(true);
    const r = predictAll(scores);
    setRes(r);
    sendLeadToCrm({ name: lead.name.trim(), phone: lead.phone, email: lead.email.trim() }, "register-cat-percentile-predictor");
    try {
      await fetch("/api/cat-predictor-lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "percentile", ...lead, inputs: { mode, ...scores }, outputs: { total: r.total, overall: r.overall.main, VARC: r.VARC.main, DILR: r.DILR.main, QA: r.QA.main }, utm: pickUtm(router.query) }),
      });
    } catch {}
    setBusy(false);
    setTimeout(() => resRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const callLink = res ? `/iim-call-predictor?o=${res.overall.main ?? ""}&v=${res.VARC.main ?? ""}&d=${res.DILR.main ?? ""}&q=${res.QA.main ?? ""}${lead.category ? `&cat=${lead.category}` : ""}` : "/iim-call-predictor";
  const shareText = res ? `My predicted CAT percentile: ${fmtPct(res.overall.main)} (${res.total}/204). Check yours free: ${PAGE_URL}` : "";

  const ld = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: "CAT Percentile Predictor 2026", url: PAGE_URL, applicationCategory: "EducationalApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, provider: { "@type": "Organization", name: "IPM Careers", url: "https://ipmcareer.com" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "CAT 2026 Score Calculator", item: `${SITE}/cat-score-calculator` }, { "@type": "ListItem", position: 2, name: "CAT Percentile Predictor", item: PAGE_URL }] },
  ];

  return (
    <AppShell activePage="/cat-percentile-predictor" pageTitle="CAT Percentile Predictor">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </Head>
      <NextSeo
        title="CAT Percentile Predictor 2026: Score vs Percentile (CAT 2025 Data)"
        description={`Free CAT percentile predictor: enter your VARC, DILR and QA marks and get your expected overall and sectional percentile, from real CAT 2025 and 2024 results. 99 percentile needed about ${marksNeeded(2025, "overall", 99)} marks in CAT 2025.`}
        canonical={PAGE_URL}
        openGraph={{ url: PAGE_URL, title: "CAT Percentile Predictor 2026 | IPM Careers", description: "Your marks to CAT percentile, from real CAT 2025 and 2024 scorecards.", siteName: "IPM Careers" }}
        additionalMetaTags={[
          { name: "keywords", content: "CAT percentile predictor, CAT percentile predictor 2026, CAT score vs percentile, CAT 2025 score vs percentile, CAT marks vs percentile, how many marks for 99 percentile in CAT, CAT 95 percentile marks, CAT sectional percentile, CAT percentile calculator" },
          { name: "robots", content: "index, follow, max-image-preview:large" },
        ]}
      />
      <div className={s.page}>
        <section className={s.hero}>
          <span className={s.eyebrow}><span className={s.pulse} /> Built on real CAT 2025 and 2024 results</span>
          <h1 className={s.title}>CAT Percentile Predictor. <span className={s.accent}>Enter your marks, see your percentile.</span></h1>
          <p className={s.sub}>Overall and sectional percentile for VARC, DILR and QA, an approximate rank, and the IIMs whose minimum you clear.</p>
          <div className={s.stats}>
            <div className={s.stat}><div className={s.statNum}>{marksNeeded(2025, "overall", 99)}</div><div className={s.statLabel}>marks for 99%ile (2025)</div></div>
            <div className={s.stat}><div className={s.statNum}>{marksNeeded(2025, "overall", 95)}</div><div className={s.statLabel}>marks for 95%ile (2025)</div></div>
            <div className={s.stat}><div className={s.statNum}>Free</div><div className={s.statLabel}>no login</div></div>
          </div>
        </section>

        <div className={s.narrow}>
          <div className={`${s.card} ${s.cardGold}`}>
            <div className={s.seg} role="tablist" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[["marks", "Marks per section"], ["attempts", "Attempts & accuracy"]].map(([k, l]) => (
                <button key={k} type="button" className={`${s.segBtn} ${mode === k ? s.segOn : ""}`} onClick={() => setMode(k)}>{l}</button>
              ))}
            </div>
            <div className={s.inputs3}>
              {SECS.map((k) => (
                <div key={k} className={s.secBox}>
                  <div><div className={s.secName}>{k}</div><div className={s.secMax}>{PATTERN[k].questions} Qs · max {PATTERN[k].max}</div></div>
                  {mode === "marks" ? (
                    <input className={s.input} inputMode="decimal" value={marks[k]} placeholder="0" aria-label={`${k} marks`}
                      onChange={(e) => setMarks((x) => ({ ...x, [k]: e.target.value.replace(/[^\d.-]/g, "") }))} />
                  ) : (
                    <>
                      <input className={s.input} inputMode="numeric" value={att[k].c} placeholder="Correct" aria-label={`${k} correct`} onChange={(e) => setAtt((x) => ({ ...x, [k]: { ...x[k], c: e.target.value.replace(/\D/g, "") } }))} />
                      <input className={s.input} inputMode="numeric" value={att[k].w} placeholder="Wrong MCQs" aria-label={`${k} wrong MCQs`} onChange={(e) => setAtt((x) => ({ ...x, [k]: { ...x[k], w: e.target.value.replace(/\D/g, "") } }))} />
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className={s.totalLine}><span>{mode === "attempts" ? "+3 per correct, −1 per wrong MCQ (wrong TITA: 0)" : "Total out of 204"}</span><b>{Math.round(total * 100) / 100}</b></div>

            <div className={s.gate}>
              <div className={s.row2}>
                <label className={s.field}><span className={s.label}>Your name</span><input className={s.input} value={lead.name} onChange={(e) => setLead((x) => ({ ...x, name: e.target.value }))} autoComplete="name" /></label>
                <label className={s.field}><span className={s.label}>WhatsApp number</span><input className={s.input} value={lead.phone} onChange={(e) => setLead((x) => ({ ...x, phone: e.target.value.replace(/\D/g, "").slice(-10) }))} inputMode="numeric" placeholder="10-digit mobile" /></label>
              </div>
              <div className={s.row2} style={{ marginTop: 10 }}>
                <label className={s.field}><span className={s.label}>Email <span className={s.opt}>(optional)</span></span><input className={s.input} value={lead.email} onChange={(e) => setLead((x) => ({ ...x, email: e.target.value }))} type="email" /></label>
                <div className={s.field}><span className={s.label}>Category <span className={s.opt}>(for IIM cutoffs)</span></span>
                  <select className={s.select} value={lead.category} onChange={(e) => setLead((x) => ({ ...x, category: e.target.value }))}>
                    <option value="">Choose</option>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {error && <div className={s.err} style={{ marginTop: 12 }}>{error}</div>}
            <button type="button" className={`${s.btn} ${s.btnFull}`} style={{ marginTop: 14 }} onClick={predict} disabled={busy}>{busy ? "Calculating…" : "Predict my percentile →"}</button>
            <p className={s.note} style={{ textAlign: "center", marginTop: 8 }}>Free. By continuing you agree to be contacted by IPM Careers about CAT and MBA admissions.</p>
          </div>

          {res && (
            <div ref={resRef} className={s.result}>
              <div className={s.resLabel}>Predicted overall percentile</div>
              <div className={s.pctBig}>{res.overall.below ? "Below 55" : fmtPct(res.overall.main)}</div>
              <div className={s.pctRange}>
                {res.overall.below ? "Our data starts at the 55th percentile (20 marks in CAT 2025)." : res.overall.low !== res.overall.high ? `Range ${fmtPct(res.overall.low)} to ${fmtPct(res.overall.high)} (CAT 2025 vs CAT 2024 results)` : "Based on CAT 2025 results"}
              </div>
              <div className={s.pills} style={{ marginTop: 10 }}>
                <span className={s.pill}>Score {res.total}/204</span>
                {res.rank && <span className={`${s.pill} ${s.pillMute}`}>{res.overall.above ? `Top ${res.rank.toLocaleString("en-IN")}` : `About rank ${res.rank.toLocaleString("en-IN")}`} of {(APPEARED[2025] / 100000).toFixed(2)} lakh</span>}
              </div>
              <div className={s.secGrid}>
                {SECS.map((k) => (
                  <div key={k} className={s.secCard}>
                    <div className={s.secSub}>{k} · {scores[k]} marks</div>
                    <div className={s.secPct}>{res[k].below ? "<1" : fmtPct(res[k].main)}</div>
                    <div className={s.secSub}>{res[k].y2024 && !res[k].y2024.below ? `2024 data: ${fmtPct(res[k].y2024.pct)}` : "percentile"}</div>
                  </div>
                ))}
              </div>
              <div className={s.actions} style={{ marginTop: 16 }}>
                <Link className={s.action} href={callLink}><span className={s.actionIcon}>🎯</span><span className={s.actionTitle}>Which IIMs do I clear?</span><span className={s.actionSub}>IIM call predictor</span></Link>
                <a className={s.action} href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"><span className={s.actionIcon}>💬</span><span className={s.actionTitle}>Share on WhatsApp</span><span className={s.actionSub}>With your CAT group</span></a>
                <Link className={s.action} href="/cat-exam-day-planner"><span className={s.actionIcon}>🧭</span><span className={s.actionTitle}>Exam day planner</span><span className={s.actionSub}>Route, alarms, checklist</span></Link>
              </div>
              <p className={s.note} style={{ marginTop: 12 }}>An estimate from real past results, not an official IIM conversion. Slot normalisation and this year’s paper decide your actual percentile.</p>
            </div>
          )}
        </div>

        <article className={s.article}>
          <h2>CAT 2025 score vs percentile</h2>
          <p>Scaled scores students reported from their CAT 2025 and CAT 2024 scorecards, compiled after the results. A dash means no reported data point for that percentile. Use them as a guide: the IIMs do not publish this table.</p>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Percentile</th><th>CAT 2025 overall</th><th>CAT 2024 overall</th><th>VARC 2025</th><th>DILR 2025</th><th>QA 2025</th></tr></thead>
              <tbody>
                {TARGETS.map((p) => (
                  <tr key={p}><td><b>{p}</b></td><td>{marksNeeded(2025, "overall", p) ?? "–"}</td><td>{marksNeeded(2024, "overall", p) ?? "–"}</td><td>{marksNeeded(2025, "VARC", p) ?? "–"}</td><td>{marksNeeded(2025, "DILR", p) ?? "–"}</td><td>{marksNeeded(2025, "QA", p) ?? "–"}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={s.note}>Sources: cracku.in CAT score vs percentile (2025 overall and VARC, DILR, QA pages; 2024 page), cross-checked with iquanta.in. Scores are scaled scores out of 204.</p>

          <h2>How CAT percentile is calculated</h2>
          <p>Each correct answer earns 3 marks, a wrong MCQ costs 1 mark and a wrong TITA answer costs nothing. Because the three slots have different papers, the IIMs convert raw marks into scaled scores. Your percentile tells you what share of all candidates scored below you: at the 99th percentile, 99% of test-takers scored lower. With about {(APPEARED[2025] / 100000).toFixed(2)} lakh candidates in CAT 2025, every 0.1 percentile near the top is roughly {Math.round(APPEARED[2025] / 1000)} candidates.</p>

          <h2>CAT 2026 exam pattern</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Section</th><th>Questions</th><th>Max marks</th><th>Time</th></tr></thead>
              <tbody>{SECS.map((k) => <tr key={k}><td>{PATTERN[k].full} ({k})</td><td>{PATTERN[k].questions}</td><td>{PATTERN[k].max}</td><td>40 min</td></tr>)}<tr><td><b>Total</b></td><td>68</td><td>{MAX_TOTAL}</td><td>120 min</td></tr></tbody>
            </table>
          </div>
          <p>Pattern as in CAT 2025; check the CAT 2026 notification for changes.</p>

          <h2>Frequently asked questions</h2>
          {FAQS.map((x) => <details key={x.q} className={s.faq}><summary>{x.q}</summary><p>{x.a}</p></details>)}
        </article>
        <div className={s.disclaimer}>⚠️ This predictor gives an estimate from score and percentile data students reported after CAT 2025 and CAT 2024. It is not an official IIM tool. Your actual percentile depends on normalisation across slots and this year’s results.</div>
      </div>
    </AppShell>
  );
}

function pickUtm(q) {
  const o = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "gclid", "fbclid"].forEach((k) => { if (q[k]) o[k] = String(q[k]).slice(0, 120); });
  return Object.keys(o).length ? o : null;
}
