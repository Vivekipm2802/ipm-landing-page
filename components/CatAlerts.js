// CAT 2026 "notify me" alerts: floating bell on every CAT page + an inline card for city/centre pages.
// One sign-up (name, WhatsApp, email) covers admit card, response sheet, answer key and result emails.
import { useEffect, useRef, useState } from "react";
import { sendLeadToCrm } from "../lib/crm";
import { alertPhase } from "../lib/catAlerts";
import s from "./CatAlerts.module.css";

const KEY = "cat-alerts-v1";
const NUDGE_KEY = "cat-alerts-nudge";
const NUDGE_GAP = 3 * 86400000;

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };

function useAlertsState() {
  const [on, setOn] = useState(null);
  useEffect(() => {
    setOn(read());
    const sync = () => setOn(read());
    window.addEventListener("cat-alerts-on", sync);
    return () => window.removeEventListener("cat-alerts-on", sync);
  }, []);
  return on;
}

function SignupForm({ city, source, onDone, compact }) {
  const [f, setF] = useState({ name: "", phone: "", email: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const name = f.name.trim(), email = f.email.trim(), phone = f.phone.replace(/\D/g, "").replace(/^(91|0)(?=[6-9]\d{9}$)/, "");
    if (name.length < 2) return setErr("Please enter your name.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setErr("Please enter a valid 10-digit WhatsApp number.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setErr("Please enter a valid email: alerts go there.");
    setBusy(true);
    sendLeadToCrm({ name, phone, email, city: city?.name || "", target: "CAT 2026" }, `register-cat-alerts-${source}`);
    try {
      const utm = {};
      try { const u = new URLSearchParams(window.location.search); ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid"].forEach((k) => { if (u.get(k)) utm[k] = u.get(k).slice(0, 120); }); } catch {}
      const res = await fetch("/api/cat-alerts-subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, email, city: city?.slug || undefined, page: window.location.pathname, utm: Object.keys(utm).length ? utm : null }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Could not turn on alerts. Please try again.");
      try { localStorage.setItem(KEY, JSON.stringify({ name, email, at: Date.now() })); } catch {}
      window.dispatchEvent(new Event("cat-alerts-on"));
      try { window.gtag && window.gtag("event", "generate_lead", { form: "cat_alerts", source }); } catch {}
      onDone && onDone({ name, email });
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return (
    <form className={`${s.form} ${compact ? s.formRow : ""}`} onSubmit={submit} noValidate>
      <input className={s.input} placeholder="Your name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-label="Your name" />
      <input className={s.input} placeholder="WhatsApp number" inputMode="numeric" autoComplete="tel-national" maxLength={14} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/[^\d+ ]/g, "") })} aria-label="WhatsApp number" />
      <input className={s.input} placeholder="Email" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-label="Email" />
      <button className={s.btn} type="submit" disabled={busy}>{busy ? "Turning on…" : "🔔 Notify me"}</button>
      {err && <div className={s.err} role="alert">{err}</div>}
      <div className={s.fine}>Free. Only CAT 2026 updates; stop anytime from any email.</div>
    </form>
  );
}

function Done({ who }) {
  return (
    <div className={s.done}>
      <div className={s.doneIcon}>✅</div>
      <div><b>Alerts are on{who?.name ? `, ${who.name.split(" ")[0]}` : ""}.</b> We'll email {who?.email || "you"} the minute each one is out. Check your inbox for a confirmation (and Spam, just in case).</div>
    </div>
  );
}

const Perks = () => (
  <ul className={s.perks}>
    <li><span>📄</span>Admit card is out (4 Nov)</li>
    <li><span>📊</span>Response sheet + 1-minute score check</li>
    <li><span>🔑</span>Answer key, then result + IIM calls</li>
  </ul>
);

// Floating bell: every CAT page (mounted from AppShell)
export default function CatAlertsBell() {
  const on = useAlertsState();
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [done, setDone] = useState(null);
  const [phase, setPhase] = useState(null);
  const fired = useRef(false);

  const [hidden, setHidden] = useState(false);
  useEffect(() => { setPhase(alertPhase()); }, []);

  // Step aside while the student is typing in a page form or the inline alerts card is on screen
  useEffect(() => {
    let typing = false, inlineVisible = false;
    const upd = () => setHidden(typing || inlineVisible);
    const isField = (el) => el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
    const fin = (e) => { if (isField(e.target)) { typing = true; upd(); } };
    const fout = () => { setTimeout(() => { typing = isField(document.activeElement); upd(); }, 0); };
    document.addEventListener("focusin", fin);
    document.addEventListener("focusout", fout);
    let io = null;
    const t = setTimeout(() => {
      const el = document.getElementById("cat-alerts");
      if (el && "IntersectionObserver" in window) {
        io = new IntersectionObserver(([en]) => { inlineVisible = en.isIntersecting; upd(); }, { threshold: 0.2 });
        io.observe(el);
      }
    }, 300);
    return () => { clearTimeout(t); io && io.disconnect(); document.removeEventListener("focusin", fin); document.removeEventListener("focusout", fout); };
  }, []);

  // Gentle nudge after 25s or 55% scroll, at most once every 3 days, never if already signed up
  useEffect(() => {
    if (on) return undefined;
    let last = 0;
    try { last = Number(localStorage.getItem(NUDGE_KEY) || 0); } catch {}
    if (Date.now() - last < NUDGE_GAP) return undefined;
    const show = () => {
      if (fired.current || read()) return;
      fired.current = true;
      setNudge(true);
      try { localStorage.setItem(NUDGE_KEY, String(Date.now())); } catch {}
    };
    const t = setTimeout(show, 25000);
    const onScroll = () => {
      const h = document.documentElement;
      if ((h.scrollTop + window.innerHeight) / Math.max(1, h.scrollHeight) > 0.55) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, [on]);

  useEffect(() => {
    if (!open) return undefined;
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  if (!phase) return null;
  const openModal = () => { setNudge(false); setDone(null); setOpen(true); };

  return (
    <>
      {nudge && !on && !open && !hidden && (
        <div className={s.nudge} role="dialog" aria-label="CAT 2026 alerts">
          <button type="button" className={s.nudgeX} onClick={() => setNudge(false)} aria-label="Close">×</button>
          <div className={s.nudgeTitle}>🔔 {phase.title}</div>
          <div className={s.nudgeText}>{phase.lead}</div>
          <button type="button" className={s.btn} onClick={openModal}>Notify me, it's free</button>
        </div>
      )}

      <button type="button" className={`${s.fab} ${on ? s.fabOn : ""} ${hidden && !open ? s.fabHide : ""}`} onClick={on ? () => setOpen(true) : openModal} aria-label={on ? "CAT alerts are on" : "Get CAT 2026 alerts"}>
        <span className={s.fabBell}>{on ? "✓" : "🔔"}</span>
        <span className={s.fabText}>{on ? "Alerts on" : phase.pill}</span>
        {!on && <span className={s.fabDot} />}
      </button>

      {open && (
        <div className={s.back} role="dialog" aria-modal="true" aria-label="CAT 2026 alerts" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className={s.modal}>
            <button type="button" className={s.x} onClick={() => setOpen(false)} aria-label="Close">×</button>
            {on && !done ? (
              <>
                <div className={s.icon}>🔔</div>
                <h2 className={s.title}>Your CAT alerts are on</h2>
                <p className={s.sub}>We'll email {on.email || "you"} the minute the admit card, response sheet, answer key and result are out.</p>
                <button type="button" className={s.linkBtn} onClick={() => { try { localStorage.removeItem(KEY); } catch {} window.dispatchEvent(new Event("cat-alerts-on")); setOpen(true); }}>Use a different number or email</button>
              </>
            ) : done ? (
              <Done who={done} />
            ) : (
              <>
                <div className={s.icon}>🔔</div>
                <h2 className={s.title}>{phase.title}</h2>
                <p className={s.sub}>One email the minute each one is out. No spam.</p>
                <Perks />
                <SignupForm source="bell" onDone={setDone} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Inline card for city / centre / hub pages
export function CatAlertsInline({ city, title, text }) {
  const on = useAlertsState();
  const [done, setDone] = useState(null);
  const [phase, setPhase] = useState(null);
  useEffect(() => { setPhase(alertPhase()); }, []);
  const head = title || (phase?.key === "admit" ? `Get the CAT admit card alert${city ? ` for ${city.name}` : ""}` : phase?.title || "Get CAT 2026 alerts");
  const body = text || (phase?.key === "admit"
    ? `Admit cards come out on 4 November. We'll email you the minute they're out${city ? `, plus the ${city.name} centre list` : ""}, then the response sheet, answer key and result.`
    : phase?.lead || "We'll email you the minute the response sheet, answer key and result are out.");
  return (
    <div className={s.inline} id="cat-alerts">
      <div className={s.inlineHead}>
        <div className={s.inlineIcon}>🔔</div>
        <div>
          <div className={s.inlineTitle}>{head}</div>
          <div className={s.inlineText}>{body}</div>
        </div>
      </div>
      {done ? <Done who={done} /> : on ? (
        <div className={s.done}><div className={s.doneIcon}>✅</div><div><b>Your CAT alerts are on.</b> We'll email {on.email || "you"} the minute each one is out.</div></div>
      ) : (
        <SignupForm city={city} source={city ? "city" : "inline"} onDone={setDone} compact />
      )}
    </div>
  );
}
