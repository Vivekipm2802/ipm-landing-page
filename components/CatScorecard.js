// CAT scorecard + detailed report. Used on /cat-score-calculator (right after scoring) and /cat-report/[uid].
import { useEffect, useState } from "react";
import Link from "next/link";
import s from "./IimbScorecard.module.css";
import k from "./CatScorecard.module.css";
import OpenMbaForms from "./OpenMbaForms";
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
  x.fillText([`${acc}% accuracy`, `${result.correct} correct`, count >= 50 && rank ? `#${rank} of ${count}` : `${result.wrong} wrong`].join("   ·   "), 80, 1235);
  x.fillStyle = "#9a958c"; x.font = `500 24px ${sans}`; x.fillText("*estimate from CAT 2025 data · register.ipmcareer.com/cat-score-calculator", 80, 1290);
  return new Promise((res) => cv.toBlob((b) => res(b), "image/png"));
}

export default function CatScorecard({ name: rawName, category, city, slot, examYear, result, uid, rank, count, warnings, onReset, isReportPage = false }) {
  const name = rawName && rawName === String(rawName).toUpperCase() ? String(rawName).toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) : rawName;
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [openQ, setOpenQ] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  useEffect(() => {
    if (!moreOpen) return undefined;
    const close = (e) => { if (e.type === "keydown" ? e.key === "Escape" : !e.target.closest?.("[data-more]")) setMoreOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("touchstart", close); document.removeEventListener("keydown", close); };
  }, [moreOpen]);
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

  // The card is drawn as soon as the scorecard appears, so a tap can open the share sheet instantly
  // (phone browsers block share sheets / new windows that open after a delay).
  const [cardFile, setCardFile] = useState(null);
  useEffect(() => {
    let off = false;
    makeStoryCard({ name, result, pred, rank, count, year: examYear }).then((blob) => { if (!off && blob) setCardFile(new File([blob], "cat-scorecard.png", { type: "image/png" })); }).catch(() => {});
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.total, uid, rank, count]);
  const isPhone = () => typeof navigator !== "undefined" && (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.platform || "")));
  const canShareFile = () => Boolean(cardFile && navigator.canShare && navigator.canShare({ files: [cardFile] }));
  const waUrl = () => `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const download = () => {
    if (!cardFile) return false;
    const a = document.createElement("a"); a.href = URL.createObjectURL(cardFile); a.download = "cat-scorecard.png"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return true;
  };

  // Story card: share sheet on phones, download on laptops
  const shareCard = () => {
    if (!cardFile) { flash("Preparing your card, tap again in a second"); return; }
    if (isPhone() && canShareFile()) {
      navigator.share({ files: [cardFile], text: shareText }).catch((e) => { if (e?.name !== "AbortError") { download(); flash("Card downloaded. Post it on your story!"); } });
    } else { download(); flash("Card downloaded. Post it on your story!"); }
  };

  // WhatsApp: phones send the image + caption through the share sheet (choose WhatsApp);
  // laptops open WhatsApp right away with the text + report link, and download the image to attach.
  const shareWhatsApp = () => {
    if (isPhone() && canShareFile()) {
      navigator.share({ files: [cardFile], text: shareText }).catch((e) => { if (e?.name !== "AbortError") window.location.href = waUrl(); });
      return;
    }
    if (isPhone()) { window.location.href = waUrl(); return; }
    window.open(waUrl(), "_blank", "noopener");
    if (download()) flash("Image downloaded: attach it in the WhatsApp chat");
  };
  const copy = async () => { try { await navigator.clipboard.writeText(reportUrl); flash("Link copied"); } catch { flash("Long-press the link to copy"); } };
  const SHOW_RANK_FROM = 50;
  const judgedSecs = secs.filter((x) => x.correct + x.wrong > 0);
  const weak = judgedSecs.length ? [...judgedSecs].sort((a, b) => a.score / a.max - b.score / b.max)[0] : null;
  const takeaways = [];
  if (weak && weak.key !== best.key) takeaways.push({ tone: "warn", head: `${weak.short} pulled you down`, text: `${weak.score}/${weak.max}. IIM shortlists need a sectional cut-off in every section, so this is where marks matter most.` });
  if (mcqWrong > 0) takeaways.push({ tone: "warn", head: `Negatives cost you ${mcqWrong} mark${mcqWrong === 1 ? "" : "s"}`, text: `${mcqWrong} wrong MCQ${mcqWrong === 1 ? "" : "s"}. Wrong TITA answers cost nothing.` });
  if (best && best.score > 0) takeaways.push({ tone: "good", head: `${best.short} is your strength`, text: `${best.score}/${best.max} with ${best.accuracy}% accuracy.` });
  const pctOk = pred.overall.main != null && !pred.overall.below;
  const tileCls = (r) => (r === "C" || r === "B" ? s.qC : r === "W" ? s.qW : s.qU);

  return (
    <div className={s.wrap}>
      <section className={s.hero}>
        <div className={s.heroTop}>
          <span className={s.kicker}><span className={s.dot} /> CAT {examYear || ""} Scorecard{slot ? ` · Slot ${slot}` : ""}</span>
          {name && <span className={s.namePill}>{name}</span>}
        </div>
        <div className={s.heroBody}>
          <div className={s.ringWrap}>
            <Ring value={Math.max(0, result.total)} max={MAX_SCORE} />
            <div className={s.ringText}><div className={s.total}>{result.total}</div><div className={s.outOf}>/ {MAX_SCORE}</div></div>
          </div>
          <div className={s.secBars}>
            {secs.map((x) => (
              <div key={x.key} className={s.secRow}>
                <div className={s.secHead}><span>{x.short}</span><b>{x.score}<i>/{x.max}</i></b></div>
                <div className={s.track}><div className={`${s.fill} ${x.score > 0 ? "" : s.fillBad}`} style={{ width: `${Math.max(2, Math.max(0, x.score / x.max) * 100)}%` }} /></div>
              </div>
            ))}
            <div className={k.counts}>
              {result.correct} correct · {result.wrong} wrong · {result.unattempted} skipped{result.pendingKey > 0 ? ` · ${result.pendingKey} awaiting key` : ""}
            </div>
          </div>
        </div>
        <div className={k.pctLine}>
          <div>{pctOk ? (
            <>Estimated percentile <b>~{fmtPct(pred.overall.main)}</b>{pred.overall.low !== pred.overall.high ? <span> (range {fmtPct(pred.overall.low)} to {fmtPct(pred.overall.high)})</span> : null}</>
          ) : <>Estimated percentile: below 55 on CAT 2025 data</>}</div>
          {rank && count >= SHOW_RANK_FROM ? <span className={k.rank}>#{rank} of {count.toLocaleString("en-IN")}</span> : null}
        </div>
      </section>

      {(warnings || []).length > 0 && <div className={s.warn}>{warnings.join(" ")}</div>}

      <div className={k.actions}>
        <button type="button" className={s.btnGold} onClick={shareWhatsApp} disabled={busy}>Share on WhatsApp</button>
        <div className={k.moreWrap} data-more>
          <button type="button" className={s.btn} onClick={() => setMoreOpen(!moreOpen)} aria-expanded={moreOpen}>More <span className={moreOpen ? k.chevOpen : k.chev}>▾</span></button>
          {moreOpen && (
            <div className={k.menu} role="menu" onClick={() => setMoreOpen(false)}>
              {uid && <button type="button" role="menuitem" onClick={copy}>Copy link</button>}
              <button type="button" role="menuitem" onClick={shareCard}>Download image</button>
              <button type="button" role="menuitem" onClick={() => window.print()}>Save as PDF</button>
              {onReset ? <button type="button" role="menuitem" onClick={onReset}>Check another sheet</button> : <Link role="menuitem" href="/cat-score-calculator">Check your own score</Link>}
            </div>
          )}
        </div>
      </div>
      {msg && <div className={s.toast} role="status">{msg}</div>}

      {takeaways.length > 0 && (
        <div className={k.takeaways}>
          {takeaways.slice(0, 3).map((t, i) => (
            <div key={i} className={`${k.take} ${t.tone === "good" ? k.takeGood : k.takeWarn}`}>
              <b>{t.head}</b>
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className={k.next}>
        <div>
          <div className={k.nextTitle}>{pctOk ? `Which IIMs does ~${fmtPct(pred.overall.main)} percentile clear?` : "Which IIMs can you still target?"}</div>
          <a className={k.nextLink} href={WHATSAPP_HELP} target="_blank" rel="noopener noreferrer">Or talk to a mentor on WhatsApp</a>
        </div>
        <Link className={s.btnGold} href={callLink}>See my IIM calls</Link>
      </div>

      <OpenMbaForms percentile={pctOk ? pred.overall.main : null} src={isReportPage ? "cat-report" : "cat-scorecard"} />

      <details className={k.full}>
        <summary className={k.fullSum}>See full analysis <span className={k.chev}>▾</span></summary>
        <div className={k.fullBody}>
          <h3 className={k.h3}>Sectional percentile (estimate)</h3>
          <div className={k.pctGrid}>
            <div><span>Overall</span><b className={k.gold}>{pred.overall.below ? "<55" : fmtPct(pred.overall.main)}</b>{pred.rank ? <i>≈ rank {pred.rank.toLocaleString("en-IN")}</i> : null}</div>
            {SECTIONS.map((sec) => <div key={sec.key}><span>{sec.short}</span><b>{pred[sec.key].below ? "<1" : fmtPct(pred[sec.key].main)}</b></div>)}
          </div>
          <p className={k.small}>Estimated from score-to-percentile data students reported after CAT 2025 (and 2024 for the range). The IIMs normalise each slot, so your official percentile can differ.</p>

          <h3 className={k.h3}>Section by section</h3>
          <div className={k.secTable}>
            <div className={k.secTh}><span>Section</span><span>Score</span><span>Correct</span><span>Wrong</span><span>Skipped</span><span>Accuracy</span></div>
            {secs.map((x) => (
              <div key={x.key} className={k.secTr}>
                <span>{x.short}</span><b>{x.score}/{x.max}</b><span>{x.correct}</span><span>{x.wrong}</span><span>{x.unattempted}</span><span>{x.accuracy}%</span>
              </div>
            ))}
          </div>
          <p className={k.small}>TITA: {tita.c} correct of {tita.a} attempted · {attempted} of 68 questions attempted.</p>

          {answers.length > 0 && (
            <>
              <h3 className={k.h3}>Question-wise map</h3>
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
        </div>
      </details>

      <p className={s.note}>Raw score: +3 correct, −1 wrong MCQ, 0 wrong TITA. Official CAT scores are normalised across slots.</p>
    </div>
  );
}
