// "MBA applications open now" card for CAT tools: schools whose forms are open today, with a tracked apply link.
// Status is worked out in the browser so the card never shows a stale "open" from a cached page.
import { useEffect, useState } from "react";
import Link from "next/link";
import { MBA_FORMS, computeStatus, fmtDate } from "../lib/mbaForms";
import { goHref, isPartner, partnerCoupon } from "../lib/partnerLinks";
import c from "./OpenMbaForms.module.css";

export default function OpenMbaForms({ percentile = null, src = "cat-tool", title = "MBA applications open now" }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const now = Date.now();
    setItems(MBA_FORMS
      .filter((f) => isPartner(f.ref))
      .map((f) => ({ ...f, st: computeStatus(f, now) }))
      .filter((f) => f.st.key === "open" || f.st.key === "closing")
      .sort((a, b) => String(a.deadline || "9999").localeCompare(String(b.deadline || "9999"))));
  }, []);
  if (!items.length) return null;
  const p = typeof percentile === "number" && !Number.isNaN(percentile) ? percentile : null;

  return (
    <section className={c.box} aria-label={title}>
      <div className={c.head}>
        <h3 className={c.title}>{title}</h3>
        <Link href="/mba-application-forms" className={c.all}>All MBA deadlines</Link>
      </div>
      <div className={c.list}>
        {items.map((f) => {
          const fits = p != null && f.catMin != null && p >= f.catMin;
          return (
            <a key={f.id} className={c.row} href={goHref(f.ref, src)} target="_blank" rel="noopener noreferrer nofollow">
              <div className={c.main}>
                <div className={c.name}>{f.name.replace(/ \(.*?\)/, "")}</div>
                <div className={c.meta}>
                  {f.deadline ? <span className={f.st.key === "closing" ? c.urgent : ""}>Last date {fmtDate(f.deadline)}</span> : <span>Open · no fixed last date</span>}
                  {partnerCoupon(f.ref) ? <span> · Code <b className={c.code}>{partnerCoupon(f.ref).code}</b>{partnerCoupon(f.ref).text && partnerCoupon(f.ref).text !== "use it while applying" && partnerCoupon(f.ref).text !== "source code" ? ` (${partnerCoupon(f.ref).text})` : ""}</span> : f.catNote && <span> · {f.catNote}</span>}
                </div>
              </div>
              {fits && <span className={c.fit}>Fits ~{Math.floor(p)}</span>}
              <span className={c.go}>Apply ↗</span>
            </a>
          );
        })}
      </div>
      <p className={c.fine}>You apply on the college&apos;s own form. If it asks how you heard about the college, mention IPM Careers.</p>
    </section>
  );
}
