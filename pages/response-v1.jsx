"use client";

import { useMemo, useState } from "react";
import Head from "next/head";
import axios from "axios";

export default function IPMATScorePage() {
  const [showResult, setShowResult] = useState(false);
  const [userName, setUserName] = useState("Result Summary");
  const [fileMeta, setFileMeta] = useState({ name: "", size: 0 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    category: "GEN",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [scores, setScores] = useState({
    total: 0,
    sa: 0,
    mcq: 0,
    va: 0,
    stats: [],
  });

  const formattedFileSize = useMemo(() => {
    if (!fileMeta?.size) return "";
    const kb = fileMeta.size / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }, [fileMeta?.size]);

  const reset = () => {
    setShowResult(false);
    setUserName("Result Summary");
    setScores({ total: 0, sa: 0, mcq: 0, va: 0, stats: [] });
    setFileMeta({ name: "", size: 0 });
    setSelectedFile(null);
    setDragActive(false);
    setFormData({ name: "", mobile: "", email: "", category: "GEN" });
    const input = document.getElementById("fileInput");
    if (input) input.value = "";
  };

  const clearFile = () => {
    setFileMeta({ name: "", size: 0 });
    setSelectedFile(null);
    const input = document.getElementById("fileInput");
    if (input) input.value = "";
  };

  const uploadToCloudinary = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds the limit of 10MB");
      return null;
    }

    const imageData = new FormData();
    imageData.append("file", file);
    imageData.append("upload_preset", "leg7fkr7"); // Using same preset as ImageUploader.js

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/duyo9pzxy/auto/upload/",
        imageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed", error);
      alert("Failed to upload file. Please try again.");
      return null;
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileMeta({ name: file.name, size: file.size });
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!/\.html?$/i.test(file.name)) return;

    setFileMeta({ name: file.name, size: file.size });
    setSelectedFile(file);
  };

  const calculateScoresFromDoc = (doc) => {
    const stats = {
      SA: { n: "Quant SA", c: 0, w: 0, s: 0, m: 0, neg: 0 },
      MCQ: { n: "Quant MCQ", c: 0, w: 0, s: 0, m: 0, neg: 1 },
      VA: { n: "Verbal Ability", c: 0, w: 0, s: 0, m: 0, neg: 1 },
    };

    doc.querySelectorAll(".question-pnl").forEach((panel) => {
      let section = "";
      let prev = panel.previousElementSibling;

      while (prev) {
        if (prev.innerText?.includes("Section :")) {
          section = prev.innerText;
          break;
        }
        prev = prev.previousElementSibling;
      }

      const key = section.includes("SA")
        ? "SA"
        : section.includes("MCQ")
        ? "MCQ"
        : "VA";

      const rightAns = panel.querySelector(".rightAns");
      const isTypeInBox =
        rightAns && !panel.querySelector('img[src*="tick.png"]');

      if (isTypeInBox) {
        const correct = rightAns.innerText
          .replace("Possible Answer:", "")
          .trim();

        let given = "";
        panel.querySelectorAll("td").forEach((td, i, arr) => {
          if (td.innerText.includes("Given Answer :")) {
            given = arr[i + 1]?.innerText.trim();
          }
        });

        if (!given || given === "--") stats[key].s++;
        else if (given === correct) {
          stats[key].c++;
          stats[key].m += 4;
        } else {
          stats[key].w++;
          stats[key].m -= stats[key].neg;
        }
      } else {
        const menu = panel.querySelector(".menu-tbl");
        if (!menu) return;

        const chosen = Array.from(menu.querySelectorAll("td"))
          .find((td) => td.innerText.includes("Chosen Option"))
          ?.nextElementSibling?.innerText.trim();

        const tick = panel.querySelector('img[src*="tick.png"]');
        const correctNum = tick
          ? tick.parentElement.innerText.trim().charAt(0)
          : "";

        if (!chosen || chosen === "--") stats[key].s++;
        else if (chosen === correctNum) {
          stats[key].c++;
          stats[key].m += 4;
        } else {
          stats[key].w++;
          stats[key].m -= 1;
        }
      }
    });

    const total = stats.SA.m + stats.MCQ.m + stats.VA.m;
    return {
      total,
      sa: stats.SA.m,
      mcq: stats.MCQ.m,
      va: stats.VA.m,
      stats: Object.values(stats),
    };
  };

  const handleSubmit = async () => {
    // Validations
    if (!formData.name.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!selectedFile) {
      alert("Please upload your response sheet.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Process locally first to get scores
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(event.target.result, "text/html");

          const calculatedScores = calculateScoresFromDoc(doc);
          const name =
            doc.querySelector("table td:nth-child(2)")?.innerText ||
            formData.name ||
            "Candidate";

          // 2. Upload to Cloudinary
          const fileUrl = await uploadToCloudinary(selectedFile);
          if (!fileUrl) {
            setIsSubmitting(false);
            return;
          }

          // 3. Send email to Admin with scores
          await axios.post("/api/sendScorecardAdmin", {
            ...formData,
            fileUrl,
            scores: {
              sa: calculatedScores.sa,
              mcq: calculatedScores.mcq,
              va: calculatedScores.va,
              total: calculatedScores.total,
            },
          });

          // 4. Update UI
          setUserName(`Scorecard: ${name}`);
          setScores(calculatedScores);
          setShowResult(true);
          setIsSubmitting(false);
        } catch (innerError) {
          console.error(innerError);
          setIsSubmitting(false);
          alert("Error processing file. Please check if it's valid.");
        }
      };

      reader.readAsText(selectedFile);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert("Something went wrong. Please try again.");
    }
  };

  const ActionButton = ({ icon, children, onClick, variant = "primary" }) => (
    <button
      className={`rcBtn ${variant === "secondary" ? "rcBtnSecondary" : ""}`}
      onClick={onClick}
      type="button"
    >
      {icon ? <span className="rcBtnIcon">{icon}</span> : null}
      <span className="rcBtnText">{children}</span>
    </button>
  );

  const ScoreCard = ({ label, value, tone = "default", sub }) => (
    <div className={`rcStatCard ${tone}`}>
      <div className="rcStatTop">
        <p className="rcStatLabel">{label}</p>
        {sub ? <span className="rcPill">{sub}</span> : null}
      </div>
      <div className="rcStatValue">{value}</div>
    </div>
  );

  const totalCorrect = useMemo(
    () => scores.stats.reduce((acc, s) => acc + (s?.c ?? 0), 0),
    [scores.stats]
  );
  const totalWrong = useMemo(
    () => scores.stats.reduce((acc, s) => acc + (s?.w ?? 0), 0),
    [scores.stats]
  );
  const totalSkipped = useMemo(
    () => scores.stats.reduce((acc, s) => acc + (s?.s ?? 0), 0),
    [scores.stats]
  );

  return (
    <>
      <Head>
        <title>IPMAT Score from Response Sheet - IPM Careers</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        <style>{`
          .rcFormGrid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            width: 100%;
          }

          .rcInputGroup {
            display: flex;
            flex-direction: column;
          }

          .rcLabel {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 6px;
            color: #333;
          }

          .rcInput {
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            width: 100%;
            transition: all 0.2s;
          }

          .rcInput:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
          }

          .rcDropzoneDisabled {
            opacity: 0.6;
            pointer-events: none;
            background-color: #f9f9f9;
            cursor: not-allowed;
          }
        `}</style>
      </Head>

      <div className="rcPage">
        {/* Top Bar */}
        <header className="rcTopbar">
          <div className="rcTopbarInner">
            <a className="rcBrand" href="/">
              <img className="rcLogo" src="ipm_logo.svg" alt="IPM Careers" />
            </a>

            {/* <div className="rcTopbarActions">
              {showResult ? (
                <ActionButton
                  variant="secondary"
                  icon={<i className="fa-solid fa-rotate-left" />}
                  onClick={reset}
                >
                  New Upload
                </ActionButton>
              ) : null}

              <ActionButton
                icon={<i className="fa-solid fa-print" />}
                onClick={() => window.print()}
              >
                Download PDF
              </ActionButton>
            </div> */}
          </div>
        </header>

        {/* Hero */}
        <section className="rcHero" aria-label="Page header">
          <div className="rcHeroInner">
            <div className="rcHeroText">
              <h1 className="rcHeroTitle">IPMAT Score from Response Sheet</h1>
              <p className="rcHeroSubtitle">
                Upload your official response HTML file to instantly generate a
                clean score summary.
              </p>
              <div className="rcHeroMeta">
                <span className="rcPill rcPillDark">
                  <i className="fa-solid fa-shield-halved" /> Processed locally
                </span>
                <span className="rcPill rcPillDark">
                  <i className="fa-solid fa-bolt" /> Instant breakdown
                </span>
                <span className="rcPill rcPillDark">
                  <i className="fa-solid fa-file-lines" /> Print-ready
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main */}
        <main className="rcMain">
          <div className="rcContainer">
            <div className="rcGrid">
              {/* Primary Card */}
              <section className="rcCard rcCardMain">
                {!showResult ? (
                  <>
                    <div className="rcCardHeader">
                      <h2 className="rcCardTitle">Generate Your Score Sheet</h2>
                      <p className="rcCardSubtitle">
                        Fill your details and upload your{" "}
                        <b>official response HTML file</b>.
                      </p>
                    </div>

                    <div
                      className="rcFormGrid"
                      style={{ marginBottom: "20px" }}
                    >
                      <div className="rcInputGroup">
                        <label className="rcLabel">Name</label>
                        <input
                          className="rcInput"
                          type="text"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="rcInputGroup">
                        <label className="rcLabel">Mobile</label>
                        <input
                          className="rcInput"
                          type="tel"
                          placeholder="Your Mobile"
                          value={formData.mobile}
                          onChange={(e) =>
                            setFormData({ ...formData, mobile: e.target.value })
                          }
                        />
                      </div>
                      <div className="rcInputGroup">
                        <label className="rcLabel">Email</label>
                        <input
                          className="rcInput"
                          type="email"
                          placeholder="Your Email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="rcInputGroup">
                        <label className="rcLabel">Category</label>
                        <select
                          className="rcInput"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                        >
                          <option value="GEN">GEN</option>
                          <option value="OBC">OBC</option>
                          <option value="SC/ST">SC/ST</option>
                          <option value="EWS">EWS</option>
                          <option value="PWD">PWD</option>
                        </select>
                      </div>
                    </div>

                    <div
                      className={`rcDropzone ${
                        dragActive ? "rcDropzoneActive" : ""
                      } ${isSubmitting ? "rcDropzoneDisabled" : ""}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!isSubmitting)
                          document.getElementById("fileInput")?.click();
                      }}
                      onKeyDown={(e) => {
                        if (
                          !isSubmitting &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
                          e.preventDefault();
                          document.getElementById("fileInput")?.click();
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(true);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(false);
                      }}
                      onDrop={handleDrop}
                      aria-label="Upload response HTML file"
                    >
                      <div className="rcDropIcon">
                        <i className="fas fa-file-arrow-up" />
                      </div>
                      <div className="rcDropText">
                        {isSubmitting ? (
                          <p className="rcDropTitle">
                            Processing... Please wait...
                          </p>
                        ) : (
                          <>
                            <p className="rcDropTitle">
                              Drag & drop your HTML file here
                            </p>
                            <p className="rcDropSub">
                              or <span className="rcLinkLike">browse</span> to
                              select it
                            </p>
                          </>
                        )}
                      </div>

                      <input
                        id="fileInput"
                        type="file"
                        hidden
                        accept=".html,.htm"
                        onChange={handleFileUpload}
                      />
                    </div>

                    {fileMeta?.name ? (
                      <div className="rcFileBadge" aria-label="Selected file">
                        <span className="rcFileBadgeIcon">
                          <i className="fa-solid fa-paperclip" />
                        </span>
                        <div className="rcFileBadgeText">
                          <p className="rcFileName">{fileMeta.name}</p>
                          <p className="rcFileMeta">{formattedFileSize}</p>
                        </div>
                        <button
                          className="rcIconBtn"
                          type="button"
                          onClick={clearFile}
                          aria-label="Clear selected file"
                        >
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </div>
                    ) : null}

                    <div style={{ marginTop: "20px" }}>
                      <button
                        className="rcBtn"
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          opacity: isSubmitting ? 0.7 : 1,
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fa-solid fa-circle-notch fa-spin" />
                            <span className="rcBtnText">Processing...</span>
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-bolt" />
                            <span className="rcBtnText">
                              Generate Scorecard
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="rcInfoRow">
                      <div className="rcInfo">
                        <p className="rcInfoTitle">
                          <i className="fa-solid fa-circle-info" /> Tip
                        </p>
                        <p className="rcInfoText">
                          Upload the <b>official</b> HTML response file you
                          downloaded from the exam portal.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rcCardHeader rcCardHeaderResult">
                      <div className="rcTitleBlock">
                        <h2 className="rcCardTitle">{userName}</h2>
                        <p className="rcCardSubtitle">
                          Breakdown is computed using standard marking rules
                          (correct +4, wrong negative as applicable).
                        </p>
                      </div>
                      <div className="rcResultActions">
                        <ActionButton
                          variant="secondary"
                          icon={<i className="fa-solid fa-rotate-left" />}
                          onClick={reset}
                        >
                          Upload Another
                        </ActionButton>
                        <ActionButton
                          icon={<i className="fa-solid fa-print" />}
                          onClick={() => window.print()}
                        >
                          Download PDF
                        </ActionButton>
                      </div>
                    </div>

                    <div className="rcStatsGrid" aria-label="Score summary">
                      <ScoreCard
                        label="Cumulative Score"
                        value={scores.total}
                        tone="primary"
                        sub="Total"
                      />
                      <ScoreCard
                        label="QA Short Answer"
                        value={scores.sa}
                        sub="+4 / 0"
                      />
                      <ScoreCard
                        label="QA MCQ"
                        value={scores.mcq}
                        sub="+4 / -1"
                      />
                      <ScoreCard
                        label="Verbal Ability"
                        value={scores.va}
                        sub="+4 / -1"
                      />
                    </div>

                    <div className="rcSection">
                      <div className="rcSectionHeader">
                        <h3 className="rcSectionTitle">Section Breakdown</h3>
                        <p className="rcSectionSubtitle">
                          Correct / Wrong / Skipped with marks per section.
                        </p>
                      </div>

                      <div
                        className="rcTableWrap"
                        role="region"
                        aria-label="Marks table"
                      >
                        <table className="rcTable">
                          <thead>
                            <tr>
                              <th align="left">Section</th>
                              <th>Correct</th>
                              <th>Wrong</th>
                              <th>Skipped</th>
                              <th>Marks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scores.stats.map((s) => (
                              <tr key={s.n}>
                                <td className="rcTableSection" align="left">
                                  {s.n}
                                </td>
                                <td>
                                  <span className="rcBadge rcBadgeGood">
                                    {s.c}
                                  </span>
                                </td>
                                <td>
                                  <span className="rcBadge rcBadgeBad">
                                    {s.w}
                                  </span>
                                </td>
                                <td>
                                  <span className="rcBadge rcBadgeNeutral">
                                    {s.s}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`rcBadge ${
                                      s.m >= 0 ? "rcBadgeGood" : "rcBadgeBad"
                                    }`}
                                  >
                                    {s.m}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            <tr className="rcTableTotalRow">
                              <td className="rcTableSection" align="left">
                                Total
                              </td>
                              <td>
                                <span className="rcBadge rcBadgeGood">
                                  {totalCorrect}
                                </span>
                              </td>
                              <td>
                                <span className="rcBadge rcBadgeBad">
                                  {totalWrong}
                                </span>
                              </td>
                              <td>
                                <span className="rcBadge rcBadgeNeutral">
                                  {totalSkipped}
                                </span>
                              </td>
                              <td>
                                <span className="rcBadge rcBadgePrimary">
                                  {scores.total}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <p className="rcNote">
                        <i className="fa-solid fa-shield-halved" /> Your file is
                        processed locally. No data is uploaded or stored.
                      </p>
                    </div>
                  </>
                )}
              </section>

              {/* Side Card */}
              <aside className="rcCard rcCardSide" aria-label="Help and tips">
                <h3 className="rcSideTitle">How to use</h3>

                <ol className="rcSteps">
                  <li className="rcStep">
                    <span className="rcStepNum">1</span>
                    <span className="rcStepText">
                      Download your official response sheet <b>HTML</b> from the
                      exam portal.
                    </span>
                  </li>
                  <li className="rcStep">
                    <span className="rcStepNum">2</span>
                    <span className="rcStepText">
                      Upload it here (drag & drop or browse).
                    </span>
                  </li>
                  <li className="rcStep">
                    <span className="rcStepNum">3</span>
                    <span className="rcStepText">
                      Review your score breakdown and print/download the PDF.
                    </span>
                  </li>
                </ol>

                <div className="rcDivider" />

                <h3 className="rcSideTitle">Notes</h3>
                <ul className="rcBullets">
                  <li>
                    Marks are computed from the response file’s correct answer
                    markers.
                  </li>
                  <li>
                    If the portal format changes, some questions might be
                    skipped by the parser.
                  </li>
                  <li>
                    Printing works best on desktop browsers (Chrome/Edge).
                  </li>
                </ul>

                <div className="rcDivider" />

                <div className="rcSideCTA">
                  <p className="rcSideCTAHeadline">Want more tools?</p>
                  <div className="rcSideLinks">
                    <a className="rcSideLink" href="/call">
                      IPMAT Call Predictor{" "}
                      <i className="fa-solid fa-arrow-right" />
                    </a>
                    <a className="rcSideLink" href="/topperlist">
                      IPMAT Topper List{" "}
                      <i className="fa-solid fa-arrow-right" />
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>

        {/* Styles */}
        <style jsx global>{`
          :root {
            --rc-brand1: var(--brand-col1, #833589);
            --rc-brand2: var(--brand-col2, #f2ad00);

            --rc-bg: #ffffff;
            --rc-bg-soft: #f6f7fb;
            --rc-text: #14151a;
            --rc-muted: #5b616e;

            --rc-card: rgba(255, 255, 255, 0.92);
            --rc-border: rgba(20, 21, 26, 0.1);
            --rc-shadow: 0 18px 60px rgba(17, 24, 39, 0.1);

            --rc-radius: 18px;
          }

          body {
            background: var(--rc-bg);
          }

          .rcPage {
            min-height: 100vh;
            background: radial-gradient(
                900px 600px at 16% -5%,
                rgba(131, 53, 137, 0.16),
                transparent 60%
              ),
              radial-gradient(
                800px 500px at 90% 10%,
                rgba(242, 173, 0, 0.18),
                transparent 55%
              ),
              linear-gradient(180deg, #ffffff 0%, var(--rc-bg-soft) 100%);
            color: var(--rc-text);
          }

          /* Topbar */
          .rcTopbar {
            position: sticky;
            top: 0;
            z-index: 50;
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          }

          .rcTopbarInner {
            max-width: 1200px;
            margin: 0 auto;
            padding: 14px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 14px;
          }

          .rcBrand {
            display: inline-flex;
            align-items: center;
          }

          .rcLogo {
            height: 42px;
            width: auto;
            display: block;
          }

          .rcTopbarActions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .rcBtn {
            border: 0;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            border-radius: 12px;
            background: linear-gradient(
              135deg,
              var(--rc-brand1),
              rgba(131, 53, 137, 0.82)
            );
            color: #fff;
            box-shadow: 0 10px 30px rgba(131, 53, 137, 0.22);
            transition: transform 140ms ease, box-shadow 140ms ease,
              filter 140ms ease;
            font-family: Modernist, Poppins, sans-serif;
            letter-spacing: 0.2px;
          }

          .rcBtn:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 38px rgba(131, 53, 137, 0.28);
            filter: saturate(1.05);
          }

          .rcBtn:active {
            transform: translateY(0px);
          }

          .rcBtnSecondary {
            background: rgba(255, 255, 255, 0.75);
            color: var(--rc-text);
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 10px 24px rgba(17, 24, 39, 0.08);
          }

          .rcBtnSecondary:hover {
            box-shadow: 0 14px 30px rgba(17, 24, 39, 0.1);
          }

          .rcBtnIcon {
            display: inline-flex;
            width: 18px;
            justify-content: center;
          }

          .rcBtnText {
            font-size: 14px;
            line-height: 1;
            font-weight: 700;
          }

          /* Hero */
          .rcHero {
            padding: 34px 18px 18px;
          }

          .rcHeroInner {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1.35fr 0.65fr;
            gap: 16px;
            align-items: stretch;
          }

          .rcHeroText {
            padding: 18px;
          }

          .rcHeroTitle {
            margin: 0;
            font-family: Modernist, Poppins, sans-serif;
            font-size: 40px;
            line-height: 1.08;
            letter-spacing: -0.4px;
          }

          .rcHeroSubtitle {
            margin: 10px 0 0 0;
            color: var(--rc-muted);
            font-size: 16px;
            line-height: 1.6;
            max-width: 58ch;
          }

          .rcHeroMeta {
            margin-top: 14px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .rcPill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: rgba(255, 255, 255, 0.7);
            color: rgba(20, 21, 26, 0.92);
          }

          .rcPillLight {
            border-color: rgba(255, 255, 255, 0.18);
            background: rgba(255, 255, 255, 0.12);
            color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
          }

          .rcHeroCard {
            border-radius: var(--rc-radius);
            padding: 16px;
            background: linear-gradient(
              135deg,
              rgba(131, 53, 137, 0.88),
              rgba(131, 53, 137, 0.65)
            );
            color: #fff;
            box-shadow: 0 18px 60px rgba(131, 53, 137, 0.18);
            overflow: hidden;
            position: relative;
          }

          .rcHeroCard:before {
            content: "";
            position: absolute;
            inset: -40px -40px auto auto;
            width: 220px;
            height: 220px;
            border-radius: 999px;
            background: radial-gradient(
              closest-side,
              rgba(242, 173, 0, 0.38),
              transparent
            );
            pointer-events: none;
          }

          .rcHeroCardTop {
            position: relative;
            z-index: 1;
          }

          .rcHeroCardTitle {
            margin: 0;
            font-family: Modernist, Poppins, sans-serif;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            opacity: 0.92;
          }

          .rcHeroCardHint {
            margin: 8px 0 0;
            font-size: 13px;
            line-height: 1.5;
            opacity: 0.95;
          }

          .rcMiniGrid {
            position: relative;
            z-index: 1;
            margin-top: 14px;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .rcMiniItem {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 14px;
            padding: 12px;
          }

          .rcMiniLabel {
            margin: 0;
            font-size: 12px;
            opacity: 0.85;
            font-weight: 700;
          }

          .rcMiniValue {
            margin: 8px 0 0;
            font-family: Modernist, Poppins, sans-serif;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.2px;
          }

          /* Main */
          .rcMain {
            padding: 10px 18px 40px;
          }

          .rcContainer {
            max-width: 1200px;
            margin: 0 auto;
          }

          .rcGrid {
            display: grid;
            grid-template-columns: 1.25fr 0.75fr;
            gap: 16px;
            align-items: start;
          }

          .rcCard {
            background: var(--rc-card);
            border: 1px solid var(--rc-border);
            border-radius: var(--rc-radius);
            box-shadow: var(--rc-shadow);
            padding: 18px;
          }

          .rcCardMain {
            overflow: hidden;
          }

          .rcCardHeader {
            margin-bottom: 14px;
          }

          .rcCardHeaderResult {
            display: flex;
            justify-content: space-between;
            gap: 14px;
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .rcTitleBlock {
            min-width: 260px;
          }

          .rcResultActions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .rcCardTitle {
            margin: 0;
            font-family: Modernist, Poppins, sans-serif;
            font-size: 20px;
            letter-spacing: -0.2px;
          }

          .rcCardSubtitle {
            margin: 8px 0 0;
            color: var(--rc-muted);
            font-size: 14px;
            line-height: 1.6;
          }

          /* Dropzone */
          .rcDropzone {
            border-radius: 16px;
            border: 1.5px dashed rgba(20, 21, 26, 0.18);
            background: linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.75),
              rgba(255, 255, 255, 0.55)
            );
            padding: 22px;
            display: flex;
            gap: 14px;
            align-items: center;
            cursor: pointer;
            transition: transform 160ms ease, border-color 160ms ease,
              box-shadow 160ms ease;
            user-select: none;
          }

          .rcDropzone:hover {
            transform: translateY(-1px);
            border-color: rgba(131, 53, 137, 0.35);
            box-shadow: 0 16px 40px rgba(17, 24, 39, 0.08);
          }

          .rcDropzoneActive {
            border-color: rgba(242, 173, 0, 0.65);
            box-shadow: 0 20px 44px rgba(242, 173, 0, 0.16);
          }

          .rcDropIcon {
            width: 54px;
            height: 54px;
            border-radius: 16px;
            display: grid;
            place-items: center;
            background: rgba(131, 53, 137, 0.1);
            color: var(--rc-brand1);
            font-size: 22px;
            flex: 0 0 auto;
          }

          .rcDropTitle {
            margin: 0;
            font-family: Modernist, Poppins, sans-serif;
            font-weight: 800;
            letter-spacing: -0.1px;
            font-size: 16px;
          }

          .rcDropSub {
            margin: 6px 0 0;
            color: var(--rc-muted);
            font-size: 13px;
          }

          .rcLinkLike {
            color: var(--rc-brand1);
            font-weight: 800;
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 3px;
          }

          .rcFileBadge {
            margin-top: 12px;
            display: flex;
            gap: 10px;
            align-items: center;
            padding: 12px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(0, 0, 0, 0.08);
          }

          .rcFileBadgeIcon {
            width: 36px;
            height: 36px;
            border-radius: 12px;
            display: grid;
            place-items: center;
            background: rgba(242, 173, 0, 0.18);
            color: rgba(20, 21, 26, 0.9);
            flex: 0 0 auto;
          }

          .rcFileBadgeText {
            flex: 1;
            min-width: 0;
          }

          .rcFileName {
            margin: 0;
            font-weight: 800;
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .rcFileMeta {
            margin: 4px 0 0;
            color: var(--rc-muted);
            font-size: 12px;
          }

          .rcIconBtn {
            border: 0;
            background: transparent;
            cursor: pointer;
            width: 36px;
            height: 36px;
            border-radius: 12px;
            display: grid;
            place-items: center;
            color: rgba(20, 21, 26, 0.75);
            transition: background 120ms ease;
          }

          .rcIconBtn:hover {
            background: rgba(0, 0, 0, 0.06);
          }

          .rcInfoRow {
            margin-top: 14px;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .rcInfo {
            border-radius: 16px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.66);
            border: 1px solid rgba(0, 0, 0, 0.06);
          }

          .rcInfoTitle {
            margin: 0;
            font-weight: 900;
            font-size: 13px;
            display: inline-flex;
            gap: 8px;
            align-items: center;
            font-family: Modernist, Poppins, sans-serif;
          }

          .rcInfoText {
            margin: 8px 0 0;
            color: var(--rc-muted);
            font-size: 13px;
            line-height: 1.55;
          }

          /* Stats cards */
          .rcStatsGrid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-top: 10px;
          }

          .rcStatCard {
            border-radius: 16px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: rgba(255, 255, 255, 0.78);
            padding: 14px;
          }

          .rcStatCard.primary {
            border-color: rgba(131, 53, 137, 0.22);
            background: linear-gradient(
              180deg,
              rgba(131, 53, 137, 0.12),
              rgba(255, 255, 255, 0.78)
            );
          }

          .rcStatTop {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .rcStatLabel {
            margin: 0;
            color: var(--rc-muted);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.2px;
          }

          .rcStatValue {
            margin-top: 10px;
            font-family: Modernist, Poppins, sans-serif;
            font-size: 30px;
            font-weight: 900;
            letter-spacing: -0.3px;
          }

          /* Section */
          .rcSection {
            margin-top: 16px;
            border-top: 1px dashed rgba(0, 0, 0, 0.12);
            padding-top: 14px;
          }

          .rcSectionHeader {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: baseline;
            flex-wrap: wrap;
          }

          .rcSectionTitle {
            margin: 0;
            font-family: Modernist, Poppins, sans-serif;
            font-size: 16px;
            letter-spacing: -0.2px;
          }

          .rcSectionSubtitle {
            margin: 0;
            color: var(--rc-muted);
            font-size: 13px;
          }

          .rcTableWrap {
            margin-top: 10px;
            overflow: auto;
            border-radius: 16px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: rgba(255, 255, 255, 0.9);
          }

          .rcTable {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            min-width: 640px;
          }

          .rcTable thead th {
            position: sticky;
            top: 0;
            z-index: 1;
            background: rgba(246, 247, 251, 0.95);
            backdrop-filter: blur(8px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            padding: 12px 12px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: rgba(20, 21, 26, 0.75);
            font-family: Modernist, Poppins, sans-serif;
          }

          .rcTable tbody td {
            padding: 12px 12px;
            text-align: center;
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            font-size: 13px;
          }

          .rcTable tbody tr:nth-child(odd) td {
            background: rgba(255, 255, 255, 0.7);
          }

          .rcTable tbody tr:nth-child(even) td {
            background: rgba(246, 247, 251, 0.45);
          }

          .rcTableSection {
            text-align: left !important;
            font-weight: 900;
            font-family: Modernist, Poppins, sans-serif;
            color: rgba(20, 21, 26, 0.92);
          }

          .rcTableTotalRow td {
            background: rgba(242, 173, 0, 0.1) !important;
            border-bottom: 0;
          }

          .rcBadge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 44px;
            padding: 7px 10px;
            border-radius: 999px;
            font-weight: 900;
            font-size: 12px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: rgba(255, 255, 255, 0.8);
          }

          .rcBadgeGood {
            background: rgba(16, 185, 129, 0.12);
            border-color: rgba(16, 185, 129, 0.24);
            color: rgba(6, 95, 70, 1);
          }

          .rcBadgeBad {
            background: rgba(239, 68, 68, 0.12);
            border-color: rgba(239, 68, 68, 0.24);
            color: rgba(127, 29, 29, 1);
          }

          .rcBadgeNeutral {
            background: rgba(100, 116, 139, 0.12);
            border-color: rgba(100, 116, 139, 0.24);
            color: rgba(30, 41, 59, 1);
          }

          .rcBadgePrimary {
            background: rgba(131, 53, 137, 0.12);
            border-color: rgba(131, 53, 137, 0.24);
            color: rgba(131, 53, 137, 1);
          }

          .rcNote {
            margin: 12px 0 0;
            color: var(--rc-muted);
            font-size: 12px;
            display: inline-flex;
            gap: 8px;
            align-items: center;
          }

          /* Side */
          .rcCardSide {
            position: sticky;
            top: 86px;
          }

          .rcSideTitle {
            margin: 0;
            font-family: Modernist, Poppins, sans-serif;
            font-size: 15px;
            letter-spacing: -0.1px;
          }

          .rcSteps {
            margin: 12px 0 0;
            padding: 0;
            list-style: none;
            display: grid;
            gap: 10px;
          }

          .rcStep {
            display: flex;
            gap: 10px;
            align-items: flex-start;
          }

          .rcStepNum {
            width: 28px;
            height: 28px;
            border-radius: 10px;
            background: rgba(131, 53, 137, 0.12);
            border: 1px solid rgba(131, 53, 137, 0.2);
            color: rgba(131, 53, 137, 1);
            font-weight: 900;
            display: grid;
            place-items: center;
            flex: 0 0 auto;
            font-family: Modernist, Poppins, sans-serif;
          }

          .rcStepText {
            color: var(--rc-muted);
            font-size: 13px;
            line-height: 1.55;
          }

          .rcDivider {
            height: 1px;
            background: rgba(0, 0, 0, 0.08);
            margin: 14px 0;
          }

          .rcBullets {
            margin: 10px 0 0;
            padding-left: 18px;
            color: var(--rc-muted);
            font-size: 13px;
            line-height: 1.55;
            display: grid;
            gap: 8px;
          }

          .rcSideCTAHeadline {
            margin: 0;
            font-family: Modernist, Poppins, sans-serif;
            font-size: 13px;
            font-weight: 900;
          }

          .rcSideLinks {
            margin-top: 10px;
            display: grid;
            gap: 10px;
          }

          .rcSideLink {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            padding: 12px;
            border-radius: 14px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            background: rgba(255, 255, 255, 0.75);
            font-weight: 900;
            color: rgba(20, 21, 26, 0.92);
            transition: transform 140ms ease, box-shadow 140ms ease;
            font-family: Modernist, Poppins, sans-serif;
          }

          .rcSideLink:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 30px rgba(17, 24, 39, 0.1);
          }

          /* Responsive */
          @media (max-width: 980px) {
            .rcHeroInner {
              grid-template-columns: 1fr;
            }
            .rcGrid {
              grid-template-columns: 1fr;
            }
            .rcCardSide {
              position: static;
            }
            .rcStatsGrid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 520px) {
            .rcHeroTitle {
              font-size: 30px;
            }
            .rcDropzone {
              flex-direction: column;
              text-align: center;
              align-items: center;
            }
            .rcInfoRow {
              grid-template-columns: 1fr;
            }
            .rcStatsGrid {
              grid-template-columns: 1fr;
            }
            .rcBtnText {
              font-size: 13px;
            }
          }

          /* Print */
          @media print {
            .rcTopbar,
            .rcHero,
            .rcCardSide,
            .rcResultActions {
              display: none !important;
            }

            .rcPage {
              background: white !important;
            }

            .rcCard {
              box-shadow: none !important;
              border: 1px solid #ddd !important;
              background: white !important;
            }

            .rcMain {
              padding: 0 !important;
            }

            .rcContainer {
              max-width: none !important;
            }

            .rcTable {
              min-width: 0 !important;
            }

            .rcTable thead th {
              position: static !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}
