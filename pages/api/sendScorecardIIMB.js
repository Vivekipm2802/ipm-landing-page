import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { SECTIONS, MAX_SCORE, scoreAnswers } from "../../utils/iimbScoring";

const SECTION_KEYS = SECTIONS.map((s) => s.key);
const RESULT_CODES = ["C", "W", "U", "N"];

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Keep only well-formed answer rows; scores are always recomputed server-side
function sanitizeAnswers(list) {
  if (!Array.isArray(list) || list.length === 0 || list.length > 80) return null;
  const out = [];
  for (const a of list) {
    if (!a || !SECTION_KEYS.includes(a.s) || !RESULT_CODES.includes(a.r)) return null;
    out.push({
      n: Number.isInteger(a.n) ? a.n : out.length + 1,
      s: a.s,
      c: str(a.c, 3),
      k: str(a.k, 3),
      r: a.r,
    });
  }
  return out;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const body = req.body || {};
  const name = str(body.name, 80);
  const mobile = str(body.mobile, 10);
  const email = str(body.email, 120).toLowerCase();
  const category = str(body.category, 20);
  const city = str(body.city, 60);
  const fileUrl = /^https:\/\//.test(body.fileUrl || "") ? str(body.fileUrl, 600) : null;

  if (!name) return res.status(400).json({ error: "Name is required" });
  if (!/^[6-9]\d{9}$/.test(mobile)) return res.status(400).json({ error: "Invalid mobile number" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: "Invalid email" });

  const answers = sanitizeAnswers(body.answers);
  if (!answers) return res.status(400).json({ error: "Invalid response data" });

  const scores = scoreAnswers(answers);
  if (scores.total > MAX_SCORE) return res.status(400).json({ error: "Invalid response data" });

  const uid = randomUUID();
  const sections = {};
  SECTION_KEYS.forEach((k) => {
    const s = scores.sections[k];
    sections[k] = { score: s.score, correct: s.correct, wrong: s.wrong, unattempted: s.unattempted, accuracy: s.accuracy, max: s.max };
  });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const { error: dbError } = await supabase.from("response_sheet_uploads").insert([
    {
      name,
      mobile,
      email,
      category,
      file_url: fileUrl,
      // Existing columns: VA -> VARC, MCQ -> LR, SA -> QADI (kept for old reports)
      score_va: scores.s1,
      score_mcq: scores.s2,
      score_sa: scores.s3,
      score_total: scores.total,
      raw_scores: {
        v: 2,
        uuid: uid,
        s1: scores.s1,
        s2: scores.s2,
        s3: scores.s3,
        total: scores.total,
        city,
        category,
        accuracy: scores.accuracy,
        sections,
        answers,
      },
    },
  ]);

  if (dbError) {
    console.error("Supabase insert error:", dbError);
    return res.status(500).json({ error: "Could not save scorecard" });
  }

  // Internal notification. Never blocks the student's result.
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.ZEPTOMAIL_SERVER || "smtp.zeptomail.in",
      port: 465,
      secure: true,
      auth: { user: "emailapikey", pass: process.env.ZEPTOMAIL_API_KEY },
    });
    const reportUrl = `https://register.ipmcareer.com/iimb-report/${uid}`;
    await transporter.sendMail({
      from: { name: "IIMB Response Analyzer", address: process.env.MAIL_FROM_NOREPLY || "noreply@ipmcareer.com" },
      to: "ipmcareeronline@gmail.com",
      subject: `New IIMB UG scorecard: ${name} (${scores.total}/${MAX_SCORE})`,
      text: `Name: ${name}\nMobile: ${mobile}\nEmail: ${email}\nCategory: ${category}\nCity: ${city}\nFile: ${fileUrl || "-"}\nReport: ${reportUrl}\n\nVARC: ${scores.s1}\nLR: ${scores.s2}\nQADI: ${scores.s3}\nTotal: ${scores.total}/${MAX_SCORE}\nAccuracy: ${scores.accuracy}%`,
      html: `
        <h2>New IIMB UG Scorecard</h2>
        <p><strong>Name:</strong> ${esc(name)}<br/>
        <strong>Mobile:</strong> ${esc(mobile)}<br/>
        <strong>Email:</strong> ${esc(email)}<br/>
        <strong>Category:</strong> ${esc(category)}<br/>
        <strong>City:</strong> ${esc(city)}</p>
        <p><a href="${esc(reportUrl)}">Open report</a>${fileUrl ? ` | <a href="${esc(fileUrl)}">Response sheet</a>` : ""}</p>
        <ul>
          <li><strong>VARC:</strong> ${scores.s1}</li>
          <li><strong>LR:</strong> ${scores.s2}</li>
          <li><strong>QADI:</strong> ${scores.s3}</li>
          <li><strong>Total:</strong> ${scores.total}/${MAX_SCORE} (accuracy ${scores.accuracy}%)</li>
        </ul>`,
    });
  } catch (err) {
    console.error("IIMB email failed (non-blocking):", err?.message);
  }

  return res.status(200).json({ uid });
}
