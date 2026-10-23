// IIM Bangalore UG scorecard + detailed report. Used on /response-v1 (right after scoring) and /iimb-report/[uid].
import { useMemo, useState } from "react";
import Link from "next/link";
import s from "./IimbScorecard.module.css";
import { SECTIONS, MAX_SCORE } from "../utils/iimbScoring";

const SITE = "https://register.ipmcareer.com";
const WHATSAPP_PI = "https://wa.me/918299470392?text=" + encodeURIComponent("IIMB - I just checked my IIM Bangalore UG score. Help me plan PI prep.");

function Ring({ value, max, size = 168, stroke = 14, label }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={s.ring} role="img" aria-label={label}>
      <defs>
        <linearGradient id="ringGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffe9c4" /><stop offset="45%" stopColor="#ffbe5c" /><stop offset="100%" stopColor="#f9a01b" /></linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(236,232,225,0.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ringGold)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} className={s.ringArc} />
    </svg>
  );
}

function Donut({ c, w, u, size = 64 }) {
  const total = Math.max(1, c + w + u), r = size / 2 - 6, C = 2 * Math.PI * r;
  const seg = (n) => (n / total) * C;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(236,232,225,0.12)" strokeWidth="9" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#4ade80" strokeWidth="9" strokeDasharray={`${seg(c)} ${C}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f87171" strokeWidth="9" strokeDasharray={`${seg(w)} ${C}`} strokeDashoffset={-seg(c)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}

// 1080×1350 image for Instagram / WhatsApp status
async function makeStoryCard({ name, scores, stats, year }) {
  const W = 1080, H = 1350, cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d");
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#0b0b0c"); g.addColorStop(0.55, "#17110a"); g.addColorStop(1, "#3a2408");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const glow = x.createRadialGradient(W * 0.8, 160, 10, W * 0.8, 160, 520);
  glow.addColorStop(0, "rgba(249,160,27,0.35)"); glow.addColorStop(1, "rgba(249,160,27,0)");
  x.fillStyle = glow; x.fillRect(0, 0, W, H);
  const sans = "Inter, 'Helvetica Neue', Arial, sans-serif", serif = "Fraunces, Georgia, serif";
  x.fillStyle = "#f9a01b"; x.font = `700 34px ${sans}`; x.fillText(`IIM BANGALORE UG ${year || ""}`.trim(), 80, 130);
  x.fillStyle = "#cfc9bf"; x.font = `500 30px ${sans}`; x.fillText("SCORECARD", 80, 176);
  x.fillStyle = "#f4f1ea"; x.font = `600 58px ${serif}`;
  const first = String(name || "My").split(" ")[0];
  x.fillText(first === "My" ? "My score" : `${first}'s score`, 80, 330);
  // ring
  const cx = 540, cy = 600, R = 190;
  x.lineWidth = 34; x.strokeStyle = "rgba(236,232,225,0.10)"; x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.stroke();
  const rg = x.createLinearGradient(cx - R, cy - R, cx + R, cy + R); rg.addColorStop(0, "#ffe9c4"); rg.addColorStop(1, "#f9a01b");
  x.strokeStyle = rg; x.lineCap = "round"; x.beginPath();
  x.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.001, Math.min(1, scores.total / MAX_SCORE))); x.stroke();
  x.textAlign = "center"; x.fillStyle = "#f9a01b"; x.font = `700 150px ${serif}`; x.fillText(String(scores.total), cx, cy + 40);
  x.fillStyle = "#9a958c"; x.font = `500 38px ${sans}`; x.fillText(`out of ${MAX_SCORE}`, cx, cy + 100);
  // sections
  x.textAlign = "left";
  SECTIONS.forEach((sec, i) => {
    const y = 900 + i * 110, d = scores.sections[sec.key];
    x.fillStyle = "#cfc9bf"; x.font = `700 32px ${sans}`; x.fillText(sec.short, 80, y);
    x.textAlign = "right"; x.fillStyle = "#f4f1ea"; x.font = `700 36px ${sans}`; x.fillText(`${d.score}/${d.max}`, 1000, y); x.textAlign = "left";
    x.fillStyle = "rgba(236,232,225,0.10)"; x.beginPath(); x.roundRect ? x.roundRect(80, y + 20, 920, 20, 10) : x.rect(80, y + 20, 920, 20); x.fill();
    const fg = x.createLinearGradient(80, 0, 1000, 0); fg.addColorStop(0, "#ffbe5c"); fg.addColorStop(1, "#f9a01b");
    x.fillStyle = fg; x.beginPath(); const wv = Math.max(0, d.score / d.max) * 920; x.roundRect ? x.roundRect(80, y + 20, Math.max(wv, 2), 20, 10) : x.rect(80, y + 20, wv, 20); x.fill();
  });
  x.fillStyle = "#ffbe5c"; x.font = `700 34px ${sans}`;
  const chips = [`${scores.accuracy}% accuracy`, `${scores.correct} correct`, stats && stats.count >= 10 ? `Top ${stats.topPct}% of ${stats.count}` : `${scores.wrong} wrong`];
  x.fillText(chips.join("   ·   "), 80, 1240);
  x.fillStyle = "#9a958c"; x.font = `500 28px ${sans}`; x.fillText("Check yours free · register.ipmcareer.com/response-v1", 80, 1295);
  return new Promise((res) => cv.toBlob((b) => res(b), "image/png"));
}

export default function IimbScorecard({ name, category, city, testDate, scores, answers, insights, uid, stats, warning, onReset, isReportPage = false }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [openQ, setOpenQ] = useState(null);
  const year = (String(testDate || "").match(/20\d{2}/) || [])[0] || "";
  const reportUrl = uid ? `${SITE}/iimb-report/${uid}` : `${SITE}/response-v1`;
  const first = String(name || "").split(" ")[0];
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2600); };

  const secs = SECTIONS.map((x) => ({ ...x, ...scores.sections[x.key] }));
  const best = [...secs].sort((a, b) => b.score / b.max - a.score / a.max)[0];
  const lost = scores.wrong; // −1 each
  const skippedPotential = scores.unattempted * 3;
  const shareText = `I scored ${scores.total}/${MAX_SCORE} in the IIM Bangalore UG Test (VARC ${secs[0].score}, LR ${secs[1].score}, QADI ${secs[2].score}, ${scores.accuracy}% accuracy). Check yours free: ${reportUrl}`;

  const maxBucket = useMemo(() => (stats?.buckets?.length ? Math.max(...stats.buckets.map((b) => b.n)) : 0), [stats]);
  const myBucket = Math.floor(Math.max(0, scores.total) / 10) * 10;

  const shareCard = async () => {
    setBusy(true);
    try {
      const blob = await makeStoryCard({ name, scores, stats, year });
      const file = new File([blob], "iimb-ug-scorecard.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = "iimb-ug-scorecard.png"; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        flash("Card downloaded. Post it on your story!");
      }
    } catch (e) {
      if (e?.name !== "AbortError") flash("Could not create the card. Try the WhatsApp share instead.");
    } finally { setBusy(false); }
  };
  // WhatsApp: on phones, share the PNG + caption through the share sheet (pick WhatsApp).
  // On laptops, wa.me links cannot carry files, so download the card and open WhatsApp with the text + report link.
  const shareWhatsApp = async () => {
    setBusy(true);
    try {
      const blob = await makeStoryCard({ name, scores, stats, year });
      const file = new File([blob], "iimb-ug-scorecard.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
      } else {
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "iimb-ug-scorecard.png"; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
        flash("Scorecard image downloaded: attach it in WhatsApp");
      }
    } catch (e) {
      if (e?.name !== "AbortError") window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
    } finally { setBusy(false); }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(reportUrl); flash("Link copied"); } catch { flash("Long-press the link to copy"); } };

  return (
    <div className={s.wrap}>
      {/* ── Hero scorecard ── */}
      <section className={s.hero}>
        <div className={s.heroTop}>
          <span className={s.kicker}><span className={s.dot} /> IIM Bangalore UG {year} · Scorecard</span>
          {name && <span className={s.namePill}>👤 {name}</span>}
        </div>
        <div className={s.heroBody}>
          <div className={s.ringWrap}>
            <Ring value={Math.max(0, scores.total)} max={MAX_SCORE} label={`${scores.total} out of ${MAX_SCORE}`} />
            <div className={s.ringText}><div className={s.total}>{scores.total}</div><div className={s.outOf}>/ {MAX_SCORE}</div></div>
          </div>
          <div className={s.secBars}>
            {secs.map((x) => (
              <div key={x.key} className={s.secRow}>
                <div className={s.secHead}><span>{x.icon} {x.short}</span><b>{x.score}<i>/{x.max}</i></b></div>
                <div className={s.track}><div className={`${s.fill} ${x.positive ? "" : s.fillBad}`} style={{ width: `${Math.max(2, Math.max(0, x.score / x.max) * 100)}%` }} /></div>
              </div>
            ))}
            <div className={s.chips}>
              <span className={s.chip}>✅ {scores.correct}</span>
              <span className={s.chip}>❌ {scores.wrong}</span>
              <span className={s.chip}>⏭ {scores.unattempted}</span>
              <span className={`${s.chip} ${s.chipGold}`}>🎯 {scores.accuracy}%</span>
              {category && <span className={s.chip}>{category}</span>}
            </div>
          </div>
        </div>
        <div className={s.heroFoot}>
          {stats && stats.count > 0 ? (
            <span className={s.rankPill}>🏆 #{stats.rank} of {stats.count.toLocaleString("en-IN")} on IPM Careers{stats.count >= 10 ? ` · top ${stats.topPct}%` : ""}</span>
          ) : <span className={s.rankPill}>🏆 Rank among calculator users appears once your report is saved</span>}
          <span className={`${s.gate} ${scores.allPositive ? s.gateOk : s.gateNo}`}>{scores.allPositive ? "✓ Positive in all 3 sections" : "✕ Not positive in every section"}</span>
        </div>
      </section>

      {warning && <div className={s.warn}>⚠️ {warning}</div>}

      {/* ── Share ── */}
      <div className={s.shareRow}>
        <button type="button" className={s.btnGold} onClick={shareCard} disabled={busy}>{busy ? "Making your card…" : "📸 Share story card"}</button>
        <button type="button" className={s.btn} onClick={shareWhatsApp} disabled={busy}>💬 WhatsApp + image</button>
        {uid && <button type="button" className={s.btn} onClick={copy}>🔗 Copy link</button>}
        {!isReportPage && uid && <a className={s.btn} href={`/iimb-report/${uid}`} target="_blank" rel="noopener noreferrer">📄 Report page</a>}
        <button type="button" className={s.btn} onClick={() => window.print()}>🖨️ PDF</button>
        {onReset ? <button type="button" className={s.btn} onClick={onReset}>🔄 Check another</button> : <Link className={s.btn} href="/response-v1">🎯 Check yours</Link>}
      </div>
      {msg && <div className={s.toast} role="status">{msg}</div>}

      {/* ── Quick read ── */}
      <div className={s.tiles}>
        <div className={s.tile}><div className={s.tileK}>Best section</div><div className={s.tileV}>{best.icon} {best.short}</div><div className={s.tileS}>{best.score}/{best.max} · {best.accuracy}% accuracy</div></div>
        <div className={s.tile}><div className={s.tileK}>Lost to negatives</div><div className={s.tileV}>−{lost}</div><div className={s.tileS}>{scores.wrong} wrong answer{scores.wrong === 1 ? "" : "s"}</div></div>
        <div className={s.tile}><div className={s.tileK}>Left on the table</div><div className={s.tileV}>{skippedPotential}</div><div className={s.tileS}>marks in {scores.unattempted} skipped</div></div>
        <div className={s.tile}><div className={s.tileK}>Attempted</div><div className={s.tileV}>{scores.attempted}<i>/60</i></div><div className={s.tileS}>{Math.round((scores.attempted / 60) * 100)}% of the paper</div></div>
      </div>

      {/* ── Section deep-dive ── */}
      <h2 className={s.h2}>Section deep-dive 🔬</h2>
      <div className={s.secGrid}>
        {secs.map((x) => (
          <div key={x.key} className={s.secCard}>
            <div className={s.secCardTop}>
              <div><div className={s.secTitle}>{x.icon} {x.short}</div><div className={s.secName}>{x.name}</div></div>
              <span className={`${s.badge} ${x.positive ? s.badgeOk : s.badgeNo}`}>{x.positive ? "Positive" : "Not positive"}</span>
            </div>
            <div className={s.secMid}>
              <Donut c={x.correct} w={x.wrong} u={x.unattempted} />
              <div className={s.secScore}>{x.score}<i>/{x.max}</i></div>
            </div>
            <div className={s.secStats}>
              <span><b className={s.ok}>{x.correct}</b> correct</span>
              <span><b className={s.no}>{x.wrong}</b> wrong</span>
              <span><b>{x.unattempted}</b> skipped</span>
              <span><b>{x.accuracy}%</b> accuracy</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Compare ── */}
      {stats && stats.count >= 5 && stats.buckets?.length > 0 && (
        <>
          <h2 className={s.h2}>How you compare 📈</h2>
          <div className={s.card}>
            <p className={s.cardSub}>Scores of {stats.count.toLocaleString("en-IN")} students who used this calculator. Your bar is gold.</p>
            <div className={s.hist}>
              {Array.from({ length: 19 }, (_, i) => i * 10).map((from) => {
                const b = stats.buckets.find((x) => x.from === from);
                const n = b ? b.n : 0;
                return (
                  <div key={from} className={s.histCol} title={`${from}-${from + 9}: ${n}`}>
                    <div className={`${s.histBar} ${from === myBucket ? s.histMe : ""}`} style={{ height: `${maxBucket ? Math.max(n ? 4 : 0, (n / maxBucket) * 100) : 0}%` }} />
                    <span className={s.histLbl}>{from % 30 === 0 ? from : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Insights ── */}
      {insights?.length > 0 && (
        <>
          <h2 className={s.h2}>What your score tells you 💡</h2>
          <ul className={s.insights}>
            {insights.map((ins, i) => (
              <li key={i} className={`${s.insight} ${ins.tone === "good" ? s.insGood : ins.tone === "warn" ? s.insWarn : ""}`}>
                <span>{ins.tone === "good" ? "✅" : ins.tone === "warn" ? "⚠️" : "📌"}</span><span>{ins.text}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ── Question map ── */}
      {answers?.length > 0 && (
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
                      <button type="button" key={a.n} onClick={() => setOpenQ(openQ === a.n ? null : a.n)}
                        className={`${s.q} ${a.r === "C" ? s.qC : a.r === "W" ? s.qW : a.r === "N" ? s.qN : s.qU} ${openQ === a.n ? s.qOpen : ""}`}
                        aria-label={`Question ${a.n}: ${a.r === "C" ? "correct" : a.r === "W" ? "wrong" : "not attempted"}`}>{a.n}</button>
                    ))}
                  </div>
                </div>
              );
            })}
            {openQ != null && (() => { const a = answers.find((x) => x.n === openQ); return a ? <div className={s.qDetail}>Q{a.n} · your answer <b>{a.c || "–"}</b> · key <b>{a.k || "–"}</b> · {a.r === "C" ? "+3" : a.r === "W" ? "−1" : "0"}</div> : null; })()}
            <div className={s.legend}><span><i style={{ background: "#4ade80" }} />Correct +3</span><span><i style={{ background: "#f87171" }} />Wrong −1</span><span><i style={{ background: "rgba(236,232,225,0.25)" }} />Skipped 0</span></div>
          </div>
          <details className={s.tableBox}>
            <summary>Full answer table</summary>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Q</th><th>Section</th><th>Yours</th><th>Key</th><th>Marks</th></tr></thead>
                <tbody>{answers.map((a) => <tr key={a.n}><td>{a.n}</td><td>{a.s}</td><td>{a.c || "–"}</td><td>{a.k || "–"}</td><td className={a.r === "C" ? s.ok : a.r === "W" ? s.no : ""}>{a.r === "C" ? "+3" : a.r === "W" ? "−1" : "0"}</td></tr>)}</tbody>
              </table>
            </div>
          </details>
        </>
      )}

      {/* ── PI CTA ── */}
      <div className={s.cta}>
        <div>
          <div className={s.ctaTitle}>Next up{first ? `, ${first}` : ""}: the IIMB interview</div>
          <div className={s.ctaText}>The interview carries 40 of 100 in IIMB's final score, as much as the test. Get a free PI plan from our mentors.</div>
        </div>
        <a className={s.btnGold} href={WHATSAPP_PI} target="_blank" rel="noopener noreferrer">📲 WhatsApp "IIMB"</a>
      </div>
      <p className={s.note}>Raw score from your response sheet using +3 / −1 / 0. IIMB standardises scores for shortlisting, so official results can differ.{city ? ` · 📍 ${city}` : ""}</p>
    </div>
  );
}
