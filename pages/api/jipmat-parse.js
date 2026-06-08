import axios from "axios";
import cheerio from "cheerio";

/**
 * POST /api/jipmat-parse
 *
 * Receives { url } — the candidate's official JIPMAT response-sheet URL
 * from onlineregistrationform.org (NTA platform).
 *
 * Parses the HTML and returns structured data:
 *
 *   {
 *     data: {
 *       exam: "JIPMAT",
 *       StudentData: { participantName },
 *       qa:   [ { questionNo, chosenOption, status }, … ],   // Q1-33
 *       lrdi: [ { questionNo, chosenOption, status }, … ],   // Q34-66
 *       varc: [ { questionNo, chosenOption, status }, … ],   // Q67-100
 *     }
 *   }
 *
 * JIPMAT format (onlineregistrationform.org / NTA):
 *   Questions have "Question No. X / Question ID XXXXX" headers
 *   4 options per question, chosen answer marked with "(Chosen Option)" text
 *   Status: "Answered", "Not Answered", "Marked For Review", etc.
 *
 * JIPMAT exam structure:
 *   100 questions total
 *   QA (Quantitative Aptitude):           Q1  – Q33  (33 questions)
 *   LRDI (Logical Reasoning & DI):        Q34 – Q66  (33 questions)
 *   VARC (Verbal Ability & Reading Comp):  Q67 – Q100 (34 questions)
 *   Marking: +4 correct, -1 wrong, 0 unanswered
 *   Total: 400 marks, 150 minutes
 */

// ─── JIPMAT 2026 Official Answer Key ───
// UPDATE THIS when the official answer key is released.
// Format: { questionNumber: correctOptionNumber }
// e.g. { 1: 2, 2: 4, 3: 1, ... }
// Set to null if answer key is not yet available.
const JIPMAT_ANSWER_KEY = null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid URL" });
  }

  // Only permit known JIPMAT response-sheet hosts
  const allowedHosts = [
    "onlineregistrationform.org",
    "www.onlineregistrationform.org",
  ];

  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  // Allow any subdomain of onlineregistrationform.org
  const hostname = parsed.hostname.toLowerCase();
  const isAllowed = allowedHosts.some(
    (h) => hostname === h || hostname.endsWith("." + h)
  );

  if (!isAllowed) {
    return res.status(400).json({
      error:
        "URL host not recognised. Please paste the official JIPMAT response-sheet link from the NTA portal (onlineregistrationform.org).",
    });
  }

  try {
    // 1. Fetch the response-sheet HTML
    const response = await axios.get(url.trim(), {
      timeout: 20000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      maxRedirects: 5,
    });

    const html = response.data;
    if (!html || typeof html !== "string" || html.trim().length < 100) {
      return res.status(400).json({
        error:
          "The response-sheet page returned empty content. The link may have expired. Please try again or use a different browser to re-download the page.",
      });
    }

    const $ = cheerio.load(html);

    // 2. Extract student name
    let participantName = "Unknown";

    // Strategy A: Look for participant name in info tables
    $("td, th, span, div").each(function () {
      const text = $(this).text().trim();
      if (/candidate\s*name|participant\s*name|student\s*name/i.test(text)) {
        const next = $(this).next("td, th, span, div").text().trim();
        if (next && next.length > 1 && next.length < 100) {
          participantName = next;
          return false; // break
        }
      }
    });

    // Strategy B: Look for name in .main-info-pnl (NTA standard)
    if (participantName === "Unknown") {
      $(".main-info-pnl td").each(function () {
        const text = $(this).text().trim();
        if (/candidate|participant|name/i.test(text) && !/roll|id|centre/i.test(text)) {
          const next = $(this).next("td").text().trim();
          if (next && next.length > 1 && next.length < 100 && !/^\d+$/.test(next)) {
            participantName = next;
            return false;
          }
        }
      });
    }

    // 3. Parse all questions
    const allQuestions = [];

    // ─── Strategy 1: NTA standard .question-pnl structure ───
    $(".question-pnl").each(function () {
      const panel = $(this);
      const menuTbl = panel.find(".menu-tbl");

      // Extract question number from header text
      let questionNo = allQuestions.length + 1;
      const headerText = panel.find("td, th, div, span").first().text();
      const qMatch = headerText.match(/Question\s*(?:No\.?|Number)?\s*[:\s]*(\d+)/i);
      if (qMatch) questionNo = parseInt(qMatch[1]);

      // Get status from menu table
      let status = "Not Answered";
      let chosenOption = "";

      menuTbl.find("td").each(function () {
        const t = $(this).text().trim().toLowerCase().replace(/\s+/g, "");
        if (t.includes("status")) {
          const val = $(this).next("td").text().trim();
          if (val) status = val;
        }
        if (t.includes("chosenoption")) {
          const val = $(this).next("td").text().trim();
          if (val && val !== "--") chosenOption = val;
        }
      });

      // Also check for "(Chosen Option)" marker in option text
      if (!chosenOption) {
        panel.find("td, span, div, label").each(function () {
          const text = $(this).text().trim();
          if (text.includes("(Chosen Option)")) {
            // Extract option number — look for a preceding number
            const optMatch = text.match(/^(\d+)\s*[.)]/);
            if (optMatch) {
              chosenOption = optMatch[1];
              status = "Answered";
            }
          }
        });
      }

      allQuestions.push({
        questionNo,
        chosenOption: chosenOption || "",
        status,
      });
    });

    // ─── Strategy 2: Parse by "(Chosen Option)" markers if Strategy 1 found nothing ───
    if (allQuestions.length === 0) {
      // Find all question blocks by looking for question number patterns
      const questionBlocks = [];
      let currentBlock = { texts: [], startIndex: -1 };

      // Get full HTML text and find question boundaries
      const bodyHtml = $("body").html() || html;

      // Split by question headers
      const questionHeaderRegex =
        /Question\s*(?:No\.?|Number)?\s*[:\s]*(\d+)\s*(?:\/\s*Question\s*ID\s*[:\s]*\d+)?/gi;
      let match;
      const headers = [];
      while ((match = questionHeaderRegex.exec(bodyHtml)) !== null) {
        headers.push({
          questionNo: parseInt(match[1]),
          index: match.index,
        });
      }

      if (headers.length > 0) {
        // For each question header, find the content until the next header
        for (let i = 0; i < headers.length; i++) {
          const startIdx = headers[i].index;
          const endIdx =
            i + 1 < headers.length ? headers[i + 1].index : bodyHtml.length;
          const qHtml = bodyHtml.substring(startIdx, endIdx);
          const q$ = cheerio.load(`<div>${qHtml}</div>`);

          let chosenOption = "";
          let status = "Not Answered";

          // Look for "(Chosen Option)" marker
          q$("td, span, div, label, p, li").each(function () {
            const text = q$(this).text().trim();
            if (text.includes("(Chosen Option)")) {
              // Try to extract option number
              // Pattern: "1) Option text (Chosen Option)" or "Option 1 ... (Chosen Option)"
              const optMatch = text.match(/^(\d+)\s*[.)]/);
              if (optMatch) {
                chosenOption = optMatch[1];
              } else {
                // Try: "Option 1" or "A)" etc.
                const altMatch = text.match(/(?:Option|Opt\.?)\s*(\d+)/i);
                if (altMatch) chosenOption = altMatch[1];
              }
              status = "Answered";
            }
          });

          // Also check for "Chosen Option :" field
          q$("td, span").each(function () {
            const t = q$(this).text().trim();
            if (/chosen\s*option\s*[:\s]/i.test(t)) {
              const val = q$(this).next().text().trim();
              if (val && val !== "--" && val !== "N/A") {
                chosenOption = val;
                status = "Answered";
              }
            }
          });

          // Check status field
          q$("td, span").each(function () {
            const t = q$(this).text().trim();
            if (/^status\s*[:\s]/i.test(t)) {
              const val = q$(this).next().text().trim();
              if (val) status = val;
            }
          });

          allQuestions.push({
            questionNo: headers[i].questionNo,
            chosenOption: chosenOption || "",
            status,
          });
        }
      }
    }

    // ─── Strategy 3: Table-row based parsing ───
    if (allQuestions.length === 0) {
      // Some NTA pages render as a single large table
      let qNum = 0;
      $("tr, div[class*='question'], div[class*='item']").each(function () {
        const rowText = $(this).text().trim();
        // Check if this row is a question header
        const qMatch = rowText.match(
          /Question\s*(?:No\.?|Number)?\s*[:\s]*(\d+)/i
        );
        if (qMatch) {
          qNum = parseInt(qMatch[1]);
        }
        // Check if this row contains "(Chosen Option)"
        if (rowText.includes("(Chosen Option)") && qNum > 0) {
          const optMatch = rowText.match(/(\d+)\s*[.)]\s*.*?\(Chosen Option\)/);
          allQuestions.push({
            questionNo: qNum,
            chosenOption: optMatch ? optMatch[1] : "",
            status: "Answered",
          });
          qNum = 0; // reset
        }
      });
    }

    // 4. Validate we got questions
    if (allQuestions.length === 0) {
      return res.status(400).json({
        error:
          "Could not parse any questions from the response sheet. The page format may have changed. Please contact support.",
      });
    }

    // 5. Sort by question number
    allQuestions.sort((a, b) => a.questionNo - b.questionNo);

    // 6. Split into JIPMAT sections (QA: 1-33, LRDI: 34-66, VARC: 67-100)
    const qa = [];
    const lrdi = [];
    const varc = [];

    for (const q of allQuestions) {
      if (q.questionNo <= 33) {
        qa.push(q);
      } else if (q.questionNo <= 66) {
        lrdi.push(q);
      } else {
        varc.push(q);
      }
    }

    // If sections couldn't be split by question number (numbering might restart per section)
    // Fall back to sequential split: first 33 = QA, next 33 = LRDI, last 34 = VARC
    let finalQa = qa,
      finalLrdi = lrdi,
      finalVarc = varc;
    if (qa.length === 0 && lrdi.length === 0 && varc.length === 0) {
      finalQa = allQuestions.slice(0, 33);
      finalLrdi = allQuestions.slice(33, 66);
      finalVarc = allQuestions.slice(66, 100);
    }

    // 7. If answer key is available, add correctAnswer and scoring
    if (JIPMAT_ANSWER_KEY) {
      for (const section of [finalQa, finalLrdi, finalVarc]) {
        for (const q of section) {
          const correctAns = JIPMAT_ANSWER_KEY[q.questionNo];
          if (correctAns !== undefined) {
            q.correctAnswer = String(correctAns);
            if (q.chosenOption && q.chosenOption !== "") {
              q.isCorrect = String(q.chosenOption) === String(correctAns);
            } else {
              q.isCorrect = null; // unanswered
            }
          }
        }
      }
    }

    // 8. Return structured data
    return res.status(200).json({
      data: {
        exam: "JIPMAT",
        answerKeyAvailable: JIPMAT_ANSWER_KEY !== null,
        StudentData: { participantName },
        qa: finalQa,
        lrdi: finalLrdi,
        varc: finalVarc,
        totalQuestions: allQuestions.length,
      },
    });
  } catch (err) {
    console.error("[jipmat-parse] Error:", err?.message || err);

    if (err?.response?.status === 403) {
      return res.status(403).json({
        error:
          "The response-sheet URL returned 403 Forbidden. The link may have expired or requires re-login on the NTA portal.",
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
          "The response-sheet server took too long to respond. Please try again in a moment.",
      });
    }

    return res.status(500).json({
      error:
        "Failed to fetch or parse the response sheet. Please check the URL and try again.",
    });
  }
}
