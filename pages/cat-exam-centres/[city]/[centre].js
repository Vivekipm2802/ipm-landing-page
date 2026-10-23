import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import AppShell from "../../../components/AppShell";
import s from "../../CatPlanner.module.css";
import { sendLeadToCrm } from "../../../lib/crm";
import { SLOTS, CENTRES_PATH, PLANNER_PATH, SITE, cityBySlug, fmtHHMM, directionsUrl, mapsEmbedUrl, mapsSearchUrl, centreQuery } from "../../../lib/catPlanner";

const REVIEWS_OPEN_AT = new Date("2026-11-29T08:30:00+05:30").getTime();
const LABELS = {
  lab_temp: { title: "Lab temperature", cold: "Cold", fine: "Fine", hot: "Hot" },
  system_lag: { title: "Computer lag", none: "None", some: "Some", bad: "Bad" },
  noise: { title: "Noise", quiet: "Quiet", some: "Some", noisy: "Noisy" },
  frisking: { title: "Frisking", relaxed: "Relaxed", normal: "Normal", strict: "Strict" },
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const citySlug = String(params.city || ""), slug = String(params.centre || "");
  try {
    const { catDb, ensureCentreEnriched, centreCounts, reviewSummary, safe } = await import("../../../lib/catPlannerServer");
    const db = catDb();
    const { data: c0 } = await db.from("cat_centres").select("*").eq("city_slug", citySlug).eq("slug", slug).maybeSingle();
    if (!c0) return { notFound: true, revalidate: 300 };
    const c = await ensureCentreEnriched(db, c0, 15000);
    const [counts, reviews, others] = await Promise.all([
      safe(() => centreCounts(db, c.id), { total: 0, bySlot: { 1: 0, 2: 0, 3: 0 } }),
      safe(() => reviewSummary(db, c.id), { count: 0, avg: null, rows: [] }),
      safe(async () => (await db.from("cat_centres").select("slug, name").eq("city_slug", citySlug).neq("id", c.id).order("name").limit(12)).data || [], []),
    ]);
    const centre = { id: c.id, slug: c.slug, city_slug: c.city_slug, city: c.city, state: c.state, name: c.name, address: c.address, pincode: c.pincode, lat: c.lat, lng: c.lng, geo_precision: c.geo_precision, nearby: c.nearby || null, updated_at: c.updated_at };
    return { props: { centre, counts, reviews, others }, revalidate: 1800 };
  } catch {
    return { notFound: true, revalidate: 300 };
  }
}

export default function CentrePage({ centre, counts, reviews, others }) {
  const city = cityBySlug(centre.city_slug);
  const url = `${SITE}${CENTRES_PATH}/${centre.city_slug}/${centre.slug}`;
  const nb = centre.nearby || {};
  const nearestRail = nb.rail?.[0], nearestMetro = nb.metro?.[0], parking = nb.parking || [];
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(Date.now() >= REVIEWS_OPEN_AT); }, []);

  const faqs = [
    { q: `What is the address of ${centre.name}?`, a: `${centre.name}${centre.address ? `, ${centre.address}` : `, ${centre.city}`}. This is the address printed on CAT admit cards for this centre.` },
    { q: `How do I reach ${centre.name}?`, a: nearestRail || nearestMetro ? `${nearestMetro ? `The nearest metro station is ${nearestMetro.name} (about ${nearestMetro.km} km). ` : ""}${nearestRail ? `The nearest railway station is ${nearestRail.name} (about ${nearestRail.km} km). ` : ""}Most students take a cab or auto. Visit a day early at your slot time to check the route.` : `Use the Google Maps route on this page and visit a day early at the same time as your slot. Most students take a cab or auto.` },
    { q: `Is parking available near ${centre.name}?`, a: parking.length ? `OpenStreetMap lists parking within about a kilometre: ${parking.map((p) => `${p.name} (${p.km} km)`).join(", ")}. Parking at exam centres fills up early, so being dropped off is easier.` : "We could not find mapped parking right next to this centre. Being dropped off, or taking a cab or auto, is usually easier on exam day." },
    { q: `What time should I reach ${centre.name} for CAT 2026?`, a: "Reach by the reporting time on your admit card. Going by last year's pattern that is 7:00 AM for slot 1, 11:00 AM for slot 2 and 3:00 PM for slot 3, and the gate closes 15 minutes before the exam starts." },
  ];
  const ld = [
    {
      "@context": "https://schema.org", "@type": "Place", name: centre.name, url,
      address: { "@type": "PostalAddress", streetAddress: centre.address || undefined, addressLocality: centre.city, addressRegion: centre.state || undefined, postalCode: centre.pincode || undefined, addressCountry: "IN" },
      ...(centre.lat && centre.geo_precision === "address" ? { geo: { "@type": "GeoCoordinates", latitude: centre.lat, longitude: centre.lng } } : {}),
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "CAT 2026 Exam Centres", item: `${SITE}${CENTRES_PATH}` },
      { "@type": "ListItem", position: 2, name: `CAT exam centre in ${centre.city}`, item: `${SITE}${CENTRES_PATH}/${centre.city_slug}` },
      { "@type": "ListItem", position: 3, name: centre.name, item: url },
    ] },
  ];

  return (
    <AppShell activePage={CENTRES_PATH} pageTitle={centre.name}>
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </Head>
      <NextSeo
        title={`${centre.name}, ${centre.city}: CAT 2026 Exam Centre Address, How to Reach & Reviews`}
        description={`${centre.name}, ${centre.city} CAT exam centre: full address, map, ${nearestRail ? `nearest station ${nearestRail.name}, ` : ""}parking, reporting time and student reviews${reviews.count ? ` (${reviews.count})` : ""}. CAT 2026 on 29 Nov.`}
        canonical={url}
        openGraph={{ url, title: `${centre.name}: CAT exam centre in ${centre.city}`, siteName: "IPM Careers" }}
        additionalMetaTags={[{ name: "keywords", content: `${centre.name}, ${centre.name} address, ${centre.name} CAT, CAT exam centre ${centre.city}, how to reach ${centre.name}` }]}
      />
      <div className={s.page}>
        <div className={s.wrap}>
          <div className={s.crumbs}><Link href={CENTRES_PATH}>CAT exam centres</Link> › <Link href={`${CENTRES_PATH}/${centre.city_slug}`}>{centre.city}</Link> › {centre.name}</div>
        </div>
        <section className={s.hero} style={{ paddingTop: "1.2rem" }}>
          <h1 className={s.title} style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)" }}>{centre.name}, <span className={s.accent}>{centre.city}</span></h1>
          <p className={s.sub}>CAT 2026 exam centre{centre.address ? `: ${centre.address}` : ""}</p>
          <div className={s.stats}>
            <div className={s.stat}><div className={s.statNum}>{counts.total}</div><div className={s.statLabel}>students planning here</div></div>
            <div className={s.stat}><div className={s.statNum}>{reviews.avg != null ? `${reviews.avg}★` : "–"}</div><div className={s.statLabel}>{reviews.count} review{reviews.count === 1 ? "" : "s"}</div></div>
          </div>
        </section>

        <div className={s.narrow}>
          <div className={s.card}>
            <h2 className={s.cardTitle}>Address and map</h2>
            <p className={s.cardSub} style={{ marginBottom: 8 }}>{centreQuery(centre)}</p>
            <div className={s.actions}>
              <a className={s.action} href={directionsUrl(centre)} target="_blank" rel="noopener noreferrer"><span className={s.actionIcon}>🗺️</span><span className={s.actionTitle}>Directions</span><span className={s.actionSub}>Google Maps</span></a>
              <a className={s.action} href={mapsSearchUrl(`hotels near ${centreQuery(centre)}`)} target="_blank" rel="noopener noreferrer"><span className={s.actionIcon}>🏨</span><span className={s.actionTitle}>Stay nearby</span><span className={s.actionSub}>Hotels around the centre</span></a>
              <Link className={s.action} href={PLANNER_PATH}><span className={s.actionIcon}>⏰</span><span className={s.actionTitle}>Exam day plan</span><span className={s.actionSub}>Leave-by time + reminders</span></Link>
            </div>
            <iframe className={s.map} title={`Map of ${centre.name}`} src={mapsEmbedUrl(centre)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>

          {(nb.rail?.length || nb.metro?.length || nb.bus?.length || nb.parking?.length) ? (
            <div className={s.card}>
              <h2 className={s.cardTitle}>How to reach</h2>
              <p className={s.cardSub}>From OpenStreetMap{centre.geo_precision !== "address" ? ", measured from the centre’s area" : ""}; straight-line distances.</p>
              <div className={s.near}>
                {[["rail", "🚆 Railway station"], ["metro", "🚇 Metro"], ["bus", "🚌 Bus stand"], ["parking", "🅿️ Parking"]].filter(([k]) => nb[k]?.length).map(([k, l]) => (
                  <div key={k} className={s.nearBox}><div className={s.nearK}>{l}</div><div className={s.nearV}>{nb[k].map((x) => <div key={x.name}>{x.name} · {x.km} km</div>)}</div></div>
                ))}
              </div>
            </div>
          ) : null}

          <div className={s.card}>
            <h2 className={s.cardTitle}>Students at this centre</h2>
            <div className={s.mates}>
              {[1, 2, 3].map((k) => <div key={k} className={s.mate}><div className={s.mateNum}>{counts.bySlot[k] || 0}</div><div className={s.mateLbl}>Slot {k}</div></div>)}
            </div>
            <p className={s.note}>Counts of students who made a plan for this centre. No names are shown. <Link href={PLANNER_PATH} className={s.link}>Add yours</Link></p>
          </div>

          <div className={s.card} id="reviews">
            <h2 className={s.cardTitle}>Reviews {reviews.count ? `(${reviews.count})` : ""}</h2>
            {reviews.count ? (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.keys(LABELS).map((k) => {
                    const t = reviews[k] || {};
                    const top = Object.entries(t).sort((a, b) => b[1] - a[1])[0];
                    return top ? <span key={k} className={s.tag}>{LABELS[k].title}: {LABELS[k][top[0]]} ({top[1]})</span> : null;
                  })}
                </div>
                {reviews.rows.map((r) => (
                  <div key={r.id} className={s.review}>
                    <div className={s.reviewHead}><span><b style={{ color: "#f4f1ea" }}>{r.display_name}</b> · {r.exam}{r.slot ? `, slot ${r.slot}` : ""}</span><span style={{ color: "#f9a01b" }}>{"★".repeat(r.overall)}<span style={{ color: "rgba(236,232,225,0.25)" }}>{"★".repeat(5 - r.overall)}</span></span></div>
                    {r.comment && <div className={s.reviewText}>{r.comment}</div>}
                    {r.reach_tip && <div className={s.reviewText} style={{ color: "#cfc9bf" }}>🧭 {r.reach_tip}</div>}
                    <div>{Object.keys(LABELS).filter((k) => r[k]).map((k) => <span key={k} className={s.tag}>{LABELS[k].title}: {LABELS[k][r[k]]}</span>)}</div>
                  </div>
                ))}
              </>
            ) : (
              <p className={s.cardSub}>No reviews yet. Took CAT or another exam here before? Your review helps this year’s students.</p>
            )}
          </div>

          <ReviewForm centreId={centre.id} cat2026Open={open} />
        </div>

        <article className={s.article}>
          <h2>CAT 2026 timings at {centre.name}</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Slot</th><th>Exam</th><th>Reporting</th><th>Gate closes</th></tr></thead>
              <tbody>{Object.entries(SLOTS).map(([k, v]) => <tr key={k}><td>{v.label}</td><td>{fmtHHMM(v.start)} to {fmtHHMM(v.end)}</td><td>{fmtHHMM(v.reporting)}</td><td>{fmtHHMM(v.gate)}</td></tr>)}</tbody>
            </table>
          </div>
          <p>Timings follow last year’s pattern; your admit card shows the exact times for your slot.{city?.fog ? ` Late-November mornings in ${city.name} are often foggy or smoggy, so morning-slot students should leave 20 to 30 minutes early.` : ""}</p>
          <h2>Questions about {centre.name}</h2>
          {faqs.map((x) => <details key={x.q} className={s.faq}><summary>{x.q}</summary><p>{x.a}</p></details>)}
          {others.length > 0 && (
            <>
              <h2>Other CAT centres in {centre.city}</h2>
              <div className={s.centreList}>{others.map((o) => <Link key={o.slug} href={`${CENTRES_PATH}/${centre.city_slug}/${o.slug}`} className={s.centreItem}><div className={s.centreName}>{o.name}</div></Link>)}</div>
            </>
          )}
        </article>
        <div className={s.disclaimer}>⚠️ Address as printed on a student’s CAT admit card. Reviews are students’ own experiences. Always go by your own admit card and iimcat.ac.in.</div>
      </div>
    </AppShell>
  );
}

function ReviewForm({ centreId, cat2026Open }) {
  const [f, setF] = useState({ exam: "", slot: "", overall: 0, labTemp: "", systemLag: "", noise: "", frisking: "", reachTip: "", comment: "", name: "", phone: "" });
  const [state, setState] = useState({ busy: false, err: "", ok: false });
  useEffect(() => { setF((x) => ({ ...x, exam: cat2026Open ? "CAT 2026" : "CAT 2025" })); }, [cat2026Open]);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const exams = [...(cat2026Open ? ["CAT 2026"] : []), "CAT 2025", "CAT 2024", "Another exam at this centre"];
  const Choice = ({ k, opts }) => (
    <div className={s.choice}>{opts.map(([v, l]) => <button key={v} type="button" className={`${s.choiceBtn} ${f[k] === v ? s.choiceOn : ""}`} onClick={() => set(k, f[k] === v ? "" : v)}>{l}</button>)}</div>
  );
  const submit = async () => {
    setState({ busy: true, err: "", ok: false });
    if (/^[6-9]\d{9}$/.test(f.phone) && f.name.trim().length > 1) sendLeadToCrm({ name: f.name.trim(), phone: f.phone }, "register-cat-centre-review");
    try {
      const r = await fetch("/api/cat-centre-review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ centreId, ...f }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save.");
      setState({ busy: false, err: "", ok: true });
    } catch (e) {
      setState({ busy: false, err: e.message, ok: false });
    }
  };
  if (state.ok) return <div className={`${s.card} ${s.cardGold}`} id="review"><h2 className={s.cardTitle}>Thank you!</h2><p className={s.cardSub}>Your review is live. It will help students taking CAT here this year.</p></div>;
  return (
    <div className={s.card} id="review">
      <h2 className={s.cardTitle}>Review this centre</h2>
      <p className={s.cardSub}>{cat2026Open ? "Took CAT 2026 here? Tell the next slot what to expect." : "CAT 2026 reviews open after slot 1 on 29 November. Took an earlier exam here? Share it now."}</p>
      <div className={s.form}>
        <div className={s.row2}>
          <div className={s.field}><span className={s.label}>Which exam?</span><select className={s.select} value={f.exam} onChange={(e) => set("exam", e.target.value)}>{exams.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className={s.field}><span className={s.label}>Slot <span className={s.opt}>(optional)</span></span><select className={s.select} value={f.slot} onChange={(e) => set("slot", e.target.value)}><option value="">Not sure</option><option value="1">Slot 1</option><option value="2">Slot 2</option><option value="3">Slot 3</option></select></div>
        </div>
        <div className={s.field}><span className={s.label}>Overall</span><div className={s.stars}>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-label={`${n} stars`} className={`${s.star} ${f.overall >= n ? s.starOn : ""}`} onClick={() => set("overall", n)}>★</button>)}</div></div>
        <div className={s.field}><span className={s.label}>Lab temperature</span><Choice k="labTemp" opts={[["cold", "Cold"], ["fine", "Fine"], ["hot", "Hot"]]} /></div>
        <div className={s.field}><span className={s.label}>Computer lag</span><Choice k="systemLag" opts={[["none", "None"], ["some", "Some"], ["bad", "Bad"]]} /></div>
        <div className={s.field}><span className={s.label}>Noise</span><Choice k="noise" opts={[["quiet", "Quiet"], ["some", "Some"], ["noisy", "Noisy"]]} /></div>
        <div className={s.field}><span className={s.label}>Frisking</span><Choice k="frisking" opts={[["relaxed", "Relaxed"], ["normal", "Normal"], ["strict", "Strict"]]} /></div>
        <label className={s.field}><span className={s.label}>How to reach / parking tip <span className={s.opt}>(optional)</span></span><input className={s.input} value={f.reachTip} onChange={(e) => set("reachTip", e.target.value)} maxLength={200} placeholder="e.g. Autos from Panki station; gate is on the back road" /></label>
        <label className={s.field}><span className={s.label}>Your experience <span className={s.opt}>(optional)</span></span><textarea className={s.textarea} value={f.comment} onChange={(e) => set("comment", e.target.value)} maxLength={600} /></label>
        <div className={s.row2}>
          <label className={s.field}><span className={s.label}>Your name</span><input className={s.input} value={f.name} onChange={(e) => set("name", e.target.value)} /></label>
          <label className={s.field}><span className={s.label}>Mobile <span className={s.opt}>(not shown)</span></span><input className={s.input} value={f.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(-10))} inputMode="numeric" /></label>
        </div>
        {state.err && <div className={s.err}>{state.err}</div>}
        <button type="button" className={s.btn} onClick={submit} disabled={state.busy}>{state.busy ? "Posting…" : "Post review"}</button>
        <p className={s.note}>Shown as first name and initial. Your number is never shown.</p>
      </div>
    </div>
  );
}
