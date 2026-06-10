import axios from "axios";
import cheerio from "cheerio";
import {
  JIPMAT_ANSWER_KEY_2026,
  applyJipmatAnswerKey,
} from "../../lib/jipmat-answer-key";

/**
 * POST /api/jipmat-parse
 *
 * Receives { url } — the candidate's official JIPMAT response-sheet URL
 * from the NTA portal, e.g.:
 *   https://nta.cbexams.com/JIPMAT/Apps/CandResp/Responsesheet.aspx?id=XXXX
 *
 * The portal is an ASP.NET WebForms app. Questions are NOT in the initial
 * HTML — they load per-topic via two chained postbacks:
 *
 *   1. GET  the page            → candidate details + __VIEWSTATE
 *   2. POST ddlTopic change     → server registers the selected topic
 *   3. POST btnLoad ("Load")    → returns .question-card blocks
 *
 * Each .question-card contains:
 *   "# N  Question ID : 116313  Topic Name : ..."   (header)
 *   <img src="QP/Qimg/_ji_2026_set01_english_q1.jpg"> (question image; qN = global number)
 *   <span id="...lblAnswer_N">Answer Given By Candidate is : 3 | NOT ANSWERED</span>
 *
 * Topics: 1 = QA (Q1–33), 2 = DILR (Q34–66), 3 = VARC (Q67–100)
 *
 * Scoring is done against lib/jipmat-answer-key.js, keyed by Question ID
 * (set-proof). Marking: +4 correct, -1 wrong, 0 unanswered.
 *
 * Returns:
 *   {
 *     data: {
 *       exam: "JIPMAT",
 *       answerKeyAvailable: true,
 *       StudentData: { participantName, rollNo, applicationNo, examDate, slot },
 *       qa:   [ { questionNo, questionId, chosenOption, status, correctAnswer, isCorrect }, … ],
 *       lrdi: [ … ],   // DILR — kept as "lrdi" for backward compatibility
 *       varc: [ … ],
 *       totalQuestions, keyCoverage
 *     }
 *   }
 */

const TOPICS = [
  { value: "1", section: "qa", offset: 0 },
  { value: "2", section: "lrdi", offset: 33 },
  { value: "3", section: "varc", offset: 66 },
];

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-IN,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Upgrade-Insecure-Requests": "1",
  "sec-ch-ua":
    '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-User": "?1",
};

// ── Cookie jar (ASP.NET session) ──
function makeJar() {
  const cookies = {};
  return {
    remember(res) {
      const setCookies = res.headers?.["set-cookie"] || [];
      for (const c of setCookies) {
        const pair = c.split(";")[0];
        const eq = pair.indexOf("=");
        if (eq > 0) cookies[pair.slice(0, eq).trim()] = pair.slice(eq + 1);
      }
    },
    header() {
      return Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
    },
  };
}

function extractFormFields($) {
  return {
    __VIEWSTATE: $("#__VIEWSTATE").val() || "",
    __VIEWSTATEGENERATOR: $("#__VIEWSTATEGENERATOR").val() || "",
    __EVENTVALIDATION: $("#__EVENTVALIDATION").val() || "",
  };
}

function buildBody(fields, topicValue, { eventTarget = "", load = false } = {}) {
  const p = new URLSearchParams();
  p.set("__EVENTTARGET", eventTarget);
  p.set("__EVENTARGUMENT", "");
  p.set("__LASTFOCUS", "");
  p.set("__VIEWSTATE", fields.__VIEWSTATE);
  p.set("__VIEWSTATEGENERATOR", fields.__VIEWSTATEGENERATOR);
  p.set("__EVENTVALIDATION", fields.__EVENTVALIDATION);
  p.set("ctl00$MainContent$ddlTopic", topicValue);
  if (load) p.set("ctl00$MainContent$btnLoad", "Load");
  return p.toString();
}

function parseQuestions($, offset) {
  const questions = [];
  $(".question-card").each(function (i) {
    const card = $(this);
    const headerText = card.text().replace(/\s+/g, " ");

    // "# 1 Question ID : 116313 Topic Name : ..."
    const seqMatch = headerText.match(/#\s*(\d+)/);
    const idMatch = headerText.match(/Question\s*ID\s*:?\s*(\d+)/i);

    // Global question number from the image filename: ..._q34.jpg
    let qNoFromImg = null;
    card.find("img").each(function () {
      const m = ($(this).attr("src") || "").match(/_q(\d+)\./i);
      if (m) qNoFromImg = parseInt(m[1], 10);
    });

    // Candidate's answer
    let chosenOption = "";
    let status = "Not Answered";
    const ansText = card.find('span[id*="lblAnswer"]').text().trim();
    const ansMatch = ansText.match(
      /Answer\s*Given\s*By\s*Candidate\s*is\s*:?\s*(\d+)/i
    );
    if (ansMatch) {
      chosenOption = ansMatch[1];
      status = "Answered";
    }

    const seq = seqMatch ? parseInt(seqMatch[1], 10) : i + 1;
    questions.push({
      questionNo: qNoFromImg || offset + seq,
      questionId: idMatch ? idMatch[1] : null,
      chosenOption,
      status,
    });
  });
  questions.sort((a, b) => a.questionNo - b.questionNo);
  return questions;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid URL" });
  }

  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  // Only permit known NTA response-sheet hosts
  const hostname = parsed.hostname.toLowerCase();
  const isAllowed =
    hostname === "cbexams.com" ||
    hostname.endsWith(".cbexams.com") ||
    hostname === "onlineregistrationform.org" ||
    hostname.endsWith(".onlineregistrationform.org");

  if (!isAllowed) {
    return res.status(400).json({
      error:
        "URL host not recognised. Please paste the official JIPMAT response-sheet link from the NTA portal (nta.cbexams.com).",
    });
  }

  if (!parsed.searchParams.get("id")) {
    return res.status(400).json({
      error:
        "This link is missing the candidate id parameter. Please copy the FULL URL from your browser's address bar (it contains '?id=').",
    });
  }

  const sheetUrl = parsed.toString();
  const jar = makeJar();

  async function get() {
    const r = await axios.get(sheetUrl, {
      timeout: 15000,
      headers: {
        ...REQUEST_HEADERS,
        "Sec-Fetch-Site": "none",
        Cookie: jar.header(),
      },
      maxRedirects: 5,
    });
    jar.remember(r);
    return r.data;
  }

  async function post(body) {
    const r = await axios.post(sheetUrl, body, {
      timeout: 15000,
      headers: {
        ...REQUEST_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: `${parsed.protocol}//${parsed.hostname}`,
        Referer: sheetUrl,
        "Sec-Fetch-Site": "same-origin",
        Cookie: jar.header(),
      },
      maxRedirects: 5,
    });
    jar.remember(r);
    return r.data;
  }

  try {
    // 1. Initial GET — candidate details + form state
    const initialHtml = await get();
    if (
      !initialHtml ||
      typeof initialHtml !== "string" ||
      initialHtml.trim().length < 100
    ) {
      return res.status(400).json({
        error:
          "The response-sheet page returned empty content. The link may have expired — please re-open your response sheet on the NTA portal and copy the fresh URL.",
      });
    }

    const $init = cheerio.load(initialHtml);

    const participantName =
      $init("#MainContent_lblName").text().trim() || "Unknown";
    const rollNo = $init("#MainContent_lblRollNo").text().trim() || "";
    const applicationNo = $init("#MainContent_lblAppNo").text().trim() || "";
    const examDate = $init("#MainContent_lblExamDate").text().trim() || "";
    const slot = $init("#MainContent_lblSlot").text().trim() || "";

    if (!$init("#MainContent_ddlTopic").length) {
      return res.status(400).json({
        error:
          "This does not look like a JIPMAT response sheet (topic selector not found). Please check the URL — it should open your Candidate Response Sheet on nta.cbexams.com.",
      });
    }

    const initialFields = extractFormFields($init);
    if (!initialFields.__VIEWSTATE) {
      return res.status(400).json({
        error:
          "Could not read the page state. The link may have expired — please copy a fresh response-sheet URL and try again.",
      });
    }

    // 2. For each topic: select-topic postback → Load postback (parallel)
    const sections = { qa: [], lrdi: [], varc: [] };

    await Promise.all(
      TOPICS.map(async (topic) => {
        // Step A: dropdown change postback
        const stepHtml = await post(
          buildBody(initialFields, topic.value, {
            eventTarget: "ctl00$MainContent$ddlTopic",
          })
        );
        const $step = cheerio.load(stepHtml);

        // Step B: click the (hidden) Load button with refreshed state
        const loadHtml = await post(
          buildBody(extractFormFields($step), topic.value, { load: true })
        );
        const $load = cheerio.load(loadHtml);

        sections[topic.section] = parseQuestions($load, topic.offset);
      })
    );

    const { qa, lrdi, varc } = sections;
    const totalQuestions = qa.length + lrdi.length + varc.length;

    // 3. Validate
    if (totalQuestions === 0) {
      return res.status(400).json({
        error:
          "Could not parse any questions from the response sheet. The link may have expired, or the page format may have changed. Please re-open your response sheet on the NTA portal, copy the fresh URL, and try again.",
      });
    }

    // 4. Score against the official answer key (by Question ID)
    let keyCoverage = 0;
    keyCoverage += applyJipmatAnswerKey(qa);
    keyCoverage += applyJipmatAnswerKey(lrdi);
    keyCoverage += applyJipmatAnswerKey(varc);

    const answerKeyAvailable =
      Object.keys(JIPMAT_ANSWER_KEY_2026).length > 0 && keyCoverage > 0;

    // 5. Return structured data
    return res.status(200).json({
      data: {
        exam: "JIPMAT",
        answerKeyAvailable,
        StudentData: { participantName, rollNo, applicationNo, examDate, slot },
        qa,
        lrdi,
        varc,
        totalQuestions,
        keyCoverage,
      },
    });
  } catch (err) {
    console.error("[jipmat-parse] Error:", err?.message || err);

    if (err?.response?.status === 403) {
      return res.status(403).json({
        error:
          "The response-sheet URL returned 403 Forbidden. The link may have expired — please re-login on the NTA portal and copy a fresh URL.",
      });
    }

    if (err?.response?.status === 404) {
      return res.status(404).json({
        error:
          "The response-sheet was not found (404). Please check the URL and try again.",
      });
    }

    if (err?.code === "ECONNABORTED" || err?.code === "ETIMEDOUT") {
      return res.status(504).json({
        error:
          "The NTA server took too long to respond. Please try again in a moment.",
      });
    }

    return res.status(500).json({
      error:
        "Failed to fetch or parse the response sheet. Please check the URL and try again.",
    });
  }
}
