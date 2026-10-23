// CAT scorecard + detailed report. Used on /cat-score-calculator (right after scoring) and /cat-report/[uid].
import { useState } from "react";
import Link from "next/link";
import s from "./IimbScorecard.module.css";
import { SECTIONS, MAX_SCORE } from "../lib/catScoring";
import { predictAll } from "../lib/catPercentile";

const SITE = "https://register.ipmcareer.com";
const WHATSAPP_HELP = "https://wa.me/918299470392?text=" + encodeURIComponent("CAT - I just checked my CAT score. Please guide me on next steps (WAT-PI and MBA forms).");
const fmtPct = (x) => (x == null ? "–" : x >= 99.99 ? "99.99+" : x.toFixed(2));

function Ring({ value, max, size = 168, stroke = 14 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={s.ring} aria-hidden="true">
      <defs><linearGradient id="catRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffe9c4" /><stop offset="45%" stopColor="#ffbe5c" /><stop offset="100%" stopColor="#f9a01b" /></linearGradient></defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(236,232,225,0.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#catRing)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} className={s.ringArc} />
    </svg>
  );
}
function Donut({ c, w, u, size = 64 }) {
  const total = Math.max(1, c + w + u), r = size / 2 - 6, C = 2 * Math.PI * r, seg = (n) => (n / total) * C;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(236,232,225,0.12)" strokeWidth="9" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#4ade80" strokeWidth="9" strokeDasharray={`${seg(c)} ${C}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f87171" strokeWidth="9" strokeDasharray={`${seg(w)} ${C}`} strokeDashoffset={-seg(c)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}

async function makeStoryCard({ name, result, pred, rank, count, year }) {
  const W = 1080, H = 1350, cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d");
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#0b0b0c"); g.addColorStop(0.55, "#17110a"); g.addColorStop(1, "#3a2408");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const glow = x.createRadialGradient(W * 0.82, 150, 10, W * 0.82, 150, 540); glow.addColorStop(0, "rgba(249,160,27,0.35)"); glow.addColorStop(1, "rgba(249,160,27,0)");
  x.fillStyle = glow; x.fillRect(0, 0, W, H);
  const sans = "Inter, 'Helvetica Neue', Arial, sans-serif", serif = "Fraunces, Georgia, serif";
  x.fillStyle = "#f9a01b"; x.font = `700 34px ${sans}`; x.fillText(`CAT ${year || ""} · SCORECARD`.replace("  ", " "), 80, 130);
  x.fillStyle = "#f4f1ea"; x.font = `600 58px ${serif}`;
  const first = String(name || "").split(" ")[0];
  x.fillText(first ? `${first}'s score` : "My score", 80, 250);
  const cx = 540, cy = 520, R = 180;
  x.lineWidth = 32; x.strokeStyle = "rgba(236,232,225,0.10)"; x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.stroke();
  const rg = x.createLinearGradient(cx - R, cy - R, cx + R, cy + R); rg.addColorStop(0, "#ffe9c4"); rg.addColorStop(1, "#f9a01b");
  x.strokeStyle = rg; x.lineCap = "round"; x.beginPath(); x.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.001, Math.min(1, result.total / MAX_SCORE))); x.stroke();
  x.textAlign = "center"; x.fillStyle = "#f9a01b"; x.font = `700 140px ${serif}`; x.fillText(String(result.total), cx, cy + 38);
  x.fillStyle = "#9a958c"; x.font = `500 36px ${sans}`; x.fillText(`out of ${MAX_SCORE}`, cx, cy + 96);
  if (pred && pred.overall.main != null && !pred.overall.below) {
    x.fillStyle = "rgba(249,160,27,0.16)"; x.beginPath(); x.roundRect ? x.roundRect(290, 745, 500, 92, 46) : x.rect(290, 745, 500, 92); x.fill();
    x.fillStyle = "#ffe9c4"; x.font = `700 44px ${sans}`; x.fillText(`~${fmtPct(pred.overall.main)} %ile*`, cx, 806);
  }
  x.textAlign = "left";
  SECTIONS.forEach((sec, i) => {
    const y = 920 + i * 100, d = result.sections[sec.key];
    x.fillStyle = "#cfc9bf"; x.font = `700 32px ${sans}`; x.fillText(sec.short, 80, y);
    x.textAlign = "right"; x.fillStyle = "#f4f1ea"; x.font = `700 34px ${sans}`; x.fillText(`${d.score}/${d.max}`, 1000, y); x.textAlign = "left";
    x.fillStyle = "rgba(236,232,225,0.10)"; x.beginPath(); x.roundRect ? x.roundRect(80, y + 18, 920, 18, 9) : x.rect(80, y + 18, 920, 18); x.fill();
    const fg = x.createLinearGradient(80, 0, 1000, 0); fg.addColorStop(0, "#ffbe5c"); fg.addColorStop(1, "#f9a01b");
    x.fillStyle = fg; const wv = Math.max(0, d.score / d.max) * 920; x.beginPath(); x.roundRect ? x.roundRect(80, y + 18, Math.max(wv, 2), 18, 9) : x.rect(80, y + 18, wv, 18); x.fill();
  });
  x.fillStyle = "#ffbe5c"; x.font = `700 32px ${sans}`;
  const acc = result.correct + result.wrong > 0 ? Math.round((result.correct / (result.correct + result.wrong)) * 100) : 0;
  x.fillText([`${acc}% accuracy`, `${result.correct} correct`, count >= 10 && rank ? `#${rank} of ${count}` : `${result.wrong} wrong`].join("   ·   "), 80, 1235);
  x.fillStyle = "#9a958c"; x.font = `500 24px ${sans}`; x.fillText("*estimate from CAT 2025 data · register.ipmcareer.com/cat-score-calculator", 80, 1290);
  return new Promise((res) => cv.toBlob((b) => res(b), "image/png"));
}

export default function CatScorecard({ name: rawName, category, city, slot, examYear, result, uid, rank, count, warnings, onReset, isReportPage = false }) {
  const name = rawName && rawName === String(rawName).toUpperCase() ? String(rawName).toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) : rawName;
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [openQ, setOpenQ] = useState(null);
  const answers = result.answers || [];
  const secs = SECTIONS.map((x) => ({ ...x, ...result.sections[x.key] }));
  const pred = predictAll({ VARC: secs[0].score, DILR: secs[1].score, QA: secs[2].score });
  const judged = result.correct + result.wrong;
  const accuracy = judged ? Math.round((result.correct / judged) * 100) : 0;
  const attempted = result.correct + result.wrong + (result.pendingKey || 0);
  const mcqWrong = secs.reduce((t, x) => t + (x.mcq?.wrong || 0), 0);
  const tita = secs.reduce((t, x) => ({ a: t.a + (x.tita?.attempted || 0), c: t.c + (x.tita?.correct || 0) }), { a: 0, c: 0 });
  const best = [...secs].sort((a, b) => b.score / b.max - a.score / a.max)[0];
  const topPct = rank && count ? Math.max(1, Math.round((rank / count) * 100)) : null;
  const reportUrl = uid ? `${SITE}/cat-report/${uid}` : `${SITE}/cat-score-calculator`;
  const first = String(name || "").split(" ")[0];
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2600); };
  const callLink = `/iim-call-predictor?o=${pred.overall.main ?? ""}&v=${pred.VARC.main ?? ""}&d=${pred.DILR.main ?? ""}&q=${pred.QA.main ?? ""}`;
  const shareText = `I scored ${result.total}/${MAX_SCORE} in CAT ${examYear || ""} (VARC ${secs[0].score}, DILR ${secs[1].score}, QA ${secs[2].score}).${pred.overall.main != null && !pred.overall.below ? ` Estimated percentile ~${fmtPct(pred.overall.main)}.` : ""} Check yours free: ${reportUrl}`;

  const shareCard = async () => {
    setBusy(true);
    try {
      const blob = await makeStoryCard({ name, result, pred, rank, count, year: examYear });
      const file = new File([blob], "cat-scorecard.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text: shareText });
      else {
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "cat-scorecard.png"; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        flash("Card downloaded. Post it on your story!");
      }
    } catch (e) { if (e?.name !== "AbortError") flash("Could not create the card. Try the WhatsApp share instead."); }
    finally { setBusy(false); }
  };
  // WhatsApp: on phones, share the PNG + caption through the share sheet (pick WhatsApp).
  // On laptops, wa.me links cannot carry files, so download the card and open WhatsApp with the text + report link.
  const shareWhatsApp = async () => {
    setBusy(true);
    try {
      const blob = await makeStoryCard({ name, result, pred, rank, count, year: examYear });
      const file = new File([blob], "cat-scorecard.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
      } else {
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "cat-scorecard.png"; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
        flash("Scorecard image downloaded: attach it in WhatsApp");
      }
    } catch (e) {
      if (e?.name !== "AbortError") window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
    } finally { setBusy(false); }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(reportUrl); flash("Link copied"); } catch { flash("Long-press the link to copy"); } };
  const tileCls = (r) => (r === "C" || r === "B" ? s.qC : r === "W" ? s.qW : s.qU);

  return (
    <div className={s.wrap}>
      <section className={s.hero}>
        <div className={s.heroTop}>
          <span className={s.kicker}><span className={s.dot} /> CAT {examYear || ""} · Scorecard{slot ? ` · Slot ${slot}` : ""}</span>
          {name && <span className={s.namePill}>👤 {name}</span>}
        </div>
        <div className={s.heroBody}>
          <div className={s.ringWrap}>
            <Ring value={Math.max(0, result.total)} max={MAX_SCORE} />
            <div className={s.ringText}><div className={s.total}>{result.total}</div><div className={s.outOf}>/ {MAX_SCORE}</div></div>
          </div>
          <div className={s.secBars}>
            {secs.map((x) => (
              <div key={x.key} className={s.secRow}>
                <div className={s.secHead}><span>{x.icon} {x.short}</span><b>{x.score}<i>/{x.max}</i></b></div>
                <div className={s.track}><div className={`${s.fill} ${x.score > 0 ? "" : s.fillBad}`} style={{ width: `${Math.max(2, Math.max(0, x.score / x.max) * 100)}%` }} /></div>
              </div>
            ))}
            <div className={s.chips}>
              <span className={s.chip}>✅ {result.correct}</span>
              <span className={s.chip}>❌ {result.wrong}</span>
              <span className={s.chip}>⏭ {result.unattempted}</span>
              <span className={`${s.chip} ${s.chipGold}`}>🎯 {accuracy}%</span>
              {result.pendingKey > 0 && <span className={s.chip}>⏳ {result.pendingKey} awaiting key</span>}
              {category && <span className={s.chip}>{category}</span>}
            </div>
          </div>
        </div>
        <div className={s.heroFoot}>
          {pred.overall.main != null && !pred.overall.below ? (
            <span className={s.rankPill}>📈 Estimated percentile ~{fmtPct(pred.overall.main)}{pred.overall.low !== pred.overall.high ? ` (range ${fmtPct(pred.overall.low)}–${fmtPct(pred.overall.high)})` : ""}</span>
          ) : <span className={s.rankPill}>📈 Estimated percentile: below 55 on CAT 2025 data</span>}
          {rank && count ? <span className={`${s.gate} ${s.gateOk}`}>🏆 #{rank} of {count.toLocaleString("en-IN")}{count >= 10 ? ` · top ${topPct}%` : ""}</span> : null}
        </div>
      </section>

      {(warnings || []).length > 0 && <div className={s.warn}>⚠️ {warnings.join(" ")}</div>}

      <div className={s.shareRow}>
        <button type="button" className={s.btnGold} onClick={shareCard} disabled={busy}>{busy ? "Making your card…" : "📸 Share story card"}</button>
        <button type="button" className={s.btn} onClick={shareWhatsApp} disabled={busy}>💬 WhatsApp + image</button>
        {uid && <button type="button" className={s.btn} onClick={copy}>🔗 Copy link</button>}
        {!isReportPage && uid && <a className={s.btn} href={`/cat-report/${uid}`} target="_blank" rel="noopener noreferrer">📄 Report page</a>}
        <Link className={s.btn} href={callLink}>🎯 IIM calls</Link>
        <button type="button" className={s.btn} onClick={() => window.print()}>🖨️ PDF</button>
        {onReset ? <button type="button" className={s.btn} onClick={onReset}>🔄 Check another</button> : <Link className={s.btn} href="/cat-score-calculator">🎓 Check yours</Link>}
      </div>
      {msg && <div className={s.toast} role="status">{msg}</div>}

      <div className={s.tiles}>
        <div className={s.tile}><div className={s.tileK}>Best section</div><div className={s.tileV}>{best.icon} {best.short}</div><div className={s.tileS}>{best.score}/{best.max} · {best.accuracy}% accuracy</div></div>
        <div className={s.tile}><div className={s.tileK}>Lost to negatives</div><div className={s.tileV}>−{mcqWrong}</div><div className={s.tileS}>{mcqWrong} wrong MCQ{mcqWrong === 1 ? "" : "s"} (TITA has no minus)</div></div>
        <div className={s.tile}><div className={s.tileK}>TITA</div><div className={s.tileV}>{tita.c}<i>/{tita.a}</i></div><div className={s.tileS}>correct of attempted</div></div>
        <div className={s.tile}><div className={s.tileK}>Attempted</div><div className={s.tileV}>{attempted}<i>/68</i></div><div className={s.tileS}>{Math.round((attempted / 68) * 100)}% of the paper</div></div>
      </div>

      <h2 className={s.h2}>Estimated percentile 📈</h2>
      <div className={s.tiles} style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
        <div className={s.tile} style={{ borderColor: "rgba(249,160,27,0.45)" }}><div className={s.tileK}>Overall</div><div className={s.tileV} style={{ color: "#f9a01b" }}>{pred.overall.below ? "<55" : fmtPct(pred.overall.main)}</div><div className={s.tileS}>{pred.rank ? `≈ rank ${pred.rank.toLocaleString("en-IN")}` : "percentile"}</div></div>
        {SECTIONS.map((k) => <div key={k.key} className={s.tile}><div className={s.tileK}>{k.short}</div><div className={s.tileV}>{pred[k.key].below ? "<1" : fmtPct(pred[k.key].main)}</div><div className={s.tileS}>sectional</div></div>)}
      </div>
      <p className={s.note} style={{ textAlign: "left" }}>Estimated from score-to-percentile data students reported after CAT 2025 (and 2024 for the range). The IIMs normalise each slot, so your official percentile can differ. <Link href={callLink} style={{ color: "#f9a01b", fontWeight: 700 }}>See which IIMs this clears →</Link></p>

      <h2 className={s.h2}>Section deep-dive 🔬</h2>
      <div className={s.secGrid}>
        {secs.map((x) => (
          <div key={x.key} className={s.secCard}>
            <div className={s.secCardTop}>
              <div><div className={s.secTitle}>{x.icon} {x.short}</div><div className={s.secName}>{x.name}</div></div>
              <span className={`${s.badge} ${x.score > 0 ? s.badgeOk : s.badgeNo}`}>{x.score > 0 ? "Positive" : "Not positive"}</span>
            </div>
            <div className={s.secMid}><Donut c={x.correct} w={x.wrong} u={x.unattempted + (x.pending || 0)} /><div className={s.secScore}>{x.score}<i>/{x.max}</i></div></div>
            <div className={s.secStats}>
              <span><b className={s.ok}>{x.correct}</b> correct</span>
              <span><b className={s.no}>{x.wrong}</b> wrong</span>
              <span><b>{x.unattempted}</b> skipped</span>
              <span><b>{x.accuracy}%</b> accuracy</span>
              <span>MCQ <b>{x.mcq?.correct || 0}/{x.mcq?.attempted || 0}</b></span>
              <span>TITA <b>{x.tita?.correct || 0}/{x.tita?.attempted || 0}</b></span>
            </div>
          </div>
        ))}
      </div>

      {result.insights?.length > 0 && (
        <>
          <h2 className={s.h2}>What your score tells you 💡</h2>
          <ul className={s.insights}>
            {result.insights.map((ins, i) => (
              <li key={i} className={`${s.insight} ${ins.tone === "good" ? s.insGood : ins.tone === "warn" ? s.insWarn : ""}`}>
                <span>{ins.tone === "good" ? "✅" : ins.tone === "warn" ? "⚠️" : "📌"}</span><span>{ins.text}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {answers.length > 0 && (
        <>
          <h2 className={s.h2}>Question-wise map 🧾</h2>
          <div className={s.card}>
            {SECTIONS.map((sec) => {
              const list = answers.filter((a) => a.s === sec.key);
              if (!list.length) return null;
              return (
                <div key={sec.key} className={s.qBlock}>
                  <div className={s.qLabel}>{sec.short}</div>
                  <div className={s.qGrid}>
                    {list.map((a) => (
                      <button type="button" key={a.n} onClick={() => setOpenQ(openQ === a.n ? null : a.n)} className={`${s.q} ${tileCls(a.r)} ${openQ === a.n ? s.qOpen : ""}`}
                        aria-label={`Question ${a.n}`}>{a.n}{a.t === "TITA" ? "ᵀ" : ""}</button>
                    ))}
                  </div>
                </div>
              );
            })}
            {openQ != null && (() => { const a = answers.find((x) => x.n === openQ); if (!a) return null; const yours = a.t === "TITA" ? a.g : a.c; return <div className={s.qDetail}>Q{a.n} · {a.t === "TITA" ? "TITA" : "MCQ"} · your answer <b>{yours || "–"}</b> · key <b>{a.r === "N" ? "awaited" : a.k || "–"}</b> · {a.m > 0 ? `+${a.m}` : a.m}</div>; })()}
            <div className={s.legend}><span><i style={{ background: "#4ade80" }} />Correct +3</span><span><i style={{ background: "#f87171" }} />Wrong (MCQ −1, TITA 0)</span><span><i style={{ background: "rgba(236,232,225,0.25)" }} />Skipped / key awaited</span><span>ᵀ = TITA</span></div>
          </div>
        </>
      )}

      <div className={s.cta}>
        <div>
          <div className={s.ctaTitle}>Next up{first ? `, ${first}` : ""}: forms, calls and WAT-PI</div>
          <div className={s.ctaText}>Track every MBA form deadline, check which IIMs your percentile clears, and get a WAT-PI plan from our mentors.</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className={s.btn} href="/mba-application-forms">🗓️ MBA forms</Link>
          <a className={s.btnGold} href={WHATSAPP_HELP} target="_blank" rel="noopener noreferrer">📲 WhatsApp us</a>
        </div>
      </div>
      <p className={s.note}>Raw score from your response sheet: +3 correct, −1 wrong MCQ, 0 wrong TITA. Official CAT scores are normalised across slots.{city ? ` · 📍 ${city}` : ""}</p>
    </div>
  );
}
