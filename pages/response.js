import styles from "./Response.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import { uuid } from "uuidv4";
import ShareButton from "../components/ShareButton";
import AppShell from "../components/AppShell";
import { toast } from "react-hot-toast";

function Response() {
  const [url, setUrl] = useState();
  const [data, setData] = useState();
  const [downloadLink, setDownloadLink] = useState();
  const [formData, setFormData] = useState();
  const [secondDownloadLink, setSecondDownloadLink] = useState();
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [help, setHelpModal] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const [topperslist, setToppersList] = useState([]);
  const [vis, setVis] = useState();
  const [error, setError] = useState();
  const [stepsOpen, setStepsOpen] = useState(false);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(undefined), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    getCount();
    getToppers();
    // Realtime toast removed for security — prevents exposing student names/scores via RLS
  }, []);

  const categories = [
    { value: "gen", title: "GEN" },
    { value: "ews", title: "EWS" },
    { value: "obc", title: "OBC" },
    { value: "nc_obc", title: "NC-OBC" },
    { value: "pwd", title: "PWD" },
    { value: "sc", title: "SC" },
    { value: "st", title: "ST" },
  ];

  useEffect(() => {
    if (router.query.form) {
      setVis(router.query.form);
    }
  }, [router]);

  async function getCount() {
    const { data, error } = await supabase.rpc("get_total_responses");
    if (data) {
      setIndex(550 + data);
    }
  }

  async function getToppers() {
    const { data, error } = await supabase.rpc("get_top_10");
    if (data) {
      setToppersList(data.slice(0, 3));
    }
  }

  async function handleGenerate(url, b, c) {
    const { data, error } = await axios.post(
      "https://main.your-domain.com/printables",
      { url: url, width: "210mm", height: "297mm" }
    );
    if (data) {
      setLoading(false);
      toast.success("Full Scorecard Available Now to Download");
      setSecondDownloadLink(data.url);
    } else if (error) {
      toast.error("Unable to Generate your PDF Scorecard");
      setLoading(false);
    }
  }

  function validateURL(url) {
    const regex = /^(ftp|http|https):\/\/[^ "]+$/;
    return regex.test(url);
  }

  async function getResponseSheetData() {
    if (!formData) {
      setError("Please fill all the details before generating.");
      return;
    }
    if (!formData.email || !validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formData.phone || !validatePhone(formData.phone)) {
      setError("Please enter a valid 10-digit phone number (without +91 or 0).");
      return;
    }
    if (!formData.category) {
      setError("Please select your category.");
      return;
    }
    if (!url || !validateURL(url.trim())) {
      setError(
        "Invalid URL. Paste the HTML response sheet link from the IIMI website."
      );
      return;
    }
    setLoading(true);
    await axios
      .post("/api/sheetdata", { url: url.trim() })
      .then((response) => {
        if (response.data) {
          const { data } = response;
          const to =
            calculateScores(data.data.sa, 0, 4) +
            calculateScores(data.data.mcq, 1, 4) +
            calculateScores(data.data.va, 1, 4);
          submitResponse(data.data, formData, to, url);
          setData(data.data);
          setLoading(false);
        } else {
          setHelpModal(true);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Sheetdata error:", err);
        const msg = err?.response?.data?.error || "Failed to fetch response sheet. Check the URL and try again.";
        setError(msg);
        setLoading(false);
      });
  }

  async function submitResponse(a, b, c) {
    setLoading(true);
    const mainTotal = c;
    const uid = uuid();

    // Safely calculate sectional scores
    let saVal = null;
    let mcqVal = null;
    let vaVal = null;
    try {
      saVal = calculateScores(a.sa, 0, 4);
      mcqVal = calculateScores(a.mcq, 1, 4);
      vaVal = calculateScores(a.va, 1, 4);
    } catch (e) {
      console.error("Score calculation error:", e);
    }

    const row = {
      email: b.email,
      phone: b.phone,
      data: JSON.stringify(a),
      name: a.StudentData.participantName,
      total: mainTotal,
      link: url.trim(),
      category: b.category,
      uuid: uid,
      sa_score: typeof saVal === 'number' ? saVal : null,
      mcq_score: typeof mcqVal === 'number' ? mcqVal : null,
      va_score: typeof vaVal === 'number' ? vaVal : null,
      city: b.city || '',
    };

    try {
      // Use server-side API to bypass RLS
      const response = await axios.post('/api/save-response', row);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
    } catch (ex) {
      console.error("Save error:", ex);
      setLoading(false);
      toast.error("Unable to save scorecard. Please try again.");
      return;
    }

    setFormData();
    setLoading(false);
    setUrl();
    toast.success("Scorecard generated! Redirecting to your detailed report...");
    setDownloadLink(`/report/${uid}`);
    setTimeout(() => {
      router.push(`/report/${uid}`);
    }, 1500);
  }

  function validatePhone(phone) {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
  }

  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function calculateScores(d, subtractScore, addScore) {
    if (!d || !Array.isArray(d)) return 0;
    return d.reduce((sum, i) => {
      if (i.status === "Answered" || i.status === "Marked For Review") {
        if (i.rightAnswer == i.givenAnswer) {
          return sum + addScore;
        } else if (i.rightAnswer != i.givenAnswer && subtractScore > 0) {
          return sum - subtractScore;
        }
      }
      return sum;
    }, 0);
  }

  const saScore = data ? calculateScores(data.sa, 0, 4) : 0;
  const mcqScore = data ? calculateScores(data.mcq, 1, 4) : 0;
  const vaScore = data ? calculateScores(data.va, 1, 4) : 0;
  const totalScore = saScore + mcqScore + vaScore;

  return (
    <AppShell activePage="/response">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title="IPMAT Score Calculator 2026 — Free Response Sheet Tool | IPM Careers"
        description="Free IPMAT Score Calculator and Response Sheet Tool. Paste your IPMAT response sheet URL and get sectional scores, detailed analysis, and predicted AIR instantly. Trusted by 500+ IPM aspirants."
        canonical="https://register.ipmcareer.com/response"
        openGraph={{
          url: "https://register.ipmcareer.com/response",
          title: "IPMAT Score Calculator 2026 — Free Response Sheet Analyzer",
          description: "Paste your IPMAT response sheet URL and get sectional scores, analysis, and predicted AIR instantly. Free IPM Score Calculator by IPM Careers.",
          images: [
            {
              url: "/scorecard_ss.png",
              width: 1200,
              height: 630,
              alt: "IPMAT Score Calculator 2026",
            },
          ],
        }}
        additionalMetaTags={[
          { name: "keywords", content: "IPMAT score calculator, IPMAT response sheet tool, IPM score calculator, IPMAT score analyzer, IPMAT score checker, IPMAT response sheet analyzer, IPMAT marks calculator 2026, IPM score calculator 2026" },
          { name: "robots", content: "index, follow" },
        ]}
      />

      <div className={styles.page}>
        {/* ── Hero ── */}
        <div className={styles.hero}>
          {/* Floating glow orbs */}
          <div className={`${styles.heroGlow} ${styles.heroGlow1}`}></div>
          <div className={`${styles.heroGlow} ${styles.heroGlow2}`}></div>
          <div className={`${styles.heroGlow} ${styles.heroGlow3}`}></div>

          <div className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowDot}></span>
            IPMAT 2026 Score Analyzer
          </div>
          <h1 className={styles.heroTitle}>
            Paste your response sheet.{' '}
            <span className={styles.heroTitleAccent}>Get your score in 10 seconds.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            </p>

          {/* Social Proof */}
          <div className={styles.socialProof}>
            <div className={styles.proofStat}>
              <span className={styles.proofStatNum}>{index.toLocaleString()}+</span> scorecards
            </div>
            <div className={styles.proofDot}></div>
            <div className={styles.proofStat}>
              Since <span className={styles.proofStatNum}>2022</span>
            </div>
            <div className={styles.proofDot}></div>
            
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className={styles.content}>
          {/* Top 3 Toppers */}
          {topperslist && topperslist.length > 0 && (
            <div className={styles.topperRow}>
              {topperslist.map((t, i) => (
                <div key={i} className={styles.topperBadge}>
                  <span className={`${styles.topperRank} ${i === 0 ? styles.topperRank1 : i === 1 ? styles.topperRank2 : styles.topperRank3}`}>
                    {i + 1}
                  </span>
                  {t.name}
                  <span className={styles.topperScore}>{t.total}</span>
                  {t.our_student && (
                    <span className={styles.topperOurs}>IPM Careers</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Scorecard Result (shown after generation) ── */}
          {data && (
            <div className={styles.scorecardResult}>
              <div className={styles.scorecardBg}></div>
              <div className={styles.scorecardBg2}></div>
              <div className={styles.scorecardHeader}>
                <div className={styles.scorecardTitle}>Your Scorecard</div>
                <div className={styles.scorecardName}>
                  👤 {data.StudentData.participantName}
                </div>
              </div>
              <div className={styles.scoreGrid}>
                <div className={styles.scoreBox}>
                  <div className={styles.scoreBoxLabel}>SA (QA)</div>
                  <div className={styles.scoreBoxValue}>{saScore}</div>
                </div>
                <div className={styles.scoreBox}>
                  <div className={styles.scoreBoxLabel}>MCQ (QA)</div>
                  <div className={styles.scoreBoxValue}>{mcqScore}</div>
                </div>
                <div className={styles.scoreBox}>
                  <div className={styles.scoreBoxLabel}>VA (MCQ)</div>
                  <div className={styles.scoreBoxValue}>{vaScore}</div>
                </div>
                <div className={`${styles.scoreBox} ${styles.scoreBoxTotal}`}>
                  <div className={styles.scoreBoxLabel}>Total</div>
                  <div className={styles.scoreBoxValue}>{totalScore}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Action Cards (shown after scorecard) ── */}
          {downloadLink && (
            <div className={styles.actionRow}>
              <a href={downloadLink} target="_blank" className={styles.actionCard}>
                <span className={styles.actionIcon}>📊</span>
                <span className={styles.actionLabel}>View Detailed Report</span>
                <span className={styles.actionDesc}>Full breakdown with analysis</span>
              </a>
              <div className={styles.actionCard} onClick={() => {
                const shareUrl = `https://register.ipmcareer.com${downloadLink}`;
                if (navigator.share) {
                  navigator.share({ title: 'My IPMAT Scorecard', url: shareUrl });
                } else {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success('Link copied!');
                }
              }}>
                <span className={styles.actionIcon}>📤</span>
                <span className={styles.actionLabel}>Share Scorecard</span>
                <span className={styles.actionDesc}>Send to friends & family</span>
              </div>
              {secondDownloadLink && (
                <a href={secondDownloadLink} target="_blank" className={`${styles.actionCard} ${styles.actionCardFull}`}>
                  <span className={styles.actionIcon}>📥</span>
                  <span className={styles.actionLabel}>Download PDF Scorecard</span>
                  <span className={styles.actionDesc}>Full scorecard as PDF</span>
                </a>
              )}
            </div>
          )}

          {/* ── Form Card ── */}
          <div className={styles.formCard}>
            <div className={styles.formTitle}>
              {data ? 'Generate Another Scorecard' : 'Generate Your Scorecard'}
            </div>
            <div className={styles.formSubtitle}>
              Enter your details and paste the response sheet URL from the IIM Indore website
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email</label>
                <input
                  className={styles.formInput}
                  type="email"
                  placeholder="your@email.com"
                  value={formData?.email || ''}
                  onChange={e => { setError(); setFormData(prev => ({ ...prev, email: e.target.value })); }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone</label>
                <input
                  className={styles.formInput}
                  type="tel"
                  placeholder="98765 43210"
                  maxLength={10}
                  value={formData?.phone || ''}
                  onChange={e => { setError(); setFormData(prev => ({ ...prev, phone: parseInt(e.target.value) || '' })); }}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <select
                  className={styles.formSelect}
                  value={formData?.category || ''}
                  onChange={e => { setError(); setFormData(prev => ({ ...prev, category: e.target.value })); }}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>City</label>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={formData?.city || ''}
                  onChange={e => { setError(); setFormData(prev => ({ ...prev, city: e.target.value })); }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Response Sheet URL</label>
                <input
                  className={styles.formInput}
                  placeholder="Paste HTML link here"
                  value={url || ''}
                  onChange={e => { setError(); setUrl(e.target.value); }}
                />
                <span className={styles.urlHint}>
                  The URL from "Candidate Response" on the IIM Indore website
                </span>
              </div>
            </div>

            <button
              className={`${styles.generateBtn} ${loading ? styles.generateBtnLoading : ''}`}
              onClick={() => { setDownloadLink(); setSent(false); getResponseSheetData(); }}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : '🎯 Analyze My Score'}
            </button>

            {error && (
              <div className={styles.errorMsg}>
                <span className={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            {downloadLink && !data && (
              <div className={styles.successMsg}>
                ✅ Your scorecard is ready! Redirecting to detailed report...
              </div>
            )}
          </div>

          {/* ── How-To Steps (collapsible) ── */}
          <div className={styles.stepsCard}>
            <div className={styles.stepsToggle} onClick={() => setStepsOpen(!stepsOpen)}>
              <div className={styles.stepsTitle}>
                📖 How to get your IPMAT 2026 response sheet URL
              </div>
              <div className={`${styles.stepsArrow} ${stepsOpen ? styles.stepsArrowOpen : ''}`}>
                ▼
              </div>
            </div>

            {stepsOpen && (
              <div className={styles.stepsList}>
                <div className={styles.step}>
                  <div className={styles.stepNum}>1</div>
                  <div className={styles.stepText}>
                    Go to the official IIM Indore IPM admissions page:{' '}
                    <a
                      className={styles.stepLink}
                      href="https://www.iimidr.ac.in/academic-programmes/five-year-integrated-programme-in-management-ipm/ipm-admissions-details"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      iimidr.ac.in/ipm-admissions
                    </a>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNum}>2</div>
                  <div className={styles.stepText}>
                    Click on <span className={styles.stepBold}>"Candidate Response"</span> and log in with your credentials
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNum}>3</div>
                  <div className={styles.stepText}>
                    Right-click (or long press on mobile) on the response sheet link and select <span className={styles.stepBold}>"Copy Link Address"</span>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNum}>4</div>
                  <div className={styles.stepText}>
                    Paste the copied URL in the <span className={styles.stepBold}>Response Sheet URL</span> field above
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNum}>5</div>
                  <div className={styles.stepText}>
                    Click <span className={styles.stepBold}>"Analyze My Score"</span> and your sectional + total scores will appear instantly
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Feature Cards ── */}
          <div className={styles.featureGrid}>
            <a href="/topperlist" className={styles.featureCard}>
              <span className={styles.featureIcon}>🏆</span>
              <span className={styles.featureName}>Topper List</span>
              <span className={styles.featureDesc}>See the highest IPMAT scores</span>
            </a>
            <a href="/call" className={styles.featureCard}>
              <span className={styles.featureIcon}>📞</span>
              <span className={styles.featureName}>Call Predictor</span>
              <span className={styles.featureDesc}>Will you get an interview call?</span>
            </a>
            <a href="/pi/profile" className={styles.featureCard}>
              <span className={styles.featureIcon}>🎯</span>
              <span className={styles.featureName}>PI Prep</span>
              <span className={styles.featureDesc}>Prepare for your IIM interview</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── SEO Blog Section ── */}
      <div style={{ maxWidth: 800, margin: '60px auto 0', padding: '0 20px 60px', fontFamily: 'DM Sans, sans-serif', color: '#333', lineHeight: 1.75 }}>
        <article>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#833589', marginBottom: 8 }}>
            IPMAT Score Calculator 2026 — Analyse Your Response Sheet in Seconds
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: 20 }}>
            Free IPMAT response sheet tool used by 500+ aspirants every exam cycle
          </p>

          <p>
            The <strong>IPMAT Score Calculator</strong> by IPM Careers is the fastest way to find out your exact IPMAT Indore score without waiting for official results. Simply paste your response sheet URL from the IIM Indore website, and our tool parses every question, applies the marking scheme (+4 for correct, -1 for wrong MCQs, no negative for SA), and gives you a complete breakdown within seconds. Whether you search for an <strong>IPMAT response sheet tool</strong> or an <strong>IPM score calculator</strong>, this is the only tool that gives you section-wise scores, a detailed scorecard, and a predicted All India Rank.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#5A2D62', marginTop: 28, marginBottom: 8 }}>How the IPMAT Response Sheet Tool Works</h3>
          <p>
            After you take the IPMAT Indore exam, IIM Indore publishes your response sheet as an HTML page. Our <strong>IPMAT Score Calculator 2026</strong> reads this page, identifies every question you attempted, checks your answers against the official answer key, and calculates your score section by section. The three sections scored are QA Short Answer (60 marks, +4 per correct, no negative), QA MCQ (120 marks, +4/-1), and Verbal Ability (180 marks, +4/-1). Your total is out of 360.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#5A2D62', marginTop: 28, marginBottom: 8 }}>What You Get from the IPM Score Calculator</h3>
          <p>
            Beyond just a total score, the <strong>IPM Score Calculator</strong> generates a full scorecard that includes your section-wise marks, accuracy percentage per section, number of correct, wrong, and unattempted questions, a predicted All India Rank based on score distribution data, and a downloadable PDF scorecard you can share. The scorecard is shareable via a unique URL, making it easy to share with mentors or coaching institutes.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#5A2D62', marginTop: 28, marginBottom: 8 }}>Why Accuracy Matters</h3>
          <p>
            Other calculators ask you to manually enter your answers one by one. That process is slow and error-prone. Our <strong>IPMAT response sheet tool</strong> reads your actual response sheet directly, so there is zero chance of manual entry errors. The score you see is the score you got.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#5A2D62', marginTop: 28, marginBottom: 8 }}>After Your Score — What Next?</h3>
          <p>
            Once you have your score, use our <a href="/call" style={{ color: '#833589', fontWeight: 600, textDecoration: 'underline' }}>IPMAT Call Predictor</a> to check which IIMs and colleges will call you for interview. Then head to the <a href="/pi/profile" style={{ color: '#833589', fontWeight: 600, textDecoration: 'underline' }}>PI Prep section</a> to start preparing for your personal interview with AI-powered mock interviews, SOP building, and question banks.
          </p>
        </article>

        {/* ── FAQ Section ── */}
        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#833589', marginBottom: 20 }}>
            Frequently Asked Questions — IPMAT Score Calculator
          </h2>
          {[
            { q: "What is the IPMAT Score Calculator?", a: "The IPMAT Score Calculator is a free tool by IPM Careers that automatically calculates your IPMAT Indore score from your official response sheet. It gives you section-wise marks, accuracy data, and a predicted All India Rank." },
            { q: "How do I use the IPMAT response sheet tool?", a: "After your IPMAT exam, IIM Indore publishes your response sheet URL. Copy that URL and paste it into our tool. Within seconds, you'll see your complete score breakdown." },
            { q: "Is this IPM Score Calculator free?", a: "Yes, completely free. No login, no payment, no hidden charges. Just paste your response sheet URL and get your scores." },
            { q: "What is the IPMAT 2026 marking scheme?", a: "IPMAT Indore has three sections: QA Short Answer (15 questions, +4 each, no negative = 60 marks), QA MCQ (30 questions, +4/-1 = 120 marks), and Verbal Ability (45 questions, +4/-1 = 180 marks). Total: 360 marks." },
            { q: "How accurate is the IPMAT Score Calculator 2026?", a: "Extremely accurate. Unlike manual calculators where you type answers one by one, our tool reads your actual response sheet directly from IIM Indore's system, eliminating any chance of manual entry errors." },
            { q: "Can I get a PDF scorecard?", a: "Yes. After your score is calculated, you can download a professional PDF scorecard that includes all sections, accuracy data, and your predicted rank." },
            { q: "What is the predicted AIR feature?", a: "Based on score distribution data from thousands of past IPMAT test-takers, the tool estimates your All India Rank. This helps you understand where you stand relative to other aspirants." },
            { q: "Where do I find my IPMAT response sheet URL?", a: "After the exam, visit the IIM Indore IPMAT portal. Log in with your credentials, navigate to the response sheet section, and copy the HTML page URL. Our tool accepts this URL directly." },
          ].map((faq, i) => (
            <details key={i} style={{ marginBottom: 12, background: '#FAF5FB', borderRadius: 10, padding: '14px 18px', border: '1px solid #E5C9EA', cursor: 'pointer' }}>
              <summary style={{ fontWeight: 600, fontSize: '0.95rem', color: '#5A2D62', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {faq.q}
                <span style={{ fontSize: '1.2rem', color: '#833589' }}>+</span>
              </summary>
              <p style={{ marginTop: 10, fontSize: '0.9rem', color: '#555', lineHeight: 1.7 }}>{faq.a}</p>
            </details>
          ))}
        </section>

        {/* ── JSON-LD FAQPage Schema ── */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "What is the IPMAT Score Calculator?", "acceptedAnswer": { "@type": "Answer", "text": "The IPMAT Score Calculator is a free tool by IPM Careers that automatically calculates your IPMAT Indore score from your official response sheet. It gives section-wise marks, accuracy data, and predicted AIR." }},
            { "@type": "Question", "name": "How do I use the IPMAT response sheet tool?", "acceptedAnswer": { "@type": "Answer", "text": "Copy your response sheet URL from IIM Indore's portal and paste it into our tool. Within seconds, you get your complete score breakdown." }},
            { "@type": "Question", "name": "Is this IPM Score Calculator free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, completely free. No login, no payment. Just paste your URL and get scores instantly." }},
            { "@type": "Question", "name": "What is the IPMAT 2026 marking scheme?", "acceptedAnswer": { "@type": "Answer", "text": "QA Short Answer: 15 questions, +4, no negative (60 marks). QA MCQ: 30 questions, +4/-1 (120 marks). Verbal Ability: 45 questions, +4/-1 (180 marks). Total: 360 marks." }},
            { "@type": "Question", "name": "How accurate is the IPMAT Score Calculator 2026?", "acceptedAnswer": { "@type": "Answer", "text": "Extremely accurate. It reads your actual response sheet directly, eliminating manual entry errors." }},
            { "@type": "Question", "name": "Can I get a PDF scorecard?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Download a professional PDF scorecard with sections, accuracy data, and predicted rank." }},
            { "@type": "Question", "name": "What is the predicted AIR feature?", "acceptedAnswer": { "@type": "Answer", "text": "Based on score distribution data, the tool estimates your All India Rank relative to other aspirants." }},
            { "@type": "Question", "name": "Where do I find my IPMAT response sheet URL?", "acceptedAnswer": { "@type": "Answer", "text": "Log in to the IIM Indore IPMAT portal, go to the response sheet section, and copy the HTML page URL." }},
          ]
        }) }} />

        {/* ── WebApplication Schema ── */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "IPMAT Score Calculator 2026",
          "url": "https://register.ipmcareer.com/response",
          "applicationCategory": "EducationalApplication",
          "operatingSystem": "All",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
          "description": "Free IPMAT Score Calculator and Response Sheet Analyzer. Paste your IPMAT Indore response sheet URL and get sectional scores, accuracy analysis, and predicted All India Rank instantly.",
          "creator": { "@type": "Organization", "name": "IPM Careers", "url": "https://ipmcareer.com" }
        }) }} />
      </div>

      {/* ── Help Modal ── */}
      {help && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.modalClose} onClick={() => setHelpModal(false)}>
              ✕
            </button>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>😕</div>
            <div className={styles.modalTitle}>Couldn't fetch your response sheet</div>
            <div className={styles.modalText}>
              This usually happens when the URL is incorrect or the response sheet has expired.
              Make sure you're copying the correct HTML link from the IIM Indore website.
            </div>
            <a href="tel:+918299470392" className={styles.modalBtn}>
              📞 Call Us for Help
            </a>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default Response;
