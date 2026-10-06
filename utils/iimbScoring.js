// ═══════════════════════════════════════════════════════════════════
// IIM Bangalore UG Test: shared scoring helpers
// Used by: pages/response-v1.jsx, pages/iimb-report/[uid].js,
//          pages/api/sendScorecardIIMB.js
//
// Official pattern (IIMB UG Admissions Process, batch 2027-31):
//   60 MCQs, 135 minutes
//   Section 1 VARC (15) | Section 2 LR (15) | Section 3 QADI (30)
// Marking used: +3 correct, -1 wrong, 0 unattempted
// ═══════════════════════════════════════════════════════════════════

export const MARK_CORRECT = 3;
export const MARK_WRONG = -1;

export const SECTIONS = [
  { key: "VARC", name: "Verbal Ability & Reading Comprehension", short: "VARC", questions: 15, icon: "📝", testWeight: 20 },
  { key: "LR", name: "Logical Reasoning", short: "LR", questions: 15, icon: "🧩", testWeight: 30 },
  { key: "QADI", name: "Quantitative Ability & Data Interpretation", short: "QADI", questions: 30, icon: "🔢", testWeight: 20 },
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

// Fallback: section by position (VARC 1-15, LR 16-30, QADI 31-60)
function indexToKey(i) {
  if (i < 15) return "VARC";
  if (i < 30) return "LR";
  return "QADI";
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
    let chosen = "";
    const menu = p.querySelector(".menu-tbl");
    if (menu) {
      const tds = Array.from(menu.querySelectorAll("td"));
      const row = tds.find((t) => clean(t.textContent).includes("Chosen Option"));
      chosen = clean(row && row.nextElementSibling ? row.nextElementSibling.textContent : "");
    }
    if (chosen === "--") chosen = "";

    const tick = p.querySelector('img[src*="tick"]');
    const key = tick && tick.parentElement ? clean(tick.parentElement.textContent).charAt(0) : "";

    let r = "U";
    if (chosen) r = key ? (chosen === key ? "C" : "W") : "N";

    return { n: i + 1, s: useLabels ? labelled[i] : indexToKey(i), c: chosen, k: key, r };
  });

  let warning = null;
  if (answers.length !== TOTAL_QUESTIONS) {
    warning = `We found ${answers.length} questions instead of ${TOTAL_QUESTIONS}. Your score is calculated on what we found. If this looks wrong, save the full page again and re-upload.`;
  } else if (answers.every((a) => !a.k)) {
    return { answers: [], error: "This file has your responses but no answer key ticks. Open the Answer Key / Response Sheet page after login and save that page." };
  }
  return { answers, warning };
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

  const lr = result.sections.LR;
  out.push({ tone: "info", text: `LR has only 15 questions but carries 30 of the 70 test points at IIMB's pre-interview stage. Your LR: ${lr.score}/${lr.max}.` });

  return out;
}
