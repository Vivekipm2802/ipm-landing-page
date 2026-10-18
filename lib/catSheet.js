// ═══════════════════════════════════════════════════════════════════
// CAT 2026 response sheet parser (server only: uses cheerio).
// The CAT response sheet is a TCS iON page on cdn*.digialm.com, the same
// platform as the IPMAT Indore sheet:
//   .main-info-pnl   candidate details (name, test date, test time)
//   .section-cntnr   one per section, label in .section-lbl
//   .question-pnl    one per question
//     .menu-tbl      Question Type / Question ID / Option n ID / Status / Chosen Option
//     .questionRowTbl  question + options; "Given Answer :" row for TITA;
//                      .rightAns (or a tick image) marks the correct answer when
//                      the sheet carries the key
// ═══════════════════════════════════════════════════════════════════
import cheerio from "cheerio";
import { sectionFromLabel, sectionByIndex, slotFromTime, TOTAL_QUESTIONS } from "./catScoring";

const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
const squash = (s) => clean(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const blank = (v) => {
  const t = clean(v);
  return !t || t === "--" || t === "-" || /^not\s*answered$/i.test(t) ? "" : t;
};

export function parseCatSheet(html) {
  const $ = cheerio.load(html);
  const panels = $(".question-pnl");
  if (panels.length === 0) {
    return { error: "We could not find any questions on this page. Use the Response Sheet link (it ends with .html), or save that page and upload the file." };
  }

  // Candidate details: label cell followed by value cell
  const info = {};
  $(".main-info-pnl td").each(function () {
    const label = squash($(this).text());
    const value = clean($(this).next("td").text());
    if (!value) return;
    if (!info.name && (label.includes("participantname") || label.includes("candidatename"))) info.name = value;
    else if (!info.testDate && label.includes("testdate")) info.testDate = value;
    else if (!info.testTime && label.includes("testtime")) info.testTime = value;
    else if (!info.subject && label.includes("subject")) info.subject = value;
  });

  // Section label per panel; only trust labels if every panel has a recognised one
  const labels = [];
  panels.each(function () {
    const box = $(this).closest(".section-cntnr");
    labels.push(sectionFromLabel(box.length ? box.find(".section-lbl").first().text() : ""));
  });
  const useLabels = labels.every(Boolean);

  const answers = [];
  panels.each(function (i) {
    const panel = $(this);
    const menu = panel.find(".menu-tbl");
    const row = panel.find(".questionRowTbl");

    const menuVal = (want) => {
      let out = "";
      menu.find("td").each(function () {
        if (out) return;
        if (squash($(this).text()).startsWith(want)) out = clean($(this).next("td").text());
      });
      return out;
    };

    const qType = squash(menuVal("questiontype"));
    const qid = menuVal("questionid").replace(/[^\w-]/g, "");
    const status = menuVal("status");
    const chosen = blank(menuVal("chosenoption"));
    const optionIds = [1, 2, 3, 4].map((n) => menuVal(`option${n}id`).replace(/[^\w-]/g, "")).filter(Boolean);

    let given = "";
    let hasGiven = false;
    row.find("td").each(function () {
      if (squash($(this).text()).startsWith("givenanswer")) {
        hasGiven = true;
        given = blank($(this).next("td").text());
      }
    });

    const isTita = hasGiven || qType === "sa" || qType.includes("tita") || qType.includes("nat") || qType.includes("shortanswer");

    // Correct answer if the sheet shows it
    let key = "";
    const right = row.find(".rightAns").first();
    if (isTita) {
      const t = clean(right.text());
      const m = t.match(/possible\s*answer[s]?\s*:\s*(.+)/i);
      let raw = m ? clean(m[1]) : t;
      // CAT 2025 sheets print "Possible Answer: NA" when the key is not on the sheet (e.g. QA TITA)
      if (/^(n\/?a|-+|nil|none)$/i.test(raw)) raw = "";
      // "Answer Type: Range" → accept any value between the two bounds
      let answerType = "";
      row.find("td").each(function () {
        const tt = clean($(this).text());
        if (/^answer\s*type\s*:/i.test(tt)) answerType = tt.toLowerCase();
      });
      const rg = raw.match(/^(-?\d+(?:\.\d+)?)\s*(?:-|to|–)\s*(-?\d+(?:\.\d+)?)$/i);
      if (raw && answerType.includes("range") && rg) key = `range:${rg[1]}:${rg[2]}`;
      else key = raw.replace(/\s*(,|\bor\b)\s*/gi, "|");
    } else {
      let t = clean(right.text());
      if (!t) {
        const tick = row.find('img[src*="tick"]').first();
        if (tick.length) t = clean(tick.parent().text());
      }
      const m = t.match(/^(\d+)/);
      key = m ? m[1] : "";
    }

    answers.push({
      n: i + 1,
      s: useLabels ? labels[i] : sectionByIndex(i),
      t: isTita ? "TITA" : "MCQ",
      q: qid,
      st: status,
      c: isTita ? "" : chosen,
      g: isTita ? given : "",
      o: isTita ? [] : optionIds,
      k: key,
    });
  });

  const warnings = [];
  if (answers.length !== TOTAL_QUESTIONS) {
    warnings.push(`We found ${answers.length} questions instead of ${TOTAL_QUESTIONS}. Your score is worked out on what we found.`);
  }
  if (!useLabels) warnings.push("Section names were not readable, so sections were assigned by question order (VARC 1-24, DILR 25-46, QA 47-68).");

  return {
    candidate: {
      name: info.name || "",
      testDate: info.testDate || "",
      testTime: info.testTime || "",
      subject: info.subject || "",
      slot: slotFromTime(info.testTime),
      year: (() => { const m = String(info.subject || "").match(/(20\d{2})/) || String(info.testDate || "").match(/(20\d{2})/); return m ? Number(m[1]) : null; })(),
    },
    answers,
    warnings,
  };
}
