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
    link: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedLeads = localStorage.getItem("iim_leads");
    if (savedLeads) {
      setLeaderboard(JSON.parse(savedLeads));
    }
  }, []);

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
    const { name, mobile, email, link } = formData;

    if (!name || mobile.length < 10 || !email) {
      alert("Please enter Name, Email, and 10-digit Mobile.");
      return;
    }

    if (!link && !selectedFile) {
      alert("Please provide a link or upload a file.");
      return;
    }

    setIsSubmitting(true);

    try {
      let htmlContent = "";
      let finalFileUrl = link;

      // 1. Get HTML Content
      if (link) {
        try {
          const res = await fetch(link);
          htmlContent = await res.text();
        } catch (e) {
          setIsSubmitting(false);
          alert("CORS Block. Please use 'Upload HTML' instead.");
          return;
        }
      } else if (selectedFile) {
        htmlContent = await new Promise((resolve, reject) => {
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
        finalFileUrl = uploadedUrl;
      }

      // 3. Calculate Scores
      const scores = calculateScores(htmlContent);

      // 4. Send Email & Save Data
      await axios.post("/api/sendScorecardIIMB", {
        ...formData,
        fileUrl: finalFileUrl,
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
      updateLeaderboard(studentData);
      setView("results");
    } catch (error) {
      console.error(error);
      alert("An error occurred during processing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLeaderboard = (student) => {
    const list = [...leaderboard, student];
    list.sort((a, b) => b.total - a.total);
    const top10 = list.slice(0, 10);
    setLeaderboard(top10);
    localStorage.setItem("iim_leads", JSON.stringify(top10));
  };

  const resetAnalysis = () => {
    setView("setup");
    setFormData({
      name: "",
      mobile: "",
      email: "",
      category: "General",
      city: "",
      link: "",
    });
    setSelectedFile(null);
    setCurrentStudent(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

      <div className="animated-bg"></div>
      <div className="deco-circle deco-circle-1"></div>
      <div className="deco-circle deco-circle-2"></div>

      <header>
        <div className="logo">
          IPM<span>CAREERS</span>
        </div>
      </header>

      <div className="container">
        <main>
          {view === "setup" && (
            <div id="setupView" className="glass-card">
              <h2>IIM-B UG Response Analyzer</h2>
              <div className="input-grid">
                <div>
                  <label>Name</label>
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
                  <label>Mobile No.</label>
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
                  <label>Email</label>
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
              </div>
              <div className="input-grid">
                <div>
                  <label>Category</label>
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
                    }}
                  >
                    <option>General</option>
                    <option>OBC</option>
                    <option>SC/ST</option>
                    <option>EWS</option>
                  </select>
                </div>
                <div>
                  <label>City</label>
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
              <div className="upload-area">
                <label>Response Source</label>
                <input
                  type="url"
                  name="link"
                  placeholder="Paste link (may face CORS restriction)"
                  style={{
                    marginBottom: "15px",
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
                  value={formData.link}
                  onChange={handleInputChange}
                />
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
                  <p>
                    <strong>
                      {selectedFile
                        ? selectedFile.name
                        : "Upload HTML Response File"}
                    </strong>
                  </p>
                  <p style={{ fontSize: "0.8rem", marginTop: "5px" }}>
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                      : "Click to browse or drag and drop"}
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".html,.htm"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <button
                className="btn-neon"
                style={{ marginTop: "25px" }}
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
            <div id="resultsView" className="glass-card">
              <h2 id="resName">{currentStudent.name}</h2>
              <p id="resMeta">
                {currentStudent.category} | {currentStudent.city} |{" "}
                {currentStudent.mobile}
              </p>

              <div className="stats-grid">
                <div className="stat-box highlight">
                  <div className="stat-icon">🏆</div>
                  <label>Total Score</label>
                  <span className="val">{currentStudent.total}</span>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">📝</div>
                  <label>Verbal Ability</label>
                  <span className="val">{currentStudent.s1}</span>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">🧩</div>
                  <label>Logical Reasoning</label>
                  <span className="val">{currentStudent.s2}</span>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">🔢</div>
                  <label>Quantitative Ability</label>
                  <span className="val">{currentStudent.s3}</span>
                </div>
              </div>

              <button
                className="btn-neon secondary no-print"
                onClick={resetAnalysis}
              >
                <i className="fas fa-redo"></i> New Analysis
              </button>
            </div>
          )}
        </main>

        <aside className="no-print">
          <div className="glass-card leaderboard-card">
            <h3>
              <i className="fas fa-trophy"></i>
              Local Leaderboard
            </h3>
            <div id="leaderboard">
              {leaderboard.map((student, index) => (
                <div key={index} className="topper-row">
                  <span>
                    <b>{index + 1}.</b> {student.name}
                  </span>
                  <span>{student.total}</span>
                </div>
              ))}
            </div>
            <p className="leaderboard-note">*Stored on this device only</p>
          </div>
        </aside>
      </div>

      {/* Global styles for variables and background */}
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

        /* Animated background needs to be on body/main container */
        body {
          background-color: var(--bg-dark);
          color: var(--text-light);
          margin: 0;
          overflow-x: hidden;
        }
      `}</style>

      {/* Scoped styles for the component content */}
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .container,
        .glass-card,
        .btn-neon,
        .stat-box,
        input,
        select {
          font-family: "DM Sans", sans-serif;
        }

        /* Re-implement body::before as a fixed div in the component since styled-jsx global body::before can be tricky with Next.js layouts */
        .animated-bg {
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
              circle at 20% 30%,
              rgba(131, 53, 137, 0.15) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(231, 152, 1, 0.1) 0%,
              transparent 50%
            );
          animation: gradientShift 20s ease infinite;
          z-index: -1;
          pointer-events: none;
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

        header {
          background: rgba(26, 17, 36, 0.95);
          backdrop-filter: blur(20px);
          padding: 15px 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom-width: 2px !important;
          border-bottom-style: solid !important;
          border-bottom-color: rgba(131, 53, 137, 0.3) !important;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .logo {
          font-family: "Bricolage Grotesque", sans-serif;
          font-weight: 800;
          font-size: 1.4rem;
        }

        .logo span {
          color: var(--accent-orange);
        }

        .container {
          max-width: 1100px;
          margin: 40px auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 30px;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 992px) {
          .container {
            grid-template-columns: 1fr;
          }
        }

        .glass-card {
          background: rgba(26, 17, 36, 0.6);
          backdrop-filter: blur(20px);
          border-width: 1px !important;
          border-style: solid !important;
          border-color: #2a1d35 !important;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
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

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        h2 {
          font-family: "Bricolage Grotesque", sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 24px;
          color: var(--text-light);
        }

        /* Inputs */
        .input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-dim);
          margin-bottom: 6px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        input:focus,
        select:focus {
          border-color: #833589 !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(131, 53, 137, 0.1);
        }

        input::placeholder {
          color: rgba(184, 169, 195, 0.5);
        }

        select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23E79801' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 45px;
        }

        .upload-area {
          margin-top: 20px;
        }

        .upload-box:hover {
          border-color: #833589 !important;
          background: rgba(131, 53, 137, 0.05);
        }

        .upload-box p {
          color: var(--text-dim);
          font-size: 0.9rem;
        }

        .btn-neon {
          background: linear-gradient(135deg, var(--accent-orange), #f5a623);
          color: #1a0a20;
          border: none;
          padding: 15px 30px;
          border-radius: 10px;
          font-weight: 700;
          font-family: "Bricolage Grotesque", sans-serif;
          width: 100%;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(231, 152, 1, 0.3);
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
          box-shadow: 0 15px 40px rgba(231, 152, 1, 0.4);
        }

        .btn-neon:hover::before {
          left: 100%;
        }

        .btn-neon:active {
          transform: translateY(0);
        }

        .btn-neon.secondary {
          background: rgba(131, 53, 137, 0.2);
          color: var(--text-light);
          border: 1px solid var(--primary-purple);
          box-shadow: none;
        }

        .btn-neon.secondary:hover {
          background: rgba(131, 53, 137, 0.3);
        }

        .btn-export {
          padding: 8px 20px;
          font-size: 0.8rem;
          width: auto;
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 30px 0;
        }

        .stat-box {
          background: rgba(10, 6, 20, 0.6);
          padding: 24px;
          border-radius: 16px;
          text-align: center;
          border: 1px solid var(--card-border);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
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
          border-color: var(--primary-purple);
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(131, 53, 137, 0.3);
        }

        .stat-box.highlight {
          border-color: var(--accent-orange);
          background: linear-gradient(
            135deg,
            rgba(231, 152, 1, 0.15),
            rgba(131, 53, 137, 0.1)
          );
          grid-column: span 3;
          padding: 32px;
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

        .stat-icon {
          width: 50px;
          height: 50px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 1.5rem;
          background: linear-gradient(
            135deg,
            rgba(131, 53, 137, 0.2),
            rgba(131, 53, 137, 0.05)
          );
          border: 1px solid rgba(131, 53, 137, 0.3);
          position: relative;
          z-index: 1;
        }

        .stat-box.highlight .stat-icon {
          width: 70px;
          height: 70px;
          font-size: 2rem;
          background: linear-gradient(
            135deg,
            rgba(231, 152, 1, 0.3),
            rgba(131, 53, 137, 0.2)
          );
          border-color: var(--accent-orange);
          animation: icon-float 3s ease infinite;
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

        .stat-box label {
          font-size: 0.8rem;
          margin-bottom: 12px;
          display: block;
          font-weight: 600;
          letter-spacing: 0.5px;
          position: relative;
          z-index: 1;
        }

        .stat-box .val {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--accent-orange);
          display: block;
          font-family: "Bricolage Grotesque", sans-serif;
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 10px rgba(231, 152, 1, 0.3);
        }

        .stat-box.highlight .val {
          font-size: 4rem;
          background: linear-gradient(135deg, var(--accent-orange), #f5a623);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hidden {
          display: none;
        }

        /* Results Header */
        #resName {
          color: var(--accent-orange);
          margin: 0 0 8px 0;
          font-size: 1.8rem;
        }

        #resMeta {
          color: var(--text-dim);
          font-size: 0.9rem;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--card-border);
        }

        /* Leaderboard */
        .leaderboard-card {
          padding: 24px;
        }

        .leaderboard-card h3 {
          margin-top: 0;
          font-size: 1.1rem;
          font-family: "Bricolage Grotesque", sans-serif;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .leaderboard-card h3 i {
          color: var(--accent-orange);
          font-size: 1.3rem;
        }

        .topper-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--card-border);
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .topper-row:hover {
          padding-left: 8px;
          color: var(--accent-orange);
        }

        .topper-row:last-child {
          border-bottom: none;
        }

        .topper-row span:first-child {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .topper-row b {
          color: var(--primary-purple);
          font-family: "Bricolage Grotesque", sans-serif;
        }

        .topper-row span:last-child {
          color: var(--accent-orange);
          font-weight: 800;
          font-family: "Bricolage Grotesque", sans-serif;
        }

        .leaderboard-note {
          font-size: 0.75rem;
          color: var(--text-dim);
          margin-top: 15px;
          font-style: italic;
        }

        @media print {
          .no-print {
            display: none;
          }
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

        /* Loading animation */
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

        .glass-card {
          animation: fadeIn 0.5s ease;
        }

        /* Decorative circles */
        .deco-circle {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.4;
          z-index: 0;
        }

        .deco-circle-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(
            circle,
            rgba(131, 53, 137, 0.2),
            transparent
          );
          top: -200px;
          right: -200px;
          animation: rotate 20s linear infinite;
        }

        .deco-circle-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(
            circle,
            rgba(231, 152, 1, 0.15),
            transparent
          );
          bottom: -150px;
          left: -150px;
          animation: rotate 25s linear infinite reverse;
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
