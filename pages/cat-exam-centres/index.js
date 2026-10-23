import { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import AppShell from "../../components/AppShell";
import s from "../CatPlanner.module.css";
import { CAT_CITIES } from "../../lib/catCities";
import { STATES, CENTRES_PATH, PLANNER_PATH, SITE } from "../../lib/catPlanner";

const PAGE_URL = `${SITE}${CENTRES_PATH}`;

const FAQS = [
  { q: "How many test cities are there for CAT 2026?", a: "CAT 2026 is held in 162 test cities across India, listed state by state on iimcat.ac.in under Exam Cities. Some entries cover twin cities, such as Faridabad-Gurugram, Chandigarh-Mohali and NOIDA-Greater Noida-Ghaziabad." },
  { q: "When will I know my CAT 2026 test centre?", a: "Your exact test centre, its address and your slot are printed on the CAT 2026 admit card, which you can download from 4 November 2026 on iimcat.ac.in." },
  { q: "Can I change my CAT test centre?", a: "No. CAT admit cards state that requests to change the test centre are not entertained. If your centre is far from home, plan the trip early and consider staying nearby the night before." },
  { q: "Where do these centre pages come from?", a: "Students add their centre when they upload their admit card to the CAT Exam Day Planner. Each centre gets a page with its address, map, nearest railway and metro stations, parking and reviews from students who took an exam there." },
  { q: "Are most CAT exam centres TCS iON Digital Zones?", a: "Many CAT centres are TCS iON Digital Zones or college computer labs run with TCS iON. The admit card gives the exact name and address of yours." },
];

export async function getStaticProps() {
  let counts = {};
  try {
    const { catDb, cityCounts } = await import("../../lib/catPlannerServer");
    counts = await cityCounts(catDb());
  } catch {}
  return { props: { counts, builtAt: new Date().toISOString() }, revalidate: 3600 };
}

export default function CatExamCentres({ counts }) {
  const [q, setQ] = useState("");
  const totalCentres = Object.values(counts).reduce((n, c) => n + (c.centres || 0), 0);
  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    return STATES.map((st) => ({
      st,
      cities: CAT_CITIES.filter((c) => c.state === st && (!t || c.name.toLowerCase().includes(t) || st.toLowerCase().includes(t) || c.aliases.some((a) => a.toLowerCase().includes(t)))),
    })).filter((g) => g.cities.length);
  }, [q]);

  const ld = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "CAT Exam Day Planner", item: `${SITE}${PLANNER_PATH}` },
      { "@type": "ListItem", position: 2, name: "CAT 2026 Exam Centres", item: PAGE_URL },
    ] },
    { "@context": "https://schema.org", "@type": "ItemList", name: "CAT 2026 test cities", numberOfItems: CAT_CITIES.length,
      itemListElement: CAT_CITIES.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: `CAT exam centre in ${c.name}`, url: `${PAGE_URL}/${c.slug}` })) },
  ];

  return (
    <AppShell activePage={CENTRES_PATH} pageTitle="CAT 2026 Exam Centres">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </Head>
      <NextSeo
        title="CAT 2026 Exam Centres: All 162 Test Cities, Centre Address & Reviews"
        description="CAT 2026 exam centre list for all 162 test cities, state-wise. Find your centre's address, map, nearest railway and metro station, parking and student reviews. Admit cards out 4 Nov."
        canonical={PAGE_URL}
        openGraph={{ url: PAGE_URL, title: "CAT 2026 Exam Centres: 162 test cities, addresses and reviews", description: "State-wise CAT 2026 test cities with centre addresses, maps and reviews from students.", siteName: "IPM Careers" }}
        additionalMetaTags={[{ name: "keywords", content: "CAT exam centres 2026, CAT 2026 test centre list, CAT test cities 2026, CAT exam centre list state wise, CAT exam centre address, CAT centre review, TCS iON digital zone CAT" }]}
      />
      <div className={s.page}>
        <section className={s.hero}>
          <span className={s.eyebrow}><span className={s.pulse} /> Official list from iimcat.ac.in</span>
          <h1 className={s.title}>CAT 2026 Exam Centres. <span className={s.accent}>All 162 test cities, with centre addresses and reviews.</span></h1>
          <p className={s.sub}>Pick your city to see the CAT centres students have added, how to reach each one, where to park, and what the lab was like.</p>
          <div className={s.stats}>
            <div className={s.stat}><div className={s.statNum}>162</div><div className={s.statLabel}>test cities</div></div>
            <div className={s.stat}><div className={s.statNum}>{STATES.length}</div><div className={s.statLabel}>states and UTs</div></div>
            {totalCentres > 0 && <div className={s.stat}><div className={s.statNum}>{totalCentres}</div><div className={s.statLabel}>centres mapped</div></div>}
          </div>
        </section>

        <div className={s.wrap}>
          <div className={`${s.card} ${s.cardGold}`}>
            <div className={s.cta}>
              <div><div className={s.tlTitle}>Got your admit card?</div><div className={s.note}>Upload it to add your centre and get your exam day plan.</div></div>
              <Link href={PLANNER_PATH} className={s.btn}>Open the Exam Day Planner →</Link>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <input className={s.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your city or state (e.g. Kanpur, Kerala)" aria-label="Search CAT test cities" />
          </div>
          {groups.map((g) => (
            <div key={g.st} className={s.stateBlock}>
              <div className={s.stateName}>{g.st}</div>
              <div className={s.cityGrid}>
                {g.cities.map((c) => {
                  const n = counts[c.slug]?.centres || 0;
                  return (
                    <Link key={c.slug} href={`${CENTRES_PATH}/${c.slug}`} className={s.cityLink}>
                      <span>{c.name}</span>{n > 0 && <span className={s.cityCount}>{n} centre{n > 1 ? "s" : ""}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          {!groups.length && <p className={s.note} style={{ marginTop: 16 }}>No CAT 2026 test city matches “{q}”. Twin cities are listed together, for example Faridabad-Gurugram.</p>}
        </div>

        <article className={s.article}>
          <h2>How CAT 2026 test centres work</h2>
          <p>When you registered for CAT 2026 you chose your preferred test cities. The IIMs then allot a centre in one of them, and you see it for the first time on your admit card on 4 November 2026. Centres are mostly TCS iON Digital Zones and college computer labs. The exam is on Sunday, 29 November 2026, in three slots, and the centre cannot be changed once allotted.</p>
          <h2>CAT exam centre: frequently asked questions</h2>
          {FAQS.map((x) => <details key={x.q} className={s.faq}><summary>{x.q}</summary><p>{x.a}</p></details>)}
        </article>
        <div className={s.disclaimer}>⚠️ City list as published on iimcat.ac.in (read 23 Oct 2026). Centre details are added by students from their admit cards; always go by your own admit card.</div>
      </div>
    </AppShell>
  );
}
