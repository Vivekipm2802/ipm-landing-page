import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import AppShell from "../components/AppShell";
import s from "./CatPlanner.module.css";
import { sendLeadToCrm } from "../lib/crm";
import { IIMS, CATEGORIES, STATUS, evaluate } from "../lib/iimCallData";

const SITE = "https://register.ipmcareer.com";
const PAGE_URL = `${SITE}/iim-call-predictor`;
const TONE = { good: s.toneGood, warn: s.toneWarn, bad: s.toneBad, info: s.toneInfo };
const num = (v) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));

const FAQS = [
  { q: "What is the minimum CAT percentile for IIM Ahmedabad?", a: "For the 2027-29 batch, IIM Ahmedabad's admission policy sets a minimum of 95 percentile overall and 85 in each section for General and EWS candidates, 90 and 80 for NC-OBC, 85 and 75 for SC, and 75 and 65 for ST. Clearing these makes you eligible to be considered; calls are then decided by a composite score that adds your 10th, 12th, graduation marks, work experience and gender diversity." },
  { q: "Does clearing the minimum cutoff mean I will get an IIM call?", a: "No. The minimum percentile only makes you eligible. Most IIMs then rank eligible candidates on a composite score of CAT plus academics, work experience and diversity, and call only the top few thousand. For example, IIM Indore shortlisted 1,817 of 147,066 General-category applicants last year." },
  { q: "Which IIMs give the most weight to academics?", a: "IIM Indore gives 25% to 12th marks and 10% to 10th at the shortlist stage, IIM Kozhikode 20% to 12th and 15% to 10th, and IIM Calcutta 15% to 12th and 10% to 10th. IIM Mumbai and the JAP and CAP IIMs shortlist on CAT alone." },
  { q: "Which IIMs shortlist only on CAT percentile?", a: "IIM Mumbai shortlists on CAT score and sectional cutoffs only. IIM Trichy, Ranchi, Raipur and Kashipur shortlist through the Joint Admission Process (JAP) by CAT percentile within category, and IIM Bodh Gaya, Jammu and Sirmaur through the Common Admission Process (CAP) by CAT percentile and intake." },
  { q: "What were the JAP IIM call cutoffs last year?", a: "For the 2026-28 batch, IIM Trichy and IIM Ranchi published the PI shortlist cutoffs: 95.25 overall for General, 89 for EWS, 88.5 for NC-OBC, 75 for SC, 44 for ST and 30 for PwD, with sectional minimums of 75, 60, 60, 45, 25 and 25." },
  { q: "Are these the CAT 2026 cutoffs?", a: "IIM Ahmedabad, Bangalore and Calcutta have published their 2027-29 policies, which are used here. The other IIMs have not yet, so their 2026-28 (CAT 2025) policies are shown and marked; they usually change only a little. Each card links to the official source." },
];

export default function IimCallPredictor() {
  const router = useRouter();
  const resRef = useRef(null);
  const [noCat, setNoCat] = useState(false);
  const [f, setF] = useState({ o: "", v: "", d: "", q: "", category: "GEN", gender: "male", x: "", xii: "", ug: "", degree: "", workex: "", name: "", phone: "", email: "" });
  const [shown, setShown] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    setF((x) => ({ ...x, o: q.o || x.o, v: q.v || x.v, d: q.d || x.d, q: q.q || x.q, category: CATEGORIES.some((c) => c.key === q.cat) ? q.cat : x.category }));
  }, [router.isReady, router.query]);

  const profile = useMemo(() => shown && ({
    category: shown.category, gender: shown.gender,
    o: shown.noCat ? null : num(shown.o), v: shown.noCat ? null : num(shown.v), d: shown.noCat ? null : num(shown.d), q: shown.noCat ? null : num(shown.q),
    x: num(shown.x), xii: num(shown.xii), ug: num(shown.ug), workex: num(shown.workex) || 0,
  }), [shown]);
  const results = useMemo(() => (profile ? IIMS.map((i) => evaluate(i, profile)).sort((a, b) => STATUS[a.status].rank - STATUS[b.status].rank || (b.margin || 0) - (a.margin || 0)) : []), [profile]);
  const clears = results.filter((r) => ["aboveCall", "comfortable", "clears", "belowCall"].includes(r.status));
  const list = results.filter((r) => filter === "all" || (filter === "clears" ? clears.includes(r) : !clears.includes(r)));

  const validate = () => {
    if (!noCat) {
      const vals = ["o", "v", "d", "q"].map((k) => num(f[k]));
      if (vals.some((v) => v == null)) return "Enter your overall and sectional CAT percentiles, or tick “I haven’t taken CAT yet”.";
      if (vals.some((v) => v < 0 || v > 100)) return "Percentiles must be between 0 and 100.";
    }
    for (const [k, l] of [["x", "10th"], ["xii", "12th"], ["ug", "graduation"]]) {
      const v = num(f[k]);
      if (v == null || v < 30 || v > 100) return `Enter your ${l} percentage (convert CGPA to % as your board or university does).`;
    }
    const w = num(f.workex);
    if (f.workex !== "" && (w == null || w < 0 || w > 240)) return "Work experience should be in months.";
    if (f.name.trim().length < 2) return "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(f.phone)) return "Please enter a valid 10-digit mobile number (without +91 or 0).";
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return "Please check your email address.";
    return "";
  };

  const run = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setError("");
    setBusy(true);
    const snap = { ...f, noCat };
    setShown(snap);
    sendLeadToCrm({ name: f.name.trim(), phone: f.phone, email: f.email.trim() }, "register-iim-call-predictor");
    const p = { category: f.category, gender: f.gender, o: noCat ? null : num(f.o), v: noCat ? null : num(f.v), d: noCat ? null : num(f.d), q: noCat ? null : num(f.q), x: num(f.x), xii: num(f.xii), ug: num(f.ug), workex: num(f.workex) || 0 };
    const out = IIMS.map((i) => evaluate(i, p));
    try {
      await fetch("/api/cat-predictor-lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "call", name: f.name, phone: f.phone, email: f.email, category: f.category, inputs: { ...p, degree: f.degree, noCat }, outputs: { clears: out.filter((r) => !["below", "acad", "target"].includes(r.status)).map((r) => r.iim.id) }, utm: pickUtm(router.query) }),
      });
    } catch {}
    setBusy(false);
    setTimeout(() => resRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const ld = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: "IIM Call Predictor 2026", url: PAGE_URL, applicationCategory: "EducationalApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, provider: { "@type": "Organization", name: "IPM Careers", url: "https://ipmcareer.com" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "CAT Percentile Predictor", item: `${SITE}/cat-percentile-predictor` }, { "@type": "ListItem", position: 2, name: "IIM Call Predictor", item: PAGE_URL }] },
  ];
  const wa = shown && !shown.noCat ? `I clear the minimum CAT cutoff at ${clears.length} of ${IIMS.length} IIMs. Check yours free: ${PAGE_URL}` : `Check the CAT percentile you need for every IIM: ${PAGE_URL}`;

  return (
    <AppShell activePage="/iim-call-predictor" pageTitle="IIM Call Predictor">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </Head>
      <NextSeo
        title="IIM Call Predictor 2026: CAT Cutoffs & Shortlisting Criteria for 22 IIMs"
        description="Free IIM call predictor: enter your CAT percentile, 10th, 12th, graduation and work-ex to see which of 22 IIMs' official minimum cutoffs you clear, last year's JAP call cutoffs and how each IIM scores your profile."
        canonical={PAGE_URL}
        openGraph={{ url: PAGE_URL, title: "IIM Call Predictor 2026 | IPM Careers", description: "Official CAT cutoffs and shortlisting criteria for 22 IIMs, checked against your profile.", siteName: "IPM Careers" }}
        additionalMetaTags={[
          { name: "keywords", content: "IIM call predictor, IIM call predictor 2026, CAT cutoff for IIM, IIM cutoff 2026, IIM shortlisting criteria, CAT percentile required for IIM, IIM Ahmedabad cutoff, IIM Bangalore cutoff, IIM Calcutta cutoff, IIM composite score calculator, JAP cutoff, CAP cutoff" },
          { name: "robots", content: "index, follow, max-image-preview:large" },
        ]}
      />
      <div className={s.page}>
        <section className={s.hero}>
          <span className={s.eyebrow}><span className={s.pulse} /> Official criteria from 22 IIMs</span>
          <h1 className={s.title}>IIM Call Predictor. <span className={s.accent}>See which IIMs your CAT percentile and profile clear.</span></h1>
          <p className={s.sub}>Checked against each IIM’s own admission policy: minimum cutoffs for your category, academic minimums, last year’s published call cutoffs, and how your profile scores.</p>
          <div className={s.stats}>
            <div className={s.stat}><div className={s.statNum}>{IIMS.length}</div><div className={s.statLabel}>IIMs covered</div></div>
            <div className={s.stat}><div className={s.statNum}>{IIMS.filter((i) => i.status === "official").length}</div><div className={s.statLabel}>from official policies</div></div>
            <div className={s.stat}><div className={s.statNum}>Free</div><div className={s.statLabel}>no login</div></div>
          </div>
        </section>

        <div className={s.narrow}>
          <div className={`${s.card} ${s.cardGold}`}>
            <h2 className={s.cardTitle}>Your CAT percentile</h2>
            <label className={s.check} style={{ margin: "6px 0 10px" }}><input type="checkbox" checked={noCat} onChange={(e) => setNoCat(e.target.checked)} /><span>I haven’t taken CAT yet: show me the percentile each IIM needs.</span></label>
            {!noCat && (
              <>
                <div className={s.inputs3} style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
                  {[["o", "Overall"], ["v", "VARC"], ["d", "DILR"], ["q", "QA"]].map(([k, l]) => (
                    <label key={k} className={s.field}><span className={s.label}>{l}</span><input className={s.input} inputMode="decimal" value={f[k]} onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value.replace(/[^\d.]/g, "") }))} placeholder="%ile" /></label>
                  ))}
                </div>
                <p className={s.note} style={{ marginTop: 6 }}>Only have marks? <Link href="/cat-percentile-predictor" className={s.link}>Predict your percentile first</Link>.</p>
              </>
            )}

            <h2 className={s.cardTitle} style={{ marginTop: 16 }}>Your profile</h2>
            <div className={s.form} style={{ marginTop: 8 }}>
              <div className={s.row2}>
                <div className={s.field}><span className={s.label}>Category</span><select className={s.select} value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
                <div className={s.field}><span className={s.label}>Gender</span><select className={s.select} value={f.gender} onChange={set("gender")}><option value="male">Male</option><option value="female">Female</option><option value="transgender">Transgender</option></select></div>
              </div>
              <div className={s.inputs3}>
                {[["x", "10th %"], ["xii", "12th %"], ["ug", "Graduation %"]].map(([k, l]) => (
                  <label key={k} className={s.field}><span className={s.label}>{l}</span><input className={s.input} inputMode="decimal" value={f[k]} onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value.replace(/[^\d.]/g, "") }))} /></label>
                ))}
              </div>
              <div className={s.row2}>
                <div className={s.field}><span className={s.label}>Graduation stream</span><select className={s.select} value={f.degree} onChange={set("degree")}><option value="">Choose</option><option value="engg">Engineering</option><option value="commerce">Commerce / Economics / BBA</option><option value="science">Science</option><option value="arts">Arts / Humanities / Law</option><option value="ca">CA / CS / CMA</option><option value="other">Other</option></select></div>
                <label className={s.field}><span className={s.label}>Full-time work-ex (months)</span><input className={s.input} inputMode="numeric" value={f.workex} onChange={(e) => setF((x) => ({ ...x, workex: e.target.value.replace(/\D/g, "") }))} placeholder="0 if fresher" /></label>
              </div>
              <div className={s.gate} style={{ marginTop: 4 }}>
                <div className={s.row2}>
                  <label className={s.field}><span className={s.label}>Your name</span><input className={s.input} value={f.name} onChange={set("name")} autoComplete="name" /></label>
                  <label className={s.field}><span className={s.label}>WhatsApp number</span><input className={s.input} value={f.phone} onChange={(e) => setF((x) => ({ ...x, phone: e.target.value.replace(/\D/g, "").slice(-10) }))} inputMode="numeric" placeholder="10-digit mobile" /></label>
                </div>
                <label className={s.field} style={{ marginTop: 10 }}><span className={s.label}>Email <span className={s.opt}>(optional)</span></span><input className={s.input} value={f.email} onChange={set("email")} type="email" /></label>
              </div>
              {error && <div className={s.err}>{error}</div>}
              <button type="button" className={`${s.btn} ${s.btnFull}`} onClick={run} disabled={busy}>{busy ? "Checking 22 IIMs…" : noCat ? "Show what each IIM needs →" : "Check my IIM calls →"}</button>
              <p className={s.note} style={{ textAlign: "center", margin: 0 }}>Free. By continuing you agree to be contacted by IPM Careers about CAT and MBA admissions.</p>
            </div>
          </div>

          {shown && (
            <div ref={resRef} style={{ scrollMarginTop: 90 }}>
              <div className={s.result}>
                <div className={s.resLabel}>{shown.noCat ? "Your targets" : "Your result"}</div>
                <div className={s.pctBig}>{shown.noCat ? IIMS.length : `${clears.length}/${IIMS.length}`}</div>
                <div className={s.pctRange}>{shown.noCat ? `IIMs, with the minimum percentile each needs from a ${CATEGORIES.find((c) => c.key === shown.category)?.label} ${shown.gender === "male" ? "male" : "female/transgender"} candidate` : "IIMs whose official minimum cutoffs you clear"}</div>
                {!shown.noCat && (
                  <div className={s.summaryGrid}>
                    <div className={s.secCard}><div className={s.secPct}>{results.filter((r) => r.status === "aboveCall").length}</div><div className={s.secSub}>above last year’s JAP call cutoff</div></div>
                    <div className={s.secCard}><div className={s.secPct}>{results.filter((r) => r.status === "comfortable").length}</div><div className={s.secSub}>clear the minimum by 5+ points</div></div>
                    <div className={s.secCard}><div className={s.secPct}>{results.filter((r) => r.status === "below" || r.status === "acad").length}</div><div className={s.secSub}>below a minimum</div></div>
                  </div>
                )}
                <p className={s.note} style={{ marginTop: 12 }}>Clearing a minimum makes you eligible, not shortlisted. Most IIMs then rank eligible candidates on a composite of CAT, academics, work-ex and diversity.</p>
              </div>

              {!shown.noCat && (
                <div className={s.filterRow}>
                  {[["all", `All ${results.length}`], ["clears", `Clears minimum (${clears.length})`], ["below", `Below (${results.length - clears.length})`]].map(([k, l]) => (
                    <button key={k} type="button" className={`${s.choiceBtn} ${filter === k ? s.choiceOn : ""}`} onClick={() => setFilter(k)}>{l}</button>
                  ))}
                </div>
              )}

              <div className={s.iimList}>
                {list.map((r) => <IimCard key={r.iim.id} r={r} p={profile} />)}
              </div>

              <div className={s.actions} style={{ marginTop: 16 }}>
                <a className={s.action} href={`https://wa.me/?text=${encodeURIComponent(wa)}`} target="_blank" rel="noopener noreferrer"><span className={s.actionIcon}>💬</span><span className={s.actionTitle}>Share on WhatsApp</span><span className={s.actionSub}>With your CAT group</span></a>
                <Link className={s.action} href="/mba-application-forms"><span className={s.actionIcon}>🗓️</span><span className={s.actionTitle}>MBA forms & deadlines</span><span className={s.actionSub}>Non-IIM forms to fill</span></Link>
                <Link className={s.action} href="/cat-exam-day-planner"><span className={s.actionIcon}>🧭</span><span className={s.actionTitle}>Exam day planner</span><span className={s.actionSub}>Route, alarms, checklist</span></Link>
              </div>
            </div>
          )}
        </div>

        <article className={s.article}>
          <h2>Minimum CAT percentile for each IIM (General category)</h2>
          <p>From each IIM’s official admission policy. These make you eligible to be considered; calls usually go well above them.</p>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>IIM</th><th>Overall</th><th>VARC</th><th>DILR</th><th>QA</th><th>Policy</th></tr></thead>
              <tbody>
                {IIMS.map((i) => { const g = i.min.GEN; return (
                  <tr key={i.id}><td>{i.name}{i.status === "reported" ? " *" : ""}</td><td>{g.o ?? "–"}</td><td>{g.v ?? "–"}</td><td>{g.d ?? "–"}</td><td>{g.q ?? "–"}</td><td>{i.policy}</td></tr>
                ); })}
              </tbody>
            </table>
          </div>
          <p className={s.note}>* IIM Rohtak: as reported by Careers360; the official policy PDF could not be read. CAP IIMs (Bodh Gaya, Jammu, Sirmaur) have lower overall minimums for women and transgender candidates. Shillong has sectional minimums only, Sambalpur and Rohtak overall only.</p>

          <h2>How IIMs shortlist after CAT</h2>
          <p>Every IIM first applies a minimum overall and sectional percentile for your category. Then most of them rank the eligible candidates on a composite score. IIM Ahmedabad uses 65% CAT and 35% academic rating, IIM Bangalore 55% CAT with the rest for 10th, 12th, graduation, work-ex and gender, IIM Calcutta 56 points of CAT, 15 for 12th, 10 for 10th and 4 for gender, and IIM Indore puts 25% on 12th marks. IIM Mumbai, the JAP IIMs (Trichy, Ranchi, Raipur, Kashipur) and the CAP IIMs (Bodh Gaya, Jammu, Sirmaur) shortlist on CAT alone.</p>

          <h2>Frequently asked questions</h2>
          {FAQS.map((x) => <details key={x.q} className={s.faq}><summary>{x.q}</summary><p>{x.a}</p></details>)}
        </article>
        <div className={s.disclaimer}>⚠️ Built from each IIM’s published admission policy (2027-29 where released, otherwise 2026-28). IIMs can change cutoffs and weights for CAT 2026; always check the official policy linked on each card. This tool does not guarantee a call.</div>
      </div>
    </AppShell>
  );
}

function IimCard({ r, p }) {
  const st = STATUS[r.status];
  const { iim, min, call, profile } = r;
  const chip = (k, label) => {
    if (min[k] == null) return null;
    const val = p && p[k] != null ? p[k] : null;
    const miss = val != null && val < min[k];
    return <span key={k} className={`${s.minChip} ${miss ? s.minMiss : ""}`}>{label} <b>{min[k]}</b>{val != null ? ` · you ${val}` : ""}</span>;
  };
  return (
    <div className={s.iim}>
      <div className={s.iimTop}>
        <div>
          <div className={s.iimName}>{iim.name}</div>
          <div className={s.iimMeta}>{iim.process ? `${iim.process} · ` : ""}{iim.policy} policy · {iim.status === "official" ? "official" : "reported, not verified"}</div>
        </div>
        <span className={`${s.tone} ${TONE[st.tone]}`}>{st.label}</span>
      </div>
      <div className={s.minRow}>{chip("o", "Overall")}{chip("v", "VARC")}{chip("d", "DILR")}{chip("q", "QA")}</div>
      {r.acadFails?.length > 0 && <div className={s.warn}>Academic minimum: {r.acadFails.join(", ")}.</div>}
      {call && <p className={s.note} style={{ marginTop: 8 }}>Last year’s published call cutoff for your category: <b style={{ color: "#f4f1ea" }}>{call.o}</b> overall{call.v ? `, ${call.v} in each section` : ""}.</p>}
      {profile && (
        <p className={s.note} style={{ marginTop: 8 }}>
          {profile.label}: <b style={{ color: "#ffbe5c" }}>{profile.total}/{profile.max}</b> ({profile.parts.map(([l, v, mx]) => `${l} ${v}/${mx}`).join(", ")})
        </p>
      )}
      {iim.fact && <p className={s.note} style={{ marginTop: 6 }}>{iim.fact}</p>}
      <details className={s.iimMore}>
        <summary>How {iim.name} shortlists</summary>
        <div className={s.weights}>
          {iim.shortlist.map(([l, w]) => (
            <div key={l} className={s.wRow}><span>{l}</span>{w != null ? <><div className={s.wBar}><div className={s.wFill} style={{ width: `${w}%` }} /></div><span>{w}</span></> : <><span className={s.opt}>weights not published</span><span /></>}</div>
          ))}
        </div>
        {iim.note && <p className={s.note} style={{ marginTop: 8 }}>{iim.note}</p>}
        <p className={s.note} style={{ marginTop: 6 }}>Source: {iim.urls.map((u, i) => <span key={u}>{i ? ", " : ""}<a className={s.link} href={u} target="_blank" rel="noopener noreferrer">{new URL(u).hostname.replace(/^www\./, "")}</a></span>)}</p>
      </details>
    </div>
  );
}

function pickUtm(q) {
  const o = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "gclid", "fbclid"].forEach((k) => { if (q[k]) o[k] = String(q[k]).slice(0, 120); });
  return Object.keys(o).length ? o : null;
}
