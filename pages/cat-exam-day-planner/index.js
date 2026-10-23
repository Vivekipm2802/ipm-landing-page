import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import AppShell from "../../components/AppShell";
import s from "../CatPlanner.module.css";
import { sendLeadToCrm } from "../../lib/crm";
import { readAdmitCardPdf } from "../../lib/catAdmitParse";
import { CAT_CITIES } from "../../lib/catCities";
import { SLOTS, STATES, ADMIT_CARD_DATE, EXAM_DATE, PLANNER_PATH, CENTRES_PATH, SITE, matchCity, fmtHHMM, fmtDay, CHECKLIST } from "../../lib/catPlanner";

const PAGE_URL = `${SITE}${PLANNER_PATH}`;
const ADMIT_OUT_AT = new Date(`${ADMIT_CARD_DATE}T10:00:00+05:30`).getTime();
const TRAVEL = [15, 20, 30, 45, 60, 75, 90, 120, 150, 180, 240];

const FAQS = [
  { q: "When will the CAT 2026 admit card be released?", a: "The CAT 2026 admit card download begins on Wednesday, 4 November 2026 on the official website iimcat.ac.in. You log in with the User ID and password you created while registering. It stays available until exam day." },
  { q: "What is the CAT 2026 exam date and slot timing?", a: "CAT 2026 is on Sunday, 29 November 2026, in three slots. Last year the slots ran 8:30 to 10:30 AM, 12:30 to 2:30 PM and 4:30 to 6:30 PM. Your admit card shows your own slot, reporting time and gate closing time, and those are the times that count." },
  { q: "What is the reporting time for CAT, and when does the gate close?", a: "On past CAT admit cards the reporting time was 90 minutes before the exam (7:00 AM for the 8:30 slot) and the gate closed 15 minutes before it started. No one is allowed in after the gate closes, so plan to arrive near the reporting time, not the gate time." },
  { q: "What should I carry to the CAT exam centre?", a: "Carry a printed admit card with your photo pasted on it, one original government photo ID (Aadhaar, PAN, passport, driving licence or voter ID), two simple pens and a transparent water bottle. Leave your phone, watch, wallet and any metal or jewellery outside, because most centres have no locker. Check the instructions on your own admit card in case anything changed this year." },
  { q: "Can I change my CAT test centre after the admit card is out?", a: "No. CAT admit cards state that requests to change the test centre are not entertained, so plan your travel (and a stay, if the centre is in another city) as soon as you download the card." },
  { q: "Is my admit card uploaded to your server?", a: "No. The admit card is read inside your browser on your own phone or laptop. We save only the test-day details: date, slot, reporting and gate times, test city and centre. Your date of birth, application number, category and photo are never sent or stored." },
  { q: "How do the exam day reminders work?", a: "Your plan page adds alarms to your phone calendar in one tap: a packing reminder the night before, a leave-now alarm at your leave-by time and a gate-closes-in-30-minutes alert. If you tick the WhatsApp box, IPM Careers may also message you CAT updates, such as when admit cards are out." },
  { q: "How is the 'leave by' time worked out?", a: "We take the reporting time on your admit card, subtract your travel time and add a 20-minute safety buffer. For morning-slot students in North Indian cities we add 20 more minutes, because late-November mornings there are often foggy or smoggy." },
  { q: "Can I find other students taking CAT at my centre?", a: "Yes, safely. Your plan shows how many students using this planner are at your centre and in your slot (counts only, never names). You can opt in to share a cab: we introduce you on WhatsApp only when someone else in your slot has also opted in." },
];

export default function CatExamDayPlanner() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [mode, setMode] = useState("pdf");
  const [stats, setStats] = useState({ plans: 0, centres: 0 });
  const [drag, setDrag] = useState(false);
  const [reading, setReading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [parseErr, setParseErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({ name: "", phone: "", email: "", city: "", slot: "", centreName: "", centreAddress: "", startArea: "", travelMins: "", waOptIn: true, carpoolOptIn: false, carpoolArea: "" });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e }));

  const [admitOut, setAdmitOut] = useState(true);
  useEffect(() => {
    if (Date.now() < ADMIT_OUT_AT) { setMode("early"); setAdmitOut(false); }
    fetch("/api/cat-planner-stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  const citiesByState = useMemo(() => STATES.map((st) => ({ st, cities: CAT_CITIES.filter((c) => c.state === st) })), []);

  const onFile = async (file) => {
    setParseErr(""); setParsed(null); setError("");
    if (!file) return;
    if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) { setParseErr("Please upload the admit card PDF you downloaded from iimcat.ac.in."); return; }
    if (file.size > 8 * 1024 * 1024) { setParseErr("That file is larger than 8 MB. Upload the admit card PDF from iimcat.ac.in."); return; }
    setReading(true);
    try {
      const p = await readAdmitCardPdf(file);
      if (!p.ok) {
        setParseErr("We could not read the test-day details from this file. Use 'Type it in' and copy them from your card.");
      } else {
        setParsed(p);
        const c = matchCity(p.city);
        setF((x) => ({ ...x, name: x.name || toTitle(p.name), city: c ? c.slug : x.city }));
      }
    } catch (e) {
      setParseErr(e?.message || "Could not open this PDF. Try again, or use 'Type it in'.");
    } finally {
      setReading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async () => {
    setError("");
    if (f.name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[6-9]\d{9}$/.test(f.phone)) return setError("Please enter a valid 10-digit mobile number (without +91 or 0).");
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return setError("Please check your email address.");
    let body = { mode, name: f.name.trim(), phone: f.phone, email: f.email.trim(), waOptIn: f.waOptIn, ref: router.query.ref || "", utm: pickUtm(router.query) };
    if (mode === "pdf") {
      if (!parsed) return setError("Upload your admit card PDF first.");
      body = { ...body, city: parsed.city, slot: parsed.slot, examDate: parsed.examDate, examStart: parsed.examStart, examEnd: parsed.examEnd, reporting: parsed.reporting, gate: parsed.gate, centreName: parsed.centreName, centreAddress: parsed.centreAddress, pincode: parsed.pincode };
    } else if (mode === "manual") {
      if (!f.city) return setError("Please choose your test city.");
      if (!f.slot) return setError("Please choose your slot.");
      if (f.centreName.trim().length < 3) return setError("Please enter your test centre name as printed on the admit card.");
      const c = CAT_CITIES.find((x) => x.slug === f.city);
      body = { ...body, city: c?.name, slot: Number(f.slot), centreName: f.centreName.trim(), centreAddress: f.centreAddress.trim() };
    } else {
      if (!f.city) return setError("Please choose your test city.");
      body = { ...body, city: CAT_CITIES.find((x) => x.slug === f.city)?.name };
    }
    if (mode !== "early") {
      body.startArea = f.startArea.trim();
      if (f.travelMins) body.travelMins = Number(f.travelMins);
      body.carpoolOptIn = f.carpoolOptIn;
      if (f.carpoolOptIn) body.carpoolArea = f.carpoolArea.trim() || f.startArea.trim();
    }
    setBusy(true);
    sendLeadToCrm({ name: body.name, phone: body.phone, email: body.email, city: body.city }, "register-cat-exam-day-planner");
    try {
      const r = await fetch("/api/cat-planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok || !d.uid) throw new Error(d.error || "Could not save your plan.");
      if (d.centre) {
        try { fetch("/api/cat-centre-enrich", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify(d.centre) }); } catch {}
      }
      router.push(`${PLANNER_PATH}/${d.uid}`);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "CAT 2026 Exam Day Planner",
      url: PAGE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      description: "Upload your CAT 2026 admit card and get your leave-by time, route and cab links to your test centre, calendar alarms and a checklist.",
      provider: { "@type": "Organization", name: "IPM Careers", url: "https://ipmcareer.com" },
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "CAT 2026 Score Calculator", item: `${SITE}/cat-score-calculator` },
        { "@type": "ListItem", position: 2, name: "CAT Exam Day Planner", item: PAGE_URL },
      ],
    },
  ];

  return (
    <AppShell activePage={PLANNER_PATH} pageTitle="CAT Exam Day Planner">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </Head>
      <NextSeo
        title="CAT 2026 Exam Day Planner: Admit Card, Reporting Time & Route to Your Centre"
        description="Upload your CAT 2026 admit card (out 4 Nov) and get your leave-by time, Google Maps and cab links to your test centre, calendar alarms and a what-to-carry checklist. Free."
        canonical={PAGE_URL}
        openGraph={{ url: PAGE_URL, title: "CAT 2026 Exam Day Planner | Free tool by IPM Careers", description: "Your whole CAT exam day, sorted from your admit card: leave-by time, route, cab, alarms, checklist and reminders.", siteName: "IPM Careers" }}
        twitter={{ cardType: "summary_large_image" }}
        additionalMetaTags={[
          { name: "keywords", content: "CAT 2026 admit card, CAT admit card 2026 download, CAT exam day guidelines, CAT reporting time, CAT 2026 slot timings, CAT gate closing time, what to carry for CAT exam, CAT exam centre route, CAT exam day planner, CAT 2026 exam date" },
          { name: "robots", content: "index, follow, max-image-preview:large" },
        ]}
      />

      <div className={s.page}>
        <section className={s.hero}>
          <span className={s.eyebrow}><span className={s.pulse} /> Admit card out {fmtShort(ADMIT_CARD_DATE)} · CAT on {fmtShort(EXAM_DATE)}</span>
          <h1 className={s.title}>CAT 2026 Exam Day Planner. <span className={s.accent}>Upload your admit card, and your whole exam day is sorted.</span></h1>
          <p className={s.sub}>Your leave-by time, one-tap route and cab to your centre, calendar alarms, a what-to-carry checklist, and phone alarms for the night before and exam morning.</p>
          <div className={s.stats}>
            {stats.plans > 0 && <div className={s.stat}><div className={s.statNum}>{stats.plans.toLocaleString("en-IN")}</div><div className={s.statLabel}>plans made</div></div>}
            <div className={s.stat}><div className={s.statNum}>162</div><div className={s.statLabel}>test cities covered</div></div>
            <div className={s.stat}><div className={s.statNum}>Free</div><div className={s.statLabel}>no login needed</div></div>
          </div>
        </section>

        <div className={s.narrow} id="start">
          <div className={`${s.card} ${s.cardGold}`}>
            <div className={s.seg} role="tablist">
              {[["pdf", "📄 Upload card"], ["manual", "✍️ Type it in"], ["early", "⏳ Card not out yet"]].map(([k, l]) => (
                <button key={k} type="button" role="tab" aria-selected={mode === k} className={`${s.segBtn} ${mode === k ? s.segOn : ""}`} onClick={() => { setMode(k); setError(""); }}>{l}</button>
              ))}
            </div>

            {mode === "pdf" && (
              <>
                {!admitOut && <p className={s.note} style={{ marginTop: -4, marginBottom: 10 }}>CAT 2026 admit cards come out on 4 November. Until then, pick “Card not out yet” and we will remind you.</p>}
                <label className={`${s.drop} ${drag ? s.dropActive : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer?.files?.[0]); }}>
                  <input ref={fileRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => onFile(e.target.files?.[0])} />
                  <div className={s.dropIcon}>{reading ? "⏳" : parsed ? "✅" : "📄"}</div>
                  <div className={s.dropTitle}>{reading ? "Reading your admit card…" : parsed ? "Admit card read. Upload another?" : "Tap to upload your CAT admit card (PDF)"}</div>
                  <div className={s.dropHint}>Download it from iimcat.ac.in after logging in</div>
                </label>
                <div className={s.privacy}><span>🔒</span><span>Read on your device. Only test-day details are saved: never your date of birth, application number, category or photo.</span></div>
                {parseErr && <div className={s.err} style={{ marginTop: 10 }}>{parseErr} <button type="button" className={s.link} onClick={() => setMode("manual")}>Type it in</button></div>}
                {parsed && (
                  <div style={{ marginTop: 14 }}>
                    <span className={s.okBadge}>✓ Found on your card</span>
                    <div className={s.kv}>
                      <span className={s.kvK}>Exam</span><span className={s.kvV}>{fmtDay(parsed.examDate)}, {fmtHHMM(parsed.examStart)} to {fmtHHMM(parsed.examEnd)} (Slot {parsed.slot})</span>
                      <span className={s.kvK}>Reporting</span><span className={s.kvV}>{fmtHHMM(parsed.reporting) || "not found"}</span>
                      <span className={s.kvK}>Gate closes</span><span className={s.kvV}>{fmtHHMM(parsed.gate) || "not found"}</span>
                      <span className={s.kvK}>Test city</span><span className={s.kvV}>{parsed.city}</span>
                      <span className={s.kvK}>Centre</span><span className={s.kvV}>{parsed.centreName}<br /><span style={{ fontWeight: 400, color: "#9a958c" }}>{parsed.centreAddress}</span></span>
                    </div>
                    {parsed.examDate && !parsed.examDate.startsWith("2026") && <p className={s.note}>This looks like a card from an earlier year. The plan will use it as given; upload your CAT 2026 card once it is out.</p>}
                  </div>
                )}
              </>
            )}

            {mode === "manual" && (
              <div className={s.form}>
                <div className={s.row2}>
                  <CitySelect value={f.city} onChange={set("city")} groups={citiesByState} />
                  <div className={s.field}>
                    <span className={s.label}>Slot</span>
                    <select className={s.select} value={f.slot} onChange={set("slot")}>
                      <option value="">Choose your slot</option>
                      {Object.entries(SLOTS).map(([k, v]) => <option key={k} value={k}>{v.label}: {fmtHHMM(v.start)} to {fmtHHMM(v.end)}</option>)}
                    </select>
                  </div>
                </div>
                <label className={s.field}><span className={s.label}>Test centre name (as on your admit card)</span><input className={s.input} value={f.centreName} onChange={set("centreName")} placeholder="e.g. iON Digital Zone iDZ 2 …" /></label>
                <label className={s.field}><span className={s.label}>Centre address <span className={s.opt}>(helps with the route)</span></span><input className={s.input} value={f.centreAddress} onChange={set("centreAddress")} placeholder="Street, area, city, pincode" /></label>
                <p className={s.note}>Times use CAT’s usual slot timings. Your admit card has the exact reporting and gate times, so uploading it gives a more accurate plan.</p>
              </div>
            )}

            {mode === "early" && (
              <div className={s.form}>
                <p className={s.note} style={{ margin: 0 }}>Admit cards come out on <b style={{ color: "#f4f1ea" }}>4 November 2026</b>. Tell us your test city now and your plan link will be ready. Come back on 4 November and upload the card to complete it.</p>
                <CitySelect value={f.city} onChange={set("city")} groups={citiesByState} label="Your CAT test city (as chosen in the CAT form)" />
              </div>
            )}

            <div className={s.form} style={{ marginTop: 14 }}>
              <div className={s.row2}>
                <label className={s.field}><span className={s.label}>Your name</span><input className={s.input} value={f.name} onChange={set("name")} autoComplete="name" /></label>
                <label className={s.field}><span className={s.label}>WhatsApp number</span><input className={s.input} value={f.phone} onChange={(e) => setF((x) => ({ ...x, phone: e.target.value.replace(/\D/g, "").slice(-10) }))} inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile" /></label>
              </div>
              <label className={s.field}><span className={s.label}>Email <span className={s.opt}>(optional)</span></span><input className={s.input} value={f.email} onChange={set("email")} type="email" autoComplete="email" /></label>

              {mode !== "early" && (
                <>
                  <div className={s.row2}>
                    <label className={s.field}><span className={s.label}>Leaving from <span className={s.opt}>(area or landmark)</span></span><input className={s.input} value={f.startArea} onChange={set("startArea")} placeholder="e.g. Kakadeo, Kanpur" /></label>
                    <div className={s.field}>
                      <span className={s.label}>Travel time to the centre</span>
                      <select className={s.select} value={f.travelMins} onChange={set("travelMins")}>
                        <option value="">Not sure yet</option>
                        {TRAVEL.map((m) => <option key={m} value={m}>{m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}`}</option>)}
                      </select>
                    </div>
                  </div>
                  <label className={s.check}><input type="checkbox" checked={f.carpoolOptIn} onChange={set("carpoolOptIn")} /><span>I’m open to sharing a cab with another student in my slot at my centre. <span className={s.opt}>We introduce you on WhatsApp only if they opted in too. Names are never shown publicly.</span></span></label>
                </>
              )}
              <label className={s.check}><input type="checkbox" checked={f.waOptIn} onChange={set("waOptIn")} /><span>Send me CAT updates on WhatsApp from IPM Careers{mode === "early" ? ", including when admit cards are out" : ""}.</span></label>

              {error && <div className={s.err}>{error}</div>}
              <button type="button" className={`${s.btn} ${s.btnFull}`} onClick={submit} disabled={busy || reading}>
                {busy ? "Saving…" : mode === "early" ? "Remind me when admit cards are out →" : "Build my exam day plan →"}
              </button>
              <p className={s.note} style={{ textAlign: "center", margin: 0 }}>Free. By continuing you agree to be contacted by IPM Careers about CAT and MBA admissions.</p>
            </div>
          </div>

          <div className={s.steps}>
            {[["1", "Upload the admit card PDF. It is read on your phone, not uploaded."], ["2", "Add your WhatsApp number and how long the trip takes."], ["3", "Get your plan: leave-by time, route, cab, alarms, checklist and reminders."]].map(([n, t]) => (
              <div key={n} className={s.step}><span className={s.stepNum}>{n}</span><div className={s.stepText}>{t}</div></div>
            ))}
          </div>
        </div>

        <article className={s.article}>
          <h2>CAT 2026 exam day: the timings that matter</h2>
          <p>CAT 2026 is on <b>Sunday, 29 November 2026</b> in three slots across 162 test cities. Admit cards can be downloaded from <b>4 November 2026</b> on iimcat.ac.in. Below are the timings from last year’s pattern; your admit card shows the exact reporting and gate-closing time for your slot, and the planner uses those.</p>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Slot</th><th>Exam</th><th>Reporting</th><th>Gate closes</th></tr></thead>
              <tbody>{Object.entries(SLOTS).map(([k, v]) => <tr key={k}><td>{v.label}</td><td>{fmtHHMM(v.start)} to {fmtHHMM(v.end)}</td><td>{fmtHHMM(v.reporting)}</td><td>{fmtHHMM(v.gate)}</td></tr>)}</tbody>
            </table>
          </div>

          <h2>What to carry to the CAT exam centre</h2>
          <ul>{CHECKLIST.map((c) => <li key={c.id}>{c.text}</li>)}</ul>

          <h2>How to download the CAT 2026 admit card</h2>
          <ol>
            <li>Go to iimcat.ac.in and open the registered candidate login.</li>
            <li>Log in with the User ID and password you set while registering for CAT 2026.</li>
            <li>Download the admit card PDF and check your name, photo, slot, test city and centre.</li>
            <li>Print every page on A4 paper and paste the same photo you uploaded in the CAT form.</li>
            <li>Upload the PDF here to get your exam day plan.</li>
          </ol>

          <h2>Find your CAT test centre</h2>
          <p>Every centre students add here gets its own page with the address, map, nearest railway and metro stations, parking, and reviews from students who took an exam there. <Link href={CENTRES_PATH}>Browse CAT 2026 exam centres by city →</Link></p>

          <h2>CAT exam day: frequently asked questions</h2>
          {FAQS.map((x) => <details key={x.q} className={s.faq}><summary>{x.q}</summary><p>{x.a}</p></details>)}
        </article>

        <div className={s.disclaimer}>
          ⚠️ This planner is a helper, not an official source. Always go by the reporting time, gate time, centre address and instructions printed on your own CAT 2026 admit card and on iimcat.ac.in. Travel times are your estimate; leave earlier if in doubt.
        </div>
      </div>
    </AppShell>
  );
}

function CitySelect({ value, onChange, groups, label = "Test city" }) {
  return (
    <div className={s.field}>
      <span className={s.label}>{label}</span>
      <select className={s.select} value={value} onChange={onChange}>
        <option value="">Choose your city</option>
        {groups.map((g) => (
          <optgroup key={g.st} label={g.st}>{g.cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</optgroup>
        ))}
      </select>
    </div>
  );
}

function fmtShort(date) {
  const d = new Date(`${date}T12:00:00+05:30`);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(d);
}
function toTitle(n) {
  return String(n || "").toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()).trim();
}
function pickUtm(q) {
  const o = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "gclid", "fbclid"].forEach((k) => { if (q[k]) o[k] = String(q[k]).slice(0, 120); });
  return Object.keys(o).length ? o : null;
}
