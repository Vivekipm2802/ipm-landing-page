import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import axios from "axios";
import { toast } from "react-hot-toast";
import AppShell from "../components/AppShell";
import styles from "./Response.module.css";
import ui from "./IimbUg.module.css";
import {
  SECTIONS,
  MAX_SCORE,
  TOTAL_QUESTIONS,
  parseResponseSheet,
  scoreAnswers,
  buildInsights,
} from "../utils/iimbScoring";

// Update this each cycle when IIMB shares the new response sheet login link
const RESPONSE_LOGIN_URL = "https://cdn.digialm.com/EForms/configuredHtml/1345/96226/login.html";
const PAGE_URL = "https://register.ipmcareer.com/response-v1";
const WHATSAPP_URL = "https://wa.me/918299470392?text=" + encodeURIComponent("IIMB - I just checked my IIM Bangalore UG score. Help me plan PI prep.");

const CATEGORIES = ["General", "EWS", "NC-OBC", "SC", "ST", "PwD"];

const FAQS = [
  {
    q: "What is the IIM Bangalore UG Score Calculator?",
    a: "It is a free tool by IPM Careers that reads your saved IIM Bangalore UG Test response sheet (HTML file) and calculates your VARC, LR, QADI and total score using +3 for a correct answer and -1 for a wrong answer. You also get accuracy, attempts and a shareable report.",
  },
  {
    q: "How many questions and marks are there in the IIM Bangalore UG Test?",
    a: "As per IIMB's admissions document, the UG Test is a 135-minute computer-based test with 60 multiple-choice questions: VARC 15, LR 15 and QADI 30. With +3 per correct answer, the maximum score is 180.",
  },
  {
    q: "What is the IIMB UG marking scheme used by this calculator?",
    a: "+3 for each correct answer, -1 for each wrong answer and 0 for unattempted questions. Section maximums are VARC 45, LR 45 and QADI 90.",
  },
  {
    q: "How do I get my IIM Bangalore UG response sheet file?",
    a: "Log in to the response sheet link shared by IIMB and open your response sheet. Copy the page link (it starts with https://cdn.digialm.com/) and paste it here. If the link does not work, save the page as HTML (Ctrl+S on laptop, Download on mobile) and upload that file instead. PDFs and screenshots do not work.",
  },
  {
    q: "Why does IIMB need a positive score in every section?",
    a: "IIMB's admissions process states that only candidates with a positive raw score in all three sections are considered for the first shortlist. The calculator flags any section where your raw score is zero or negative.",
  },
  {
    q: "How does IIMB use the UG Test score for selection?",
    a: "At the pre-interview stage the UG Test carries 70 points (QADI 20, LR 30, VARC 20), along with Class 10 overall score (15), Class 10 maths score (10) and gender diversity (5). After the interview, the UG Test carries 40, the personal interview 40, Class 10 overall 10 and Class 10 maths 10.",
  },
  {
    q: "Is my calculated score the same as my official IIMB score?",
    a: "It matches the raw marks from your response sheet. IIMB standardises scores and computes percentiles for shortlisting, so your official percentile and composite score can differ from the raw total.",
  },
  {
    q: "Is the IIM Bangalore UG Score Calculator free?",
    a: "Yes. It is completely free. Your phone number and email are never shown publicly.",
  },
];

export default function IimbUgScoreCalculator() {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", category: "", city: "" });
  const [mode, setMode] = useState("link"); // "link" | "file"
  const [sheetUrl, setSheetUrl] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [boardLoading, setBoardLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [device, setDevice] = useState("laptop");
  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get("/api/iimbLeaderboard");
      setLeaderboard(res?.data?.leaderboard ?? []);
      if (typeof res?.data?.count === "number") setCount(res.data.count);
    } catch (e) {
      setLeaderboard([]);
    } finally {
      setBoardLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 7000);
    return () => clearTimeout(t);
  }, [error]);

  const update = (key) => (e) => {
    setError("");
    const value = key === "mobile" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const acceptFile = (f) => {
    setError("");
    setWarning("");
    if (!f) return;
    const name = (f.name || "").toLowerCase();
    if (name.endsWith(".pdf") || f.type === "application/pdf") {
      setError("That is a PDF. Please save the response sheet page as HTML (Ctrl+S) and upload the .html file.");
      return;
    }
    if (!name.endsWith(".html") && !name.endsWith(".htm") && f.type !== "text/html") {
      setError("Please upload the response sheet as an .html or .htm file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File is larger than 10 MB. Save the page as 'Webpage, HTML only' and try again.");
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    acceptFile(e.dataTransfer?.files?.[0]);
  };

  const onDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return "Please enter a valid 10-digit mobile number (without +91 or 0).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (!form.category) return "Please select your category.";
    if (mode === "link") {
      let u;
      try {
        u = new URL(sheetUrl.trim());
      } catch {
        return "Please paste the full response sheet link (it starts with https://cdn.digialm.com/...).";
      }
      if (u.hostname !== "cdn.digialm.com") return "That link is not an IIMB response sheet link. It should start with https://cdn.digialm.com/";
    } else if (!file) {
      return "Please upload your response sheet HTML file.";
    }
    return "";
  };

  const uploadToCloudinary = async (f) => {
    try {
      const data = new FormData();
      data.append("file", f);
      data.append("upload_preset", "leg7fkr7");
      const res = await axios.post("https://api.cloudinary.com/v1_1/duyo9pzxy/auto/upload/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.secure_url;
    } catch (e) {
      console.error("Cloudinary upload failed", e);
      return null;
    }
  };

  const analyse = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    setError("");
    setWarning("");

    try {
      let html = "";
      if (mode === "link") {
        try {
          const res = await axios.post("/api/iimb-fetch-sheet", { url: sheetUrl.trim() });
          html = res?.data?.html || "";
        } catch (e) {
          setError(e?.response?.data?.error || "We could not open that link. Check it, or switch to 'Upload file' and upload the saved page.");
          setSubmitting(false);
          return;
        }
      } else {
        html = await file.text();
      }
      const parsed = parseResponseSheet(html);
      if (parsed.error) {
        setError(parsed.error);
        setSubmitting(false);
        return;
      }
      if (parsed.warning) setWarning(parsed.warning);

      const scores = scoreAnswers(parsed.answers);
      const fileUrl = mode === "link" ? sheetUrl.trim() : await uploadToCloudinary(file);

      let uid = null;
      try {
        const res = await axios.post("/api/sendScorecardIIMB", {
          name: form.name.trim(),
          mobile: form.mobile,
          email: form.email.trim(),
          category: form.category,
          city: form.city.trim(),
          fileUrl,
          answers: parsed.answers,
        });
        uid = res?.data?.uid || null;
      } catch (e) {
        console.error("Save failed", e);
        toast.error("Score calculated, but we could not save your report link. Try again in a minute.");
      }

      setResult({
        name: form.name.trim(),
        category: form.category,
        city: form.city.trim(),
        answers: parsed.answers,
        scores,
        insights: buildInsights(scores),
        uid,
      });
      if (uid) toast.success("Scorecard ready!");
      fetchLeaderboard();
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      console.error(e);
      setError("Something went wrong while reading your file. Please re-save the response sheet as HTML and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setFile(null);
    setSheetUrl("");
    setWarning("");
    setForm({ name: "", mobile: "", email: "", category: "", city: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reportUrl = result?.uid ? `https://register.ipmcareer.com/iimb-report/${result.uid}` : PAGE_URL;
  const shareText = result
    ? `I scored ${result.scores.total}/${MAX_SCORE} in the IIM Bangalore UG Test (VARC ${result.scores.sections.VARC.score}, LR ${result.scores.sections.LR.score}, QADI ${result.scores.sections.QADI.score}). Check yours free: ${reportUrl}`
    : "";

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not copy. Long-press the link to copy.");
    }
  };

  const top3 = leaderboard.slice(0, 3);

  return (
    <AppShell activePage="/response-v1" pageTitle="IIM-B UG Score Calculator">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title="IIM Bangalore UG Score Calculator 2026 | IIMB UG Response Sheet & Answer Key Tool"
        description="Free IIM Bangalore UG Score Calculator. Upload your IIMB UG response sheet and get VARC, LR, QADI and total score out of 180 instantly, with accuracy, sectional check and a shareable report."
        canonical={PAGE_URL}
        openGraph={{
          url: PAGE_URL,
          title: "IIM Bangalore UG Score Calculator 2026 | Free IIMB UG Response Sheet Tool",
          description: "Upload your IIMB UG response sheet and get your section-wise score out of 180 in seconds. Free tool by IPM Careers.",
          images: [{ url: "https://register.ipmcareer.com/iimbug.png", width: 1200, height: 630, alt: "IIM Bangalore UG Score Calculator" }],
          siteName: "IPM Careers",
        }}
        twitter={{ cardType: "summary_large_image" }}
        additionalMetaTags={[
          {
            name: "keywords",
            content:
              "IIM Bangalore UG score calculator, IIMB UG score calculator, IIM Bangalore UG response sheet, IIMB UG answer key, IIM Bangalore UG answer key 2026, IIM B UG response key tool, IIMB UG Test marks calculator, IIM Bangalore BSc score calculator",
          },
          { name: "robots", content: "index, follow, max-image-preview:large" },
        ]}
      />

      <div className={styles.page}>
        {/* ── Hero ── */}
        <div className={styles.hero}>
          <div className={`${styles.heroGlow} ${styles.heroGlow1}`}></div>
          <div className={`${styles.heroGlow} ${styles.heroGlow2}`}></div>
          <div className={`${styles.heroGlow} ${styles.heroGlow3}`}></div>

          <div className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowDot}></span>
            IIM Bangalore UG Test 2026
          </div>
          <h1 className={styles.heroTitle}>
            IIM Bangalore UG Score Calculator.{" "}
            <span className={styles.heroTitleAccent}>Paste your response sheet link, get your score in seconds.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            VARC, LR and QADI scores out of 180, accuracy, sectional cut check and a report you can share.
          </p>
          <div className={styles.socialProof}>
            {count > 0 && (
              <>
                <div className={styles.proofStat}>
                  <span className={styles.proofStatNum}>{count.toLocaleString("en-IN")}+</span> scorecards
                </div>
                <div className={styles.proofDot}></div>
              </>
            )}
            <div className={styles.proofStat}>
              <span className={styles.proofStatNum}>100%</span> free
            </div>
            <div className={styles.proofDot}></div>
            <div className={styles.proofStat}>No login needed</div>
          </div>
        </div>

        {/* ── Quick facts ── */}
        <div className={ui.factStrip}>
          <div className={ui.fact}><div className={ui.factNum}>{TOTAL_QUESTIONS}</div><div className={ui.factLabel}>MCQs</div></div>
          <div className={ui.fact}><div className={ui.factNum}>135</div><div className={ui.factLabel}>Minutes</div></div>
          <div className={ui.fact}><div className={ui.factNum}>{MAX_SCORE}</div><div className={ui.factLabel}>Max marks</div></div>
          <div className={ui.fact}><div className={ui.factNum}>+3 / -1</div><div className={ui.factLabel}>Marking</div></div>
        </div>

        <div className={ui.layout}>
          {/* ════════ MAIN COLUMN ════════ */}
          <div className={ui.mainCol}>
            {top3.length > 0 && (
              <div className={styles.topperRow}>
                {top3.map((t, i) => (
                  <div key={i} className={styles.topperBadge}>
                    <span className={`${styles.topperRank} ${i === 0 ? styles.topperRank1 : i === 1 ? styles.topperRank2 : styles.topperRank3}`}>{i + 1}</span>
                    {t.name}
                    <span className={styles.topperScore}>{t.total}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Result ── */}
            {result && (
              <div ref={resultRef} style={{ scrollMarginTop: 90 }}>
                <div className={styles.scorecardResult}>
                  <div className={styles.scorecardBg}></div>
                  <div className={styles.scorecardBg2}></div>
                  <div className={styles.scorecardHeader}>
                    <div className={styles.scorecardTitle}>Your IIM-B UG Scorecard</div>
                    <div className={styles.scorecardName}>👤 {result.name}</div>
                  </div>
                  <div className={styles.scoreGrid}>
                    {SECTIONS.map((s) => (
                      <div key={s.key} className={styles.scoreBox}>
                        <div className={styles.scoreBoxLabel}>{s.short}</div>
                        <div className={styles.scoreBoxValue}>
                          {result.scores.sections[s.key].score}
                          <span className={ui.scoreBoxMax}>/{result.scores.sections[s.key].max}</span>
                        </div>
                      </div>
                    ))}
                    <div className={`${styles.scoreBox} ${styles.scoreBoxTotal}`}>
                      <div className={styles.scoreBoxLabel}>Total</div>
                      <div className={styles.scoreBoxValue}>
                        {result.scores.total}
                        <span className={ui.scoreBoxMax}>/{MAX_SCORE}</span>
                      </div>
                    </div>
                  </div>
                  <div className={ui.scorecardMeta}>
                    <span className={ui.metaChip}>✅ {result.scores.correct} correct</span>
                    <span className={ui.metaChip}>❌ {result.scores.wrong} wrong</span>
                    <span className={ui.metaChip}>⏭ {result.scores.unattempted} skipped</span>
                    <span className={ui.metaChip}>🎯 {result.scores.accuracy}% accuracy</span>
                    {result.category && <span className={ui.metaChip}>{result.category}</span>}
                  </div>
                </div>

                {warning && (
                  <div className={ui.warnMsg} style={{ marginTop: -8, marginBottom: 16 }}>
                    <span>⚠️</span>
                    {warning}
                  </div>
                )}

                <div className={`${styles.actionRow} ${ui.noPrint}`}>
                  {result.uid ? (
                    <a href={`/iimb-report/${result.uid}`} target="_blank" rel="noopener noreferrer" className={styles.actionCard}>
                      <span className={styles.actionIcon}>📊</span>
                      <span className={styles.actionLabel}>View Full Report</span>
                      <span className={styles.actionDesc}>Question-wise analysis</span>
                    </a>
                  ) : (
                    <div className={styles.actionCard} onClick={() => window.print()}>
                      <span className={styles.actionIcon}>🖨️</span>
                      <span className={styles.actionLabel}>Save as PDF</span>
                      <span className={styles.actionDesc}>Print this scorecard</span>
                    </div>
                  )}
                  <div className={styles.actionCard} onClick={shareWhatsApp}>
                    <span className={styles.actionIcon}>📲</span>
                    <span className={styles.actionLabel}>Share on WhatsApp</span>
                    <span className={styles.actionDesc}>Send to friends & family</span>
                  </div>
                  {result.uid && (
                    <div className={styles.actionCard} onClick={copyLink}>
                      <span className={styles.actionIcon}>🔗</span>
                      <span className={styles.actionLabel}>Copy Report Link</span>
                      <span className={styles.actionDesc}>Your link stays live</span>
                    </div>
                  )}
                  <div className={styles.actionCard} onClick={reset}>
                    <span className={styles.actionIcon}>🔄</span>
                    <span className={styles.actionLabel}>Analyse Another</span>
                    <span className={styles.actionDesc}>Check a friend's score</span>
                  </div>
                </div>

                {/* Section breakdown */}
                <div className={ui.sectionList}>
                  {SECTIONS.map((s) => {
                    const sec = result.scores.sections[s.key];
                    const pct = sec.max > 0 ? Math.max(0, (sec.score / sec.max) * 100) : 0;
                    return (
                      <div key={s.key} className={ui.sectionCard}>
                        <div className={ui.sectionHead}>
                          <div className={ui.sectionName}>
                            <span>{s.icon}</span> {s.name}
                          </div>
                          <span className={`${ui.badge} ${sec.positive ? ui.badgeGood : ui.badgeBad}`}>
                            {sec.positive ? "Positive ✓" : "Not positive"}
                          </span>
                        </div>
                        <div className={ui.bar}>
                          <div className={ui.barFill} style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className={ui.statRow}>
                          <span>Score <b>{sec.score}/{sec.max}</b></span>
                          <span>Correct <b className={ui.good}>{sec.correct}</b></span>
                          <span>Wrong <b className={ui.bad}>{sec.wrong}</b></span>
                          <span>Skipped <b>{sec.unattempted}</b></span>
                          <span>Accuracy <b>{sec.accuracy}%</b></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Insights */}
                <div className={ui.card}>
                  <h2 className={ui.cardTitle}>💡 What your score tells you</h2>
                  <ul className={ui.insightList}>
                    {result.insights.map((ins, i) => (
                      <li key={i} className={`${ui.insight} ${ins.tone === "good" ? ui.insightGood : ins.tone === "warn" ? ui.insightWarn : ""}`}>
                        <span>{ins.tone === "good" ? "✅" : ins.tone === "warn" ? "⚠️" : "📌"}</span>
                        <span>{ins.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <WeightageCard />
              </div>
            )}

            {/* ── Form ── */}
            {!result && (
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Calculate your IIM-B UG score</h2>
                <div className={styles.formSubtitle}>Fill your details, then paste your response sheet link or upload the saved page</div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="iimb-name">Full Name</label>
                    <input id="iimb-name" className={styles.formInput} type="text" placeholder="Your full name" value={form.name} onChange={update("name")} autoComplete="name" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="iimb-mobile">Mobile</label>
                    <input id="iimb-mobile" className={styles.formInput} type="tel" inputMode="numeric" placeholder="10-digit number" value={form.mobile} onChange={update("mobile")} autoComplete="tel-national" />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="iimb-email">Email</label>
                    <input id="iimb-email" className={styles.formInput} type="email" placeholder="you@email.com" value={form.email} onChange={update("email")} autoComplete="email" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="iimb-category">Category</label>
                    <select id="iimb-category" className={styles.formSelect} value={form.category} onChange={update("category")}>
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label className={styles.formLabel} htmlFor="iimb-city">City</label>
                    <input id="iimb-city" className={styles.formInput} type="text" placeholder="e.g. Bengaluru" value={form.city} onChange={update("city")} autoComplete="address-level2" />
                  </div>
                </div>

                <div className={ui.tabs} style={{ marginTop: 4, marginBottom: 12 }}>
                  <button type="button" className={`${ui.tab} ${mode === "link" ? ui.tabActive : ""}`} onClick={() => { setMode("link"); setError(""); }}>🔗 Paste link</button>
                  <button type="button" className={`${ui.tab} ${mode === "file" ? ui.tabActive : ""}`} onClick={() => { setMode("file"); setError(""); }}>📄 Upload file</button>
                </div>

                {mode === "link" ? (
                  <div className={styles.formGroup} style={{ marginBottom: 12 }}>
                    <label className={styles.formLabel} htmlFor="iimb-url">Response Sheet Link</label>
                    <input
                      id="iimb-url"
                      className={styles.formInput}
                      type="url"
                      inputMode="url"
                      placeholder="https://cdn.digialm.com/per/g01/pub/1345/..."
                      value={sheetUrl}
                      onChange={(e) => { setError(""); setSheetUrl(e.target.value); }}
                    />
                    <span className={styles.urlHint}>
                      Open your response sheet after login and copy the link from the address bar.{" "}
                      <a href="#how-to" onClick={() => setStepsOpen(true)} style={{ color: "#833589", fontWeight: 600 }}>How?</a>
                    </span>
                  </div>
                ) : (
                <div className={styles.formGroup} style={{ marginBottom: 12 }}>
                  <span className={styles.formLabel}>Response Sheet File</span>
                  <div
                    role="button"
                    tabIndex={0}
                    className={`${ui.uploadBox} ${dragActive ? ui.uploadBoxActive : ""} ${file ? ui.uploadBoxDone : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
                    onDragEnter={onDrag}
                    onDragOver={onDrag}
                    onDragLeave={onDrag}
                    onDrop={onDrop}
                  >
                    <div className={ui.uploadIcon}>{file ? "✅" : "📄"}</div>
                    <div className={ui.uploadTitle}>{file ? file.name : "Tap to upload or drag your HTML file here"}</div>
                    <div className={ui.uploadSub}>{file ? `${(file.size / 1024).toFixed(1)} KB · tap to change` : ".html or .htm, up to 10 MB"}</div>
                    {!file && <span className={ui.uploadWarn}>NOT A PDF</span>}
                    <input ref={fileInputRef} type="file" accept=".html,.htm,text/html" style={{ display: "none" }} onChange={(e) => acceptFile(e.target.files?.[0])} />
                  </div>
                  <span className={styles.urlHint}>
                    Not sure how to save it?{" "}
                    <a href="#how-to" onClick={() => setStepsOpen(true)} style={{ color: "#833589", fontWeight: 600 }}>See the steps</a>
                  </span>
                </div>
                )}

                <button className={`${styles.generateBtn} ${submitting ? styles.generateBtnLoading : ""}`} onClick={analyse} disabled={submitting}>
                  {submitting ? "Analysing..." : "🎯 Analyse My Score"}
                </button>

                {error && (
                  <div className={styles.errorMsg} role="alert">
                    <span className={styles.errorIcon}>⚠️</span>
                    {error}
                  </div>
                )}
                <div className={ui.privacyNote}>🔒 Your phone and email are never shown publicly.</div>
              </div>
            )}

            {/* ── How-to ── */}
            <div className={`${styles.stepsCard} ${ui.noPrint}`} id="how-to" style={{ scrollMarginTop: 90 }}>
              <div className={styles.stepsToggle} onClick={() => setStepsOpen(!stepsOpen)}>
                <h2 className={styles.stepsTitle} style={{ margin: 0 }}>📖 How to save your IIMB UG response sheet</h2>
                <div className={`${styles.stepsArrow} ${stepsOpen ? styles.stepsArrowOpen : ""}`}>▼</div>
              </div>
              {stepsOpen && (
                <>
                  <div className={ui.tabs}>
                    <button className={`${ui.tab} ${device === "laptop" ? ui.tabActive : ""}`} onClick={() => setDevice("laptop")}>💻 Laptop</button>
                    <button className={`${ui.tab} ${device === "mobile" ? ui.tabActive : ""}`} onClick={() => setDevice("mobile")}>📱 Mobile</button>
                  </div>
                  <div className={styles.stepsList}>
                    <div className={styles.step}>
                      <div className={styles.stepNum}>1</div>
                      <div className={styles.stepText}>
                        Log in to your response sheet using the link shared by IIMB:{" "}
                        <a className={styles.stepLink} href={RESPONSE_LOGIN_URL} target="_blank" rel="noopener noreferrer">open login page</a>
                      </div>
                    </div>
                    <div className={styles.step}>
                      <div className={styles.stepNum}>2</div>
                      <div className={styles.stepText}>
                        Open your <span className={styles.stepBold}>Response Sheet / Answer Key</span> page. The address should start with{" "}
                        <span className={ui.kbd}>https://cdn.digialm.com/per/g01/pub/1345/</span>
                      </div>
                    </div>
                    <div className={styles.step}>
                      <div className={styles.stepNum}>3</div>
                      <div className={styles.stepText}>
                        <span className={styles.stepBold}>Easiest:</span>{" "}
                        {device === "laptop"
                          ? <>click the address bar, press <span className={ui.kbd}>Ctrl</span> + <span className={ui.kbd}>C</span> and paste the link in the <span className={styles.stepBold}>Paste link</span> tab above.</>
                          : <>tap the address bar, select all, copy, and paste the link in the <span className={styles.stepBold}>Paste link</span> tab above.</>}
                      </div>
                    </div>
                    <div className={styles.step}>
                      <div className={styles.stepNum}>4</div>
                      <div className={styles.stepText}>
                        <span className={styles.stepBold}>Link not working?</span>{" "}
                        {device === "laptop" ? (
                          <>Press <span className={ui.kbd}>Ctrl</span> + <span className={ui.kbd}>S</span> (<span className={ui.kbd}>Cmd</span> + <span className={ui.kbd}>S</span> on Mac), save as <span className={styles.stepBold}>Webpage, HTML</span> and use the <span className={styles.stepBold}>Upload file</span> tab. Do not print to PDF.</>
                        ) : (
                          <>Tap the browser menu (⋮), choose <span className={styles.stepBold}>Download</span> or <span className={styles.stepBold}>Save page</span>, and use the <span className={styles.stepBold}>Upload file</span> tab. Do not save as PDF.</>
                        )}
                      </div>
                    </div>
                    <div className={styles.step}>
                      <div className={styles.stepNum}>5</div>
                      <div className={styles.stepText}>Tap <span className={styles.stepBold}>Analyse My Score</span>. Your VARC, LR, QADI and total appear instantly.</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Other tools ── */}
            <div className={`${styles.featureGrid} ${ui.noPrint}`}>
              <Link href="/interview-prep" className={styles.featureCard}>
                <span className={styles.featureIcon}>🤖</span>
                <span className={styles.featureName}>AI Mock Interview</span>
                <span className={styles.featureDesc}>PI is 40% of IIMB's final score</span>
              </Link>
              <Link href="/response" className={styles.featureCard}>
                <span className={styles.featureIcon}>📊</span>
                <span className={styles.featureName}>IPMAT Score Calculator</span>
                <span className={styles.featureDesc}>Check your IPMAT Indore score</span>
              </Link>
              <Link href="/pi-batch" className={styles.featureCard}>
                <span className={styles.featureIcon}>🎯</span>
                <span className={styles.featureName}>PI Batch</span>
                <span className={styles.featureDesc}>Interview prep with mentors</span>
              </Link>
            </div>
          </div>

          {/* ════════ SIDE COLUMN ════════ */}
          <aside className={`${ui.sideCol} ${ui.noPrint}`}>
            <div className={ui.board}>
              <h2 className={ui.boardTitle}>🏆 Leaderboard (Top 10)</h2>
              {boardLoading ? (
                <>
                  <div className={ui.skeleton}></div>
                  <div className={ui.skeleton}></div>
                  <div className={ui.skeleton}></div>
                </>
              ) : leaderboard.length === 0 ? (
                <div className={ui.boardEmpty}>No submissions yet. Be the first!</div>
              ) : (
                leaderboard.map((s, i) => (
                  <div key={i} className={ui.boardRow}>
                    <span className={`${ui.boardRank} ${i === 0 ? ui.boardRank1 : i === 1 ? ui.boardRank2 : i === 2 ? ui.boardRank3 : ""}`}>{i + 1}</span>
                    <span className={ui.boardName}>
                      {s.name}
                      {s.city && <span className={ui.boardCity}>{s.city}</span>}
                    </span>
                    <span className={ui.boardScore}>{s.total}</span>
                  </div>
                ))
              )}
              <div className={ui.boardNote}>*Raw total out of {MAX_SCORE}, self-reported via this tool</div>
            </div>

            <div className={ui.ctaCard}>
              <h3 className={ui.ctaTitle}>Cleared the test? Plan your PI.</h3>
              <p className={ui.ctaText}>The interview carries 40 of 100 in IIMB's final score. Get a free PI plan from our mentors.</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={ui.ctaBtn}>📲 WhatsApp "IIMB"</a>
            </div>
          </aside>
        </div>

        {/* ════════ SEO ARTICLE ════════ */}
        <article className={ui.article}>
          <h2>IIM Bangalore UG Score Calculator 2026: check your IIMB UG Test score from the response sheet</h2>
          <p className={ui.lede}>Free IIMB UG response sheet tool with section-wise marks, accuracy and a shareable report</p>
          <p>
            The <strong>IIM Bangalore UG Score Calculator</strong> by IPM Careers reads your saved IIMB UG Test response sheet and works out your
            exact raw score in seconds. It checks every one of the 60 questions against the answer key marked on your sheet, applies the marking
            scheme and shows your <strong>VARC, LR and QADI</strong> scores, total out of 180, accuracy, attempts and whether each section is positive.
            No manual entry, so no counting mistakes.
          </p>

          <h3>IIM Bangalore UG Test pattern 2026</h3>
          <p>
            IIMB admits students to its four-year, full-time residential <strong>B.Sc. (Hons) in Data Science</strong> and{" "}
            <strong>B.Sc. (Hons) in Economics</strong> programmes through the IIMB UG Test followed by a personal interview. The test is a
            135-minute computer-based test with 60 multiple-choice questions.
          </p>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr><th>Section</th><th>Questions</th><th>Max marks (+3 each)</th></tr>
              </thead>
              <tbody>
                <tr><td>Section 1: Verbal Ability & Reading Comprehension (VARC)</td><td>15</td><td>45</td></tr>
                <tr><td>Section 2: Logical Reasoning (LR)</td><td>15</td><td>45</td></tr>
                <tr><td>Section 3: Quantitative & Data Interpretation (QADI)</td><td>30</td><td>90</td></tr>
                <tr><td><strong>Total</strong></td><td><strong>60</strong></td><td><strong>180</strong></td></tr>
              </tbody>
            </table>
          </div>

          <h3>How the IIMB UG score is calculated</h3>
          <p>
            Each correct answer gets <strong>+3</strong>, each wrong answer gets <strong>-1</strong> and an unattempted question gets{" "}
            <strong>0</strong>. So if you got 30 right and 10 wrong, your score is (30 × 3) - (10 × 1) = 80. Because of the negative marking,
            accuracy matters as much as attempts, which is why the calculator shows both for every section.
          </p>

          <h3>How IIMB uses your UG Test score</h3>
          <p>
            According to IIMB's admissions document, only candidates with a <strong>positive raw score in all three sections</strong> are
            considered for the first shortlist. Shortlisted candidates then get a pre-interview score, and selected candidates are called for the
            personal interview. The calculator flags any section that is not positive so you know exactly where you stand on that first gate.
          </p>
          <WeightageCard compact />

          <h3>Eligibility snapshot (batch 2027-31)</h3>
          <ul>
            <li>Age not more than 20 years as on 1 August 2027</li>
            <li>Pass in Class XII or equivalent from a recognised board</li>
            <li>Mathematics as a subject in both Class XI and Class XII</li>
            <li>At least 60% marks in Class X</li>
          </ul>
          <p>Always confirm the latest rules on IIMB's official UG admissions website before you apply.</p>

          <h3>Got your score? Here is what to do next</h3>
          <p>
            The personal interview carries 40 of the 100 points in IIMB's post-interview score, the same as the UG Test itself. Start practising
            with our <Link href="/interview-prep">AI Mock Interview</Link>, and if you also wrote IPMAT Indore, check that score with the{" "}
            <Link href="/response">IPMAT Score Calculator</Link>.
          </p>

          <h2 style={{ fontSize: "1.35rem" }}>Frequently asked questions: IIM Bangalore UG Score Calculator</h2>
          {FAQS.map((f, i) => (
            <details key={i} className={ui.faqItem}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </article>
      </div>

      {/* ── Structured data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                name: "IIM Bangalore UG Score Calculator 2026",
                url: PAGE_URL,
                applicationCategory: "EducationalApplication",
                operatingSystem: "All",
                offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                description:
                  "Free IIM Bangalore UG Score Calculator. Upload your IIMB UG response sheet to get VARC, LR, QADI and total score out of 180, accuracy and a shareable report.",
                creator: { "@type": "Organization", name: "IPM Careers", url: "https://ipmcareer.com" },
              },
              {
                "@type": "FAQPage",
                mainEntity: FAQS.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "IPM Careers", item: "https://register.ipmcareer.com/" },
                  { "@type": "ListItem", position: 2, name: "IIM Bangalore UG Score Calculator", item: PAGE_URL },
                ],
              },
            ],
          }),
        }}
      />
    </AppShell>
  );
}

function WeightageCard({ compact = false }) {
  return (
    <div className={ui.card} style={compact ? { marginTop: "1rem" } : undefined}>
      {!compact && <h2 className={ui.cardTitle}>⚖️ How IIMB weighs your test</h2>}
      <div className={ui.weightGrid}>
        <div className={ui.weightCol}>
          <div className={ui.weightHead}>Pre-interview score</div>
          <div className={ui.weightRow}><span>UG Test</span><b>70</b></div>
          <div className={ui.weightRow}><span>· QADI / LR / VARC</span><b>20 / 30 / 20</b></div>
          <div className={ui.weightRow}><span>Class 10 overall</span><b>15</b></div>
          <div className={ui.weightRow}><span>Class 10 maths</span><b>10</b></div>
          <div className={ui.weightRow}><span>Gender diversity</span><b>5</b></div>
        </div>
        <div className={ui.weightCol}>
          <div className={ui.weightHead}>Final (post-interview) score</div>
          <div className={ui.weightRow}><span>UG Test</span><b>40</b></div>
          <div className={ui.weightRow}><span>Personal interview</span><b>40</b></div>
          <div className={ui.weightRow}><span>Class 10 overall</span><b>10</b></div>
          <div className={ui.weightRow}><span>Class 10 maths</span><b>10</b></div>
        </div>
      </div>
      <div className={ui.sourceNote}>Source: IIMB UG Admissions Process document for batch 2027-31. Board scores are standardised by IIMB.</div>
    </div>
  );
}
