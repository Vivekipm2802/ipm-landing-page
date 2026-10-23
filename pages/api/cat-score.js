// POST /api/cat-score
// Body: { name, email, phone, category, city, url }  or  { ..., html } for an uploaded file
// Fetches the CAT 2026 response sheet (cdn*.digialm.com), parses it, scores it
// (+3 / -1 MCQ, +3 / 0 TITA) with the key printed on the sheet or our answer-key
// table, saves the scorecard and returns it with a share id.
import { parseCatSheet } from "../../lib/catSheet";
import { scoreCat, EXAM_YEAR } from "../../lib/catScoring";
import { catDb, loadCatKeys, scoreColumns } from "../../lib/catServer";

const MAX_BYTES = 6 * 1024 * 1024;
const HOST_OK = (h) => /^(cdn\d*\.)?digialm\.com$/i.test(h) || /^www\.digialm\.com$/i.test(h);

const clip = (v, n = 200) => String(v == null ? "" : v).trim().slice(0, n);

async function fetchSheet(raw) {
  let target;
  try { target = new URL(String(raw || "").trim()); } catch { return { error: "Please paste the full response sheet link." }; }
  if (target.protocol !== "https:" || !HOST_OK(target.hostname) || target.port) {
    return { error: "Only official CAT response sheet links from cdn.digialm.com are supported." };
  }
  if (!/\.html?$/i.test(target.pathname)) {
    return { error: "This does not look like a response sheet link. It should end with .html" };
  }
  target.hash = "";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(target.toString(), {
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (IPM Careers CAT Score Calculator)", Accept: "text/html" },
    });
    if (upstream.status !== 200) {
      return { error: "This link has expired or is not public. Save the response sheet page and use 'Upload file' instead." };
    }
    const html = await upstream.text();
    if (html.length > MAX_BYTES) return { error: "Response sheet is too large to process." };
    return { html, url: target.toString() };
  } catch (e) {
    return {
      error: e?.name === "AbortError"
        ? "The response sheet server took too long. Try again, or upload the saved page."
        : "Could not open the response sheet link. Try again, or upload the saved page.",
    };
  } finally {
    clearTimeout(timer);
  }
}

import { notifyLead } from "../../lib/leadNotify";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  res.setHeader("Cache-Control", "no-store");

  const b = req.body || {};
  const name = clip(b.name, 120);
  const email = clip(b.email, 200).toLowerCase();
  const phone = clip(b.phone, 20).replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  const category = clip(b.category, 20);
  const city = clip(b.city, 80);

  if (name.length < 2) return res.status(400).json({ error: "Please enter your name." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });

  const ping = (extra = {}) => notifyLead("CAT Score Calculator", { name, phone, email, Category: category, City: city, ...extra }, "https://register.ipmcareer.com/cat-score-calculator");

  let html = "", responseUrl = null, mode = "link";
  if (typeof b.html === "string" && b.html.length > 0) {
    if (b.html.length > MAX_BYTES) { await ping({ Note: "Sheet upload too large" }); return res.status(413).json({ error: "File is too large." }); }
    html = b.html;
    mode = "upload";
  } else {
    const got = await fetchSheet(b.url);
    if (got.error) { await ping({ Note: `Sheet not read: ${got.error}` }); return res.status(400).json({ error: got.error }); }
    html = got.html;
    responseUrl = got.url;
  }

  const parsed = parseCatSheet(html);
  if (parsed.error) { await ping({ Note: `Sheet not read: ${parsed.error}` }); return res.status(400).json({ error: parsed.error }); }

  let db;
  try { db = catDb(); } catch { return res.status(500).json({ error: "Server is not configured. Please try again later." }); }

  let keys = {};
  try {
    const need = parsed.answers.filter((a) => !a.k && a.q).map((a) => a.q);
    if (need.length) keys = await loadCatKeys(db, need);
  } catch (e) {
    console.error("cat-score: key lookup failed", e?.message);
  }

  const result = scoreCat(parsed.answers, keys);
  const examYear = parsed.candidate.year && parsed.candidate.year >= 2015 && parsed.candidate.year <= EXAM_YEAR + 1 ? parsed.candidate.year : EXAM_YEAR;
  const row = {
    exam_year: examYear,
    name, email, phone, category, city,
    candidate_name: clip(parsed.candidate.name, 120),
    test_date: clip(parsed.candidate.testDate, 60),
    test_time: clip(parsed.candidate.testTime, 60),
    slot: parsed.candidate.slot,
    response_url: responseUrl,
    input_mode: mode,
    ...scoreColumns(result),
  };

  // Same student, same sheet → update the earlier scorecard instead of adding a duplicate
  let uid = null;
  try {
    let q = db.from("cat_responses").select("id, uid").eq("exam_year", examYear).eq("phone", phone).limit(1);
    q = responseUrl ? q.eq("response_url", responseUrl) : q.eq("candidate_name", row.candidate_name).eq("test_date", row.test_date);
    const { data: existing } = await q;
    if (existing && existing.length) {
      const { error } = await db.from("cat_responses").update(row).eq("id", existing[0].id);
      if (error) throw error;
      uid = existing[0].uid;
    } else {
      const { data, error } = await db.from("cat_responses").insert(row).select("uid").single();
      if (error) throw error;
      uid = data.uid;
    }
  } catch (e) {
    console.error("cat-score: save failed", e?.message);
    // still return the score so the student is not left with nothing
  }

  await ping({ Score: `${result.total} / 204 (VARC ${result.sections?.VARC?.score}, DILR ${result.sections?.DILR?.score}, QA ${result.sections?.QA?.score})`, Slot: parsed.candidate.slot, Report: uid ? `https://register.ipmcareer.com/cat-report/${uid}` : "" });

  let rank = null, count = null;
  try {
    const { data } = await db.rpc("cat_score_stats", { p_year: examYear, p_score: result.total });
    if (data && data[0]) {
      count = Number(data[0].total_students) || null;
      rank = data[0].better_than_you != null ? Number(data[0].better_than_you) + 1 : null;
    }
  } catch {}

  return res.status(200).json({
    uid,
    examYear,
    candidate: parsed.candidate,
    warnings: parsed.warnings,
    result: {
      total: result.total,
      sections: result.sections,
      correct: result.correct,
      wrong: result.wrong,
      unattempted: result.unattempted,
      pendingKey: result.pendingKey,
      keySource: result.keySource,
    },
    rank,
    count,
  });
}

export const config = {
  api: { bodyParser: { sizeLimit: "4mb" }, responseLimit: "2mb" },
};
