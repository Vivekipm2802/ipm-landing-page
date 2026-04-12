import axios from "axios";
import cheerio from "cheerio";

/**
 * POST /api/sheetdata
 *
 * Receives { url } — the candidate's official IPMAT response-sheet URL
 * from cdn.digialm.com (TCS iON platform).
 *
 * Parses the HTML and returns structured score data that the /response
 * page frontend expects:
 *
 *   {
 *     data: {
 *       StudentData: { participantName },
 *       sa:  [ { status, rightAnswer, givenAnswer }, … ],
 *       mcq: [ { status, rightAnswer, givenAnswer }, … ],
 *       va:  [ { status, rightAnswer, givenAnswer }, … ],
 *     }
 *   }
 *
 * HTML structure (TCS iON response sheet):
 *   .main-info-pnl          — student info table (Participant Name, ID, etc.)
 *   .section-cntnr          — one per section, contains .section-lbl + .question-pnl(s)
 *     .section-lbl          — "Section : Quantitative Ability SA" / "... MCQ" / "Verbal Ability"
 *     .question-pnl         — one per question
 *       .menu-tbl           — table with "Status :" and "Chosen Option :" rows
 *       .questionRowTbl     — contains answer options with .rightAns / .wrngAns classes
 *                           — SA questions have "Given Answer :" label + value in next <td>
 *                           — SA correct answer in .rightAns: "Possible Answer: 3000"
 *                           — MCQ correct answer in .rightAns: "2." (option number with dot)
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid URL" });
  }

  // Only permit known response-sheet hosts
  const allowedHosts = [
    "cdn.digialm.com",
    "www.digialm.com",
    "digialm.com",
    "cdn2.digialm.com",
  ];

  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  if (!allowedHosts.includes(parsed.hostname)) {
    return res.status(400).json({
      error:
        "URL host not recognised. Please paste the official response-sheet link from the IIM/TCS iON portal.",
    });
  }

  try {
    // 1. Fetch the response-sheet HTML
    const response = await axios.get(url.trim(), {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      maxRedirects: 3,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 2. Extract student name from .main-info-pnl table
    let participantName = "Unknown";
    $(".main-info-pnl td").each(function () {
      const text = $(this).text().trim();
      if (/participant\s*name/i.test(text)) {
        const next = $(this).next("td").text().trim();
        if (next) participantName = next;
      }
    });

    // 3. Parse sections — each .section-cntnr has a .section-lbl and question panels
    const sections = { sa: [], mcq: [], va: [] };

    $(".section-cntnr").each(function () {
      const sectionEl = $(this);
      const label = sectionEl.find(".section-lbl").first().text().trim().toLowerCase();

      // Determine which bucket this section belongs to
      let bucket;
      if (label.includes("sa") || label.includes("short answer")) {
        bucket = "sa";
      } else if (
        label.includes("verbal") ||
        label.includes("va") ||
        label.includes("english") ||
        label.includes("language")
      ) {
        bucket = "va";
      } else if (label.includes("mcq") || label.includes("quantitative")) {
        bucket = "mcq";
      } else {
        // Default: if label doesn't match, put in mcq
        bucket = "mcq";
      }

      // 4. Parse each question panel within this section
      sectionEl.find(".question-pnl").each(function () {
        const panel = $(this);
        const menuTbl = panel.find(".menu-tbl");
        const rowTbl = panel.find(".questionRowTbl");

        // Helper: extract value from label-value pair in menu-tbl
        function getMenuValue(label) {
          let value = "";
          menuTbl.find("td").each(function () {
            const t = $(this).text().trim();
            if (t.toLowerCase().replace(/\s+/g, "").includes(label.toLowerCase().replace(/\s+/g, ""))) {
              value = $(this).next("td").text().trim();
            }
          });
          return value;
        }

        const status = getMenuValue("Status") || "Not Answered";
        const chosenOption = getMenuValue("Chosen Option") || "";

        // Determine correct answer and given answer based on question type
        let rightAnswer = "";
        let givenAnswer = "";

        if (bucket === "sa") {
          // SA (Short Answer) questions:
          //   - Correct answer: .rightAns text like "Possible Answer: 3000" → extract "3000"
          //   - Given answer: TD after "Given Answer :" label
          const rightAnsEl = rowTbl.find(".rightAns").first();
          if (rightAnsEl.length) {
            const raText = rightAnsEl.text().trim();
            // Extract number after "Possible Answer:" or just take the text
            const match = raText.match(/(?:possible\s*answer\s*:\s*)(.*)/i);
            rightAnswer = match ? match[1].trim() : raText;
          }

          // Find "Given Answer" value
          rowTbl.find("td").each(function () {
            if ($(this).text().trim().toLowerCase().startsWith("given answer")) {
              givenAnswer = $(this).next("td").text().trim();
            }
          });
        } else {
          // MCQ questions:
          //   - Correct answer: .rightAns text like "2." → extract "2"
          //   - Given answer: "Chosen Option" from menu-tbl like "2" or "--"
          const rightAnsEl = rowTbl.find(".rightAns").first();
          if (rightAnsEl.length) {
            const raText = rightAnsEl.text().trim();
            // Extract leading digit(s) before the dot: "2." → "2"
            const match = raText.match(/^(\d+)/);
            rightAnswer = match ? match[1] : raText;
          }

          givenAnswer = chosenOption === "--" ? "" : chosenOption;
        }

        sections[bucket].push({
          status,
          rightAnswer,
          givenAnswer,
        });
      });
    });

    // 5. Fallback: if no .section-cntnr found, try flat .question-pnl parsing
    //    and split by standard IPMAT Indore layout (15 SA + 30 MCQ + 45 VA)
    if (
      sections.sa.length === 0 &&
      sections.mcq.length === 0 &&
      sections.va.length === 0
    ) {
      const allQuestions = [];

      $(".question-pnl").each(function () {
        const panel = $(this);
        const menuTbl = panel.find(".menu-tbl");
        const rowTbl = panel.find(".questionRowTbl");

        function getMenuValue(label) {
          let value = "";
          menuTbl.find("td").each(function () {
            const t = $(this).text().trim();
            if (t.toLowerCase().replace(/\s+/g, "").includes(label.toLowerCase().replace(/\s+/g, ""))) {
              value = $(this).next("td").text().trim();
            }
          });
          return value;
        }

        const status = getMenuValue("Status") || "Not Answered";
        const chosenOption = getMenuValue("Chosen Option") || "";

        // Try to detect if SA or MCQ from structure
        const hasGivenAnswer = rowTbl.find("td").filter(function () {
          return $(this).text().trim().toLowerCase().startsWith("given answer");
        }).length > 0;

        let rightAnswer = "";
        let givenAnswer = "";

        const rightAnsEl = rowTbl.find(".rightAns").first();
        if (hasGivenAnswer) {
          // SA-style
          if (rightAnsEl.length) {
            const raText = rightAnsEl.text().trim();
            const match = raText.match(/(?:possible\s*answer\s*:\s*)(.*)/i);
            rightAnswer = match ? match[1].trim() : raText;
          }
          rowTbl.find("td").each(function () {
            if ($(this).text().trim().toLowerCase().startsWith("given answer")) {
              givenAnswer = $(this).next("td").text().trim();
            }
          });
        } else {
          // MCQ-style
          if (rightAnsEl.length) {
            const raText = rightAnsEl.text().trim();
            const match = raText.match(/^(\d+)/);
            rightAnswer = match ? match[1] : raText;
          }
          givenAnswer = chosenOption === "--" ? "" : chosenOption;
        }

        allQuestions.push({ status, rightAnswer, givenAnswer });
      });

      // Standard IPMAT Indore split: 15 SA + 30 MCQ + 45 VA
      // But also support older 20+20+40 pattern
      const total = allQuestions.length;
      let saCount, mcqCount;
      if (total === 90) {
        saCount = 15;
        mcqCount = 30;
      } else if (total === 80) {
        saCount = 20;
        mcqCount = 20;
      } else {
        // Generic split
        saCount = Math.round(total * 0.17);
        mcqCount = Math.round(total * 0.33);
      }

      sections.sa = allQuestions.slice(0, saCount);
      sections.mcq = allQuestions.slice(saCount, saCount + mcqCount);
      sections.va = allQuestions.slice(saCount + mcqCount);
    }

    // 6. Return structured data matching what the frontend expects
    return res.status(200).json({
      data: {
        StudentData: { participantName },
        sa: sections.sa,
        mcq: sections.mcq,
        va: sections.va,
      },
    });
  } catch (err) {
    console.error("[sheetdata] Error:", err?.message || err);

    if (err?.response?.status === 403) {
      return res.status(403).json({
        error:
          "The response-sheet URL returned 403 Forbidden. The link may have expired or requires re-login on the IIM portal.",
      });
    }

    return res.status(500).json({
      error:
        "Failed to fetch or parse the response sheet. Please check the URL and try again.",
    });
  }
}
