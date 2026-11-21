// Small details popup used by the CAT tools: the tool asks only for its own inputs,
// then this popup collects name, WhatsApp and email right before showing the result.
import { useEffect, useRef } from "react";
import c from "../pages/CatCalc.module.css";

export default function LeadPopup({ open, onClose, onSubmit, busy, error, values, onChange, title = "Almost there", sub, cta = "Show my result", emailOptional = true, categories = null, categoryLabel = "Category", categoryOptional = true }) {
  const nameRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => nameRef.current?.focus(), 60);
    const esc = (e) => { if (e.key === "Escape" && !busyRef.current) closeRef.current(); };
    window.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(t); window.removeEventListener("keydown", esc); document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;
  const set = (k, v) => onChange({ ...values, [k]: v });

  return (
    <div className={c.back} role="dialog" aria-modal="true" aria-labelledby="lead-popup-title" onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <form className={c.modal} onSubmit={(e) => { e.preventDefault(); onSubmit(); }} noValidate>
        <button type="button" className={c.x} onClick={onClose} disabled={busy} aria-label="Close">×</button>
        <h2 id="lead-popup-title" className={c.modalTitle}>{title}</h2>
        {sub && <p className={c.modalSub}>{sub}</p>}

        <label className={c.label} htmlFor="lp-name">Full name</label>
        <input id="lp-name" ref={nameRef} className={c.input} type="text" placeholder="Your full name" value={values.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />

        <div className={c.row}>
          <div>
            <label className={c.label} htmlFor="lp-phone">WhatsApp number</label>
            <input id="lp-phone" className={c.input} type="tel" inputMode="numeric" placeholder="10-digit number" value={values.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(-10))} autoComplete="tel-national" />
          </div>
          <div>
            <label className={c.label} htmlFor="lp-email">Email{emailOptional && <span className={c.optional}> (optional)</span>}</label>
            <input id="lp-email" className={c.input} type="email" placeholder="you@email.com" value={values.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
          </div>
        </div>

        {categories && (
          <>
            <span className={c.label}>{categoryLabel}{categoryOptional && <span className={c.optional}> (optional)</span>}</span>
            <div className={c.chips} role="radiogroup" aria-label={categoryLabel}>
              {categories.map((cat) => (
                <button key={cat.key} type="button" role="radio" aria-checked={values.category === cat.key} className={`${c.chip} ${values.category === cat.key ? c.chipOn : ""}`} onClick={() => set("category", values.category === cat.key && categoryOptional ? "" : cat.key)}>{cat.label}</button>
              ))}
            </div>
          </>
        )}

        {error && <div className={c.error} role="alert">{error}</div>}

        <button type="submit" className={c.cta} disabled={busy}>{busy ? "Working…" : cta}</button>
        <p className={c.fine}>Free. By continuing you agree to be contacted by IPM Careers about CAT and MBA admissions.</p>
      </form>
    </div>
  );
}
