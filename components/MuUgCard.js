// A quiet, one-card nudge for UG aspirants: Masters' Union UG programmes as a backup option.
// Countdown is worked out in the browser so cached pages never show a stale number.
import { useEffect, useState } from "react";
import s from "./MuUgCard.module.css";
import { MU_PROGRAMMES, muHref, muDeadline } from "../lib/muUg";

export default function MuUgCard({ src = "site", title, text, style }) {
  const [dl, setDl] = useState(null);
  useEffect(() => { setDl(muDeadline()); }, []);
  return (
    <aside className={s.box} style={style}>
      <div className={s.head}>
        <p className={s.title}>{title || "Keeping a backup to the IIMs?"}</p>
        {dl && <span className={dl.open && dl.days <= 7 ? s.dateHot : s.date}>{dl.line}</span>}
      </div>
      <p className={s.text}>{text || "Masters' Union, Gurugram has 4-year UG programmes with its own online test. Apply now so you have an option in hand when IPMAT results come."}</p>
      <div className={s.chips}>
        {MU_PROGRAMMES.map((p) => (
          <a key={p.slug} className={s.chip} href={muHref(p.slug, src)} target="_blank" rel="noopener sponsored">{p.label} ↗</a>
        ))}
      </div>
      <p className={s.fine}>Referral links · you apply on the official Masters&apos; Union site</p>
    </aside>
  );
}
