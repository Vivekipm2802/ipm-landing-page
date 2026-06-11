import styles from "./Jipmat.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { NextSeo } from "next-seo";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import AppShell from "../components/AppShell";
import { toast } from "react-hot-toast";

// UUID v4 — uses the browser's crypto API (the old `uuidv4` package's
// `uuid` export breaks in the production bundle: "(0, c.uuid) is not a function")
function genUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Animated count-up ──
function useCountUp(target, duration = 1600) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target == null) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

// ── Grade + vibe ──
function getVibe(score) {
  if (score >= 320) return { grade: "S+", vibe: "certified topper energy 🔥", color: "#ffd700" };
  if (score >= 280) return { grade: "S", vibe: "IIM-bound. no cap 🚀", color: "#22d3ee" };
  if (score >= 240) return { grade: "A+", vibe: "you ate this, fr ✨", color: "#34d399" };
  if (score >= 200) return { grade: "A", vibe: "solid W — keep cooking 💪", color: "#a855f7" };
  if (score >= 140) return { grade: "B", vibe: "respectable run. now lock in 📈", color: "#fb923c" };
  return { grade: "C", vibe: "character development arc 🎬", color: "#f472b6" };
}

// ── Benchmark zones (EDIT THESE as real cutoff data emerges — estimates!) ──
const BENCHMARKS = [
  { label: "IIM Bodh Gaya zone", score: 220 },
  { label: "IIM Jammu zone", score: 245 },
  { label: "Topper league", score: 320 },
];

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
      const h = parsed.hostname.toLowerCase();
      return (
        h === "cbexams.com" ||
        h.endsWith(".cbexams.com") ||
        h === "onlineregistrationform.org" ||
        h.endsWith(".onlineregistrationform.org")
      );
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
   * Dropped questions (isCorrect === "dropped") are excluded from scoring.
   * All 100 questions are MCQ.
   */
  function calculateSectionScore(questions) {
    if (!questions || !Array.isArray(questions)) return { score: 0, correct: 0, wrong: 0, skipped: 0 };
    let score = 0, correct = 0, wrong = 0, skipped = 0;
    for (const q of questions) {
      if (q.isCorrect === "dropped") {
        // Dropped by NTA — excluded from scoring
        continue;
      }
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
        "Invalid URL. Please paste your official JIPMAT response sheet link from nta.cbexams.com."
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
        const uid = genUuid();
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

        // ── Save to Supabase (non-fatal: if the DB is down/paused, the
        //    student still gets their score and the email still goes out) ──
        let saved = false;
        try {
          const { error: dbError } = await supabase
            .from("responses")
            .insert(insertData);
          if (dbError) {
            console.error("[JIPMAT] Supabase error:", dbError);
          } else {
            saved = true;
          }
        } catch (e) {
          console.error("[JIPMAT] Supabase unreachable:", e);
        }

        // ── Email the lead via Gmail (never blocks the student's result) ──
        try {
          await axios.post("/api/jipmat-notify", {
            name: formData.name.trim(),
            email: formData.email,
            phone: formData.phone,
            city: formData.city || "",
            category: formData.category,
            scores: {
              qa: qaStats.score,
              lrdi: lrdiStats.score,
              varc: varcStats.score,
              total: totalScore,
            },
            link: url.trim(),
            student: parsed.StudentData || {},
          });
        } catch (e) {
          console.error("[JIPMAT] Notify failed:", e);
        }

        // Store response and scores in state for display
        setData({
          ...parsed,
          qaStats,
          lrdiStats,
          varcStats,
          totalScore,
        });

        if (saved) {
          // Also broadcast for live social proof
          try {
            await supabase.from("who_submitted").insert({
              name: formData.name.trim(),
              total: totalScore !== null ? totalScore : "Pending",
            });
          } catch {}

          setDownloadLink(`/jipmat-report/${uid}`);
          toast.success("Response captured! Redirecting to your report...");
          setTimeout(() => {
            router.push(`/jipmat-report/${uid}`);
          }, 1500);
        } else {
          // DB unavailable — show the scorecard inline, skip the report redirect
          toast.success("Score calculated!");
        }

        setLoading(false);
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

  // ── Share scorecard as image (canvas → native share sheet / download) ──
  async function shareScorecardImage() {
    try {
      const W = 1080, H = 1350;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      const rr = (x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      // Background
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#0f172a");
      bg.addColorStop(1, "#1a1033");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      const g1 = ctx.createRadialGradient(W - 100, 150, 0, W - 100, 150, 420);
      g1.addColorStop(0, "rgba(168,85,181,0.35)");
      g1.addColorStop(1, "rgba(168,85,181,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);
      const g2 = ctx.createRadialGradient(80, H - 150, 0, 80, H - 150, 420);
      g2.addColorStop(0, "rgba(56,189,248,0.22)");
      g2.addColorStop(1, "rgba(56,189,248,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = "center";
      ctx.fillStyle = "#c084fc";
      ctx.font = "800 30px Inter, sans-serif";
      ctx.fillText("⚡ JIPMAT 2026 SCORECARD", W / 2, 110);

      const dispName = (data?.StudentData?.participantName || formData.name || "Student").toUpperCase();
      ctx.fillStyle = "#f8fafc";
      ctx.font = "900 50px Inter, sans-serif";
      ctx.fillText(dispName, W / 2, 182);
      ctx.fillStyle = "#64748b";
      ctx.font = "700 26px Inter, sans-serif";
      ctx.fillText(
        `${(formData.category || "GEN").toUpperCase()}${data?.StudentData?.slot ? "  ·  SLOT " + data.StudentData.slot : ""}`,
        W / 2,
        228
      );

      // Score ring
      const cx = W / 2, cy = 520, R = 200;
      ctx.lineWidth = 28;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(148,163,184,0.12)";
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      const frac = Math.max(0, Math.min(1, (totalScore || 0) / 400));
      const ringGrad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      ringGrad.addColorStop(0, "#a855b5");
      ringGrad.addColorStop(0.6, "#833589");
      ringGrad.addColorStop(1, "#38bdf8");
      ctx.strokeStyle = ringGrad;
      ctx.shadowColor = "rgba(168,85,181,0.6)";
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#f8fafc";
      ctx.font = "900 130px Inter, sans-serif";
      ctx.fillText(String(totalScore ?? "—"), cx, cy + 30);
      ctx.fillStyle = "#64748b";
      ctx.font = "700 34px Inter, sans-serif";
      ctx.fillText("/ 400", cx, cy + 88);

      ctx.font = "900 34px Inter, sans-serif";
      ctx.fillStyle = vibe.color;
      ctx.fillText(`GRADE ${vibe.grade}  ·  ${accuracy}% ACCURACY`, cx, 812);

      // Section bars
      const secs = [
        { n: "QA", s: data?.qaStats?.score || 0, m: (data?.qa?.length || 33) * 4, c: "#a855b5" },
        { n: "DILR", s: data?.lrdiStats?.score || 0, m: (data?.lrdi?.length || 33) * 4, c: "#38bdf8" },
        { n: "VARC", s: data?.varcStats?.score || 0, m: (data?.varc?.length || 34) * 4, c: "#34d399" },
      ];
      let y = 890;
      const bx = 140, bw = W - 280;
      for (const s of secs) {
        ctx.textAlign = "left";
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "800 30px Inter, sans-serif";
        ctx.fillText(s.n, bx, y);
        ctx.textAlign = "right";
        ctx.fillStyle = s.c;
        ctx.fillText(`${s.s} / ${s.m}`, bx + bw, y);
        ctx.fillStyle = "rgba(148,163,184,0.12)";
        rr(bx, y + 18, bw, 14, 7);
        ctx.fill();
        ctx.fillStyle = s.c;
        rr(bx, y + 18, Math.max(14, bw * Math.max(0, Math.min(1, s.s / s.m))), 14, 7);
        ctx.fill();
        y += 100;
      }

      // Footer branding
      ctx.textAlign = "center";
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 28px Inter, sans-serif";
      ctx.fillText("calculate yours →  register.ipmcareer.com/jipmat", W / 2, 1245);
      ctx.fillStyle = "#c084fc";
      ctx.font = "900 30px Inter, sans-serif";
      ctx.fillText("IPM CAREERS · RUN BY IIM ALUMNI", W / 2, 1298);

      const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
      const file = new File([blob], "jipmat-scorecard.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "My JIPMAT Scorecard" });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "jipmat-scorecard.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success("Scorecard saved! Share it anywhere 🔥");
      }
    } catch (e) {
      if (e?.name !== "AbortError") {
        console.error("[JIPMAT] Image share failed:", e);
        toast.error("Could not generate the image. Please try again.");
      }
    }
  }

  function shareWhatsApp() {
    const link = downloadLink
      ? `https://register.ipmcareer.com${downloadLink}`
      : "https://register.ipmcareer.com/jipmat";
    const text = `Just calculated my JIPMAT 2026 score 🔥\n\nTotal: ${totalScore}/400\nQA ${qaScore} · DILR ${lrdiScore} · VARC ${varcScore}\n\nCalculate yours 👉 ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  // Section scores for display
  const qaScore = data?.qaStats?.score || 0;
  const lrdiScore = data?.lrdiStats?.score || 0;
  const varcScore = data?.varcStats?.score || 0;
  const totalScore = data?.totalScore;

  // ── Score reveal animation state ──
  const [reveal, setReveal] = useState(false);
  useEffect(() => {
    if (data) {
      const t = setTimeout(() => setReveal(true), 200);
      return () => clearTimeout(t);
    }
    setReveal(false);
  }, [data]);

  const totalAnimated = useCountUp(
    reveal && typeof totalScore === "number" ? totalScore : 0
  );

  // Aggregate stats
  const totalCorrect =
    (data?.qaStats?.correct || 0) + (data?.lrdiStats?.correct || 0) + (data?.varcStats?.correct || 0);
  const totalWrong =
    (data?.qaStats?.wrong || 0) + (data?.lrdiStats?.wrong || 0) + (data?.varcStats?.wrong || 0);
  const totalSkipped =
    (data?.qaStats?.skipped || 0) + (data?.lrdiStats?.skipped || 0) + (data?.varcStats?.skipped || 0);
  const totalAttempted = (data?.totalQuestions || 100) - totalSkipped;
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const vibe = getVibe(typeof totalScore === "number" ? totalScore : 0);

  const RING_R = 68;
  const RING_C = 2 * Math.PI * RING_R;
  const ringArc = Math.max(0, Math.min(1, (totalScore || 0) / 400)) * RING_C;

  const sectionRows = data
    ? [
        { short: "QA", name: "Quant Aptitude", stats: data.qaStats, count: data.qa?.length || 33, color: "#a855b5" },
        { short: "DILR", name: "DI & Logical Reasoning", stats: data.lrdiStats, count: data.lrdi?.length || 33, color: "#38bdf8" },
        { short: "VARC", name: "Verbal Ability & RC", stats: data.varcStats, count: data.varc?.length || 34, color: "#34d399" },
      ]
    : [];

  return (
    <AppShell activePage="/jipmat" pageTitle="JIPMAT Score Calculator">
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title="JIPMAT Score Calculator 2026 — Check Your Score Instantly | IPM Careers"
        description="Paste your JIPMAT response sheet URL and get instant sectional scores for QA, DILR, and VARC against the official NTA answer key. Free JIPMAT 2026 score calculator by IPM Careers."
        canonical="https://register.ipmcareer.com/jipmat"
        openGraph={{
          url: "https://register.ipmcareer.com/jipmat",
          title:
            "JIPMAT Score Calculator 2026 — Check Your Score Instantly | IPM Careers",
          description:
            "Paste your JIPMAT response sheet URL and get instant sectional scores against the official NTA answer key. Free tool by IPM Careers.",
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
            Scored against the official NTA answer key. Instant sectional
            breakdown with QA, DILR & VARC scores. Know exactly where you
            stand for IIM Jammu & IIM Bodh Gaya.
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
              <div className={styles.gCard}>
                <div className={styles.gBlobA}></div>
                <div className={styles.gBlobB}></div>
                <div className={styles.gSparkle1}>✨</div>
                <div className={styles.gSparkle2}>✦</div>

                <div className={styles.gInner}>
                  <div className={styles.gEyebrow}>⚡ scorecard unlocked</div>
                  <div className={styles.gName}>
                    {data.StudentData?.participantName || formData.name}
                  </div>
                  <div className={styles.gMeta}>
                    JIPMAT 2026 · {(formData.category || "gen").toUpperCase()}
                    {data.StudentData?.slot ? ` · Slot ${data.StudentData.slot}` : ""}
                  </div>

                  {data.answerKeyAvailable ? (
                    <>
                      {/* ── Score Ring ── */}
                      <div className={styles.gRingWrap}>
                        <svg viewBox="0 0 160 160" className={styles.gRingSvg}>
                          <defs>
                            <linearGradient id="jipgrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#a855b5" />
                              <stop offset="55%" stopColor="#833589" />
                              <stop offset="100%" stopColor="#38bdf8" />
                            </linearGradient>
                          </defs>
                          <circle cx="80" cy="80" r={RING_R} className={styles.gRingTrack} />
                          <circle
                            cx="80"
                            cy="80"
                            r={RING_R}
                            className={styles.gRingFill}
                            stroke="url(#jipgrad)"
                            style={{
                              strokeDasharray: `${ringArc} ${RING_C}`,
                              strokeDashoffset: reveal ? 0 : ringArc,
                            }}
                          />
                        </svg>
                        <div className={styles.gRingCenter}>
                          <div className={styles.gRingScore}>{totalAnimated}</div>
                          <div className={styles.gRingMax}>/ 400</div>
                        </div>
                      </div>

                      <div
                        className={styles.gGradeChip}
                        style={{ color: vibe.color, borderColor: vibe.color }}
                      >
                        GRADE {vibe.grade}
                      </div>
                      <div className={styles.gVibe}>{vibe.vibe}</div>

                      {/* ── Quick Stats ── */}
                      <div className={styles.gQuickRow}>
                        <div className={styles.gQuickStat}>
                          <div className={styles.gQuickVal}>{totalAttempted}</div>
                          <div className={styles.gQuickLab}>attempted</div>
                        </div>
                        <div className={styles.gQuickStat}>
                          <div className={styles.gQuickVal} style={{ color: "#34d399" }}>
                            {totalCorrect}
                          </div>
                          <div className={styles.gQuickLab}>correct</div>
                        </div>
                        <div className={styles.gQuickStat}>
                          <div className={styles.gQuickVal} style={{ color: "#f87171" }}>
                            {totalWrong}
                          </div>
                          <div className={styles.gQuickLab}>wrong</div>
                        </div>
                        <div className={styles.gQuickStat}>
                          <div className={styles.gQuickVal} style={{ color: "#38bdf8" }}>
                            {accuracy}%
                          </div>
                          <div className={styles.gQuickLab}>accuracy</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={styles.gQuickRow}>
                      <div className={styles.gQuickStat}>
                        <div className={styles.gQuickVal}>{totalAttempted}</div>
                        <div className={styles.gQuickLab}>attempted</div>
                      </div>
                      <div className={styles.gQuickStat}>
                        <div className={styles.gQuickVal}>{totalSkipped}</div>
                        <div className={styles.gQuickLab}>skipped</div>
                      </div>
                      <div className={styles.gQuickStat}>
                        <div className={styles.gQuickVal}>⏳</div>
                        <div className={styles.gQuickLab}>key pending</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Section Breakdown ── */}
              {data.answerKeyAvailable && (
                <div className={styles.gSectionWrap}>
                  {sectionRows.map((sec) => {
                    const max = sec.count * 4;
                    const score = sec.stats?.score || 0;
                    const att = sec.count - (sec.stats?.skipped || 0);
                    const acc = att > 0 ? Math.round(((sec.stats?.correct || 0) / att) * 100) : 0;
                    return (
                      <div className={styles.gSectionCard} key={sec.short}>
                        <div className={styles.gSectionTop}>
                          <span className={styles.gSectionName}>
                            <span className={styles.gSectionDot} style={{ background: sec.color }}></span>
                            {sec.name}
                          </span>
                          <span className={styles.gSectionScore} style={{ color: sec.color }}>
                            {score}
                            <span className={styles.gSectionMax}>/{max}</span>
                          </span>
                        </div>
                        <div className={styles.gBarTrack}>
                          <div
                            className={styles.gBarFill}
                            style={{
                              width: reveal ? `${Math.max(0, (score / max) * 100)}%` : "0%",
                              background: `linear-gradient(90deg, ${sec.color}99, ${sec.color})`,
                            }}
                          ></div>
                        </div>
                        <div className={styles.gChipsRow}>
                          <span className={`${styles.gChip} ${styles.gChipCorrect}`}>
                            ✓ {sec.stats?.correct || 0}
                          </span>
                          <span className={`${styles.gChip} ${styles.gChipWrong}`}>
                            ✗ {sec.stats?.wrong || 0}
                          </span>
                          <span className={`${styles.gChip} ${styles.gChipSkip}`}>
                            — {sec.stats?.skipped || 0}
                          </span>
                          <span className={styles.gChipAcc}>{acc}% acc</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Where You Stand ── */}
              {data.answerKeyAvailable && typeof totalScore === "number" && (
                <div className={styles.gMeterCard}>
                  <div className={styles.gMeterTitle}>📍 where you stand</div>
                  <div className={styles.gMeterTrack}>
                    <div
                      className={styles.gMeterFill}
                      style={{ width: reveal ? `${Math.max(0, Math.min(100, (totalScore / 400) * 100))}%` : "0%" }}
                    ></div>
                    {BENCHMARKS.map((b) => (
                      <div
                        className={styles.gMarker}
                        key={b.label}
                        style={{ left: `${(b.score / 400) * 100}%` }}
                      >
                        <div className={styles.gMarkerTick}></div>
                        <div className={styles.gMarkerLabel}>
                          {b.label}
                          <span className={styles.gMarkerScore}>{b.score}+</span>
                        </div>
                      </div>
                    ))}
                    <div
                      className={styles.gUserDot}
                      style={{ left: reveal ? `${Math.max(0, Math.min(100, (totalScore / 400) * 100))}%` : "0%" }}
                    >
                      <span className={styles.gUserDotLabel}>you · {totalScore}</span>
                    </div>
                  </div>
                  <div className={styles.gMeterScale}>
                    <span>0</span>
                    <span>100</span>
                    <span>200</span>
                    <span>300</span>
                    <span>400</span>
                  </div>
                  <div className={styles.gDisclaimer}>
                    *zones are estimates from past trends — not official cutoffs
                  </div>
                </div>
              )}

              {/* ── Share Scorecard ── */}
              {data.answerKeyAvailable && (
                <div className={styles.gShareRow}>
                  <button
                    className={styles.gShareBtnPrimary}
                    onClick={shareScorecardImage}
                  >
                    🖼️ Share My Scorecard
                  </button>
                  <button
                    className={styles.gShareBtnWa}
                    onClick={shareWhatsApp}
                  >
                    💬 WhatsApp
                  </button>
                </div>
              )}

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
                  placeholder="https://nta.cbexams.com/JIPMAT/Apps/CandResp/Responsesheet.aspx?id=..."
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
                    viewed your response sheet (<strong>nta.cbexams.com</strong>)
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
                    will open with your Candidate Response Sheet
                  </div>
                </div>
                <div className={styles.stepItem}>
                  <div className={styles.stepNum}>4</div>
                  <div className={styles.stepText}>
                    <strong>Copy the full URL</strong> from the browser address
                    bar (it looks like
                    https://nta.cbexams.com/JIPMAT/Apps/CandResp/Responsesheet.aspx?id=...)
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
              (33 questions), Data Interpretation & Logical Reasoning (33
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
              and compares your chosen answers against the official answer key
              released by NTA. It automatically calculates your section-wise
              scores for QA, DILR, and VARC, giving you a comprehensive
              breakdown of your performance. You can use this score to check
              your eligibility for IIM Jammu and IIM Bodh Gaya.
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
                Aptitude (33Q), Data Interpretation & Logical Reasoning (33Q),
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
                Our calculator uses the official NTA answer key (matched by
                Question ID, so it works for every paper set) to evaluate your
                responses. The score calculated here matches the official
                scoring methodology (+4/-1/0) exactly.
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                What if NTA revises the answer key after challenges?
              </div>
              <div className={styles.faqAnswer}>
                Your response is saved. If NTA revises any answers in the final
                key, your report page will automatically reflect the updated
                scores — just revisit your report link.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default JipmatScoreCalculator;
