import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { NextSeo } from "next-seo";
import AppShell from "../components/AppShell";
import s from "./MbaForms.module.css";
import { MBA_FORMS, TYPES, CHECKED_ON, computeStatus, fmtDate } from "../lib/mbaForms";

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

const FAQS = [
  {
    q: "Which MBA application forms for 2027-29 are open right now?",
    a: "As of 18 October 2026, XAT 2027, SNAP 2026, NMAT 2026, MAT December 2026 and IBSAT 2026 registrations are open, along with B-school forms such as SPJIMR, MDI Gurgaon, IIFT, IMT Ghaziabad, XIM, MICA, BITSoM, IMI Delhi, FORE, TAPMI, GIM Goa and K J Somaiya. Use the 'Open now' filter above for the live list.",
  },
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
    q: "Is this list official?",
    a: "No. IPM Careers compiles it from official exam and college websites and updates it regularly, but colleges can extend or change dates at any time. Always confirm the last date on the official website before you pay or submit.",
  },
];

function calendarLink(f) {
  if (!f.deadline) return null;
  const d = f.deadline.replace(/-/g, "");
  const next = new Date(`${f.deadline}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const end = next.toISOString().slice(0, 10).replace(/-/g, "");
  const text = encodeURIComponent(`Last date: ${f.name} application`);
  const details = encodeURIComponent(`${f.programme}\nApply: ${f.link}\nCross-check the date on the official website.\nvia IPM Careers MBA Forms tracker`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${d}/${end}&details=${details}`;
}

export default function MbaApplicationForms({ builtAt }) {
  const [now, setNow] = useState(builtAt);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");

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

  return (
    <AppShell activePage="/mba-application-forms" pageTitle="MBA Forms & Deadlines">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title="MBA Application Forms 2027-29: Last Dates & Deadlines Tracker"
        description="All MBA application forms 2027-29 in one place: XAT, SNAP, NMAT, MAT, IBSAT and last dates for IIMs, IITs, FMS, SPJIMR, MDI, IIFT, XLRI, MICA, Symbiosis and more. Live status and days left."
        canonical={PAGE_URL}
        openGraph={{
          url: PAGE_URL,
          title: "MBA Application Forms 2027-29: Every Last Date in One Place",
          description: "Live tracker of MBA entrance exam and B-school application deadlines for the 2027-29 batch.",
          siteName: "IPM Careers",
        }}
        additionalMetaTags={[
          { name: "keywords", content: "MBA application form 2027, MBA application forms 2027-29, MBA form last date 2026, MBA deadlines 2027, XAT 2027 last date, SNAP 2026 last date, NMAT 2026 last date, SPJIMR application 2027, MDI application 2027, IIFT application 2027, IIT MBA application 2027, B-school application deadlines" },
          { name: "robots", content: "index, follow, max-image-preview:large" },
        ]}
      />

      <div className={s.page}>
        <section className={s.hero}>
          <span className={s.eyebrow}><span className={`${s.dot} ${s.dotOpen}`}></span>MBA 2027-29 · last checked {fmtDate(CHECKED_ON)}</span>
          <h1 className={s.title}>
            MBA Application Forms 2027-29. <span className={s.accent}>Every last date in one place.</span>
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
                const cal = st.key !== "closed" ? calendarLink(r) : null;
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

                    {st.next && st.next.date !== r.deadline && (
                      <div className={s.nextRound}>Next: {st.next.label} · <b>{fmtDate(st.next.date)}</b></div>
                    )}

                    {r.rounds && r.rounds.length > 1 && (
                      <ul className={s.rounds}>
                        {r.rounds.map((x) => (
                          <li key={x.label} className={new Date(`${x.date}T23:59:59+05:30`).getTime() < now ? s.past : ""}>
                            <span>{x.label}</span><span>{fmtDate(x.date)}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className={s.chips}>{(r.exams || []).map((e) => <span key={e} className={s.chip}>{e}</span>)}</div>
                    <div className={s.meta}><b>Fee:</b> {r.fee}</div>
                    {r.note && <div className={s.meta}>{r.note}</div>}
                    {r.lastCycle && <div className={s.last}>{r.lastCycle} (for reference only)</div>}
                    <div className={`${s.src} ${r.source === "official" ? s.srcOk : s.srcWait}`}>
                      {r.source === "official" ? "✔ Checked on the official website" : "⏳ Official 2027 notice awaited"}
                    </div>

                    <div className={s.actions}>
                      <a className={s.apply} href={r.link} target="_blank" rel="noopener noreferrer nofollow">{st.key === "soon" || st.key === "closed" ? "Official website ↗" : "Apply on official site ↗"}</a>
                      {cal && <a className={s.cal} href={cal} target="_blank" rel="noopener noreferrer nofollow">📅 Remind me</a>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <article className={s.article}>
          <h2>MBA application forms 2027-29: how to use this tracker</h2>
          <p>
            This page lists the <strong>MBA application forms for the 2027-29 batch</strong>: national entrance exams like XAT, SNAP, NMAT,
            MAT and IBSAT, the IIMs, the IIT management schools and top B-schools such as FMS, SPJIMR, MDI, IIFT, XLRI, MICA, IMT and the
            Symbiosis institutes. Each card shows the status today, the last date, days left, accepted exams, the application fee and a link
            to the official form. Tap <em>Remind me</em> to add the deadline to your Google Calendar.
          </p>

          <h2>MBA entrance exam registration last dates 2026-27</h2>
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
                dateModified: CHECKED_ON,
                publisher: { "@type": "Organization", name: "IPM Careers", url: "https://ipmcareer.com" },
              },
              {
                "@type": "ItemList",
                name: "MBA application deadlines 2027-29",
                itemListElement: MBA_FORMS.filter((f) => f.deadline).map((f, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: `${f.name}: last date ${fmtDate(f.deadline)}`,
                  url: f.link,
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
    </AppShell>
  );
}

// Re-generated every hour so statuses are right in the HTML that Google sees;
// the browser then refreshes them with the visitor's clock.
export async function getStaticProps() {
  return { props: { builtAt: Date.now() }, revalidate: 3600 };
}
