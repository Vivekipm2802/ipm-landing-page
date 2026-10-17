import { sendLeadToCrm } from "../lib/crm";
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import axios from "axios";
import { toast } from "react-hot-toast";
import AppShell from "../components/AppShell";
import styles from "./Response.module.css";
import ui from "./IimbUg.module.css";
import { SECTIONS, MAX_SCORE, TOTAL_QUESTIONS, buildCatInsights } from "../lib/catScoring";

const PAGE_URL = "https://register.ipmcareer.com/cat-score-calculator";
const CAT_SITE = "https://iimcat.ac.in";
const WHATSAPP_URL = "https://wa.me/918299470392?text=" + encodeURIComponent("CAT - I just checked my CAT 2026 score. Please guide me on next steps.");
const CATEGORIES = ["General", "EWS", "NC-OBC", "SC", "ST", "PwD"];

const FAQS = [
  {
    q: "What is the CAT 2026 Score Calculator?",
    a: "It is a free tool by IPM Careers. Paste your CAT 2026 response sheet link (or upload the saved page) and it works out your VARC, DILR, QA and total score out of 204 using the official marking scheme, with correct, wrong and unattempted counts for MCQ and TITA questions.",
  },
  {
    q: "What is the CAT 2026 exam pattern?",
    a: "CAT 2026 has 68 questions in 120 minutes for 204 marks: VARC 24 questions (40 minutes, 72 marks), DILR 22 questions (40 minutes, 66 marks) and QA 22 questions (40 minutes, 66 marks). Each section has both MCQ and TITA (type in the answer) questions.",
  },
  {
    q: "What is the CAT marking scheme?",
    a: "Every correct answer gets +3. A wrong MCQ answer gets -1. A wrong TITA answer gets 0, because there is no negative marking for TITA questions. Unattempted questions get 0.",
  },
  {
    q: "How do I calculate my CAT score from the response sheet?",
    a: "Score = 3 × (correct answers) − 1 × (wrong MCQs). For example, 40 correct, 12 wrong MCQs and 5 wrong TITAs gives 3 × 40 − 12 = 108. The calculator does this for every question in your response sheet automatically.",
  },
  {
    q: "Where do I find my CAT 2026 response sheet link?",
    a: "Log in at iimcat.ac.in when the response sheet is released and open the response sheet. The page opens from the TCS iON server, so the link starts with https://cdn.digialm.com/ and ends with .html. Copy that link and paste it here. If the page opens inside the CAT portal and you cannot see the link, save the page (Ctrl+S) and upload the file instead.",
  },
  {
    q: "What if the answer key is not out yet?",
    a: "The calculator still reads your responses and saves them. Questions without a key are shown as 'waiting for key'. When the official answer key is released, your saved report link updates automatically with the final score.",
  },
  {
    q: "Is my calculated score the same as my CAT percentile?",
    a: "No. This tool gives your raw score. The IIMs normalise scores across the three slots and then compute percentiles, so your official scaled score and percentile can differ from the raw total.",
  },
  {
    q: "Is the CAT score calculator free and safe?",
    a: "Yes. It is completely free, needs no login, and your phone number and email are never shown publicly. The leaderboard shows only first name, last initial and city.",
  },
];

export default function CatScoreCalculator() {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", category: "", city: "" });
  const [mode, setMode] = useState("link");
  const [sheetUrl, setSheetUrl] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [boardLoading, setBoardLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [stepsOpen, setStepsOpen] = useState(false);
  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get("/api/cat-leaderboard");
      setLeaderboard(res?.data?.leaderboard ?? []);
      if (typeof res?.data?.count === "number") setCount(res.data.count);
    } catch {
      setLeaderboard([]);
    } finally {
      setBoardLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 8000);
    return () => clearTimeout(t);
  }, [error]);

  const update = (key) => (e) => {
    setError("");
    const value = key === "mobile" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const acceptFile = (f) => {
    setError("");
    if (!f) return;
    const name = (f.name || "").toLowerCase();
    if (name.endsWith(".pdf") || f.type === "application/pdf") {
      setError("That is a PDF. Save the response sheet page as HTML (Ctrl+S) and upload the .html file.");
      return;
    }
    if (!name.endsWith(".html") && !name.endsWith(".htm") && f.type !== "text/html") {
      setError("Please upload the response sheet as an .html or .htm file.");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      setError("File is larger than 4 MB. Save the page as 'Webpage, HTML only' and try again.");
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
    if (form.name.trim().length < 2) return "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return "Please enter a valid 10-digit mobile number (without +91 or 0).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (!form.category) return "Please select your category.";
    if (mode === "link") {
      let u;
      try { u = new URL(sheetUrl.trim()); } catch { return "Please paste the full response sheet link (it starts with https://cdn.digialm.com/...)."; }
      if (!/(^|\.)digialm\.com$/i.test(u.hostname)) return "That is not a CAT response sheet link. It should start with https://cdn.digialm.com/";
    } else if (!file) {
      return "Please upload your saved response sheet (.html) file.";
    }
    return "";
  };

  const analyse = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true);
    // CRM copy of this lead (fire-and-forget, never blocks the form)
    sendLeadToCrm({ name: form?.name, phone: form?.mobile, email: form?.email, city: form?.city }, "register-cat-score-calculator");
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.mobile,
        email: form.email.trim(),
        category: form.category,
        city: form.city.trim(),
      };
      if (mode === "link") payload.url = sheetUrl.trim();
      else payload.html = await file.text();

      const res = await axios.post("/api/cat-score", payload);
      const d = res.data || {};
      setResult({ ...d, name: payload.name, category: payload.category, insights: buildCatInsights(d.result) });
      if (d.uid) toast.success("Scorecard ready!");
      else toast.error("Score calculated, but we could not save your report link. Try again in a minute.");
      fetchLeaderboard();
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError(e?.response?.data?.error || "Something went wrong. Check the link, or switch to 'Upload file' and upload the saved page.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setFile(null);
    setSheetUrl("");
    setForm({ name: "", mobile: "", email: "", category: "", city: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const r = result?.result;
  const reportUrl = result?.uid ? `https://register.ipmcareer.com/cat-report/${result.uid}` : PAGE_URL;
  const shareText = r
    ? `I scored ${r.total}/${MAX_SCORE} in CAT 2026 (VARC ${r.sections.VARC.score}, DILR ${r.sections.DILR.score}, QA ${r.sections.QA.score}). Check yours free: ${reportUrl}`
    : "";
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(reportUrl); toast.success("Link copied!"); }
    catch { toast.error("Could not copy. Long-press the link to copy."); }
  };

  const top3 = leaderboard.slice(0, 3);

  return (
    <AppShell activePage="/cat-score-calculator" pageTitle="CAT 2026 Score Calculator">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title="CAT 2026 Score Calculator: Check Score from Response Sheet | IPM Careers"
        description="Free CAT 2026 score calculator. Paste your CAT response sheet link and get VARC, DILR, QA and total score out of 204 with MCQ and TITA analysis, using +3/-1 marking. No login."
        canonical={PAGE_URL}
        openGraph={{
          url: PAGE_URL,
          title: "CAT 2026 Score Calculator | Free CAT Response Sheet Tool",
          description: "Paste your CAT 2026 response sheet link and get your section-wise score out of 204 in seconds. Free tool by IPM Careers.",
          siteName: "IPM Careers",
        }}
        twitter={{ cardType: "summary_large_image" }}
        additionalMetaTags={[
          {
            name: "keywords",
            content:
              "CAT score calculator, CAT 2026 score calculator, CAT 2026 response sheet, CAT response sheet 2026, CAT 2026 answer key, CAT marks calculator, CAT VARC DILR QA score, CAT TITA marking, how to calculate CAT score",
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
            CAT 2026 · 29 November 2026
          </div>
          <h1 className={styles.heroTitle}>
            CAT 2026 Score Calculator.{" "}
            <span className={styles.heroTitleAccent}>Paste your response sheet link, get your score in seconds.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            VARC, DILR and QA scores out of 204, MCQ and TITA accuracy, and a report link you can share.
          </p>
          <div className={styles.socialProof}>
            {count > 0 && (
              <>
                <div className={styles.proofStat}><span className={styles.proofStatNum}>{count.toLocaleString("en-IN")}+</span> scorecards</div>
                <div className={styles.proofDot}></div>
              </>
            )}
            <div className={styles.proofStat}><span className={styles.proofStatNum}>100%</span> free</div>
            <div className={styles.proofDot}></div>
            <div className={styles.proofStat}>No login needed</div>
          </div>
        </div>

        {/* ── Quick facts ── */}
        <div className={ui.factStrip}>
          <div className={ui.fact}><div className={ui.factNum}>{TOTAL_QUESTIONS}</div><div className={ui.factLabel}>Questions</div></div>
          <div className={ui.fact}><div className={ui.factNum}>120</div><div className={ui.factLabel}>Minutes</div></div>
          <div className={ui.fact}><div className={ui.factNum}>{MAX_SCORE}</div><div className={ui.factLabel}>Max marks</div></div>
          <div className={ui.fact}><div className={ui.factNum}>+3 / -1</div><div className={ui.factLabel}>MCQ marking (TITA: no minus)</div></div>
        </div>

        <div className={ui.layout}>
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
            {r && (
              <div ref={resultRef} style={{ scrollMarginTop: 90 }}>
                <div className={styles.scorecardResult}>
                  <div className={styles.scorecardBg}></div>
                  <div className={styles.scorecardBg2}></div>
                  <div className={styles.scorecardHeader}>
                    <div className={styles.scorecardTitle}>Your CAT 2026 Scorecard</div>
                    <div className={styles.scorecardName}>👤 {result.candidate?.name || result.name}</div>
                  </div>
                  <div className={styles.scoreGrid}>
                    {SECTIONS.map((s) => (
                      <div key={s.key} className={styles.scoreBox}>
                        <div className={styles.scoreBoxLabel}>{s.short}</div>
                        <div className={styles.scoreBoxValue}>
                          {r.sections[s.key].score}
                          <span className={ui.scoreBoxMax}>/{s.max}</span>
                        </div>
                      </div>
                    ))}
                    <div className={`${styles.scoreBox} ${styles.scoreBoxTotal}`}>
                      <div className={styles.scoreBoxLabel}>Total</div>
                      <div className={styles.scoreBoxValue}>
                        {r.total}
                        <span className={ui.scoreBoxMax}>/{MAX_SCORE}</span>
                      </div>
                    </div>
                  </div>
                  <div className={ui.scorecardMeta}>
                    <span className={ui.metaChip}>✅ {r.correct} correct</span>
                    <span className={ui.metaChip}>❌ {r.wrong} wrong</span>
                    <span className={ui.metaChip}>⏭ {r.unattempted} skipped</span>
                    {r.pendingKey > 0 && <span className={ui.metaChip}>⏳ {r.pendingKey} waiting for key</span>}
                    {result.candidate?.slot && <span className={ui.metaChip}>Slot {result.candidate.slot}</span>}
                    {result.rank && result.count && <span className={ui.metaChip}>🏅 #{result.rank} of {result.count.toLocaleString("en-IN")} on this tool</span>}
                  </div>
                </div>

                {(result.warnings || []).map((w, i) => (
                  <div key={i} className={ui.warnMsg} style={{ marginTop: -8, marginBottom: 16 }}>
                    <span>⚠️</span>{w}
                  </div>
                ))}

                <div className={styles.actionRow}>
                  {result.uid ? (
                    <a href={`/cat-report/${result.uid}`} target="_blank" rel="noopener noreferrer" className={styles.actionCard}>
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
                    <span className={styles.actionDesc}>Send to friends</span>
                  </div>
                  {result.uid && (
                    <div className={styles.actionCard} onClick={copyLink}>
                      <span className={styles.actionIcon}>🔗</span>
                      <span className={styles.actionLabel}>Copy Report Link</span>
                      <span className={styles.actionDesc}>Updates when the key is out</span>
                    </div>
                  )}
                  <div className={styles.actionCard} onClick={reset}>
                    <span className={styles.actionIcon}>🔄</span>
                    <span className={styles.actionLabel}>Check Another</span>
                    <span className={styles.actionDesc}>Check a friend's score</span>
                  </div>
                </div>

                <div className={ui.sectionList}>
                  {SECTIONS.map((s) => {
                    const sec = r.sections[s.key];
                    const pct = sec.max > 0 ? Math.max(0, (sec.score / sec.max) * 100) : 0;
                    return (
                      <div key={s.key} className={ui.sectionCard}>
                        <div className={ui.sectionHead}>
                          <div className={ui.sectionName}><span>{s.icon}</span> {s.name}</div>
                          <span className={`${ui.badge} ${sec.score > 0 ? ui.badgeGood : ui.badgeBad}`}>{sec.score}/{sec.max}</span>
                        </div>
                        <div className={ui.bar}><div className={ui.barFill} style={{ width: `${pct}%` }}></div></div>
                        <div className={ui.statRow}>
                          <span>Correct <b className={ui.good}>{sec.correct}</b></span>
                          <span>Wrong <b className={ui.bad}>{sec.wrong}</b></span>
                          <span>Skipped <b>{sec.unattempted}</b></span>
                          <span>MCQ <b>{sec.mcq.correct}/{sec.mcq.attempted}</b></span>
                          <span>TITA <b>{sec.tita.correct}/{sec.tita.attempted}</b></span>
                          <span>Accuracy <b>{sec.accuracy}%</b></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

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
              </div>
            )}

            {/* ── Form ── */}
            {!r && (
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Calculate your CAT 2026 score</h2>
                <div className={styles.formSubtitle}>Fill your details, then paste your response sheet link or upload the saved page</div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="cat-name">Full Name</label>
                    <input id="cat-name" className={styles.formInput} type="text" placeholder="Your full name" value={form.name} onChange={update("name")} autoComplete="name" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="cat-mobile">Mobile</label>
                    <input id="cat-mobile" className={styles.formInput} type="tel" inputMode="numeric" placeholder="10-digit number" value={form.mobile} onChange={update("mobile")} autoComplete="tel-national" />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="cat-email">Email</label>
                    <input id="cat-email" className={styles.formInput} type="email" placeholder="you@email.com" value={form.email} onChange={update("email")} autoComplete="email" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="cat-category">Category</label>
                    <select id="cat-category" className={styles.formSelect} value={form.category} onChange={update("category")}>
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label className={styles.formLabel} htmlFor="cat-city">City</label>
                    <input id="cat-city" className={styles.formInput} type="text" placeholder="e.g. Delhi" value={form.city} onChange={update("city")} autoComplete="address-level2" />
                  </div>
                </div>

                <div className={ui.tabs} style={{ marginTop: 4, marginBottom: 12 }}>
                  <button type="button" className={`${ui.tab} ${mode === "link" ? ui.tabActive : ""}`} onClick={() => { setMode("link"); setError(""); }}>🔗 Paste link</button>
                  <button type="button" className={`${ui.tab} ${mode === "file" ? ui.tabActive : ""}`} onClick={() => { setMode("file"); setError(""); }}>📄 Upload file</button>
                </div>

                {mode === "link" ? (
                  <div className={styles.formGroup} style={{ marginBottom: 12 }}>
                    <label className={styles.formLabel} htmlFor="cat-url">CAT Response Sheet Link</label>
                    <input
                      id="cat-url"
                      className={styles.formInput}
                      type="url"
                      inputMode="url"
                      placeholder="https://cdn.digialm.com/per/g28/pub/.../....html"
                      value={sheetUrl}
                      onChange={(e) => { setError(""); setSheetUrl(e.target.value); }}
                    />
                    <span className={styles.urlHint}>
                      Open your response sheet after logging in at iimcat.ac.in and copy the link.{" "}
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
                      <div className={ui.uploadSub}>{file ? `${(file.size / 1024).toFixed(1)} KB · tap to change` : ".html or .htm, up to 4 MB"}</div>
                      {!file && <span className={ui.uploadWarn}>NOT A PDF</span>}
                      <input ref={fileInputRef} type="file" accept=".html,.htm,text/html" style={{ display: "none" }} onChange={(e) => acceptFile(e.target.files?.[0])} />
                    </div>
                  </div>
                )}

                <button className={`${styles.generateBtn} ${submitting ? styles.generateBtnLoading : ""}`} onClick={analyse} disabled={submitting}>
                  {submitting ? "Reading your response sheet..." : "🎯 Calculate My CAT Score"}
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
            <div className={styles.stepsCard} id="how-to" style={{ scrollMarginTop: 90 }}>
              <div className={styles.stepsToggle} onClick={() => setStepsOpen(!stepsOpen)}>
                <h2 className={styles.stepsTitle} style={{ margin: 0 }}>📖 How to get your CAT 2026 response sheet link</h2>
                <div className={`${styles.stepsArrow} ${stepsOpen ? styles.stepsArrowOpen : ""}`}>▼</div>
              </div>
              {stepsOpen && (
                <div className={styles.stepsList}>
                  <div className={styles.step}>
                    <div className={styles.stepNum}>1</div>
                    <div className={styles.stepText}>
                      Log in at <a className={styles.stepLink} href={CAT_SITE} target="_blank" rel="noopener noreferrer">iimcat.ac.in</a> with your user ID and password once the response sheet is released.
                    </div>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepNum}>2</div>
                    <div className={styles.stepText}>
                      Open the <span className={styles.stepBold}>Response Sheet</span>. It opens from the TCS iON server, so the address starts with{" "}
                      <span className={ui.kbd}>https://cdn.digialm.com/</span> and ends with <span className={ui.kbd}>.html</span>
                    </div>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepNum}>3</div>
                    <div className={styles.stepText}>
                      Copy the link from the address bar and paste it in the <span className={styles.stepBold}>Paste link</span> tab above.
                      If the sheet opens inside the portal, press <span className={ui.kbd}>Ctrl</span> + <span className={ui.kbd}>U</span>, search for{" "}
                      <span className={ui.kbd}>digialm</span> and copy the link that ends with .html.
                    </div>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepNum}>4</div>
                    <div className={styles.stepText}>
                      <span className={styles.stepBold}>Link not working?</span> Press <span className={ui.kbd}>Ctrl</span> + <span className={ui.kbd}>S</span> (or Download on mobile),
                      save as <span className={styles.stepBold}>Webpage, HTML</span> and use the <span className={styles.stepBold}>Upload file</span> tab. PDFs and screenshots do not work.
                    </div>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepNum}>5</div>
                    <div className={styles.stepText}>Tap <span className={styles.stepBold}>Calculate My CAT Score</span>. Your VARC, DILR, QA and total appear in seconds.</div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Other tools ── */}
            <div className={styles.featureGrid}>
              <Link href="/response" className={styles.featureCard}>
                <span className={styles.featureIcon}>📊</span>
                <span className={styles.featureName}>IPMAT Score Analyzer</span>
                <span className={styles.featureDesc}>IPMAT Indore response sheet tool</span>
              </Link>
              <Link href="/jipmat" className={styles.featureCard}>
                <span className={styles.featureIcon}>📝</span>
                <span className={styles.featureName}>JIPMAT Score Calculator</span>
                <span className={styles.featureDesc}>NTA JIPMAT response sheet tool</span>
              </Link>
              <Link href="/interview-prep" className={styles.featureCard}>
                <span className={styles.featureIcon}>🤖</span>
                <span className={styles.featureName}>AI Mock Interview</span>
                <span className={styles.featureDesc}>Practise for the PI round</span>
              </Link>
            </div>
          </div>

          {/* ── Side column ── */}
          <aside className={ui.sideCol}>
            <div className={ui.board}>
              <h2 className={ui.boardTitle}>🏆 CAT 2026 Leaderboard (Top 10)</h2>
              {boardLoading ? (
                <>
                  <div className={ui.skeleton}></div>
                  <div className={ui.skeleton}></div>
                  <div className={ui.skeleton}></div>
                </>
              ) : leaderboard.length === 0 ? (
                <div className={ui.boardEmpty}>No fully scored sheets yet. Be the first!</div>
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
              <div className={ui.boardNote}>*Raw score out of {MAX_SCORE}, from response sheets checked on this tool</div>
            </div>

            <div className={ui.ctaCard}>
              <h3 className={ui.ctaTitle}>Got your score? Plan the next step.</h3>
              <p className={ui.ctaText}>Talk to our IIM alumni mentors about calls, WAT-PI prep and which colleges to target.</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={ui.ctaBtn}>📲 WhatsApp "CAT"</a>
            </div>
          </aside>
        </div>

        {/* ════════ SEO ARTICLE ════════ */}
        <article className={ui.article}>
          <h2>CAT 2026 Score Calculator: work out your CAT score from the response sheet</h2>
          <p className={ui.lede}>Free CAT response sheet tool with VARC, DILR and QA marks, MCQ vs TITA accuracy and a shareable report</p>
          <p>
            The <strong>CAT 2026 Score Calculator</strong> by IPM Careers reads your official CAT response sheet and calculates your exact raw
            score in seconds. It checks all 68 questions, applies the CAT marking scheme separately to MCQ and TITA questions, and shows your{" "}
            <strong>VARC, DILR and QA</strong> scores, total out of 204, correct, wrong and unattempted counts and accuracy for each section.
            No manual counting, so no mistakes.
          </p>

          <h3>CAT 2026 exam pattern</h3>
          <p>
            CAT 2026 is being conducted by IIM Indore on <strong>Sunday, 29 November 2026</strong> as a 120-minute computer-based test in three
            slots. Each section is timed separately at 40 minutes and has both MCQ and TITA questions.
          </p>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr><th>Section</th><th>Questions</th><th>Time</th><th>Max marks</th></tr>
              </thead>
              <tbody>
                <tr><td>Verbal Ability & Reading Comprehension (VARC)</td><td>24</td><td>40 min</td><td>72</td></tr>
                <tr><td>Data Interpretation & Logical Reasoning (DILR)</td><td>22</td><td>40 min</td><td>66</td></tr>
                <tr><td>Quantitative Aptitude (QA)</td><td>22</td><td>40 min</td><td>66</td></tr>
                <tr><td><strong>Total</strong></td><td><strong>68</strong></td><td><strong>120 min</strong></td><td><strong>204</strong></td></tr>
              </tbody>
            </table>
          </div>

          <h3>CAT 2026 marking scheme: MCQ vs TITA</h3>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr><th>Question type</th><th>Correct</th><th>Wrong</th><th>Not attempted</th></tr>
              </thead>
              <tbody>
                <tr><td>MCQ (multiple choice)</td><td>+3</td><td>-1</td><td>0</td></tr>
                <tr><td>TITA (type in the answer)</td><td>+3</td><td>0</td><td>0</td></tr>
              </tbody>
            </table>
          </div>

          <h3>How to calculate your CAT score</h3>
          <p>
            <strong>CAT score = 3 × (total correct) − 1 × (wrong MCQs)</strong>. Wrong TITA answers do not reduce your score. For example, if you
            got 40 questions right, 12 MCQs wrong and 5 TITAs wrong, your score is 3 × 40 − 12 = <strong>108</strong>. The calculator does this
            question by question from your response sheet, so the MCQ/TITA split is always right.
          </p>

          <h3>What the calculator shows you</h3>
          <ul>
            <li>Section-wise score for VARC (out of 72), DILR (out of 66) and QA (out of 66), plus total out of 204</li>
            <li>Correct, wrong and unattempted questions, and accuracy for each section</li>
            <li>MCQ and TITA results separately, so you can see where negative marking hurt</li>
            <li>Your rank among students who checked their score on this tool, and a report link you can share</li>
          </ul>

          <h3>Raw score vs CAT percentile</h3>
          <p>
            This tool gives your <strong>raw score</strong> from the response sheet and answer key. The IIMs normalise scores across the three
            slots and then calculate percentiles, so your official scaled score and percentile can differ from the raw total. Use the raw score
            to judge your sectional strengths and plan your next steps while you wait for the result.
          </p>

          <h3>More free tools from IPM Careers</h3>
          <p>
            Preparing a younger sibling for IIM's five-year programme? Try the <Link href="/response">IPMAT Score Analyzer</Link>, the{" "}
            <Link href="/jipmat">JIPMAT Score Calculator</Link> and the <Link href="/response-v1">IIM Bangalore UG Score Calculator</Link>.
          </p>

          <h2 style={{ fontSize: "1.35rem" }}>Frequently asked questions: CAT 2026 Score Calculator</h2>
          {FAQS.map((f, i) => (
            <details key={i} className={ui.faqItem}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </article>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                name: "CAT 2026 Score Calculator",
                url: PAGE_URL,
                applicationCategory: "EducationalApplication",
                operatingSystem: "All",
                offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                description: "Free CAT 2026 score calculator. Paste your CAT response sheet link to get VARC, DILR, QA and total score out of 204 with MCQ and TITA analysis.",
                creator: { "@type": "Organization", name: "IPM Careers", url: "https://ipmcareer.com" },
              },
              {
                "@type": "HowTo",
                name: "How to calculate your CAT 2026 score from the response sheet",
                totalTime: "PT2M",
                step: [
                  { "@type": "HowToStep", name: "Open your response sheet", text: "Log in at iimcat.ac.in and open your CAT 2026 response sheet." },
                  { "@type": "HowToStep", name: "Copy the link", text: "Copy the response sheet link that starts with https://cdn.digialm.com/ and ends with .html." },
                  { "@type": "HowToStep", name: "Paste and calculate", text: "Paste the link in the CAT 2026 Score Calculator, enter your details and tap Calculate My CAT Score." },
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "IPM Careers", item: "https://register.ipmcareer.com/" },
                  { "@type": "ListItem", position: 2, name: "Score Calculators", item: "https://register.ipmcareer.com/response" },
                  { "@type": "ListItem", position: 3, name: "CAT 2026 Score Calculator", item: PAGE_URL },
                ],
              },
            ],
          }),
        }}
      />
    </AppShell>
  );
}
