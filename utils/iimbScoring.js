// ═══════════════════════════════════════════════════════════════════
// IIM Bangalore UG Test: shared scoring helpers
// Used by: pages/response-v1.jsx, pages/iimb-report/[uid].js,
//          pages/api/sendScorecardIIMB.js
//
// Official pattern (IIMB UG Admissions Process for batch 2027-31, test on 15 Nov 2026):
//   60 MCQs, 135 minutes, sections in this order with their own timers:
//   QADI 30 questions (60 min) | LR 15 questions (45 min) | VARC 15 questions (30 min)
//   Pre-interview weights of the 70 test points: QADI 30, LR 20, VARC 20
// Marking: +3 correct, -1 wrong, 0 unattempted.
// ═══════════════════════════════════════════════════════════════════

export const MARK_CORRECT = 3;
export const MARK_WRONG = -1;

export const SECTIONS = [
  { key: "QADI", name: "Quantitative Ability & Data Interpretation", short: "QADI", questions: 30, minutes: 60, icon: "🔢", testWeight: 30 },
  { key: "LR", name: "Logical Reasoning", short: "LR", questions: 15, minutes: 45, icon: "🧩", testWeight: 20 },
  { key: "VARC", name: "Verbal Ability & Reading Comprehension", short: "VARC", questions: 15, minutes: 30, icon: "📝", testWeight: 20 },
];
export const EXAM_YEAR = 2026;            // the test on 15 Nov 2026 (batch 2027-31)
export const TEST_DATE = "2026-11-15";
export const RESULT_DATE = "2026-12-15";  // tentative, per IIMB FAQ
export const KEY_DATES = [
  { label: "UG Admission Test", when: "15 Nov 2026", done: true },
  { label: "Results", when: "15 Dec 2026 (tentative)" },
  { label: "Interviews", when: "2nd and 3rd week of Jan 2027 (tentative)" },
  { label: "Offers & waitlist", when: "3rd week of Feb 2027 (tentative)" },
];
// First-shortlist minimum percentiles (IIMB UG Admissions Process 2026, Annexure I, Table 1)
export const CUTOFFS = [
  { cat: "General", VARC: 50, LR: 50, QADI: 75, total: 80 },
  { cat: "NC-OBC", VARC: 40, LR: 40, QADI: 50, total: 50 },
  { cat: "EWS", VARC: 40, LR: 40, QADI: 50, total: 50 },
  { cat: "SC", VARC: 25, LR: 25, QADI: 40, total: 40 },
  { cat: "ST", VARC: 20, LR: 20, QADI: 30, total: 30 },
  { cat: "PwD", VARC: 20, LR: 20, QADI: 30, total: 30 },
];

export const TOTAL_QUESTIONS = 60;
export const MAX_SCORE = TOTAL_QUESTIONS * MARK_CORRECT; // 180

export const sectionMax = (key) => {
  const s = SECTIONS.find((x) => x.key === key);
  return s ? s.questions * MARK_CORRECT : 0;
};

// Map a section label from the response sheet to our keys
function labelToKey(label) {
  const t = (label || "").toLowerCase();
  if (!t) return null;
  if (t.includes("verbal") || t.includes("varc") || t.includes("english") || t.includes("reading")) return "VARC";
  if (t.includes("logical") || /\blr\b/.test(t) || t.includes("reasoning")) return "LR";
  if (t.includes("quant") || t.includes("qadi") || t.includes("data interpretation") || t.includes("math")) return "QADI";
  return null;
}

// Fallback: section by position, 2026 order (QADI 1-30, LR 31-45, VARC 46-60)
function indexToKey(i) {
  if (i < 30) return "QADI";
  if (i < 45) return "LR";
  return "VARC";
}

const clean = (s) => (s || "").replace(/\s+/g, " ").trim();

/**
 * Parse a saved IIMB UG response sheet (digialm HTML) in the browser.
 * Returns { answers: [{ n, s, c, k, r }], warning }
 *   n = question number, s = section key, c = chosen option, k = correct option,
 *   r = "C" correct | "W" wrong | "U" unattempted | "N" no key found
 */
export function parseResponseSheet(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const panels = Array.from(doc.querySelectorAll(".question-pnl"));

  if (panels.length === 0) {
    return { answers: [], error: "We could not find any questions in this file. Save the response sheet page as HTML (Ctrl+S on laptop, Download on mobile) and upload that file. PDFs and screenshots will not work." };
  }

  // Only trust section labels if every panel has one we recognise
  const labelled = panels.map((p) => {
    const box = p.closest(".section-cntnr");
    const lbl = box ? box.querySelector(".section-lbl") : null;
    return labelToKey(lbl ? lbl.textContent : "");
  });
  const useLabels = labelled.every(Boolean);

  const answers = panels.map((p, i) => {
    let chosen = "", qid = "";
    const optIds = [];
    const menu = p.querySelector(".menu-tbl");
    if (menu) {
      const tds = Array.from(menu.querySelectorAll("td"));
      const cell = (label) => {
        const row = tds.find((t) => clean(t.textContent).startsWith(label));
        return clean(row && row.nextElementSibling ? row.nextElementSibling.textContent : "");
      };
      chosen = cell("Chosen Option");
      qid = cell("Question ID").replace(/\D/g, "");
      for (let o = 1; o <= 6; o++) {
        const v = cell(`Option ${o} ID`).replace(/\D/g, "");
        if (!v) break;
        optIds.push(v);
      }
    }
    if (chosen === "--") chosen = "";

    const tick = p.querySelector('img[src*="tick"]');
    const key = tick && tick.parentElement ? clean(tick.parentElement.textContent).charAt(0) : "";

    let r = "U";
    if (chosen) r = key ? (chosen === key ? "C" : "W") : "N";

    return { n: i + 1, s: useLabels ? labelled[i] : indexToKey(i), c: chosen, k: key, kt: key, q: qid, o: optIds, r };
  });

  let warning = null;
  if (answers.length !== TOTAL_QUESTIONS) {
    warning = `We found ${answers.length} questions instead of ${TOTAL_QUESTIONS}. Your score is calculated on what we found. If this looks wrong, save the full page again and re-upload.`;
  }
  // No ticks: the sheet has responses only. The page then scores with IIMB's official key (if loaded) or stops.
  const noTicks = answers.every((a) => !a.k);
  return { answers, warning, noTicks, candidate: readCandidate(doc) };
}

// Name (and test details) from the header table of the response sheet: "Candidate Name | <name>"
function readCandidate(doc) {
  const out = { name: "", testDate: "", testTime: "" };
  const cells = Array.from(doc.querySelectorAll(".main-info-pnl td, table td"));
  const val = (label) => {
    const td = cells.find((t) => clean(t.textContent).toLowerCase() === label);
    return td && td.nextElementSibling ? clean(td.nextElementSibling.textContent) : "";
  };
  const titleCase = (s) => s.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());
  const raw = val("candidate name") || val("name of the candidate") || val("name");
  out.name = raw ? titleCase(raw).slice(0, 80) : "";
  out.testDate = val("test date");
  out.testTime = val("test time");
  return out;
}

/**
 * Apply IIMB's official answer key (rows of iimb_ug_answer_keys) on top of the sheet's ticks.
 * keys: { [questionId]: { id: correctOptionId, n: correctOptionNumber, dropped: bool } }
 * Matches by option ID first (option order can differ between candidates), then by option number.
 * Dropped questions score 0 for everyone (r = "X") until IIMB says otherwise.
 */
export function applyOfficialKey(answers, keys) {
  if (!keys || !Object.keys(keys).length) return { answers: (answers || []).map((a) => ({ ...a, ks: "sheet" })), official: 0 };
  let official = 0;
  const out = (answers || []).map((a) => {
    const k = a.q ? keys[a.q] : null;
    const tick = a.kt != null ? a.kt : a.k;
    if (!k) return { ...a, k: tick, ks: "sheet", r: !a.c ? "U" : tick ? (a.c === tick ? "C" : "W") : "N" };
    official += 1;
    if (k.dropped) return { ...a, k: "", ks: "official", r: "X" };
    let num = "";
    if (k.id && Array.isArray(a.o) && a.o.length) {
      const i = a.o.indexOf(String(k.id));
      if (i >= 0) num = String(i + 1);
    }
    if (!num && k.n) num = String(k.n);
    const r = !a.c ? "U" : num ? (a.c === num ? "C" : "W") : "N";
    return { ...a, k: num, ks: "official", r };
  });
  return { answers: out, official };
}

/**
 * Score a parsed answer list. Pure function, safe on server and client.
 */
export function scoreAnswers(answers) {
  const sections = {};
  SECTIONS.forEach((s) => {
    sections[s.key] = { score: 0, correct: 0, wrong: 0, unattempted: 0, noKey: 0, total: 0, max: s.questions * MARK_CORRECT };
  });

  (answers || []).forEach((a) => {
    const sec = sections[a.s];
    if (!sec) return;
    sec.total += 1;
    if (a.r === "C") { sec.correct += 1; sec.score += MARK_CORRECT; }
    else if (a.r === "W") { sec.wrong += 1; sec.score += MARK_WRONG; }
    else if (a.r === "N") { sec.noKey += 1; }
    else if (a.r === "X") { sec.dropped = (sec.dropped || 0) + 1; }
    else { sec.unattempted += 1; }
  });

  Object.values(sections).forEach((sec) => {
    const attempted = sec.correct + sec.wrong;
    sec.attempted = attempted;
    sec.accuracy = attempted > 0 ? Math.round((sec.correct / attempted) * 100) : 0;
    sec.positive = sec.score > 0;
  });

  const total = Object.values(sections).reduce((t, s) => t + s.score, 0);
  const correct = Object.values(sections).reduce((t, s) => t + s.correct, 0);
  const wrong = Object.values(sections).reduce((t, s) => t + s.wrong, 0);
  const attempted = correct + wrong;

  return {
    sections,
    total,
    correct,
    wrong,
    attempted,
    unattempted: Object.values(sections).reduce((t, s) => t + s.unattempted, 0),
    accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
    allPositive: Object.values(sections).every((s) => s.positive),
    // legacy fields kept for the existing table columns + leaderboard
    s1: sections.VARC.score,
    s2: sections.LR.score,
    s3: sections.QADI.score,
  };
}

/** Quick, honest insights from the numbers. No predictions. */
export function buildInsights(result) {
  const out = [];
  const secs = SECTIONS.map((s) => ({ ...s, ...result.sections[s.key] }));

  const weak = secs.filter((s) => !s.positive);
  if (weak.length === 0) {
    out.push({ tone: "good", text: "Positive raw score in all 3 sections. IIMB only considers candidates with a positive score in every section for the first shortlist, so you clear that basic gate." });
  } else {
    out.push({ tone: "warn", text: `${weak.map((s) => s.short).join(" and ")} ${weak.length > 1 ? "are" : "is"} not positive yet. IIMB's first shortlist needs a positive raw score in every section, so this is the first thing to fix in your prep.` });
  }

  const ranked = [...secs].sort((a, b) => b.score / b.max - a.score / a.max);
  if (ranked[0].score > 0) {
    out.push({ tone: "good", text: `Strongest section: ${ranked[0].short} (${ranked[0].score}/${ranked[0].max}, ${ranked[0].accuracy}% accuracy).` });
  }

  if (result.wrong > 0) {
    out.push({ tone: "info", text: `Negative marking cost you ${result.wrong} mark${result.wrong > 1 ? "s" : ""} across ${result.wrong} wrong answer${result.wrong > 1 ? "s" : ""}. Overall accuracy: ${result.accuracy}%.` });
  }

  const qa = result.sections.QADI;
  out.push({ tone: "info", text: `QADI carries 30 of the 70 test points at IIMB's pre-interview stage (LR and VARC carry 20 each), so it moves your shortlist chances the most. Your QADI: ${qa.score}/${qa.max}.` });

  return out;
}
