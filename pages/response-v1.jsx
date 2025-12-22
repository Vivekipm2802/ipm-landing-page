import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import axios from "axios";

export default function ResponseAnalyzer() {
  const [view, setView] = useState("setup"); // 'setup' | 'results'
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    category: "General",
    city: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const fileInputRef = useRef(null);

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await axios.get("/api/iimbLeaderboard");
      setLeaderboard(res?.data?.leaderboard ?? []);
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Popup UX: close on ESC + lock body scroll while open
  useEffect(() => {
    if (!isHowItWorksOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsHowItWorksOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isHowItWorksOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadToCloudinary = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds the limit of 10MB");
      return null;
    }

    const imageData = new FormData();
    imageData.append("file", file);
    imageData.append("upload_preset", "leg7fkr7");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/duyo9pzxy/auto/upload/",
        imageData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed", error);
      return null;
    }
  };

  const calculateScores = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const panels = doc.querySelectorAll(".question-pnl");
    let s1 = 0,
      s2 = 0,
      s3 = 0;

    panels.forEach((p, i) => {
      const menu = p.querySelector(".menu-tbl");
      if (!menu) return;

      const chosenRow = Array.from(menu.querySelectorAll("td")).find((t) =>
        t.innerText.includes("Chosen Option")
      );
      const chosen = chosenRow?.nextElementSibling?.innerText.trim();

      const tick = p.querySelector('img[src*="tick.png"]');
      const correct = tick ? tick.parentElement.innerText.trim().charAt(0) : "";

      let m = 0;
      if (chosen && chosen !== "--") {
        m = chosen === correct ? 3 : -1;
      }
      if (i < 15) s1 += m;
      else if (i < 30) s2 += m;
      else s3 += m;
    });

    return { s1, s2, s3, total: s1 + s2 + s3 };
  };

  const startProcess = async () => {
    const { name, mobile, email } = formData;

    if (!name || mobile.length < 10 || !email) {
      alert("Please enter Name, Email, and 10-digit Mobile.");
      return;
    }

    if (!selectedFile) {
      alert("Please upload an HTML response file.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Read HTML Content from uploaded file
      const htmlContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(selectedFile);
      });

      // 2. Upload to Cloudinary
      const uploadedUrl = await uploadToCloudinary(selectedFile);
      if (!uploadedUrl) {
        setIsSubmitting(false);
        alert("Failed to upload file. Please try again.");
        return;
      }

      // 3. Calculate Scores
      const scores = calculateScores(htmlContent);

      // 4. Send Email & Save Data
      await axios.post("/api/sendScorecardIIMB", {
        ...formData,
        fileUrl: uploadedUrl,
        scores,
      });

      // 5. Update UI
      const studentData = {
        name: formData.name,
        mobile: formData.mobile,
        city: formData.city,
        category: formData.category,
        ...scores,
      };

      setCurrentStudent(studentData);
      setView("results");
      fetchLeaderboard();
    } catch (error) {
      console.error(error);
      alert("An error occurred during processing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAnalysis = () => {
    setView("setup");
    setFormData({
      name: "",
      mobile: "",
      email: "",
      category: "General",
      city: "",
    });
    setSelectedFile(null);
    setCurrentStudent(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const styles = {
    animatedBg: {
      position: "fixed",
      top: "-50%",
      left: "-50%",
      width: "200%",
      height: "200%",
      background:
        "radial-gradient(circle at 20% 30%, rgba(131, 53, 137, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(231, 152, 1, 0.1) 0%, transparent 50%)",
      animation: "gradientShift 20s ease infinite",
      zIndex: -1,
      pointerEvents: "none",
    },

    decoCircleBase: {
      position: "fixed",
      borderRadius: "50%",
      pointerEvents: "none",
      opacity: 0.4,
      zIndex: 0,
    },
    decoCircle1: {
      width: "400px",
      height: "400px",
      background:
        "radial-gradient(circle, rgba(131, 53, 137, 0.2), transparent)",
      top: "-200px",
      right: "-200px",
      animation: "rotate 20s linear infinite",
    },
    decoCircle2: {
      width: "300px",
      height: "300px",
      background:
        "radial-gradient(circle, rgba(231, 152, 1, 0.15), transparent)",
      bottom: "-150px",
      left: "-150px",
      animation: "rotate 25s linear infinite reverse",
    },

    header: {
      background: "rgba(26, 17, 36, 0.95)",
      backdropFilter: "blur(20px)",
      padding: "15px 5%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "2px solid rgba(131, 53, 137, 0.3)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    },

    logo: {
      display: "flex",
      alignItems: "center",
    },
    logoImg: {
      height: "34px",
      width: "auto",
      display: "block",
    },
    logoAccent: {
      color: "var(--accent-orange)",
    },

    container: {
      maxWidth: "1100px",
      margin: "40px auto",
      padding: "0px 20px 42px 20px",
      position: "relative",
      zIndex: 1,
    },

    glassCard: {
      background: "rgba(26, 17, 36, 0.6)",
      backdropFilter: "blur(20px)",
      border: "1px solid var(--card-border)",
      borderRadius: "20px",
      padding: "30px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      position: "relative",
      overflow: "hidden",
      animation: "fadeIn 0.5s ease",
    },

    h2: {
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontSize: "1.6rem",
      fontWeight: 700,
      marginBottom: "24px",
      color: "var(--text-light)",
    },

    uploadArea: {
      marginTop: "20px",
    },

    uploadBoxP: {
      color: "var(--text-dim)",
      fontSize: "0.9rem",
      margin: 0,
    },

    btnNeon: {
      background: "linear-gradient(135deg, var(--accent-orange), #f5a623)",
      color: "#1a0a20",
      border: "none",
      padding: "15px 30px",
      borderRadius: "10px",
      fontWeight: 700,
      fontFamily: '"Bricolage Grotesque", sans-serif',
      width: "100%",
      cursor: "pointer",
      textTransform: "uppercase",
      letterSpacing: "1px",
      transition: "all 0.3s ease",
      fontSize: "0.95rem",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 10px 30px rgba(231, 152, 1, 0.3)",
    },

    btnNeonSecondary: {
      background: "rgba(131, 53, 137, 0.2)",
      color: "var(--text-light)",
      border: "1px solid var(--primary-purple)",
      boxShadow: "none",
      marginTop: "20px",
    },

    resName: {
      color: "var(--accent-orange)",
      margin: "0 0 8px 0",
      fontSize: "1.8rem",
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontWeight: 700,
    },

    resMeta: {
      color: "var(--text-dim)",
      fontSize: "0.9rem",
      marginBottom: "20px",
      paddingBottom: "20px",
      borderBottom: "1px solid var(--card-border)",
    },

    statBox: {
      background: "rgba(10, 6, 20, 0.6)",
      padding: "24px",
      borderRadius: "16px",
      textAlign: "center",
      border: "1px solid var(--card-border)",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
    },

    statBoxHighlight: {
      border: "1px solid var(--accent-orange)",
      background:
        "linear-gradient(135deg, rgba(231, 152, 1, 0.15), rgba(131, 53, 137, 0.1))",
      padding: "32px",
    },

    statIcon: {
      width: "50px",
      height: "50px",
      margin: "0 auto 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "12px",
      fontSize: "1.5rem",
      background:
        "linear-gradient(135deg, rgba(131, 53, 137, 0.2), rgba(131, 53, 137, 0.05))",
      border: "1px solid rgba(131, 53, 137, 0.3)",
      position: "relative",
      zIndex: 1,
    },

    statIconHighlight: {
      width: "70px",
      height: "70px",
      fontSize: "2rem",
      background:
        "linear-gradient(135deg, rgba(231, 152, 1, 0.3), rgba(131, 53, 137, 0.2))",
      border: "1px solid var(--accent-orange)",
      animation: "icon-float 3s ease infinite",
    },

    fieldLabel: {
      display: "block",
      fontSize: "0.75rem",
      color: "var(--text-dim)",
      marginBottom: "6px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },

    statLabel: {
      fontSize: "0.8rem",
      marginBottom: "12px",
      display: "block",
      fontWeight: 600,
      letterSpacing: "0.5px",
      position: "relative",
      zIndex: 1,
      textTransform: "uppercase",
      color: "var(--text-dim)",
    },

    statVal: {
      fontSize: "2.5rem",
      fontWeight: 800,
      color: "var(--accent-orange)",
      display: "block",
      fontFamily: '"Bricolage Grotesque", sans-serif',
      position: "relative",
      zIndex: 1,
      textShadow: "0 2px 10px rgba(231, 152, 1, 0.3)",
    },

    statValHighlight: {
      fontSize: "4rem",
      background: "linear-gradient(135deg, var(--accent-orange), #f5a623)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },

    leaderboardH3: {
      marginTop: 0,
      fontSize: "1.1rem",
      fontFamily: '"Bricolage Grotesque", sans-serif',
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "20px",
    },

    leaderboardH3Icon: {
      color: "var(--accent-orange)",
      fontSize: "1.3rem",
    },

    topperRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 0",
      borderBottom: "1px solid var(--card-border)",
      fontSize: "0.9rem",
      transition: "all 0.2s ease",
    },

    topperRowName: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },

    topperIndex: {
      color: "var(--primary-purple)",
      fontFamily: '"Bricolage Grotesque", sans-serif',
    },

    topperScore: {
      color: "var(--accent-orange)",
      fontWeight: 800,
      fontFamily: '"Bricolage Grotesque", sans-serif',
    },

    leaderboardNote: {
      fontSize: "0.75rem",
      color: "var(--text-dim)",
      marginTop: "15px",
      fontStyle: "italic",
    },

    howItWorksTitle: {
      margin: 0,
      marginBottom: "10px",
      fontSize: "0.95rem",
      fontWeight: 800,
      fontFamily: '"Bricolage Grotesque", sans-serif',
      color: "var(--text-light)",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      letterSpacing: "0.3px",
    },
    howItWorksTitleIcon: {
      width: "34px",
      height: "34px",
      borderRadius: "10px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "linear-gradient(135deg, rgba(231, 152, 1, 0.22), rgba(131, 53, 137, 0.12))",
      border: "1px solid rgba(231, 152, 1, 0.35)",
      color: "var(--accent-orange)",
      flex: "0 0 auto",
    },
    howItWorksSteps: {
      display: "grid",
      gap: "12px",
      marginTop: "14px",
    },
    howItWorksStep: {
      display: "flex",
      gap: "12px",
      padding: "12px 14px",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(10, 6, 20, 0.55)",
    },
    howItWorksStepNumWrap: {
      width: "34px",
      height: "34px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "linear-gradient(135deg, rgba(231, 152, 1, 0.22), rgba(131, 53, 137, 0.14))",
      border: "1px solid rgba(231, 152, 1, 0.28)",
      flex: "0 0 auto",
      marginTop: "2px",
    },
    howItWorksStepNum: {
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontWeight: 900,
      color: "var(--accent-orange)",
      fontSize: "0.95rem",
      lineHeight: 1,
    },
    howItWorksStepBody: {
      minWidth: 0,
    },
    howItWorksStepHeading: {
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontWeight: 800,
      fontSize: "0.92rem",
      color: "var(--text-light)",
      marginBottom: "4px",
      letterSpacing: "0.2px",
    },
    howItWorksStepText: {
      margin: 0,
      color: "var(--text-dim)",
      lineHeight: 1.55,
      fontSize: "0.88rem",
      wordBreak: "break-word",
    },
    howItWorksLink: {
      color: "var(--accent-orange)",
      textDecoration: "underline",
      fontWeight: 700,
    },
    kbd: {
      display: "inline-block",
      padding: "2px 6px",
      borderRadius: "6px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(26, 17, 36, 0.65)",
      color: "var(--text-light)",
      fontSize: "0.85em",
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      margin: "0 2px",
    },

    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    howItWorksHeaderBtn: {
      background: "rgba(131, 53, 137, 0.18)",
      color: "var(--text-light)",
      border: "1px solid rgba(131, 53, 137, 0.55)",
      padding: "10px 14px",
      borderRadius: "12px",
      fontWeight: 800,
      fontFamily: '"Bricolage Grotesque", sans-serif',
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
      whiteSpace: "nowrap",
    },

    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(10px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "18px",
    },

    modalCard: {
      width: "min(760px, 100%)",
      maxHeight: "min(80vh, 740px)",
      overflow: "auto",
      background: "rgba(26, 17, 36, 0.92)",
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: "18px",
      boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
    },

    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      padding: "16px 16px 12px 16px",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      position: "sticky",
      top: 0,
      background: "rgba(26, 17, 36, 0.96)",
      backdropFilter: "blur(10px)",
      zIndex: 1,
    },

    modalTitleWrap: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      minWidth: 0,
    },

    modalTitle: {
      margin: 0,
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontWeight: 900,
      fontSize: "1.05rem",
      color: "var(--text-light)",
      letterSpacing: "0.2px",
    },

    modalCloseBtn: {
      width: "40px",
      height: "40px",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(10, 6, 20, 0.4)",
      color: "var(--text-light)",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },

    modalBody: {
      padding: "16px",
    },

    modalSection: {
      display: "grid",
      gap: "12px",
    },

    modalSectionTitle: {
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontWeight: 900,
      color: "var(--accent-orange)",
      letterSpacing: "0.4px",
      textTransform: "uppercase",
      fontSize: "0.78rem",
    },

    modalDivider: {
      height: "1px",
      background: "rgba(255,255,255,0.08)",
      margin: "16px 0",
    },
  };

  return (
    <>
      <Head>
        <title>IIM Bangalore UG Response Key Analyzer</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="animated-bg" style={styles.animatedBg}></div>
      <div
        className="deco-circle deco-circle-1"
        style={{ ...styles.decoCircleBase, ...styles.decoCircle1 }}
      ></div>
      <div
        className="deco-circle deco-circle-2"
        style={{ ...styles.decoCircleBase, ...styles.decoCircle2 }}
      ></div>

      <header style={styles.header}>
        <div className="logo" style={styles.logo}>
          <img
            src="/whitelogoipm.svg"
            alt="IPM Careers"
            style={styles.logoImg}
          />
        </div>

        <div style={styles.headerRight}>
          <button
            type="button"
            className="no-print"
            style={styles.howItWorksHeaderBtn}
            onClick={() => setIsHowItWorksOpen(true)}
          >
            <i className="fas fa-circle-info"></i> How it works
          </button>
        </div>
      </header>

      {isHowItWorksOpen && (
        <div
          style={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="How it works"
          onClick={() => setIsHowItWorksOpen(false)}
        >
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitleWrap}>
                <span style={styles.howItWorksTitleIcon}>
                  <i className="fas fa-list-check"></i>
                </span>
                <h3 style={styles.modalTitle}>How it works</h3>
              </div>

              <button
                type="button"
                aria-label="Close"
                style={styles.modalCloseBtn}
                onClick={() => setIsHowItWorksOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <div style={styles.modalSectionTitle}>For Laptop</div>

                <div style={styles.howItWorksSteps}>
                  <div style={styles.howItWorksStep}>
                    <div style={styles.howItWorksStepNumWrap}>
                      <span style={styles.howItWorksStepNum}>1</span>
                    </div>
                    <div style={styles.howItWorksStepBody}>
                      <div style={styles.howItWorksStepHeading}>
                        Login and open your Answer Key
                      </div>
                      <p style={styles.howItWorksStepText}>
                        Open:{" "}
                        <a
                          href="https://cdn.digialm.com/EForms/configuredHtml/1345/96226/login.html"
                          target="_blank"
                          rel="noreferrer"
                          style={styles.howItWorksLink}
                        >
                          https://cdn.digialm.com/EForms/configuredHtml/1345/96226/login.html
                        </a>
                      </p>
                    </div>
                  </div>

                  <div style={styles.howItWorksStep}>
                    <div style={styles.howItWorksStepNumWrap}>
                      <span style={styles.howItWorksStepNum}>2</span>
                    </div>
                    <div style={styles.howItWorksStepBody}>
                      <div style={styles.howItWorksStepHeading}>
                        Save your Answer Key (don’t print)
                      </div>
                      <p style={styles.howItWorksStepText}>
                        Press <span style={styles.kbd}>Ctrl</span>+
                        <span style={styles.kbd}>S</span> and save your Answer
                        Key <strong>(DO NOT PRESS PRINT)</strong>.
                      </p>
                    </div>
                  </div>

                  <div style={styles.howItWorksStep}>
                    <div style={styles.howItWorksStepNumWrap}>
                      <span style={styles.howItWorksStepNum}>3</span>
                    </div>
                    <div style={styles.howItWorksStepBody}>
                      <div style={styles.howItWorksStepHeading}>Upload</div>
                      <p style={styles.howItWorksStepText}>
                        Upload the saved file here.
                      </p>
                    </div>
                  </div>

                  <div style={styles.howItWorksStep}>
                    <div style={styles.howItWorksStepNumWrap}>
                      <span style={styles.howItWorksStepNum}>4</span>
                    </div>
                    <div style={styles.howItWorksStepBody}>
                      <div style={styles.howItWorksStepHeading}>Analyse</div>
                      <p style={styles.howItWorksStepText}>
                        Click on “Analyse Now”.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.modalDivider} />

              <div style={styles.modalSection}>
                <div style={styles.modalSectionTitle}>For Mobile</div>

                <div style={styles.howItWorksSteps}>
                  <div style={styles.howItWorksStep}>
                    <div style={styles.howItWorksStepNumWrap}>
                      <span style={styles.howItWorksStepNum}>1</span>
                    </div>
                    <div style={styles.howItWorksStepBody}>
                      <div style={styles.howItWorksStepHeading}>
                        Login and open your Answer Key
                      </div>
                      <p style={styles.howItWorksStepText}>
                        Open:{" "}
                        <a
                          href="https://cdn.digialm.com/EForms/configuredHtml/1345/96226/login.html"
                          target="_blank"
                          rel="noreferrer"
                          style={styles.howItWorksLink}
                        >
                          https://cdn.digialm.com/EForms/configuredHtml/1345/96226/login.html
                        </a>
                      </p>
                    </div>
                  </div>

                  <div style={styles.howItWorksStep}>
                    <div style={styles.howItWorksStepNumWrap}>
                      <span style={styles.howItWorksStepNum}>2</span>
                    </div>
                    <div style={styles.howItWorksStepBody}>
                      <div style={styles.howItWorksStepHeading}>Download</div>
                      <p style={styles.howItWorksStepText}>
                        Click on the download option in the corner.
                      </p>
                    </div>
                  </div>

                  <div style={styles.howItWorksStep}>
                    <div style={styles.howItWorksStepNumWrap}>
                      <span style={styles.howItWorksStepNum}>3</span>
                    </div>
                    <div style={styles.howItWorksStepBody}>
                      <div style={styles.howItWorksStepHeading}>Upload</div>
                      <p style={styles.howItWorksStepText}>
                        Upload the downloaded file.
                      </p>
                    </div>
                  </div>

                  <div style={styles.howItWorksStep}>
                    <div style={styles.howItWorksStepNumWrap}>
                      <span style={styles.howItWorksStepNum}>4</span>
                    </div>
                    <div style={styles.howItWorksStepBody}>
                      <div style={styles.howItWorksStepHeading}>Analyse</div>
                      <p style={styles.howItWorksStepText}>Analyse now.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={styles.container}>
        <main>
          {view === "setup" && (
            <div id="setupView" className="glass-card" style={styles.glassCard}>
              <h2 style={styles.h2}>IIM-B UG Response Analyzer</h2>
              <div className="input-grid">
                <div>
                  <label style={styles.fieldLabel}>Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter student name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "#2a1d35",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      color: "#ffffff",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                      width: "100%",
                      backgroundColor: "rgba(10, 6, 20, 0.8)",
                    }}
                  />
                </div>
                <div>
                  <label style={styles.fieldLabel}>Mobile No.</label>
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="10-digit number"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    style={{
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "#2a1d35",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      color: "#ffffff",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                      width: "100%",
                      backgroundColor: "rgba(10, 6, 20, 0.8)",
                    }}
                  />
                </div>
                <div>
                  <label style={styles.fieldLabel}>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "#2a1d35",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      color: "#ffffff",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                      width: "100%",
                      backgroundColor: "rgba(10, 6, 20, 0.8)",
                    }}
                  />
                </div>
                <div>
                  <label style={styles.fieldLabel}>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "#2a1d35",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      color: "#ffffff",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                      width: "100%",
                      backgroundColor: "rgba(10, 6, 20, 0.8)",
                      cursor: "pointer",
                      appearance: "none",
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23E79801' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 16px center",
                      paddingRight: "45px",
                    }}
                  >
                    <option>General</option>
                    <option>OBC</option>
                    <option>SC/ST</option>
                    <option>EWS</option>
                  </select>
                </div>
              </div>
              <div className="input-grid">
                <div>
                  <label style={styles.fieldLabel}>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleInputChange}
                    style={{
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "#2a1d35",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      color: "#ffffff",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                      width: "100%",
                      backgroundColor: "rgba(10, 6, 20, 0.8)",
                    }}
                  />
                </div>
              </div>
              <div className="upload-area" style={styles.uploadArea}>
                <label style={styles.fieldLabel}>Upload Response File</label>
                <div
                  className="upload-box"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    borderWidth: "2px",
                    borderStyle: "dashed",
                    borderColor: "#2a1d35",
                    padding: "30px",
                    borderRadius: "12px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    backgroundColor: "rgba(10, 6, 20, 0.4)",
                  }}
                >
                  <i
                    className="fas fa-file-code"
                    style={{
                      fontSize: "2.5rem",
                      color: "#E79801",
                      marginBottom: "12px",
                      display: "block",
                    }}
                  ></i>
                  <p style={styles.uploadBoxP}>
                    <strong>
                      {selectedFile
                        ? selectedFile.name
                        : "Upload HTML Response File"}
                    </strong>
                  </p>
                  <p
                    style={{
                      ...styles.uploadBoxP,
                      fontSize: "0.8rem",
                      marginTop: "5px",
                    }}
                  >
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                      : "Click to browse or drag and drop"}
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept=".html,.htm"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <button
                className="btn-neon"
                style={{ ...styles.btnNeon, marginTop: "25px" }}
                onClick={startProcess}
              >
                <i
                  className={`fas ${
                    isSubmitting ? "fa-spinner fa-spin" : "fa-chart-line"
                  }`}
                ></i>{" "}
                {isSubmitting ? "Processing..." : "Analyze Now"}
              </button>
            </div>
          )}

          {view === "results" && currentStudent && (
            <div
              id="resultsView"
              className="glass-card"
              style={styles.glassCard}
            >
              <h2 id="resName" style={styles.resName}>
                {currentStudent.name}
              </h2>
              <p id="resMeta" style={styles.resMeta}>
                {currentStudent.category} | {currentStudent.city} |{" "}
                {currentStudent.mobile}
              </p>

              <div className="stats-grid">
                <div
                  className="stat-box highlight"
                  style={{ ...styles.statBox, ...styles.statBoxHighlight }}
                >
                  <div
                    className="stat-icon"
                    style={{ ...styles.statIcon, ...styles.statIconHighlight }}
                  >
                    🏆
                  </div>
                  <label style={styles.statLabel}>Total Score</label>
                  <span
                    className="val"
                    style={{ ...styles.statVal, ...styles.statValHighlight }}
                  >
                    {currentStudent.total}
                  </span>
                </div>
                <div className="stat-box" style={styles.statBox}>
                  <div className="stat-icon" style={styles.statIcon}>
                    📝
                  </div>
                  <label style={styles.statLabel}>Verbal Ability</label>
                  <span className="val" style={styles.statVal}>
                    {currentStudent.s1}
                  </span>
                </div>
                <div className="stat-box" style={styles.statBox}>
                  <div className="stat-icon" style={styles.statIcon}>
                    🧩
                  </div>
                  <label style={styles.statLabel}>Logical Reasoning</label>
                  <span className="val" style={styles.statVal}>
                    {currentStudent.s2}
                  </span>
                </div>
                <div className="stat-box" style={styles.statBox}>
                  <div className="stat-icon" style={styles.statIcon}>
                    🔢
                  </div>
                  <label style={styles.statLabel}>Quantitative Ability</label>
                  <span className="val" style={styles.statVal}>
                    {currentStudent.s3}
                  </span>
                </div>
              </div>

              <button
                className="btn-neon secondary no-print"
                style={{ ...styles.btnNeon, ...styles.btnNeonSecondary }}
                onClick={resetAnalysis}
              >
                <i className="fas fa-redo"></i> New Analysis
              </button>
            </div>
          )}
        </main>

        <aside className="no-print">
          <div
            className="glass-card leaderboard-card"
            style={{ ...styles.glassCard, padding: "24px" }}
          >
            <h3 style={styles.leaderboardH3}>
              <i className="fas fa-trophy" style={styles.leaderboardH3Icon}></i>
              Leaderboard (Top 10)
            </h3>
            <div id="leaderboard">
              {leaderboardLoading ? (
                <p className="leaderboard-note" style={styles.leaderboardNote}>
                  Loading...
                </p>
              ) : leaderboard.length === 0 ? (
                <p className="leaderboard-note" style={styles.leaderboardNote}>
                  No submissions yet
                </p>
              ) : (
                leaderboard.map((student, index) => (
                  <div
                    key={index}
                    className="topper-row"
                    style={{
                      ...styles.topperRow,
                      ...(index === leaderboard.length - 1
                        ? { borderBottom: "none" }
                        : null),
                    }}
                  >
                    <span style={styles.topperRowName}>
                      <b style={styles.topperIndex}>{index + 1}.</b>{" "}
                      {student.name}
                    </span>
                    <span style={styles.topperScore}>{student.total}</span>
                  </div>
                ))
              )}
            </div>
            <p className="leaderboard-note" style={styles.leaderboardNote}>
              *Top 10 by total score
            </p>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        :root {
          --primary-purple: #833589;
          --accent-orange: #e79801;
          --bg-dark: #0a0614;
          --bg-card: #1a1124;
          --card-border: #2a1d35;
          --text-light: #ffffff;
          --text-dim: #b8a9c3;
          --success: #22c55e;
          --danger: #ef4444;
        }

        body {
          background-color: var(--bg-dark);
          color: var(--text-light);
          margin: 0;
          overflow-x: hidden;
          font-family: "DM Sans", sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        /* Responsive grid needs CSS (inline styles can't be overridden by media queries) */
        .container {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 30px;
        }

        @media (max-width: 992px) {
          .container {
            grid-template-columns: 1fr;
          }
        }

        .input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 30px 0;
        }

        @media (max-width: 768px) {
          .input-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-box.highlight {
            grid-column: span 1;
          }
        }

        @media print {
          .no-print {
            display: none !important;
          }
        }

        /* Focus/placeholder */
        input:focus,
        select:focus {
          border-color: #833589 !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(131, 53, 137, 0.1) !important;
        }

        input::placeholder {
          color: rgba(184, 169, 195, 0.5);
        }

        /* Hover/pseudo-elements + keyframes */
        .upload-box:hover {
          border-color: #833589 !important;
          background: rgba(131, 53, 137, 0.05) !important;
        }

        .btn-neon::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.5s ease;
        }

        .btn-neon:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(231, 152, 1, 0.4) !important;
        }

        .btn-neon:hover::before {
          left: 100%;
        }

        .btn-neon:active {
          transform: translateY(0);
        }

        .btn-neon.secondary:hover {
          background: rgba(131, 53, 137, 0.3) !important;
        }

        .glass-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(
            90deg,
            var(--primary-purple),
            var(--accent-orange),
            var(--primary-purple)
          );
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        .stat-box::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(131, 53, 137, 0.1),
            transparent
          );
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .stat-box:hover::before {
          opacity: 1;
        }

        .stat-box:hover {
          border-color: var(--primary-purple) !important;
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(131, 53, 137, 0.3) !important;
        }

        .stat-box.highlight {
          grid-column: span 3;
        }

        .stat-box.highlight::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          background: radial-gradient(
            circle,
            rgba(231, 152, 1, 0.2),
            transparent
          );
          transform: translate(-50%, -50%);
          border-radius: 50%;
          animation: pulse-glow 3s ease infinite;
        }

        .topper-row:hover {
          padding-left: 8px !important;
          color: var(--accent-orange) !important;
        }

        .topper-row:last-child {
          border-bottom: none;
        }

        @keyframes gradientShift {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(5%, 5%);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.2;
          }
        }

        @keyframes icon-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
