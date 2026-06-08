import styles from "./Jipmat.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import { uuid } from "uuidv4";
import AppShell from "../components/AppShell";
import { toast } from "react-hot-toast";

function JipmatScoreCalculator() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    getCount();
  }, []);

  const categories = [
    { value: "gen", title: "GEN" },
    { value: "ews", title: "EWS" },
    { value: "obc", title: "OBC-NCL" },
    { value: "sc", title: "SC" },
    { value: "st", title: "ST" },
    { value: "pwd", title: "PwD" },
  ];

  async function getCount() {
    try {
      const { count } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .like("data", '%"exam":"JIPMAT"%');
      setIndex(count || 0);
    } catch {
      setIndex(0);
    }
  }

  function validateURL(urlStr) {
    try {
      const parsed = new URL(urlStr.trim());
      return parsed.hostname.endsWith("onlineregistrationform.org");
    } catch {
      return false;
    }
  }

  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePhone(phone) {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
  }

  /**
   * JIPMAT Scoring:
   * +4 for correct, -1 for wrong, 0 for unanswered
   * All 100 questions are MCQ.
   */
  function calculateSectionScore(questions) {
    if (!questions || !Array.isArray(questions)) return { score: 0, correct: 0, wrong: 0, skipped: 0 };
    let score = 0, correct = 0, wrong = 0, skipped = 0;
    for (const q of questions) {
      if (!q.chosenOption || q.chosenOption === "" || q.status === "Not Answered") {
        skipped++;
        continue;
      }
      if (q.isCorrect === true) {
        correct++;
        score += 4;
      } else if (q.isCorrect === false) {
        wrong++;
        score -= 1;
      } else {
        // Answer key not available — count as attempted but unscored
        // We'll show the response was recorded
      }
    }
    return { score, correct, wrong, skipped };
  }

  async function handleSubmit() {
    // Validate form
    if (!formData.name || !formData.name.trim()) {
      setError("Please enter your name.");
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
        "Invalid URL. Please paste your official JIPMAT response sheet link from onlineregistrationform.org."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/jipmat-parse", {
        url: url.trim(),
      });

      if (response.data?.data) {
        const parsed = response.data.data;

        // Calculate scores if answer key is available
        const qaStats = calculateSectionScore(parsed.qa);
        const lrdiStats = calculateSectionScore(parsed.lrdi);
        const varcStats = calculateSectionScore(parsed.varc);

        const totalScore = parsed.answerKeyAvailable
          ? qaStats.score + lrdiStats.score + varcStats.score
          : null;

        // Prepare data for Supabase
        const uid = uuid();
        const insertData = {
          email: formData.email,
          phone: formData.phone,
          data: JSON.stringify({
            ...parsed,
            formName: formData.name.trim(),
            city: formData.city || "",
          }),
          name: parsed.StudentData?.participantName || formData.name.trim(),
          total: totalScore !== null ? totalScore : 0,
          link: url.trim(),
          category: formData.category,
          uuid: uid,
        };

        const { error: dbError } = await supabase
          .from("responses")
          .insert(insertData);

        if (dbError) {
          console.error("[JIPMAT] Supabase error:", dbError);
          toast.error("Failed to save your response. Please try again.");
          setLoading(false);
          return;
        }

        // Store response and scores in state for display
        setData({
          ...parsed,
          qaStats,
          lrdiStats,
          varcStats,
          totalScore,
        });

        // Also broadcast for live social proof
        try {
          await supabase.from("who_submitted").insert({
            name: formData.name.trim(),
            total: totalScore !== null ? totalScore : "Pending",
          });
        } catch {}

        setLoading(false);
        setDownloadLink(`/jipmat-report/${uid}`);
        toast.success("Response captured! Redirecting to your report...");

        setTimeout(() => {
          router.push(`/jipmat-report/${uid}`);
        }, 1500);
      } else {
        setError("Could not parse the response sheet. Please check the URL.");
        setLoading(false);
      }
    } catch (err) {
      console.error("[JIPMAT] Error:", err);
      const msg =
        err?.response?.data?.error ||
        "Failed to process the response sheet. Please check the URL and try again.";
      setError(msg);
      setLoading(false);
    }
  }

  // Section scores for display
  const qaScore = data?.qaStats?.score || 0;
  const lrdiScore = data?.lrdiStats?.score || 0;
  const varcScore = data?.varcStats?.score || 0;
  const totalScore = data?.totalScore;

  return (
    <AppShell activePage="/jipmat" pageTitle="JIPMAT Score Calculator">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title="JIPMAT Score Calculator 2026 — Check Your Score Instantly | IPM Careers"
        description="Paste your JIPMAT response sheet URL and get instant sectional scores for QA, LRDI, and VARC. Free JIPMAT 2026 score calculator by IPM Careers."
        canonical="https://register.ipmcareer.com/jipmat"
        openGraph={{
          url: "https://register.ipmcareer.com/jipmat",
          title:
            "JIPMAT Score Calculator 2026 — Check Your Score Instantly | IPM Careers",
          description:
            "Paste your JIPMAT response sheet URL and get instant sectional scores. Free tool by IPM Careers.",
          images: [
            {
              url: "/scorecard_ss.png",
              width: 1200,
              height: 630,
              alt: "JIPMAT Score Calculator by IPM Careers",
            },
          ],
        }}
      />

      <div className={styles.page}>
        {/* ── Hero ── */}
        <div className={styles.hero}>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowDot}></span>
            JIPMAT 2026 Score Calculator
          </div>
          <h1 className={styles.heroTitle}>
            Paste your response sheet.{" "}
            <span className={styles.heroTitleAccent}>
              Get your JIPMAT score instantly.
            </span>
          </h1>
          <p className={styles.heroSubtitle}>
            Instant sectional breakdown with QA, LRDI & VARC scores. Know
            exactly where you stand for IIM Jammu & IIM Bodh Gaya.
          </p>

          <div className={styles.socialProof}>
            {index > 0 && (
              <>
                <div className={styles.proofStat}>
                  <span className={styles.proofStatNum}>
                    {index.toLocaleString()}+
                  </span>{" "}
                  scorecards generated
                </div>
                <div className={styles.proofDot}></div>
              </>
            )}
            <div className={styles.proofStat}>
              Powered by{" "}
              <span className={styles.proofStatNum}>IPM Careers</span>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className={styles.content}>
          {/* ── Scorecard Result (shown after generation) ── */}
          {data && (
            <>
              <div className={styles.scorecardResult}>
                <div className={styles.scorecardBg}></div>
                <div className={styles.scorecardHeader}>
                  <div className={styles.scorecardTitle}>Your Scorecard</div>
                  <div className={styles.scorecardName}>
                    {data.StudentData?.participantName || formData.name}
                  </div>
                </div>

                {data.answerKeyAvailable ? (
                  <div className={styles.scoreGrid}>
                    <div className={styles.scoreBox}>
                      <div className={styles.scoreBoxLabel}>QA</div>
                      <div className={styles.scoreBoxValue}>{qaScore}</div>
                    </div>
                    <div className={styles.scoreBox}>
                      <div className={styles.scoreBoxLabel}>LRDI</div>
                      <div className={styles.scoreBoxValue}>{lrdiScore}</div>
                    </div>
                    <div className={styles.scoreBox}>
                      <div className={styles.scoreBoxLabel}>VARC</div>
                      <div className={styles.scoreBoxValue}>{varcScore}</div>
                    </div>
                    <div
                      className={`${styles.scoreBox} ${styles.scoreBoxTotal}`}
                    >
                      <div className={styles.scoreBoxLabel}>Total</div>
                      <div className={styles.scoreBoxValue}>{totalScore}</div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.scoreGrid}>
                    <div className={styles.scoreBox}>
                      <div className={styles.scoreBoxLabel}>QA</div>
                      <div className={styles.scoreBoxValue}>
                        {data.qaStats ? `${data.qa?.length - data.qaStats.skipped}/${data.qa?.length}` : "—"}
                      </div>
                    </div>
                    <div className={styles.scoreBox}>
                      <div className={styles.scoreBoxLabel}>LRDI</div>
                      <div className={styles.scoreBoxValue}>
                        {data.lrdiStats ? `${data.lrdi?.length - data.lrdiStats.skipped}/${data.lrdi?.length}` : "—"}
                      </div>
                    </div>
                    <div className={styles.scoreBox}>
                      <div className={styles.scoreBoxLabel}>VARC</div>
                      <div className={styles.scoreBoxValue}>
                        {data.varcStats ? `${data.varc?.length - data.varcStats.skipped}/${data.varc?.length}` : "—"}
                      </div>
                    </div>
                    <div
                      className={`${styles.scoreBox} ${styles.scoreBoxTotal}`}
                    >
                      <div className={styles.scoreBoxLabel}>Attempted</div>
                      <div className={styles.scoreBoxValue}>
                        {data.totalQuestions
                          ? data.totalQuestions -
                            (data.qaStats?.skipped || 0) -
                            (data.lrdiStats?.skipped || 0) -
                            (data.varcStats?.skipped || 0)
                          : "—"}
                        /{data.totalQuestions || 100}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Answer key pending banner */}
              {!data.answerKeyAvailable && (
                <div className={styles.pendingBanner}>
                  <div className={styles.pendingBannerIcon}>⏳</div>
                  <div className={styles.pendingBannerTitle}>
                    Official Answer Key Not Yet Released
                  </div>
                  <div className={styles.pendingBannerText}>
                    Your response has been recorded. Once NTA releases the
                    official JIPMAT 2026 answer key, your score will be
                    calculated automatically. Check back soon!
                  </div>
                </div>
              )}

              {/* Action cards */}
              {downloadLink && (
                <div className={styles.actionRow}>
                  <a
                    href={downloadLink}
                    target="_blank"
                    className={styles.actionCard}
                  >
                    <span className={styles.actionIcon}>📊</span>
                    <span className={styles.actionLabel}>
                      View Detailed Report
                    </span>
                    <span className={styles.actionDesc}>
                      {data.answerKeyAvailable
                        ? "Full breakdown with analysis"
                        : "Response summary & attempt stats"}
                    </span>
                  </a>
                  <div
                    className={styles.actionCard}
                    onClick={() => {
                      const shareUrl = `https://register.ipmcareer.com${downloadLink}`;
                      if (navigator.share) {
                        navigator.share({
                          title: "My JIPMAT Scorecard",
                          url: shareUrl,
                        });
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success("Link copied!");
                      }
                    }}
                  >
                    <span className={styles.actionIcon}>📤</span>
                    <span className={styles.actionLabel}>Share Result</span>
                    <span className={styles.actionDesc}>
                      Send to friends & family
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Form Card ── */}
          {!data && (
            <div className={styles.formCard}>
              <div className={styles.formTitle}>Calculate Your JIPMAT Score</div>
              <div className={styles.formSubtitle}>
                Fill your details and paste the response sheet URL
              </div>

              {/* Name & City */}
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Full Name *</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Your full name"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>City</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Your city"
                    value={formData.city || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email *</label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Phone *</label>
                  <input
                    className={styles.input}
                    type="tel"
                    placeholder="10-digit number"
                    maxLength={10}
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>
              </div>

              {/* Category */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Category *</label>
                <div className={styles.categoryGrid}>
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      className={
                        formData.category === cat.value
                          ? styles.categoryChipActive
                          : styles.categoryChip
                      }
                      onClick={() =>
                        setFormData({ ...formData, category: cat.value })
                      }
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Input */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  JIPMAT Response Sheet URL *
                </label>
                <input
                  className={styles.urlInput}
                  type="url"
                  placeholder="https://...onlineregistrationform.org/JIPMAT/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              {/* Error */}
              {error && <div className={styles.error}>{error}</div>}

              {/* Submit */}
              <button
                className={
                  loading ? styles.submitBtnLoading : styles.submitBtn
                }
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Analyzing Response Sheet..." : "Calculate My Score"}
              </button>
            </div>
          )}

          {/* ── How to find your URL ── */}
          <div className={styles.stepsSection}>
            <button
              className={styles.stepsToggle}
              onClick={() => setStepsOpen(!stepsOpen)}
            >
              {stepsOpen ? "▼" : "▶"} How to find your JIPMAT Response Sheet URL
            </button>

            {stepsOpen && (
              <div className={styles.stepsList}>
                <div className={styles.stepItem}>
                  <div className={styles.stepNum}>1</div>
                  <div className={styles.stepText}>
                    Go to the <strong>NTA JIPMAT portal</strong> where you
                    downloaded your response sheet (onlineregistrationform.org)
                  </div>
                </div>
                <div className={styles.stepItem}>
                  <div className={styles.stepNum}>2</div>
                  <div className={styles.stepText}>
                    Login with your <strong>Application Number</strong> and{" "}
                    <strong>Date of Birth</strong>
                  </div>
                </div>
                <div className={styles.stepItem}>
                  <div className={styles.stepNum}>3</div>
                  <div className={styles.stepText}>
                    Click on <strong>"View Response Sheet"</strong> — a new tab
                    will open with your responses
                  </div>
                </div>
                <div className={styles.stepItem}>
                  <div className={styles.stepNum}>4</div>
                  <div className={styles.stepText}>
                    <strong>Copy the full URL</strong> from the browser address
                    bar (it starts with https://...onlineregistrationform.org...)
                  </div>
                </div>
                <div className={styles.stepItem}>
                  <div className={styles.stepNum}>5</div>
                  <div className={styles.stepText}>
                    <strong>Paste it above</strong> and click "Calculate My
                    Score"
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── SEO Blog Section ── */}
          <div className={styles.blogSection}>
            <h2 className={styles.blogTitle}>
              JIPMAT 2026 Score Calculator — Know Your Score Before Results
            </h2>
            <p className={styles.blogText}>
              The Joint Integrated Programme in Management Aptitude Test (JIPMAT)
              is conducted by NTA for admission to the 5-Year Integrated
              Programme in Management at IIM Jammu and IIM Bodh Gaya. JIPMAT
              2026 tests candidates across three sections: Quantitative Aptitude
              (33 questions), Logical Reasoning & Data Interpretation (33
              questions), and Verbal Ability & Reading Comprehension (34
              questions).
            </p>

            <h3 className={styles.blogSubtitle}>
              JIPMAT 2026 Exam Pattern at a Glance
            </h3>
            <p className={styles.blogText}>
              JIPMAT is a computer-based test of 150 minutes duration with 100
              multiple-choice questions carrying 400 marks total. Each correct
              answer earns +4 marks and each incorrect answer deducts 1 mark.
              There is no negative marking for unanswered questions.
            </p>

            <h3 className={styles.blogSubtitle}>
              How Does This Calculator Work?
            </h3>
            <p className={styles.blogText}>
              Our JIPMAT Score Calculator reads your official NTA response sheet
              and compares your chosen answers against the official answer key.
              It automatically calculates your section-wise scores for QA, LRDI,
              and VARC, giving you a comprehensive breakdown of your
              performance. You can use this score to check your eligibility for
              IIM Jammu and IIM Bodh Gaya.
            </p>

            <h3 className={styles.blogSubtitle}>
              JIPMAT Selection Process
            </h3>
            <p className={styles.blogText}>
              For IIM Jammu, the final selection weightage is JIPMAT Score (70%)
              + Class 10 & 12 Board Marks (30%). There is no WAT-PI round for
              JIPMAT admissions — your JIPMAT score and academic record
              determine your admission. This makes your JIPMAT score even more
              critical.
            </p>
          </div>

          {/* ── FAQ Section ── */}
          <div className={styles.faqSection}>
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                What is the JIPMAT 2026 exam pattern?
              </div>
              <div className={styles.faqAnswer}>
                JIPMAT 2026 has 100 MCQs across 3 sections: Quantitative
                Aptitude (33Q), Logical Reasoning & Data Interpretation (33Q),
                and Verbal Ability & Reading Comprehension (34Q). Total marks:
                400. Duration: 150 minutes. Marking: +4 correct, -1 wrong.
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                Which IIMs accept JIPMAT scores?
              </div>
              <div className={styles.faqAnswer}>
                JIPMAT scores are accepted by IIM Jammu and IIM Bodh Gaya for
                their 5-Year Integrated Programme in Management (IPM).
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                Is there a WAT-PI round in JIPMAT admissions?
              </div>
              <div className={styles.faqAnswer}>
                No. Unlike IPMAT Indore, JIPMAT admissions do not have a WAT-PI
                round. Selection is based on JIPMAT score plus academic
                performance (Class 10 and 12 marks).
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                How accurate is this score calculator?
              </div>
              <div className={styles.faqAnswer}>
                Our calculator uses the official NTA answer key to evaluate your
                responses. The score calculated here matches the official
                scoring methodology (+4/-1/0) exactly. Once the official answer
                key is released, scores are 100% accurate.
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                What if the answer key is not yet released?
              </div>
              <div className={styles.faqAnswer}>
                Your response will be recorded and saved. As soon as the
                official answer key is released by NTA, your score will be
                calculated automatically. You can revisit your report page to
                see updated scores.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default JipmatScoreCalculator;
