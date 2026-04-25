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
    supabase
      .channel("room1")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "who_submitted" },
        (payload) => {
          toast.custom(
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              background: '#fff', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb', fontSize: '0.82rem', fontFamily: 'inherit', zIndex: 50
            }}>
              <span style={{ fontSize: '1.2rem' }}>🎯</span>
              <div>
                <strong>{payload.new.name}</strong> just generated their scorecard
                <div style={{ color: '#6c63ff', fontWeight: 700, fontSize: '0.78rem' }}>
                  Scored: {payload.new.total}
                </div>
              </div>
            </div>
          );
        }
      )
      .subscribe();
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
            calculateScores(data.data.va, 1, 4, true);
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

    // Core insert — only columns that exist in the table
    const row = {
      email: b.email,
      phone: b.phone,
      data: JSON.stringify(a),
      name: a.StudentData.participantName,
      total: mainTotal,
      link: url.trim(),
      category: b.category,
      uuid: uid,
    };

    const { error } = await supabase.from("responses").insert(row);
    if (error) {
      console.error("Supabase insert error:", error);
    }

    // Try to update with sectional scores (won't fail if columns don't exist yet)
    try {
      const saVal = calculateScores(a.sa, 0, 4);
      const mcqVal = calculateScores(a.mcq, 1, 4);
      const vaVal = calculateScores(a.va, 1, 4, true);
      await supabase.from("responses").update({
        sa_score: saVal,
        mcq_score: mcqVal,
        va_score: vaVal,
        city: b.city || '',
      }).eq("uuid", uid);
    } catch (e) {
      // Columns may not exist yet — that is fine
    }

    // Always show scorecard
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

  function calculateScores(d, subtractScore, addScore, special) {
    if (!d || !Array.isArray(d)) return 0;
    return d.reduce((sum, i) => {
      if (i.status === "Answered" || i.status === "Marked For Review") {
        if (i.rightAnswer == i.givenAnswer) {
          return sum + addScore;
        } else if (
          i.rightAnswer != i.givenAnswer &&
          subtractScore > 0 &&
          !(special == true && i.givenAnswer.length > 1)
        ) {
          return sum - subtractScore;
        }
      }
      return sum;
    }, 0);
  }

  const saScore = data ? calculateScores(data.sa, 0, 4) : 0;
  const mcqScore = data ? calculateScores(data.mcq, 1, 4) : 0;
  const vaScore = data ? calculateScores(data.va, 1, 4, true) : 0;
  const totalScore = saScore + mcqScore + vaScore;

  return (
    <AppShell activePage="/response">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title="IPMAT Score Analyzer — Check Your Score in 10 Seconds | IPM Careers"
        description="Paste your IPMAT response sheet URL and get your sectional scores, detailed analysis, and performance report instantly. Used by 500+ IPMAT aspirants."
        canonical="https://register.ipmcareer.com/response"
        openGraph={{
          url: "https://register.ipmcareer.com/response",
          title: "IPMAT Score Analyzer — Check Your Score in 10 Seconds | IPM Careers",
          description:
            "Paste your IPMAT response sheet URL and get your sectional scores, detailed analysis, and performance report instantly.",
          images: [
            {
              url: "/scorecard_ss.png",
              width: 1200,
              height: 630,
              alt: "IPMAT Score Analyzer by IPM Careers",
            },
          ],
        }}
      />

      <div className={styles.page}>
        {/* ── Hero ── */}
        <div className={styles.hero}>
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
              <span className={styles.proofStatNum}>{index.toLocaleString()}+</span> scorecards generated
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
            <a href="/call" className={styles.featureCard}>
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
