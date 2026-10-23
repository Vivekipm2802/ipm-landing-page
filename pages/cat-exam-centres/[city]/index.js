import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import AppShell from "../../../components/AppShell";
import s from "../../CatPlanner.module.css";
import { CAT_CITIES } from "../../../lib/catCities";
import { SLOTS, CENTRES_PATH, PLANNER_PATH, SITE, cityBySlug, fmtHHMM } from "../../../lib/catPlanner";

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const slug = String(params.city || "");
  let city = cityBySlug(slug);
  let centres = [], plans = 0, weather = null;
  try {
    const { catDb, lastCatDayWeather, safe } = await import("../../../lib/catPlannerServer");
    const db = catDb();
    const { data } = await db.from("cat_centres").select("id, slug, name, address, pincode, city, state").eq("city_slug", slug).order("name");
    centres = data || [];
    if (!city && !centres.length) return { notFound: true, revalidate: 600 };
    if (!city) city = { slug, name: centres[0].city, state: centres[0].state || "", aliases: [centres[0].city], fog: false, unofficial: true };
    const { count } = await db.from("cat_planner").select("id", { count: "exact", head: true }).eq("city_slug", slug);
    plans = count || 0;
    if (centres.length) {
      const ids = centres.map((c) => c.id);
      const { data: pc } = await db.from("cat_planner").select("centre_id").in("centre_id", ids);
      const byId = {};
      (pc || []).forEach((r) => { byId[r.centre_id] = (byId[r.centre_id] || 0) + 1; });
      centres = centres.map((c) => ({ ...c, students: byId[c.id] || 0 }));
    }
    if (city.lat) weather = await safe(() => lastCatDayWeather(city.lat, city.lng), null);
  } catch {
    if (!city) return { notFound: true, revalidate: 600 };
  }
  return { props: { city, centres, plans, weather }, revalidate: 3600 };
}

export default function CityPage({ city, centres, plans, weather }) {
  const url = `${SITE}${CENTRES_PATH}/${city.slug}`;
  const sameState = CAT_CITIES.filter((c) => c.state === city.state && c.slug !== city.slug);
  const twin = city.aliases && city.aliases.length > 2 ? city.aliases.filter((a) => a !== city.name && !/\(/.test(a)) : [];
  const n = centres.length;

  const faqs = [
    { q: `How many CAT exam centres are there in ${city.name}?`, a: n ? `Students using our planner have added ${n} CAT 2026 centre${n > 1 ? "s" : ""} in ${city.name} so far: ${centres.slice(0, 6).map((c) => c.name).join("; ")}${n > 6 ? " and more" : ""}. The list grows as more admit cards are uploaded after 4 November.` : `${city.name} is one of the 162 official CAT 2026 test cities. The exact centres appear on admit cards from 4 November 2026; this page lists each one as students add it.` },
    { q: `What is the reporting time at CAT centres in ${city.name}?`, a: `Reporting times are the same across India and are printed on your admit card. Going by last year's pattern: 7:00 AM for the 8:30 AM slot, 11:00 AM for the 12:30 PM slot and 3:00 PM for the 4:30 PM slot. The gate closes 15 minutes before the exam starts.` },
    { q: `Can I change my CAT test centre in ${city.name}?`, a: "No. Requests to change the test centre are not accepted once the admit card is issued, so plan your route early." },
    ...(city.fog ? [{ q: `Is fog a problem for the CAT morning slot in ${city.name}?`, a: `Late-November mornings in ${city.name} are often foggy or smoggy, which slows traffic. If you have the morning slot, leave 20 to 30 minutes earlier than your usual travel time; our planner adds this buffer automatically.` }] : []),
  ];
  const w7 = weather?.slots?.[0];
  const ld = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "CAT 2026 Exam Centres", item: `${SITE}${CENTRES_PATH}` },
      { "@type": "ListItem", position: 2, name: `CAT exam centre in ${city.name}`, item: url },
    ] },
  ];

  return (
    <AppShell activePage={CENTRES_PATH} pageTitle={`CAT Exam Centre in ${city.name}`}>
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </Head>
      <NextSeo
        title={`CAT Exam Centre in ${city.name} 2026: Centre List, Address & Reporting Time`}
        description={`CAT 2026 exam centres in ${city.name}${city.state ? `, ${city.state}` : ""}: ${n ? `${n} centre${n > 1 ? "s" : ""} with address, map, nearest station, parking and reviews` : "centre list from admit cards (out 4 Nov), reporting times, how to reach and what to carry"}. Exam on 29 Nov 2026.`}
        canonical={url}
        noindex={Boolean(city.unofficial)}
        openGraph={{ url, title: `CAT 2026 exam centres in ${city.name}`, siteName: "IPM Careers" }}
        additionalMetaTags={[{ name: "keywords", content: `CAT exam centre in ${city.name}, CAT 2026 test centre ${city.name}, CAT centre ${city.name} address, CAT exam centre list ${city.state || ""}` }]}
      />
      <div className={s.page}>
        <div className={s.wrap}>
          <div className={s.crumbs}><Link href={CENTRES_PATH}>CAT exam centres</Link> › {city.state ? `${city.state} › ` : ""}{city.name}</div>
        </div>
        <section className={s.hero} style={{ paddingTop: "1.2rem" }}>
          <h1 className={s.title}>CAT Exam Centre in {city.name}. <span className={s.accent}>{n ? `${n} centre${n > 1 ? "s" : ""} added so far.` : "Centres appear here from 4 November."}</span></h1>
          <p className={s.sub}>{city.unofficial ? "" : `${city.name} is an official CAT 2026 test city${city.state ? ` in ${city.state}` : ""}. `}{twin.length ? `It covers ${twin.join(", ")}. ` : ""}The exam is on Sunday, 29 November 2026.</p>
          <div className={s.stats}>
            <div className={s.stat}><div className={s.statNum}>{n}</div><div className={s.statLabel}>centres added</div></div>
            {plans > 0 && <div className={s.stat}><div className={s.statNum}>{plans.toLocaleString("en-IN")}</div><div className={s.statLabel}>students planning here</div></div>}
          </div>
        </section>

        <div className={s.wrap}>
          <div className={`${s.card} ${s.cardGold}`}>
            <div className={s.cta}>
              <div><div className={s.tlTitle}>Taking CAT in {city.name}?</div><div className={s.note}>Upload your admit card for your leave-by time, route, cab links and reminders. It also adds your centre here.</div></div>
              <Link href={PLANNER_PATH} className={s.btn}>Plan my exam day →</Link>
            </div>
          </div>

          <div className={s.card}>
            <h2 className={s.cardTitle}>CAT 2026 centres in {city.name}</h2>
            {n ? (
              <div className={s.centreList} style={{ marginTop: 10 }}>
                {centres.map((c) => (
                  <Link key={c.id} href={`${CENTRES_PATH}/${city.slug}/${c.slug}`} className={s.centreItem}>
                    <div className={s.centreName}>{c.name}</div>
                    {c.address && <div className={s.centreAddr}>{c.address}</div>}
                    {c.students > 0 && <div className={s.centreMeta}><span className={s.pill}>{c.students} student{c.students > 1 ? "s" : ""} planning</span></div>}
                  </Link>
                ))}
              </div>
            ) : (
              <p className={s.cardSub}>No centre added yet. Admit cards come out on 4 November 2026; the first student to upload one from {city.name} adds the first centre.</p>
            )}
          </div>

          {w7 && (
            <div className={s.card}>
              <h2 className={s.cardTitle}>What CAT day was like here last year</h2>
              <p className={s.cardSub}>Recorded weather and air quality in {city.name} on CAT 2025 day (30 November 2025), at each slot’s reporting time.</p>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Reporting time</th><th>Temperature</th><th>Humidity</th><th>Air quality (US AQI)</th></tr></thead>
                  <tbody>
                    {weather.slots.map((x, i) => (
                      <tr key={x.hour}><td>{fmtHHMM(SLOTS[i + 1].reporting)} (Slot {i + 1})</td><td>{x.temp != null ? `${Math.round(x.temp)}°C` : "–"}</td><td>{x.humidity != null ? `${Math.round(x.humidity)}%` : "–"}</td><td>{x.aqi != null ? Math.round(x.aqi) : "–"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={s.note}>Source: Open-Meteo historical weather and CAMS air quality data, for the city centre.</p>
              {city.fog && <div className={s.warn}>🌫️ Morning-slot students: late-November mornings in {city.name} are often foggy or smoggy. Leave 20 to 30 minutes earlier.</div>}
            </div>
          )}
        </div>

        <article className={s.article}>
          <h2>Reporting time and gate closing time</h2>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Slot</th><th>Exam</th><th>Reporting</th><th>Gate closes</th></tr></thead>
              <tbody>{Object.entries(SLOTS).map(([k, v]) => <tr key={k}><td>{v.label}</td><td>{fmtHHMM(v.start)} to {fmtHHMM(v.end)}</td><td>{fmtHHMM(v.reporting)}</td><td>{fmtHHMM(v.gate)}</td></tr>)}</tbody>
            </table>
          </div>
          <p>Timings follow last year’s pattern. Your admit card shows the exact times for your slot.</p>
          <h2>Questions about CAT centres in {city.name}</h2>
          {faqs.map((x) => <details key={x.q} className={s.faq}><summary>{x.q}</summary><p>{x.a}</p></details>)}
          {sameState.length > 0 && (
            <>
              <h2>Other CAT 2026 test cities in {city.state}</h2>
              <div className={s.cityGrid}>{sameState.map((c) => <Link key={c.slug} href={`${CENTRES_PATH}/${c.slug}`} className={s.cityLink}>{c.name}</Link>)}</div>
            </>
          )}
        </article>
        <div className={s.disclaimer}>⚠️ Centre details are added by students from their admit cards. Always go by your own admit card and iimcat.ac.in.</div>
      </div>
    </AppShell>
  );
}
