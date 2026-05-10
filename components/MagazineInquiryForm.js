// Inline lead-capture form for magazine reader pages.
// Sends to /api/magazine-inquiry which writes to Supabase.
// Mobile-first, dark + orange styling, inline validation, success state,
// and a honeypot field for casual spam protection.

import { useState } from 'react';

const TARGET_YEARS = [
  { value: '2026',      label: 'IPMAT 2026 (this year)' },
  { value: '2027',      label: 'IPMAT 2027' },
  { value: '2028',      label: 'IPMAT 2028' },
  { value: '2029',      label: 'IPMAT 2029' },
  { value: 'exploring', label: 'Just exploring / not sure yet' },
];

export default function MagazineInquiryForm({ blog }) {
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', target_year: '', hp: '',
  });
  const [status, setStatus] = useState({ state: 'idle', msg: '' });

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (status.state === 'submitting') return;

    // Lightweight client-side checks (server re-validates)
    const name        = form.name.trim();
    const email       = form.email.trim();
    const mobile      = form.mobile.replace(/[^\d]/g, '');
    const target_year = form.target_year;

    if (name.length < 2) return setStatus({ state: 'error', msg: 'Please enter your name.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      return setStatus({ state: 'error', msg: 'Please enter a valid email.' });
    if (mobile.length < 10) return setStatus({ state: 'error', msg: 'Please enter a 10-digit mobile.' });
    if (!target_year) return setStatus({ state: 'error', msg: 'Pick your IPMAT target year.' });

    setStatus({ state: 'submitting', msg: '' });
    try {
      const r = await fetch('/api/magazine-inquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name, email, mobile, target_year,
          blog_slug:     blog?.slug,
          blog_title:    blog?.title,
          blog_category: blog?.category,
          hp:            form.hp,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'Submission failed.');

      setStatus({ state: 'success', msg: '' });
      setForm({ name: '', email: '', mobile: '', target_year: '', hp: '' });
    } catch (err) {
      setStatus({ state: 'error', msg: err.message || 'Something went wrong.' });
    }
  }

  if (status.state === 'success') {
    return (
      <aside
        className="mt-14 rounded-2xl p-7 sm:p-9 border text-center"
        style={{
          borderColor: 'rgba(249,160,27,0.45)',
          background: 'linear-gradient(135deg, rgba(249,160,27,0.10), rgba(249,160,27,0.02))',
        }}
      >
        <div className="text-4xl mb-3">🎯</div>
        <h3 className="text-2xl font-extrabold text-[#f1f5f9]">You're on the list, future IIMer.</h3>
        <p className="mt-2 text-[#94a3b8] text-[15px] leading-relaxed">
          A counsellor will reach out within 24 hours with a personalised IPMAT roadmap based on your target year.
        </p>
        <p className="mt-4 text-xs text-[#64748b]">
          In a hurry? WhatsApp us at <a href="https://wa.me/918299470392" className="text-[#f9a01b] font-semibold hover:underline" target="_blank" rel="noopener noreferrer">+91 82994 70392</a>.
        </p>
      </aside>
    );
  }

  const inputCls =
    'w-full bg-[#0f1117] border border-[#1e2533] focus:border-[#f9a01b] focus:outline-none ' +
    'text-[#f1f5f9] placeholder-[#64748b] rounded-xl px-4 py-3 text-sm transition-colors';

  return (
    <aside
      className="mt-14 rounded-2xl p-6 sm:p-8 border"
      style={{
        borderColor: 'rgba(249,160,27,0.30)',
        background: 'linear-gradient(135deg, rgba(249,160,27,0.06), rgba(249,160,27,0.0))',
      }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="text-3xl">📬</div>
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f9a01b]">FREE COUNSELLING · NO SPAM</span>
          <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-[#f1f5f9] leading-tight">
            Want a personalised IPMAT roadmap?
          </h3>
          <p className="mt-1 text-sm text-[#94a3b8]">
            Drop your details — a real counsellor (not a bot) will call within 24 hours with a plan tailored to your target year.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3" noValidate>
        {/* Honeypot — hidden from humans, bots fill it */}
        <input
          type="text" name="website" tabIndex="-1" autoComplete="off"
          value={form.hp} onChange={e => set('hp', e.target.value)}
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
          aria-hidden="true"
        />

        <div className="sm:col-span-1">
          <label className="block text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
            Your Name
          </label>
          <input
            type="text" required maxLength={100} placeholder="e.g. Ananya Sharma"
            value={form.name} onChange={e => set('name', e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-1">
          <label className="block text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
            Mobile
          </label>
          <input
            type="tel" required maxLength={15} placeholder="10-digit mobile" inputMode="numeric"
            value={form.mobile} onChange={e => set('mobile', e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-1">
          <label className="block text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            type="email" required maxLength={200} placeholder="you@example.com"
            value={form.email} onChange={e => set('email', e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-1">
          <label className="block text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1.5">
            IPMAT Target Year
          </label>
          <select
            required value={form.target_year} onChange={e => set('target_year', e.target.value)}
            className={inputCls + ' appearance-none cursor-pointer'}
          >
            <option value="" disabled>Pick your target year</option>
            {TARGET_YEARS.map(y => (
              <option key={y.value} value={y.value}>{y.label}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
          <button
            type="submit"
            disabled={status.state === 'submitting'}
            className="flex-1 bg-[#f9a01b] hover:bg-[#e08e15] disabled:opacity-60 text-[#0a0c14] font-extrabold py-3 px-6 rounded-xl text-sm tracking-wide transition-colors shadow-[0_8px_20px_-8px_rgba(249,160,27,0.6)]"
          >
            {status.state === 'submitting' ? 'Sending…' : 'Get my free roadmap →'}
          </button>
          <span className="text-[11px] text-[#64748b] text-center sm:text-left">
            🔒 Your info stays with us. Zero spam. Unsubscribe anytime.
          </span>
        </div>

        {status.state === 'error' && (
          <div className="sm:col-span-2 text-[13px] font-semibold rounded-lg px-3 py-2 mt-1"
               style={{ color: '#fb7185', background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.3)' }}>
            {status.msg}
          </div>
        )}
      </form>
    </aside>
  );
}
