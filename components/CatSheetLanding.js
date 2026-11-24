// Shared template for /cat-response-sheet-2026 and /cat-answer-key-2026: a plain header, one link box that hands the
// response sheet link to the score calculator, a quiet "tell me when it's out" card, then the article and FAQs.
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import AppShell from "./AppShell";
import { CatAlertsInline } from "./CatAlerts";
import s from "../pages/CatPlanner.module.css";
import t from "../pages/CatTools.module.css";
import c from "../pages/CatCalc.module.css";

const SITE = "https://register.ipmcareer.com";

export default function CatSheetLanding({ path, pageTitle, seoTitle, seoDesc, h1, sub, statusLine, alertTitle, alertText, children, faqs, keywords }) {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [err, setErr] = useState("");
  const url = `${SITE}${path}`;

  const go = (e) => {
    e.preventDefault();
    const raw = link.trim();
    let u;
    try { u = new URL(raw); } catch { return setErr("Paste the full link. It starts with https://cdn.digialm.com/ and ends with .html"); }
    if (!/(^|\.)digialm\.com$/i.test(u.hostname)) return setErr("That is not a CAT response sheet link. It should start with https://cdn.digialm.com/");
    router.push(`/cat-score-calculator?url=${encodeURIComponent(raw)}`);
  };

  const ld = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "CAT 2026 Score Calculator", item: `${SITE}/cat-score-calculator` },
      { "@type": "ListItem", position: 2, name: pageTitle, item: url },
    ] },
  ];

  return (
    <AppShell activePage="/cat-score-calculator" pageTitle={pageTitle}>
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </Head>
      <NextSeo
        title={seoTitle}
        description={seoDesc}
        canonical={url}
        openGraph={{ url, title: seoTitle, description: seoDesc, siteName: "IPM Careers" }}
        additionalMetaTags={[{ name: "keywords", content: keywords }, { name: "robots", content: "index, follow, max-image-preview:large" }]}
      />
      <div className={s.page}>
        <header className={t.head}>
          <h1 className={t.h1}>{h1}</h1>
          <p className={t.sub}>{sub}</p>
        </header>

        <div className={s.narrow}>
          <form className={c.card} onSubmit={go} noValidate>
            <div className={c.counter} style={{ paddingBottom: 14, marginBottom: 16 }}>
              <span className={c.counterLabel}>{statusLine}</span>
            </div>
            <label className={c.label} htmlFor="sheet-link">Have your response sheet? Paste the link</label>
            <input id="sheet-link" className={c.input} type="url" inputMode="url" autoComplete="off" placeholder="https://cdn.digialm.com/..." value={link} onChange={(e) => { setErr(""); setLink(e.target.value); }} />
            {err && <div className={c.error} role="alert">{err}</div>}
            <button type="submit" className={c.cta}>Check my CAT score</button>
            <p className={c.fine}>Free. VARC, DILR, QA and total out of 204, plus your estimated percentile.</p>
          </form>

          <div style={{ marginTop: 16 }}>
            <CatAlertsInline title={alertTitle} text={alertText} />
          </div>
        </div>

        <article className={s.article}>
          {children}
          <h2>Frequently asked questions</h2>
          {faqs.map((x) => <details key={x.q} className={s.faq}><summary>{x.q}</summary><p>{x.a}</p></details>)}
          <p style={{ marginTop: 24 }}>
            Next: <Link href="/cat-score-calculator">CAT score calculator</Link> · <Link href="/cat-percentile-predictor">percentile predictor</Link> · <Link href="/iim-call-predictor">IIM call predictor</Link> · <Link href="/mba-application-forms">MBA forms and deadlines</Link>
          </p>
        </article>
      </div>
    </AppShell>
  );
}
