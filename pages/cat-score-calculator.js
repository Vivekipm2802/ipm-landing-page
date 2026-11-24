import { sendLeadToCrm } from "../lib/crm";
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { NextSeo } from "next-seo";
import axios from "axios";
import { toast } from "react-hot-toast";
import AppShell from "../components/AppShell";
import CatScorecard from "../components/CatScorecard";
import styles from "./Response.module.css";
import ui from "./IimbUg.module.css";
import c from "./CatCalc.module.css";
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
    q: "When will the CAT 2026 response sheet be released?",
    a: "The IIMs have not announced the date yet. For CAT 2025, held on 30 November 2025, the response sheet and provisional answer key were released on 4 December 2025, so expect the CAT 2026 response sheet in the first week of December 2026.",
  },
  {
    q: "How do I download the CAT response sheet on my phone?",
    a: "Log in at iimcat.ac.in, open the response sheet and copy the link from the address bar. If you cannot copy it, open the browser menu, choose Download or Save page, and upload that file in the Upload file tab. Screenshots and PDFs do not work.",
  },
  {
    q: "How many marks are needed for 99 percentile in CAT?",
    a: "In CAT 2025, published estimates put 99 percentile at roughly 85 to 93 raw marks out of 204, depending on the slot. The figure changes every year with difficulty: about 98 in 2021, 84 in 2022, 76 in 2023 and 96 in 2024. These are coaching-institute estimates, not official IIM data.",
  },
  {
    q: "What is the difference between raw score and scaled score in CAT?",
    a: "Your raw score is 3 marks per correct answer minus 1 per wrong MCQ. Because the three slots have different papers, the IIMs convert raw scores into scaled scores to make slots comparable, and percentiles are calculated from the scaled scores.",
  },
  {
    q: "How much does it cost to challenge the CAT answer key?",
    a: "In CAT 2025 the objection fee was Rs 1,500 per question, refunded only if the objection was accepted, and the window ran from 8 to 10 December 2025. The CAT 2026 fee and dates will be announced with the provisional answer key.",
  },
  {
    q: "Does this calculator predict my CAT percentile?",
    a: "Not yet. It gives your exact raw score, section-wise marks and your rank among students who used the tool. Use the CAT score vs percentile table on this page for a rough idea; official percentiles come only with the result.",
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
  const [helpOpen, setHelpOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [linkFailed, setLinkFailed] = useState(false);
  const fileInputRef = useRef(null);
  const nameRef = useRef(null);
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

  // Links from the response sheet / answer key pages arrive as ?url=<response sheet link>: prefill and open the details step
  useEffect(() => {
    try {
      const u = new URLSearchParams(window.location.search).get("url");
      if (!u) return;
      const parsed = new URL(u);
      if (!/(^|\.)digialm\.com$/i.test(parsed.hostname)) return;
      setSheetUrl(u);
      setModalError("");
      setModalOpen(true);
    } catch {}
  }, []);

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

  const linkError = () => {
    if (mode === "file") return file ? "" : "Please choose your saved response sheet (.html) file.";
    const raw = sheetUrl.trim();
    if (!raw) return "Paste your CAT response sheet link first.";
    let u;
    try { u = new URL(raw); } catch { return "Please paste the full link. It starts with https://cdn.digialm.com/ and ends with .html"; }
    if (!/(^|\.)digialm\.com$/i.test(u.hostname)) return "That is not a CAT response sheet link. It should start with https://cdn.digialm.com/";
    return "";
  };

  const detailsError = () => {
    if (form.name.trim().length < 2) return "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return "Please enter a valid 10-digit WhatsApp number (without +91 or 0).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (!form.category) return "Please pick your category.";
    return "";
  };

  // Step 1: link only. Step 2: details in a popup.
  const start = (e) => {
    e && e.preventDefault();
    const v = linkError();
    if (v) { setError(v); return; }
    setError("");
    setModalError("");
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen) return undefined;
    const t = setTimeout(() => nameRef.current?.focus(), 60);
    const esc = (e) => { if (e.key === "Escape" && !submitting) setModalOpen(false); };
    window.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(t); window.removeEventListener("keydown", esc); document.body.style.overflow = prev; };
  }, [modalOpen, submitting]);

  const analyse = async (e) => {
    e && e.preventDefault();
    const v = detailsError();
    if (v) { setModalError(v); return; }
    setSubmitting(true);
    setModalError("");
    // CRM copy of this lead (fire-and-forget, never blocks the form)
    sendLeadToCrm({ name: form?.name, phone: form?.mobile, email: form?.email, city: form?.city }, "register-cat-score-calculator");
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
      setModalOpen(false);
      try { window.gtag && window.gtag("event", "generate_lead", { form: "cat_score_calculator" }); } catch {}
      if (d.uid) toast.success("Scorecard ready!");
      else toast.error("Score calculated, but we could not save your report link. Try again in a minute.");
      fetchLeaderboard();
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      // Problems with the link are fixed on the main card, so close the popup and show it there
      setModalOpen(false);
      setLinkFailed(true);
      setError(err?.response?.data?.error || "We could not read that link. Check it and try again, or upload the saved page instead.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setFile(null);
    setMode("link");
    setError("");
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


  return (
    <AppShell activePage="/cat-score-calculator" pageTitle="CAT 2026 Score Calculator">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title="CAT Score Calculator 2026 from Response Sheet + Percentile"
        description="Paste your CAT 2026 response sheet link and get VARC, DILR, QA and total out of 204, your estimated percentile and rank among students. Free, no login. Works the day the response sheet is out."
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
              "CAT score calculator, CAT score calculator 2026, CAT score calculator response sheet, CAT response sheet calculator, CAT response sheet 2026, CAT response sheet release date, CAT 2026 answer key, CAT score vs percentile, CAT marks vs percentile, CAT marks calculator, CAT raw score vs scaled score, how to calculate CAT score",
          },
          { name: "robots", content: "index, follow, max-image-preview:large" },
        ]}
      />

      <div className={`${styles.page} ${c.page}`}>
        {r ? (
          <div className={c.resultWrap} ref={resultRef} style={{ scrollMarginTop: 90 }}>
            <CatScorecard
              name={result.candidate?.name || result.name}
              category={result.category}
              city={form.city}
              slot={result.candidate?.slot}
              examYear={result.examYear}
              result={{ ...r, insights: result.insights }}
              uid={result.uid}
              rank={result.rank}
              count={result.count}
              warnings={result.warnings}
              onReset={reset}
            />
          </div>
        ) : (
          <section className={c.hero}>
            <div className={c.left}>
              <div className={c.eyebrow}>CAT 2026 · Free · No login</div>
              <h1 className={c.title}>CAT 2026 Score Calculator</h1>
              <p className={c.sub}>Paste your response sheet link. Get your VARC, DILR, QA and total score out of {MAX_SCORE} in under a minute.</p>
              <ol className={c.steps}>
                <li className={c.step}>
                  <span className={c.stepNum}>1</span>
                  <div className={c.stepText}><b>Open your response sheet</b><span>Log in at <a href={CAT_SITE} target="_blank" rel="noopener noreferrer">iimcat.ac.in</a> once it is released</span></div>
                </li>
                <li className={c.step}>
                  <span className={c.stepNum}>2</span>
                  <div className={c.stepText}><b>Copy the link</b><span>It starts with cdn.digialm.com and ends with .html</span></div>
                </li>
                <li className={c.step}>
                  <span className={c.stepNum}>3</span>
                  <div className={c.stepText}><b>Paste it here</b><span>Your section-wise score and report are ready in seconds</span></div>
                </li>
              </ol>
            </div>

            <form className={c.card} onSubmit={start} noValidate>
              {count >= 25 && (
                <div className={c.counter}>
                  <span className={c.counterLabel}>Total submissions</span>
                  <span className={c.counterNum}>{count.toLocaleString("en-IN")}</span>
                </div>
              )}

              {mode === "link" ? (
                <>
                  <label className={c.label} htmlFor="cat-url">Paste your response sheet URL</label>
                  <input
                    id="cat-url"
                    className={c.input}
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://cdn.digialm.com/..."
                    value={sheetUrl}
                    onChange={(e) => { setError(""); setLinkFailed(false); setSheetUrl(e.target.value); }}
                  />
                </>
              ) : (
                <>
                  <span className={c.label}>Saved response sheet</span>
                  <button type="button" className={c.fileBtn} onClick={() => fileInputRef.current?.click()}>
                    {file ? `✅ ${file.name}` : "Choose the saved .html file"}
                  </button>
                  <input ref={fileInputRef} type="file" accept=".html,.htm,text/html" style={{ display: "none" }} onChange={(e) => acceptFile(e.target.files?.[0])} />
                  <button type="button" className={c.textBtn} onClick={() => { setMode("link"); setFile(null); setError(""); }}>Use the link instead</button>
                </>
              )}

              {error && (
                <div className={c.error} role="alert">
                  {error}
                  {mode === "link" && linkFailed && (
                    <button type="button" className={c.textBtn} onClick={() => { setMode("file"); setError(""); }}>Upload the saved page instead</button>
                  )}
                </div>
              )}

              <button type="submit" className={c.cta}>Calculate my score</button>

              <button type="button" className={c.help} onClick={() => setHelpOpen(!helpOpen)} aria-expanded={helpOpen}>
                Where do I find the link? <span className={helpOpen ? c.chevOpen : c.chev}>▾</span>
              </button>
              {helpOpen && (
                <div className={c.helpBody} id="how-to">
                  <p>Open the response sheet after logging in at iimcat.ac.in and copy the address from the browser bar.</p>
                  <p>If it opens inside the portal, press <kbd>Ctrl</kbd> + <kbd>U</kbd>, search for <kbd>digialm</kbd> and copy the link ending in .html.</p>
                  <p>PDFs and screenshots do not work.</p>
                </div>
              )}

              <p className={c.fine}>Free. Your phone and email are never shown publicly.</p>
            </form>
          </section>
        )}

        {/* ── Details popup ── */}
        {modalOpen && (
          <div className={c.back} role="dialog" aria-modal="true" aria-labelledby="cat-modal-title" onClick={(e) => { if (e.target === e.currentTarget && !submitting) setModalOpen(false); }}>
            <form className={c.modal} onSubmit={analyse} noValidate>
              <button type="button" className={c.x} onClick={() => setModalOpen(false)} disabled={submitting} aria-label="Close">×</button>
              <h2 id="cat-modal-title" className={c.modalTitle}>Almost there</h2>
              <p className={c.modalSub}>Tell us who you are so we can save your scorecard and send you the report link.</p>

              <label className={c.label} htmlFor="cat-name">Full name</label>
              <input id="cat-name" ref={nameRef} className={c.input} type="text" placeholder="Your full name" value={form.name} onChange={update("name")} autoComplete="name" />

              <div className={c.row}>
                <div>
                  <label className={c.label} htmlFor="cat-mobile">WhatsApp number</label>
                  <input id="cat-mobile" className={c.input} type="tel" inputMode="numeric" placeholder="10-digit number" value={form.mobile} onChange={update("mobile")} autoComplete="tel-national" />
                </div>
                <div>
                  <label className={c.label} htmlFor="cat-email">Email</label>
                  <input id="cat-email" className={c.input} type="email" placeholder="you@email.com" value={form.email} onChange={update("email")} autoComplete="email" />
                </div>
              </div>

              <span className={c.label}>Category</span>
              <div className={c.chips} role="radiogroup" aria-label="Category">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button" role="radio" aria-checked={form.category === cat} className={`${c.chip} ${form.category === cat ? c.chipOn : ""}`} onClick={() => { setModalError(""); setForm((prev) => ({ ...prev, category: cat })); }}>{cat}</button>
                ))}
              </div>

              <label className={c.label} htmlFor="cat-city">City <span className={c.optional}>(optional)</span></label>
              <input id="cat-city" className={c.input} type="text" placeholder="e.g. Delhi" value={form.city} onChange={update("city")} autoComplete="address-level2" />

              {modalError && <div className={c.error} role="alert">{modalError}</div>}

              <button type="submit" className={c.cta} disabled={submitting}>
                {submitting ? "Reading your response sheet..." : "Show my score"}
              </button>
              <p className={c.fine}>Your phone and email are never shown publicly.</p>
            </form>
          </div>
        )}

        {leaderboard.length >= 5 && (
          <section className={c.board}>
            <h2 className={c.boardTitle}>Top scores so far</h2>
            <div className={c.boardList}>
              {leaderboard.slice(0, 10).map((s, i) => (
                <div key={i} className={c.boardRow}>
                  <span className={c.boardRank}>{i + 1}</span>
                  <span className={c.boardName}>{s.name}{s.city && <span className={c.boardCity}> · {s.city}</span>}</span>
                  <span className={c.boardScore} title={s.provisional ? "Provisional: part of the answer key is awaited" : undefined}>{s.total}{s.provisional ? "*" : ""}</span>
                </div>
              ))}
            </div>
            <p className={c.boardNote}>Raw score out of {MAX_SCORE} from response sheets checked here. * Provisional until the official key is out.</p>
          </section>
        )}

        {/* ════════ SEO ARTICLE ════════ */}
        <article className={ui.article}>
          <h2>CAT 2026 Score Calculator: work out your CAT score from the response sheet</h2>
          <p className={ui.lede}>Free CAT response sheet tool with VARC, DILR and QA marks, MCQ vs TITA accuracy and a shareable report</p>
          <p>
            The <strong>CAT Score Calculator 2026</strong> by IPM Careers is a free CAT response sheet calculator: it reads your official CAT
            response sheet and calculates your exact raw score in seconds, with no manual marks counting. It checks all 68 questions, applies the CAT marking scheme separately to MCQ and TITA questions, and shows your{" "}
            <strong>VARC, DILR and QA</strong> scores, total out of 204, correct, wrong and unattempted counts and accuracy for each section.
            Think of it as a CAT marks calculator that already knows the answer key.
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

          <h2>CAT score calculator from response sheet: step by step</h2>
          <p>
            Your CAT response sheet is a page on the TCS iON server (cdn.digialm.com) that lists every question, the option you chose or the
            answer you typed for TITA, and the correct answer. Paste that link above and the calculator scores all 68 questions for you. If the
            link has expired, save the page as HTML and upload it instead: the result is the same.
          </p>
          <ol>
            <li><strong>Laptop:</strong> log in at iimcat.ac.in, open the response sheet, copy the link from the address bar. If you only see the
              portal address, press Ctrl + U, search for <em>digialm</em> and copy the link ending in .html.</li>
            <li><strong>Mobile:</strong> open the response sheet, tap the address bar and copy the link. Or use the browser menu (⋮) → Download /
              Save page and upload the file with the <em>Upload file</em> tab. Screenshots and PDFs will not work.</li>
            <li>Paste the link, add your details and tap <em>Calculate My CAT Score</em>.</li>
          </ol>

          <h2>CAT response sheet 2026: release date and answer key</h2>
          <p>
            The IIMs have not announced the CAT 2026 response sheet date yet. Going by last year, expect it in the <strong>first week of December
            2026</strong>, a few days after the exam on 29 November. The provisional answer key is released with it, followed by a short window to
            challenge answers.
          </p>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr><th>Step</th><th>CAT 2025 (actual)</th><th>CAT 2026 (expected)</th></tr>
              </thead>
              <tbody>
                <tr><td>Exam</td><td>30 November 2025</td><td>29 November 2026</td></tr>
                <tr><td>Response sheet + provisional answer key</td><td>4 December 2025</td><td>First week of December 2026</td></tr>
                <tr><td>Answer key objection window</td><td>8 to 10 December 2025</td><td>A few days after the key</td></tr>
                <tr><td>Objection fee</td><td>Rs 1,500 per question (refunded if accepted)</td><td>To be announced</td></tr>
                <tr><td>Final answer key and result</td><td>With the result</td><td>Late December 2026 or early January 2027</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            Checked your score before the CAT 2026 answer key is out? Your report link updates automatically once the official key is loaded,
            so you never need to re-enter anything.
          </p>

          <h2>CAT score vs percentile 2026 (based on CAT 2025)</h2>
          <p>
            CAT percentile depends on how everyone else did, so no tool can give the official figure before the result. The table below shows
            roughly how many <strong>raw marks out of 204</strong> were needed for each percentile in CAT 2025. These are approximate ranges from
            published post-result analyses by coaching institutes, not official IIM data, and they vary by slot.
          </p>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr><th>Percentile</th><th>Approx. overall raw marks (CAT 2025)</th></tr>
              </thead>
              <tbody>
                <tr><td>99.5</td><td>about 96</td></tr>
                <tr><td>99</td><td>85 to 93</td></tr>
                <tr><td>95</td><td>62 to 68</td></tr>
                <tr><td>90</td><td>51 to 53</td></tr>
                <tr><td>80</td><td>about 41</td></tr>
              </tbody>
            </table>
          </div>
          <h3>CAT marks vs percentile: section wise and over the years</h3>
          <p>
            For a <strong>99 percentile in each section</strong> in CAT 2025, estimates put VARC at about 39 to 44, DILR at about 30 to 32 and QA at
            about 27 to 31 raw marks. The overall mark for 99 percentile moves a lot with difficulty: roughly 98 in 2021, 84 in 2022, 76 in 2023,
            96 in 2024 and 85 to 93 in 2025. So compare your score with the same year's paper, not an old table.
          </p>
          <h3>CAT raw score vs scaled score (normalisation)</h3>
          <p>
            This calculator gives your <strong>raw score</strong>: 3 marks per correct answer minus 1 per wrong MCQ. Because CAT runs in three
            slots with different papers, the IIMs first convert raw scores into <strong>scaled scores</strong> so that the slots are comparable,
            and then compute percentiles from the scaled scores. That is why two students with the same raw score in different slots can get
            different percentiles.
          </p>

          <h2>After the CAT 2026 response sheet: result and scorecard</h2>
          <p>
            The CAT 2026 result and scorecard will be published on iimcat.ac.in, expected in late December 2026 or early January 2027. Your
            scorecard shows scaled scores and percentiles for each section and overall, which institutes then use for shortlisting along with
            their own sectional cut-offs.
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
                  { "@type": "ListItem", position: 2, name: "CAT 2026 Score Calculator", item: PAGE_URL },
                ],
              },
            ],
          }),
        }}
      />
    </AppShell>
  );
}
