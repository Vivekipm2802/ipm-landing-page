import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { NextSeo } from "next-seo";
import AppShell from "../components/AppShell";
import s from "./MbaForms.module.css";
import { MBA_FORMS, TYPES, CHECKED_ON, computeStatus, fmtDate } from "../lib/mbaForms";
import { sendLeadToCrm } from "../lib/crm";

const ALERT_KEY = "mba-alerts-v1";

const PAGE_URL = "https://register.ipmcareer.com/mba-application-forms";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open now" },
  { key: "closing", label: "Closing in 14 days" },
  { key: "soon", label: "Opening soon" },
  { key: "viacat", label: "Via CAT form" },
  { key: "closed", label: "Closed" },
];
const ORDER = { closing: 0, open: 1, soon: 2, viacat: 3, closed: 4 };
const DOT = { open: s.dotOpen, closing: s.dotClosing, soon: s.dotSoon, viacat: s.dotViacat, closed: s.dotClosed };
const BADGE = { open: s.bOpen, closing: s.bClosing, soon: s.bSoon, viacat: s.bViacat, closed: s.bClosed };
const TYPE_LABEL = { exam: "Entrance exam", iim: "IIM", iit: "IIT", bschool: "B-school", symbiosis: "Symbiosis · SNAP" };

const FAQS_STATIC = [
  {
    q: "Do I need a separate application for IIMs after CAT?",
    a: "Not for most IIMs: IIM Ahmedabad, Bangalore, Calcutta and most others are selected inside the CAT 2026 form, which closed on 22 September 2026. A few ask for an extra step after the CAT result, such as IIM Mumbai (separate application), IIM Rohtak (paid registration) and IIM Udaipur (registration by email invite).",
  },
  {
    q: "Which top B-schools need a form separate from CAT?",
    a: "FMS Delhi, SPJIMR, MDI Gurgaon, IIFT, the IITs (SJMSOM, DMS, DoMS), IMT, IMI, FORE, MICA and most private B-schools need their own application even though they shortlist on CAT scores. Missing that separate form means you are not considered, whatever your percentile.",
  },
  {
    q: "What is the last date for the MDI and SPJIMR applications 2027?",
    a: "SPJIMR's PGDM 2027-29 form closes on 27 November 2026 and MDI Gurgaon's on 28 November 2026 at 5 PM, as listed on their official admissions pages.",
  },
  {
    q: "When do the IIT MBA application forms open?",
    a: "The IIT MBA programmes (SJMSOM IIT Bombay, DMS IIT Delhi, DoMS IIT Madras, IIT Kanpur, VGSoM IIT Kharagpur and IIT Roorkee) usually open their forms after the CAT result, between late December and early January, and close in late January or early February.",
  },
  {
    q: "When do MBA admissions 2027 start?",
    a: "MBA admissions for the 2027-29 batch run through the 2026-27 season: CAT 2026 is on 29 November 2026, XAT 2027 on 3 January 2027 and SNAP on 13, 19 and 26 December 2026. Most B-school application forms open between August 2026 and January 2027, and the IIT MBA forms open after the CAT result.",
  },
  {
    q: "What is the FMS Delhi application form 2027 last date?",
    a: "FMS Delhi has not released its MBA 2027-29 notice yet. It needs a separate FMS form in addition to CAT, so keep an eye on fms.edu; this tracker updates the card as soon as the official dates are out.",
  },
  {
    q: "What is the IIFT MBA application form 2027 last date?",
    a: "The IIFT MBA (IB) 2027-29 form opened on 12 October 2026 and closes on 25 November 2026. The fee is ₹3,000 (₹1,500 for reserved categories); shortlisting uses CAT 2026.",
  },
  {
    q: "When will the IIM Mumbai MBA application form 2027 open?",
    a: "IIM Mumbai needs a separate application in addition to CAT. Last year the form opened after the CAT result, so expect the 2027-29 form around December 2026 or January 2027.",
  },
  {
    q: "Which MBA forms should I fill before CAT?",
    a: "Several forms close before the CAT exam on 29 November 2026: NMIMS (25 Oct), BITSoM Round 1 (15 Nov), MICAT-I (21 Nov), IIFT and SNAP (25 Nov), SPJIMR and IMT (27 Nov) and MDI Gurgaon (28 Nov). See the 'before CAT vs after CAT' table on this page.",
  },
  {
    q: "How much is the MBA application form fee?",
    a: "Most B-school forms cost between ₹1,500 and ₹3,500: for example SPJIMR ₹2,500, MDI ₹3,000, IIFT ₹3,000, IMT ₹3,500 and TAPMI ₹2,500 for two programmes. Entrance exams are separate: XAT ₹2,300, SNAP ₹2,550 per attempt and NMAT ₹3,000 plus taxes.",
  },
  {
    q: "Is this list official?",
    a: "No. IPM Careers compiles it from official exam and college websites and updates it regularly, but colleges can extend or change dates at any time. Always confirm the last date on the official website before you pay or submit.",
  },
];


export default function MbaApplicationForms({ builtAt }) {
  const [now, setNow] = useState(builtAt);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [alerts, setAlerts] = useState(null); // { token, name, email, phone, follows: [], all }
  const [modal, setModal] = useState(null); // { formId, all }
  const [af, setAf] = useState({ name: "", phone: "", email: "", all: false });
  const [aBusy, setABusy] = useState(false);
  const [aErr, setAErr] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    try { const a = JSON.parse(localStorage.getItem(ALERT_KEY) || "null"); if (a && a.token) setAlerts(a); } catch {}
  }, []);
  const saveAlerts = (a) => { setAlerts(a); try { a ? localStorage.setItem(ALERT_KEY, JSON.stringify(a)) : localStorage.removeItem(ALERT_KEY); } catch {} };
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 3200); };
  const formName = (id) => MBA_FORMS.find((x) => x.id === id)?.name || "this form";

  const openModal = (formId, all = false) => {
    setAErr("");
    setAf((x) => ({ ...x, all: all || x.all, name: x.name || alerts?.name || "", phone: x.phone || alerts?.phone || "", email: x.email || alerts?.email || "" }));
    setModal({ formId, all });
  };

  const bell = async (r, isSoon) => {
    if (!alerts) return openModal(r.id);
    const on = !(alerts.follows || []).includes(r.id);
    try {
      const res = await fetch("/api/mba-alerts-follow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: alerts.token, formId: r.id, on }) });
      const d = await res.json();
      if (res.status === 404) { saveAlerts(null); return openModal(r.id); }
      if (!res.ok) throw new Error(d.error);
      saveAlerts({ ...alerts, follows: d.follows, all: d.all });
      flash(on ? (isSoon ? `We'll email you when ${r.name} opens, then 7 days and 1 day before it closes.` : `Done. We'll email you 7 days and 1 day before ${r.name} closes.`) : `Alerts off for ${r.name}.`);
    } catch (e) { flash(e.message || "Could not update. Try again."); }
  };

  const submitAlerts = async () => {
    setAErr("");
    if (af.name.trim().length < 2) return setAErr("Please enter your name.");
    if (!/^[6-9]\d{9}$/.test(af.phone)) return setAErr("Please enter a valid 10-digit WhatsApp number.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(af.email.trim())) return setAErr("Please enter a valid email: reminders go there.");
    setABusy(true);
    sendLeadToCrm({ name: af.name.trim(), phone: af.phone, email: af.email.trim() }, "register-mba-deadline-alerts");
    try {
      const utm = {};
      try { const u = new URLSearchParams(window.location.search); ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid"].forEach((k) => { if (u.get(k)) utm[k] = u.get(k).slice(0, 120); }); } catch {}
      const res = await fetch("/api/mba-alerts-subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: af.name.trim(), phone: af.phone, email: af.email.trim(), formId: modal?.formId || undefined, all: af.all || modal?.all, utm: Object.keys(utm).length ? utm : null }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not turn on alerts.");
      saveAlerts({ token: d.token, name: af.name.trim(), email: af.email.trim(), phone: af.phone, follows: d.follows, all: d.all });
      const fid = modal?.formId;
      setModal(null);
      flash(d.all ? "You'll get an email 7 days and 1 day before every MBA deadline." : fid ? `Done. We'll email you 7 days and 1 day before ${formName(fid)} closes.` : "Alerts are on.");
    } catch (e) { setAErr(e.message); } finally { setABusy(false); }
  };

  const toggleAll = async () => {
    if (!alerts) return openModal(null, true);
    try {
      const res = await fetch("/api/mba-alerts-follow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: alerts.token, all: !alerts.all }) });
      const d = await res.json();
      if (res.status === 404) { saveAlerts(null); return openModal(null, true); }
      if (!res.ok) throw new Error(d.error);
      saveAlerts({ ...alerts, follows: d.follows, all: d.all });
      flash(d.all ? "Alerts on for every MBA deadline." : "Alerts for all forms are off. Colleges you belled stay on.");
    } catch (e) { flash(e.message || "Could not update. Try again."); }
  };

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const rows = useMemo(() => MBA_FORMS.map((f) => ({ ...f, st: computeStatus(f, now) })), [now]);

  const counts = useMemo(() => {
    const c = { open: 0, closing: 0, soon: 0 };
    rows.forEach((r) => { if (r.st.key === "open" || r.st.key === "closing") c.open += 1; if (r.st.key === "closing") c.closing += 1; if (r.st.key === "soon") c.soon += 1; });
    return c;
  }, [rows]);

  // Next date that matters for each open form: an earlier round (e.g. lower-fee round) or the last date
  const closingSoon = useMemo(() => {
    const DAY = 86400000;
    return rows
      .filter((r) => (r.st.key === "open" || r.st.key === "closing") && r.deadline)
      .map((r) => {
        const useRound = r.type !== "symbiosis" && r.st.next && r.st.next.date < r.deadline;
        const date = useRound ? r.st.next.date : r.deadline;
        const days = Math.max(0, Math.ceil((new Date(`${date}T23:59:59+05:30`).getTime() - now) / DAY) - 1);
        return { ...r, stripDate: date, stripDays: days, stripLabel: useRound ? r.st.next.label : "Last date" };
      })
      .sort((a, b) => a.stripDate.localeCompare(b.stripDate))
      .slice(0, 8);
  }, [rows, now]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows
      .filter((r) => status === "all" || (status === "open" ? r.st.key === "open" || r.st.key === "closing" : r.st.key === status))
      .filter((r) => type === "all" || r.type === type)
      .filter((r) => !term || `${r.name} ${r.programme} ${(r.exams || []).join(" ")}`.toLowerCase().includes(term))
      .sort((a, b) => (ORDER[a.st.key] - ORDER[b.st.key]) || String(a.deadline || "9999").localeCompare(String(b.deadline || "9999")) || a.name.localeCompare(b.name));
  }, [rows, status, type, q]);

  const jump = (id) => {
    setStatus("all"); setType("all"); setQ("");
    setTimeout(() => document.getElementById(`f-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const exams = MBA_FORMS.filter((f) => f.type === "exam" && f.mode !== "year-round");
  const todayIST = new Date(now + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
  const CAT_DAY = "2026-11-29";
  const openDated = rows.filter((r) => (r.st.key === "open" || r.st.key === "closing") && r.deadline).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const openNames = rows.filter((r) => r.st.key === "open" || r.st.key === "closing");
  const thisWeek = openDated.filter((r) => r.st.days <= 7);
  const soonList = rows.filter((r) => r.st.key === "soon");
  const beforeCat = openDated.filter((r) => r.deadline <= CAT_DAY && r.type !== "exam");
  const afterCat = openDated.filter((r) => r.deadline > CAT_DAY && r.type !== "exam");
  const iits = rows.filter((r) => r.type === "iit");
  const feeRows = rows.filter((r) => (r.type === "bschool" || r.type === "iit") && r.fee && !/^(see official|to be announced)/i.test(r.fee));
  const nonIim = rows.filter((r) => r.type !== "exam" && r.type !== "iim").length;
  const FAQS = [
    {
      q: "Which MBA forms are out right now?",
      a: `As of ${fmtDate(todayIST)}, ${openNames.length} MBA forms and entrance exam registrations on this page are open, including ${openDated.slice(0, 8).map((r) => `${r.name} (last date ${fmtDate(r.deadline)})`).join(", ")}. Use the 'Open now' filter for the full live list.`,
    },
    ...FAQS_STATIC,
  ];

  return (
    <AppShell activePage="/mba-application-forms" pageTitle="MBA Forms & Deadlines">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title="MBA Application Forms 2026: Last Dates for 2027-29 Batch (Live)"
        description="Which MBA forms are open now? Live MBA application form 2026 last dates for the 2027-29 batch: XAT, SNAP, NMAT, SPJIMR, MDI, IIFT, IITs and more, updated hourly."
        canonical={PAGE_URL}
        openGraph={{
          url: PAGE_URL,
          title: "MBA Application Forms 2026: Which Forms Are Open Now (Live)",
          description: "Live tracker of MBA entrance exam and B-school application deadlines for the 2027-29 batch.",
          siteName: "IPM Careers",
        }}
        additionalMetaTags={[
          { name: "keywords", content: "MBA application form 2026, MBA application form 2026 last date, MBA form last date 2026, MBA application form 2027, MBA forms open now, which MBA forms are out, upcoming MBA forms, MBA admission 2027, MBA application deadlines 2026, MBA application form fees, non IIM MBA form 2027, IIT MBA application form 2027, IIFT MBA application form 2027, FMS application form 2027, SPJIMR application deadline, MDI application last date, XAT registration last date, SNAP registration last date, NMAT registration last date" },
          { name: "robots", content: "index, follow, max-image-preview:large" },
        ]}
      />

      <div className={s.page}>
        <section className={s.hero}>
          <span className={s.eyebrow}><span className={`${s.dot} ${s.dotOpen}`}></span>Live · status as of {fmtDate(todayIST)} · dates verified {fmtDate(CHECKED_ON)}</span>
          <h1 className={s.title}>
            MBA Application Forms 2026. <span className={s.accent}>Every last date for the 2027-29 batch.</span>
          </h1>
          <p className={s.sub}>
            Entrance exams, IIMs, IITs and top B-schools: what is open, what closes this week and which forms you still need to fill
            separately after CAT.
          </p>
          <div className={s.stats}>
            <div className={s.stat}><div className={`${s.statNum} ${s.numOpen}`}>{counts.open}</div><div className={s.statLabel}>Open now</div></div>
            <div className={s.stat}><div className={`${s.statNum} ${s.numClosing}`}>{counts.closing}</div><div className={s.statLabel}>Closing in 14 days</div></div>
            <div className={s.stat}><div className={`${s.statNum} ${s.numSoon}`}>{counts.soon}</div><div className={s.statLabel}>Opening soon</div></div>
          </div>
          <button type="button" className={`${s.alertCta} ${alerts?.all ? s.alertCtaOn : ""}`} onClick={toggleAll}>
            {alerts?.all ? "🔔 Alerts on for every deadline · turn off" : "🔔 Email me before every MBA deadline"}
          </button>
          <p className={s.alertHint}>Or tap the 🔔 on any college. Reminders 7 days and 1 day before the last date.</p>
        </section>

        <div className={s.wrap}>
          {closingSoon.length > 0 && (
            <div className={s.strip}>
              <div className={s.stripHead}><span className={`${s.dot} ${s.dotClosing}`}></span>Next deadlines</div>
              <div className={s.stripRow}>
                {closingSoon.map((r) => (
                  <button key={r.id} type="button" className={s.stripItem} onClick={() => jump(r.id)}>
                    <div className={s.stripName}>{r.name}</div>
                    <div className={s.stripMeta}>{r.stripLabel}: {fmtDate(r.stripDate)} · {r.stripDays === 0 ? "today" : `${r.stripDays} day${r.stripDays === 1 ? "" : "s"} left`}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={s.toolbar}>
            <input className={s.search} type="search" placeholder="Search a college or exam (e.g. MDI, XAT, IIT)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search forms" />
            <div className={s.pills} role="tablist" aria-label="Status">
              {STATUS_FILTERS.map((f) => (
                <button key={f.key} type="button" role="tab" aria-selected={status === f.key} className={`${s.pill} ${status === f.key ? s.pillOn : ""}`} onClick={() => setStatus(f.key)}>{f.label}</button>
              ))}
            </div>
            <div className={s.pills} role="tablist" aria-label="Type">
              {TYPES.map((t) => (
                <button key={t.key} type="button" role="tab" aria-selected={type === t.key} className={`${s.pill} ${type === t.key ? s.pillOn : ""}`} onClick={() => setType(t.key)}>{t.label}</button>
              ))}
            </div>
            <span className={s.count}>{list.length} of {MBA_FORMS.length} shown</span>
          </div>

          {list.length === 0 ? (
            <div className={s.empty}>Nothing matches these filters. Try "All".</div>
          ) : (
            <div className={s.grid}>
              {list.map((r) => {
                const st = r.st;
                const followed = Boolean(alerts && ((alerts.follows || []).includes(r.id)));
                return (
                  <article key={r.id} id={`f-${r.id}`} className={`${s.card} ${st.key === "closing" ? s.cardClosing : ""} ${st.key === "closed" ? s.cardClosed : ""}`}>
                    <div className={s.cardTop}>
                      <span className={`${s.badge} ${BADGE[st.key]}`}><span className={`${s.dot} ${DOT[st.key]}`}></span>{st.label}</span>
                      <span className={s.type}>{TYPE_LABEL[r.type]}</span>
                    </div>
                    <h3 className={s.name}>{r.name}</h3>
                    <p className={s.prog}>{r.programme}</p>

                    <div className={`${s.dl} ${st.key === "closing" ? s.daysUrgent : ""}`}>
                      <div>
                        <div className={s.dlLabel}>{st.key === "soon" && r.opens ? "Opens" : st.key === "viacat" ? "How to apply" : "Last date"}</div>
                        <div className={s.dlDate}>
                          {st.key === "soon" && r.opens ? fmtDate(r.opens)
                            : r.deadline ? fmtDate(r.deadline)
                            : r.dateText ? r.dateText
                            : st.key === "viacat" ? "Through the CAT form"
                            : st.rolling ? "No fixed date"
                            : r.mode === "year-round" ? "Any time"
                            : "To be announced"}
                        </div>
                      </div>
                      {(st.key === "open" || st.key === "closing") && typeof st.days === "number" && (
                        <div className={`${s.days} ${st.key === "closing" ? s.daysUrgent : ""}`}>
                          <span className={s.daysNum}>{st.days === 0 ? "Today" : st.days}</span>
                          {st.days === 0 ? "last day" : st.days === 1 ? "day left" : "days left"}
                        </div>
                      )}
                    </div>

                    {st.next && st.next.date !== r.deadline && r.type !== "symbiosis" && (
                      <div className={s.nextRound}>{st.next.label} · <b>{fmtDate(st.next.date)}</b></div>
                    )}

                    <div className={s.examLine}>
                      {(r.exams || []).slice(0, 3).join(" · ")}{(r.exams || []).length > 3 ? ` +${r.exams.length - 3}` : ""}
                    </div>

                    <div className={s.actions}>
                      <a className={s.apply} href={r.link} target="_blank" rel="noopener noreferrer nofollow">{st.key === "soon" || st.key === "closed" ? "Official site ↗" : "Apply ↗"}</a>
                      {st.key !== "closed" && (
                        <button type="button" className={`${s.cal} ${s.bell} ${followed || alerts?.all ? s.bellOn : ""}`} onClick={() => bell(r, st.key === "soon")}
                          title={followed ? "Alerts on: tap to turn off" : st.key === "soon" ? "Email me when this form opens" : "Email me 7 days and 1 day before the last date"}
                          aria-label={followed ? `Turn off alerts for ${r.name}` : `Get deadline alerts for ${r.name}`} aria-pressed={followed}>
                          🔔
                        </button>
                      )}
                    </div>

                    <details className={s.more}>
                      <summary>Fee, dates & details</summary>
                      <div className={s.moreBody}>
                        <div className={s.meta}><b>Fee:</b> {r.fee}</div>
                        {r.rounds && r.rounds.length > 1 && (
                          <ul className={s.rounds}>
                            {r.rounds.map((x) => (
                              <li key={x.label} className={new Date(`${x.date}T23:59:59+05:30`).getTime() < now ? s.past : ""}>
                                <span>{x.label}</span><span>{fmtDate(x.date)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {r.note && <div className={s.meta}>{r.note}</div>}
                        {r.lastCycle && <div className={s.last}>{r.lastCycle} (for reference only)</div>}
                        <div className={`${s.src} ${r.source === "official" ? s.srcOk : s.srcWait}`}>
                          {r.source === "official" ? "✔ Checked on the official website" : "⏳ Official 2027 notice awaited"}
                        </div>
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <article className={s.article}>
          <h2>MBA application forms 2026 for the 2027-29 batch: how to use this tracker</h2>
          <p>
            This page lists the <strong>MBA application forms for the 2027-29 batch</strong>: national entrance exams like XAT, SNAP, NMAT,
            MAT and IBSAT, the IIMs, the IIT management schools and top B-schools such as FMS, SPJIMR, MDI, IIFT, XLRI, MICA, IMT and the
            Symbiosis institutes. Each card shows the status today, the last date, days left, accepted exams and a link to the official form; the fee and
            round-by-round dates are under <em>Fee, dates &amp; details</em>. Tap the 📅 button to add a deadline to your Google Calendar. Statuses and days left refresh every hour.
          </p>

          <h2>MBA forms open now ({openNames.length} as of {fmtDate(todayIST)})</h2>
          <p>
            These MBA application forms are open today, earliest last date first:{" "}
            {openDated.map((r, i) => (
              <span key={r.id}>{i ? ", " : ""}<a href={`#f-${r.id}`}>{r.name}</a> ({fmtDate(r.deadline)})</span>
            ))}
            . A few more are open with no fixed last date yet, such as {rows.filter((r) => r.st.rolling).map((r) => r.name).join(", ")}.
          </p>

          <h2>MBA forms closing this week</h2>
          {thisWeek.length ? (
            <ul>
              {thisWeek.map((r) => (
                <li key={r.id}><a href={`#f-${r.id}`}>{r.name}</a>: last date {fmtDate(r.deadline)} ({r.st.days === 0 ? "today" : `${r.st.days} day${r.st.days === 1 ? "" : "s"} left`})</li>
              ))}
            </ul>
          ) : (
            <p>No form on this page closes in the next 7 days. The next last date is {openDated[0] ? `${openDated[0].name} on ${fmtDate(openDated[0].deadline)}` : "not announced yet"}.</p>
          )}

          <h2>Upcoming MBA forms (opening soon)</h2>
          <p>
            These forms are not open yet. Most of them open around or after the CAT result:{" "}
            {soonList.map((r, i) => (
              <span key={r.id}>{i ? ", " : ""}<a href={`#f-${r.id}`}>{r.name}</a></span>
            ))}
            . Each card shows last year's dates for reference until the official 2027 notice is out.
          </p>

          <h2>MBA forms to fill before CAT vs after CAT 2026</h2>
          <p>CAT 2026 is on 29 November 2026. These B-school forms close before the exam, so do not wait for your score:</p>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Close before CAT (by 29 Nov 2026)</th><th>Last date</th></tr></thead>
              <tbody>{beforeCat.map((r) => <tr key={r.id}><td><a href={`#f-${r.id}`}>{r.name}</a></td><td>{fmtDate(r.deadline)}</td></tr>)}</tbody>
            </table>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Close after CAT</th><th>Last date</th></tr></thead>
              <tbody>{afterCat.map((r) => <tr key={r.id}><td><a href={`#f-${r.id}`}>{r.name}</a></td><td>{fmtDate(r.deadline)}</td></tr>)}</tbody>
            </table>
          </div>

          <h2>IIT MBA application forms 2027</h2>
          <p>
            The IIT management schools need their own form in addition to CAT and usually open it after the CAT result. This page tracks{" "}
            {iits.length} of them:{" "}
            {iits.map((r, i) => (
              <span key={r.id}>{i ? ", " : ""}<a href={`#f-${r.id}`}>{r.name}</a></span>
            ))}
            .
          </p>

          <h2>Non-IIM MBA forms 2027</h2>
          <p>
            Apart from the IIMs, {nonIim} non-IIM B-schools and programmes are tracked here, from FMS, SPJIMR, MDI, IIFT and XLRI to the
            Symbiosis institutes and newer schools like BITSoM. Unlike the IIMs, almost all of them need a separate application form.
          </p>

          <h2>MBA application form fees 2026</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>College</th><th>Application fee</th></tr></thead>
              <tbody>{feeRows.map((r) => <tr key={r.id}><td>{r.name}</td><td>{r.fee}</td></tr>)}</tbody>
            </table>
          </div>

          <h2>MBA entrance exam form last dates 2026 (XAT, SNAP, NMAT, MAT, IBSAT)</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Exam</th><th>Last date to register</th><th>Exam date(s)</th><th>Fee</th></tr></thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e.id}>
                    <td><a href={e.link} target="_blank" rel="noopener noreferrer nofollow">{e.name}</a></td>
                    <td>{e.deadline ? fmtDate(e.deadline) : "To be announced"}</td>
                    <td>{(e.rounds || []).filter((x) => /exam|test/i.test(x.label)).map((x) => fmtDate(x.date)).join(", ") || (e.id === "nmat-2026" ? "2 Nov - 20 Dec 2026" : e.id === "ibsat-2026" ? "5-27 Dec 2026 (weekends)" : "To be announced")}</td>
                    <td>{e.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Forms you must fill separately after CAT</h2>
          <p>
            CAT only covers the IIMs. Most other CAT-accepting institutes need their own form, often with an earlier deadline than you expect:
            SPJIMR and MDI close in the last week of November, IIFT on 25 November, and IMT on 27 November 2026. FMS Delhi, the IIT MBA
            programmes, DFBE (DU) and IIM Mumbai usually open their forms around or after the CAT result. Filter by <em>Opening soon</em> to
            see them.
          </p>

          <h2>Symbiosis (SNAP): two steps, two deadlines</h2>
          <p>
            For SIBM, SCMHRD, SIIB, SCIT, SIOM and other Symbiosis institutes you first register for <strong>SNAP 2026 by 25 November
            2026</strong>, then pay a separate ₹1,000 programme registration for each institute by its own last date (SIBM Pune and SCMHRD on
            12 December, SIIB on 18 December 2026, SIBM Nagpur on 20 January 2027).
          </p>

          <h2>Tips before you apply</h2>
          <ul>
            <li>Apply early: several schools (GIM Goa, LBSIM) charge a lower fee in their first rounds.</li>
            <li>Keep your CAT registration number, photo, signature and Class 10/12/graduation marks ready before you start.</li>
            <li>Check whether a school needs work experience or a specific score type (e.g. ISB needs GMAT/GRE, MICA needs MICAT).</li>
            <li>Save the payment receipt and the application number for every form.</li>
          </ul>

          <h2>Frequently asked questions</h2>
          {FAQS.map((f) => (
            <details key={f.q} className={s.faq}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </article>

        <div className={s.wrap}>
          <div className={s.disclaimer} role="note">
            <b>Please cross-check before you apply.</b> We compile these dates from official exam and college websites and update them
            regularly, but institutes can extend, change or close forms at any time and we may not catch every change immediately. Do not rely
            on this page alone: always confirm the last date, fee and eligibility on the official website linked on each card before you pay
            or submit. Last checked: {fmtDate(CHECKED_ON)}.
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                name: "MBA Application Forms 2027-29: Last Dates & Deadlines Tracker",
                url: PAGE_URL,
                dateModified: todayIST,
                publisher: { "@type": "Organization", name: "IPM Careers", url: "https://ipmcareer.com" },
              },
              {
                "@type": "ItemList",
                name: "MBA application deadlines 2027-29",
                itemListElement: MBA_FORMS.filter((f) => f.deadline).map((f, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: `${f.name}: last date ${fmtDate(f.deadline)}`,
                  url: `${PAGE_URL}#f-${f.id}`,
                })),
              },
              {
                "@type": "FAQPage",
                mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "IPM Careers", item: "https://register.ipmcareer.com/" },
                  { "@type": "ListItem", position: 2, name: "MBA Application Forms 2027-29", item: PAGE_URL },
                ],
              },
            ],
          }),
        }}
      />
      {modal && (
        <div className={s.modalBack} role="dialog" aria-modal="true" aria-label="Turn on deadline alerts" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className={s.modal}>
            <button type="button" className={s.modalX} onClick={() => setModal(null)} aria-label="Close">×</button>
            <div className={s.modalIcon}>🔔</div>
            <h2 className={s.modalTitle}>{modal.formId ? `Get alerts for ${formName(modal.formId)}` : "Get alerts for every MBA deadline"}</h2>
            <p className={s.modalSub}>We email you 7 days and 1 day before the last date{modal.formId && MBA_FORMS.find((x) => x.id === modal.formId) && computeStatus(MBA_FORMS.find((x) => x.id === modal.formId), now).key === "soon" ? ", and the day the form opens" : ""}. Free.</p>
            <div className={s.modalForm}>
              <label className={s.mField}><span>Your name</span><input className={s.mInput} value={af.name} onChange={(e) => setAf((x) => ({ ...x, name: e.target.value }))} autoComplete="name" /></label>
              <label className={s.mField}><span>WhatsApp number</span><input className={s.mInput} value={af.phone} onChange={(e) => setAf((x) => ({ ...x, phone: e.target.value.replace(/\D/g, "").slice(-10) }))} inputMode="numeric" placeholder="10-digit mobile" autoComplete="tel-national" /></label>
              <label className={s.mField}><span>Email (reminders go here)</span><input className={s.mInput} value={af.email} onChange={(e) => setAf((x) => ({ ...x, email: e.target.value }))} type="email" autoComplete="email" /></label>
              {modal.formId && (
                <label className={s.mCheck}><input type="checkbox" checked={af.all} onChange={(e) => setAf((x) => ({ ...x, all: e.target.checked }))} /><span>Also remind me before every other MBA deadline</span></label>
              )}
              {aErr && <div className={s.mErr}>{aErr}</div>}
              <button type="button" className={s.mBtn} onClick={submitAlerts} disabled={aBusy}>{aBusy ? "Turning on…" : "Turn on alerts"}</button>
              <p className={s.mNote}>One email a day at most. Unsubscribe from any email. By continuing you agree to be contacted by IPM Careers about MBA admissions.</p>
            </div>
          </div>
        </div>
      )}
      {toast && <div className={s.toast} role="status">{toast}</div>}
    </AppShell>
  );
}

// Re-generated every hour so statuses are right in the HTML that Google sees;
// the browser then refreshes them with the visitor's clock.
export async function getStaticProps() {
  return { props: { builtAt: Date.now() }, revalidate: 3600 };
}
