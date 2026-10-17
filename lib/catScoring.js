// ═══════════════════════════════════════════════════════════════════
// CAT 2026: exam pattern + scoring (pure functions, safe on server and client)
// Used by: pages/api/cat-score.js, pages/api/cat-rescore.js,
//          pages/cat-score-calculator.js, pages/cat-report/[uid].js
//
// Pattern: 68 questions, 120 minutes, 204 marks
//   VARC 24 Q / 40 min / 72 | DILR 22 Q / 40 min / 66 | QA 22 Q / 40 min / 66
// Marking: MCQ +3 / -1, TITA +3 / 0 (no negative marking for TITA), unattempted 0
// ═══════════════════════════════════════════════════════════════════

export const EXAM_YEAR = 2026;
export const MARK_CORRECT = 3;
export const MARK_WRONG_MCQ = -1;
export const MARK_WRONG_TITA = 0;

export const SECTIONS = [
  { key: "VARC", name: "Verbal Ability & Reading Comprehension", short: "VARC", questions: 24, minutes: 40, max: 72, icon: "📖" },
  { key: "DILR", name: "Data Interpretation & Logical Reasoning", short: "DILR", questions: 22, minutes: 40, max: 66, icon: "🧩" },
  { key: "QA", name: "Quantitative Aptitude", short: "QA", questions: 22, minutes: 40, max: 66, icon: "🔢" },
];

export const TOTAL_QUESTIONS = 68;
export const MAX_SCORE = 204;

// Section by position, used only when the sheet has no readable section labels
export function sectionByIndex(i) {
  if (i < 24) return "VARC";
  if (i < 46) return "DILR";
  return "QA";
}

export function sectionFromLabel(label) {
  const t = String(label || "").toLowerCase();
  if (!t) return null;
  if (t.includes("varc") || t.includes("verbal") || t.includes("reading")) return "VARC";
  if (t.includes("dilr") || t.includes("lrdi") || t.includes("data interpretation") || t.includes("logical")) return "DILR";
  if (/\bqa\b/.test(t) || t.includes("quant")) return "QA";
  return null;
}

const norm = (v) => String(v == null ? "" : v).replace(/\s+/g, " ").trim();

// TITA: numeric compare when both sides are numbers, else case-insensitive text.
// The key may list several accepted values separated by "|".
export function titaMatches(given, key) {
  const g = norm(given);
  if (!g) return false;
  return String(key || "")
    .split("|")
    .map(norm)
    .filter(Boolean)
    .some((k) => {
      const rg = k.match(/^range:(-?[\d.]+):(-?[\d.]+)$/);
      if (rg) {
        const x = Number(g), lo = Math.min(Number(rg[1]), Number(rg[2])), hi = Math.max(Number(rg[1]), Number(rg[2]));
        return !isNaN(x) && x >= lo - 1e-9 && x <= hi + 1e-9;
      }
      const a = Number(g), b = Number(k);
      if (g !== "" && k !== "" && !isNaN(a) && !isNaN(b)) return Math.abs(a - b) < 1e-9;
      return g.toLowerCase() === k.toLowerCase();
    });
}

// MCQ: the key can be the option number ("2") or the official Option ID.
export function mcqMatches(chosen, optionIds, key) {
  const c = norm(chosen);
  const k = norm(key);
  if (!c || !k) return false;
  if (c === k) return true;
  const idx = Number(c) - 1;
  return Array.isArray(optionIds) && optionIds[idx] != null && norm(optionIds[idx]) === k;
}

/**
 * Score a parsed answer list.
 * answers: [{ n, s, t: "MCQ"|"TITA", q: questionId, c: chosen option, g: given TITA answer, o: [optionIds], k: key from sheet }]
 *   (re-scoring a saved row: ks = key from the sheet, k = key used last time)
 * dbKeys:  { [questionId]: { answer, is_dropped } }
 * Returns { total, sections, correct, wrong, unattempted, pendingKey, keySource, answers (with r + m) }
 *   r: "C" correct | "W" wrong | "U" unattempted | "N" attempted, no key yet | "B" dropped (bonus)
 *   m: marks for that question
 */
export function scoreCat(answers, dbKeys = {}) {
  const sections = {};
  SECTIONS.forEach((s) => {
    sections[s.key] = {
      score: 0, correct: 0, wrong: 0, unattempted: 0, pending: 0, bonus: 0, total: 0, max: s.max,
      mcq: { attempted: 0, correct: 0, wrong: 0 }, tita: { attempted: 0, correct: 0, wrong: 0 },
    };
  });

  let usedSheet = 0, usedDb = 0;
  const scored = (answers || []).map((a) => {
    const sec = sections[a.s];
    const dk = a.q ? dbKeys[a.q] : null;
    const isTita = a.t === "TITA";
    const response = isTita ? norm(a.g) : norm(a.c);
    const sheetKey = norm(a.ks != null ? a.ks : a.k); // key printed on the response sheet
    let key = sheetKey;
    if (key) usedSheet += 1;
    else if (dk && (dk.answer || dk.is_dropped)) { key = norm(dk.answer); usedDb += 1; }

    let r = "U", m = 0;
    if (dk && dk.is_dropped) { r = "B"; m = MARK_CORRECT; }
    else if (!response) { r = "U"; }
    else if (!key) { r = "N"; }
    else if (isTita ? titaMatches(response, key) : mcqMatches(response, a.o, key)) { r = "C"; m = MARK_CORRECT; }
    else { r = "W"; m = isTita ? MARK_WRONG_TITA : MARK_WRONG_MCQ; }

    if (sec) {
      sec.total += 1;
      sec.score += m;
      const bucket = isTita ? sec.tita : sec.mcq;
      if (response) bucket.attempted += 1;
      if (r === "C") { sec.correct += 1; bucket.correct += 1; }
      else if (r === "W") { sec.wrong += 1; bucket.wrong += 1; }
      else if (r === "N") sec.pending += 1;
      else if (r === "B") sec.bonus += 1;
      else sec.unattempted += 1;
    }
    return { ...a, ks: sheetKey, k: key || "", r, m };
  });

  let total = 0, correct = 0, wrong = 0, unattempted = 0, pendingKey = 0;
  Object.values(sections).forEach((sec) => {
    sec.attempted = sec.correct + sec.wrong + sec.pending;
    const judged = sec.correct + sec.wrong;
    sec.accuracy = judged > 0 ? Math.round((sec.correct / judged) * 100) : 0;
    total += sec.score; correct += sec.correct; wrong += sec.wrong;
    unattempted += sec.unattempted; pendingKey += sec.pending;
  });

  const keySource = usedSheet && usedDb ? "mixed" : usedSheet ? "sheet" : usedDb ? "db" : "pending";
  return { total, sections, correct, wrong, unattempted, pendingKey, keySource, answers: scored };
}

// "08:30 AM - 10:30 AM" style test times → slot 1/2/3 (null if unknown)
export function slotFromTime(t) {
  const m = String(t || "").match(/(\d{1,2})[:.](\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = Number(m[1]);
  const ap = (m[3] || "").toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  if (h < 11) return 1;
  if (h < 15) return 2;
  return 3;
}

// Plain-language takeaways for the scorecard and report
export function buildCatInsights(result) {
  const out = [];
  if (!result || !result.sections) return out;
  const secs = SECTIONS.map((s) => ({ ...s, ...result.sections[s.key] }));
  if (result.pendingKey > 0) {
    out.push({ tone: "warn", text: `${result.pendingKey} of your attempted questions are waiting for the official answer key. Your score updates automatically when IIM Indore releases it; open your report link again then.` });
  }
  const judged = secs.filter((s) => s.correct + s.wrong > 0);
  if (judged.length) {
    const best = [...judged].sort((a, b) => b.score / b.max - a.score / a.max)[0];
    const weak = [...judged].sort((a, b) => a.score / a.max - b.score / b.max)[0];
    out.push({ tone: "good", text: `${best.short} is your strongest section: ${best.score}/${best.max} with ${best.accuracy}% accuracy.` });
    if (weak.key !== best.key) out.push({ tone: "warn", text: `${weak.short} needs the most work: ${weak.score}/${weak.max}. CAT shortlists usually need a sectional cut-off in every section, not just a good total.` });
  }
  const mcqWrong = secs.reduce((t, s) => t + (s.mcq.wrong || 0), 0);
  if (mcqWrong > 0) {
    out.push({ tone: "info", text: `Negative marking cost you ${mcqWrong} mark${mcqWrong === 1 ? "" : "s"} on wrong MCQs. Wrong TITA answers cost nothing, so attempting them is low-risk.` });
  }
  const titaAtt = secs.reduce((t, s) => t + s.tita.attempted, 0);
  const titaRight = secs.reduce((t, s) => t + s.tita.correct, 0);
  if (titaAtt > 0) out.push({ tone: "info", text: `TITA: ${titaRight} correct out of ${titaAtt} attempted.` });
  out.push({ tone: "info", text: "CAT percentiles are calculated by the IIMs after normalising scores across the three slots, so the same raw score can map to different percentiles in different slots." });
  return out;
}
