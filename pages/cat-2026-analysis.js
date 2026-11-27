// /cat-2026-analysis: exam-day tool. A student picks their slot, rates each section and enters attempts and
// how many they think are right; we show an expected score range and percentile range (lib/catPercentile),
// and a live slot-wise picture from everyone who has answered (pages/api/cat-analysis-stats).
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import AppShell from "../components/AppShell";
import LeadPopup from "../components/LeadPopup";
import { CatAlertsInline } from "../components/CatAlerts";
import s from "./CatPlanner.module.css";
import t from "./CatTools.module.css";
import a from "./CatAnalysis.module.css";
import { sendLeadToCrm } from "../lib/crm";
import { PATTERN, APPEARED, predictAll } from "../lib/catPercentile";
import { CATEGORIES } from "../lib/iimCallData";

const SITE = "https://register.ipmcareer.com";
const PAGE_URL = `${SITE}/cat-2026-analysis`;
const SECS = ["VARC", "DILR", "QA"];
const SLOTS = [
  { n: 1, time: "8:30 to 10:30 AM", ends: "2026-11-29T10:30:00+05:30" },
  { n: 2, time: "12:30 to 2:30 PM", ends: "2026-11-29T14:30:00+05:30" },
  { n: 3, time: "4:30 to 6:30 PM", ends: "2026-11-29T18:30:00+05:30" },
];
const LEVELS = ["Easy", "Moderate", "Difficult"];
const fmtPct = (x) => (x == null ? "–" : x >= 99.99 ? "99.99+" : x.toFixed(2));
const blankSec = () => ({ lvl: "", att: "", ok: "" });

const FAQS = [
  { q: "When is CAT 2026 and what are the slot timings?", a: "CAT 2026 is on Sunday, 29 November 2026, in three slots: 8:30 to 10:30 AM, 12:30 to 2:30 PM and 4:30 to 6:30 PM. Check the exact reporting time on your admit card." },
  { q: "What is the CAT 2026 exam pattern?", a: "68 questions in 120 minutes: VARC 24 questions, DILR 22 and QA 22, with 40 minutes per section. A correct answer is +3, a wrong MCQ is −1 and a wrong TITA (type in the answer) costs nothing." },
  { q: "How do you estimate my percentile from attempts?", a: "You tell us how many questions you attempted and how many you think are right in each section. We work out a score range: the low end counts every wrong answer as an MCQ (−1 each), the high end counts them as TITA (no penalty). We then map that range onto the score-to-percentile curves students reported after CAT 2025 and CAT 2024. It is an estimate, not an official conversion." },
  { q: "Is the slot analysis on this page official?", a: "No. It is the combined view of students who wrote that slot and answered here: how difficult each section felt and how many questions people attempted. It fills in after each slot ends and gets more reliable as more students answer." },
  { q: "When will the CAT 2026 response sheet and answer key come out?", a: "Last year the response sheet and provisional answer key came out on 4 December, five days after the exam. Expect the CAT 2026 response sheet in the first week of December. Turn on alerts on this page and we will email you when it is out." },
  { q: "Do different slots have different difficulty? Is it fair?", a: "Each slot has a different paper, so difficulty can vary. The IIMs normalise raw scores across slots into scaled scores before calculating percentiles, so a tougher slot is not a disadvantage by itself." },
];

export default function CatAnalysis() {
  const router = useRouter();
  const resRef = useRef(null);
  const [slot, setSlot] = useState(null);
  const [secs, setSecs] = useState({ VARC: blankSec(), DILR: blankSec(), QA: blankSec() });
  const [lead, setLead] = useState({ name: "", phone: "", email: "", category: "" });
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(false);
  const [popupError, setPopupError] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [stats, setStats] = useState(null);
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    fetch("/api/cat-analysis-stats").then((r) => (r.ok ? r.json() : null)).then((j) => j && setStats(j)).catch(() => {});
  }, []);

  // Default the slot to the one that most recently ended (or slot 1)
  useEffect(() => {
    if (now == null || slot) return;
    const done = SLOTS.filter((x) => now >= new Date(x.ends).getTime());
    setSlot(done.length ? done[done.length - 1].n : 1);
  }, [now, slot]);

  const set = (k, field, v) => setSecs((x) => ({ ...x, [k]: { ...x[k], [field]: v } }));

  const nums = SECS.reduce((o, k) => {
    const att = secs[k].att === "" ? null : Number(secs[k].att);
    const ok = secs[k].ok === "" ? null : Number(secs[k].ok);
    o[k] = { att, ok, low: att != null && ok != null ? 3 * ok - (att - ok) : null, high: ok != null ? 3 * ok : null };
    return o;
  }, {});
  const filled = SECS.every((k) => nums[k].low != null);
  const lowTotal = filled ? SECS.reduce((n, k) => n + nums[k].low, 0) : null;
  const highTotal = filled ? SECS.reduce((n, k) => n + nums[k].high, 0) : null;

  const validate = () => {
    if (!slot) return "Pick your slot.";
    for (const k of SECS) {
      const { att, ok } = nums[k];
      if (att == null || ok == null) return `Enter your ${k} attempts and how many you think are right.`;
      if (att > PATTERN[k].questions) return `${k} has only ${PATTERN[k].questions} questions.`;
      if (ok > att) return `${k}: right answers cannot be more than attempts.`;
    }
    return "";
  };
  const leadError = () => {
    if (lead.name.trim().length < 2) return "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(lead.phone)) return "Please enter a valid 10-digit WhatsApp number (without +91 or 0).";
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email.trim())) return "Please check your email address.";
    return "";
  };
  const start = () => {
    const v = validate();
    if (v) { setError(v); return; }
    setError("");
    setPopupError("");
    setPopup(true);
  };

  const submit = () => {
    const v = validate() || leadError();
    if (v) { setPopupError(v); return; }
    setBusy(true);
    const lo = predictAll({ VARC: nums.VARC.low, DILR: nums.DILR.low, QA: nums.QA.low });
    const hi = predictAll({ VARC: nums.VARC.high, DILR: nums.DILR.high, QA: nums.QA.high });
    setRes({ lo, hi });
    sendLeadToCrm({ name: lead.name.trim(), phone: lead.phone, email: lead.email.trim() }, "register-cat-2026-analysis");
    const inputs = { slot, ...SECS.reduce((o, k) => ({ ...o, [k]: { lvl: secs[k].lvl || null, att: nums[k].att, ok: nums[k].ok } }), {}) };
    try {
      fetch("/api/cat-predictor-lead", {
        method: "POST", keepalive: true, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "analysis", ...lead, inputs, outputs: { low: lo.total, high: hi.total, pctLow: lo.overall.main, pctHigh: hi.overall.main }, utm: pickUtm(router.query) }),
      }).catch(() => {});
    } catch {}
    setBusy(false);
    setPopup(false);
    setTimeout(() => resRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const pctText = (r) => (r.overall.below ? "below 55" : fmtPct(r.overall.main));
  const shareText = slot ? `Wrote CAT 2026 Slot ${slot}? See how others found VARC, DILR and QA, and get your expected percentile from attempts: ${PAGE_URL}` : PAGE_URL;
  const callLink = res ? `/iim-call-predictor?o=${res.lo.overall.main ?? ""}&v=${res.lo.VARC.main ?? ""}&d=${res.lo.DILR.main ?? ""}&q=${res.lo.QA.main ?? ""}${lead.category ? `&cat=${lead.category}` : ""}` : "/iim-call-predictor";

  const firstEnd = new Date(SLOTS[0].ends).getTime();
  const live = now != null && now >= firstEnd;

  const ld = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: "CAT 2026 Exam Analysis and Percentile from Attempts", url: PAGE_URL, applicationCategory: "EducationalApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, provider: { "@type": "Organization", name: "IPM Careers", url: "https://ipmcareer.com" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "CAT 2026 Score Calculator", item: `${SITE}/cat-score-calculator` }, { "@type": "ListItem", position: 2, name: "CAT 2026 Exam Analysis", item: PAGE_URL }] },
  ];

  return (
    <AppShell activePage="/cat-2026-analysis" pageTitle="CAT 2026 Exam Analysis">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </Head>
      <NextSeo
        title="CAT 2026 Exam Analysis: Slot 1, 2, 3 + Expected Percentile"
        description="CAT 2026 (29 Nov) slot-wise analysis from students who just wrote it: VARC, DILR, QA difficulty and attempts. Enter your attempts to see your expected score and percentile. Free."
        canonical={PAGE_URL}
        openGraph={{ url: PAGE_URL, title: "CAT 2026 Exam Analysis: How was your slot?", description: "Slot-wise difficulty and attempts from students, plus your expected percentile from attempts.", siteName: "IPM Careers" }}
        additionalMetaTags={[{ name: "keywords", content: "CAT 2026 analysis, CAT 2026 exam analysis, CAT 2026 slot 1 analysis, CAT 2026 slot 2 analysis, CAT 2026 slot 3 analysis, CAT 2026 paper analysis, CAT 2026 difficulty level, CAT 2026 good attempts, CAT 2026 expected percentile, CAT percentile from attempts" }]}
        robotsProps={{ maxImagePreview: "large" }}
      />
      <div className={s.page}>
        <header className={t.head}>
          <h1 className={t.h1}>CAT 2026 Exam Analysis</h1>
          <p className={t.sub}>Just wrote CAT? Tell us how your slot went. See your expected percentile and how everyone else in your slot found it.</p>
        </header>

        <div className={s.narrow}>
          <div className={`${s.card} ${s.cardGold}`}>
            <div className={a.label}>Your slot</div>
            <div className={s.seg} role="tablist" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              {SLOTS.map((x) => (
                <button key={x.n} type="button" className={`${s.segBtn} ${slot === x.n ? s.segOn : ""}`} onClick={() => setSlot(x.n)}>Slot {x.n}</button>
              ))}
            </div>

            {SECS.map((k) => (
              <div key={k} className={a.row}>
                <div className={a.secHead}>
                  <span className={a.secName}>{k}</span>
                  <span className={a.secMax}>{PATTERN[k].questions} Qs</span>
                </div>
                <div className={a.levels}>
                  {LEVELS.map((l) => (
                    <button key={l} type="button" className={`${a.lvl} ${secs[k].lvl === l ? a.lvlOn : ""}`} onClick={() => set(k, "lvl", secs[k].lvl === l ? "" : l)}>{l}</button>
                  ))}
                </div>
                <div className={a.nums}>
                  <input className={s.input} inputMode="numeric" placeholder="Attempted" aria-label={`${k} attempted`} value={secs[k].att} onChange={(e) => set(k, "att", e.target.value.replace(/\D/g, "").slice(0, 2))} />
                  <input className={s.input} inputMode="numeric" placeholder="Think right" aria-label={`${k} answers you think are right`} value={secs[k].ok} onChange={(e) => set(k, "ok", e.target.value.replace(/\D/g, "").slice(0, 2))} />
                </div>
              </div>
            ))}

            <div className={s.totalLine}>
              <span>Expected score (of 204)</span>
              <b>{filled ? (lowTotal === highTotal ? lowTotal : `${lowTotal} to ${highTotal}`) : "–"}</b>
            </div>
            {error && <div className={s.err} style={{ marginTop: 12 }}>{error}</div>}
            <button type="button" className={`${s.btn} ${s.btnFull}`} style={{ marginTop: 14 }} onClick={start}>See my expected percentile</button>
            <p className={a.fine}>Rating difficulty is optional. It builds the slot analysis below.</p>
          </div>

          {res && (
            <div ref={resRef} className={s.result}>
              <div className={s.resLabel}>Expected overall percentile</div>
              <div className={s.pctBig} style={{ fontSize: "clamp(2rem, 7vw, 2.8rem)" }}>
                {pctText(res.lo) === pctText(res.hi) ? pctText(res.lo) : `${pctText(res.lo)} to ${pctText(res.hi)}`}
              </div>
              <div className={s.pctRange}>Score {res.lo.total === res.hi.total ? res.lo.total : `${res.lo.total} to ${res.hi.total}`} of 204 · low end counts every wrong answer as an MCQ (−1)</div>
              {res.lo.rank && <div className={t.meta}>About rank {res.lo.rank.toLocaleString("en-IN")} of {(APPEARED[2025] / 100000).toFixed(2)} lakh (at the low end)</div>}
              <div className={s.secGrid}>
                {SECS.map((k) => (
                  <div key={k} className={s.secCard}>
                    <div className={s.secSub}>{k} · {nums[k].low === nums[k].high ? nums[k].low : `${nums[k].low}–${nums[k].high}`}</div>
                    <div className={s.secPct}>{res.lo[k].below ? "<1" : fmtPct(res.lo[k].main)}</div>
                    <div className={s.secSub}>percentile (low end)</div>
                  </div>
                ))}
              </div>
              <div className={t.next}>
                <Link className={t.cta} href={callLink}>See which IIMs may call me</Link>
                <a className={t.textLink} href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">Ask your CAT group on WhatsApp</a>
              </div>
              <p className={s.note} style={{ marginTop: 14 }}>An estimate from CAT 2025 and 2024 results, not an official conversion. Check your exact score with the response sheet.</p>
              <div style={{ marginTop: 16, textAlign: "left" }}>
                <CatAlertsInline title="Get your exact score the day the response sheet is out" text="We email you the minute the CAT 2026 response sheet is out (expected first week of December), with a 1-minute score check." />
              </div>
            </div>
          )}

          <SlotBoard stats={stats} live={live} />
        </div>

        <LeadPopup
          open={popup}
          onClose={() => setPopup(false)}
          onSubmit={submit}
          busy={busy}
          error={popupError}
          values={lead}
          onChange={setLead}
          sub="Tell us who you are and we will show your expected percentile right away."
          cta="Show my percentile"
          categories={CATEGORIES}
          categoryLabel="Category (for IIM cutoffs)"
        />

        <article className={s.article}>
          <h2>CAT 2026 slot timings</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Slot</th><th>Time (29 Nov 2026)</th></tr></thead>
              <tbody>{SLOTS.map((x) => <tr key={x.n}><td>Slot {x.n}</td><td>{x.time}</td></tr>)}</tbody>
            </table>
          </div>

          <h2>CAT 2026 exam pattern</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Section</th><th>Questions</th><th>Max marks</th><th>Time</th></tr></thead>
              <tbody>
                {SECS.map((k) => <tr key={k}><td>{PATTERN[k].full}</td><td>{PATTERN[k].questions}</td><td>{PATTERN[k].max}</td><td>40 min</td></tr>)}
                <tr><td><b>Total</b></td><td><b>68</b></td><td><b>204</b></td><td><b>120 min</b></td></tr>
              </tbody>
            </table>
          </div>
          <p>Marking: +3 for a correct answer, −1 for a wrong MCQ, 0 for a wrong TITA answer or a skipped question.</p>

          <h2>What happens after CAT 2026</h2>
          <p>
            The response sheet and provisional answer key usually come out about five days after the exam (4 December last year).
            When yours is out, paste the link into the <Link href="/cat-score-calculator">CAT score calculator</Link> for your exact section-wise score.
            Until then, see <Link href="/cat-response-sheet-2026">CAT response sheet 2026</Link>, <Link href="/cat-percentile-predictor">CAT percentile predictor</Link> and <Link href="/iim-call-predictor">IIM call predictor</Link>.
            Many MBA forms are still open: <Link href="/mba-application-forms">MBA forms and deadlines</Link>.
          </p>

          <h2>Frequently asked questions</h2>
          {FAQS.map((x) => <details key={x.q} className={s.faq}><summary>{x.q}</summary><p>{x.a}</p></details>)}
        </article>
      </div>
    </AppShell>
  );
}

// Live slot-wise picture: shown per slot once at least MIN students of that slot have answered.
const MIN = 5;
function SlotBoard({ stats, live }) {
  const slots = stats?.slots || {};
  const any = Object.values(slots).some((x) => x.n >= MIN);
  return (
    <section className={a.board}>
      <div className={a.boardHead}>
        <h2 className={a.boardTitle}>How each slot felt</h2>
        <span className={a.boardMeta}>{any ? "Live from students who wrote it" : live ? "Filling in as students answer" : "Opens after Slot 1 ends, 10:30 AM on 29 Nov"}</span>
      </div>
      {any ? (
        <div className={a.slotGrid}>
          {[1, 2, 3].map((n) => {
            const x = slots[n];
            if (!x || x.n < MIN) return <div key={n} className={a.slotCard}><div className={a.slotName}>Slot {n}</div><div className={a.slotWait}>Waiting for more answers</div></div>;
            return (
              <div key={n} className={a.slotCard}>
                <div className={a.slotName}>Slot {n} <span>{x.n} students</span></div>
                {SECS.map((k) => (
                  <div key={k} className={a.slotRow}>
                    <span className={a.slotSec}>{k}</span>
                    <span>{x[k]?.level || "–"}</span>
                    <span className={a.slotAtt}>{x[k]?.medianAtt != null ? `~${x[k].medianAtt} attempts` : ""}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <p className={a.boardEmpty}>Each slot&apos;s difficulty and typical attempts appear here once enough students from that slot have answered.</p>
      )}
    </section>
  );
}

function pickUtm(q) {
  const o = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "gclid", "fbclid"].forEach((k) => { if (q[k]) o[k] = String(q[k]).slice(0, 120); });
  return Object.keys(o).length ? o : null;
}
