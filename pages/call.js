import { useEffect, useRef, useState } from "react";
import Timer from "../components/Timer";
import st from "./TestPredictor.module.css";
import Head from "next/head";
import { NextSeo } from "next-seo";
import axios from "axios";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";
import "tailwindcss/tailwind.css";
import Confetti from "../components/CanvasCofetti";
import AppShell from "../components/AppShell";
import { collegesData } from "../utils/callColleges";
import { callGlobalStyles as globalStyles } from "../utils/callStyles";

function Call() {
  const [data, setData] = useState();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [count, setCount] = useState("...");
  const [isVisible, setIsVisible] = useState(false);
  const scrolldiv = useRef(null);

  const categories = [
    { value: "gen", title: "GEN — General" },
    { value: "ews", title: "EWS — Economically Weaker Section" },
    { value: "obc", title: "OBC — Other Backward Class" },
    { value: "pwd", title: "PWD — Person with Disability" },
    { value: "sc", title: "SC — Scheduled Caste" },
    { value: "st", title: "ST — Scheduled Tribe" },
  ];


  // College prestige ranking for display order
  const COLLEGE_RANK = {
    'IIM Indore': 1,
    'IIM Ranchi': 2,
    'IIM Shillong': 3,
    'IIFT': 4,
    'TAPMI': 5,
    'IIM Sambalpur': 6,
    'IIM Sirmaur': 7,
    'IIM Amritsar': 8,
    'NALSAR': 9,
    'NIRMA': 10,
    'Krea University (IFMR)': 11,
    'Alliance University': 12,
    'LM Thapar (TIET)': 13,
    'NICMAR University': 14,
    'GLS University': 15,
  };

  async function getCount() {
    try {
      const res = await fetch("/api/predictor-count");
      const json = await res.json();
      if (json.count !== undefined) setCount(550 + json.count);
    } catch (err) {
      console.error("Failed to fetch count:", err);
    }
  }

  useEffect(() => {
    getCount();
  }, []);

  function validatePhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
  }
  function validateName(name) {
    return name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);
  }

  async function submitLead(a) {
    await supabase.from("predictor").insert({
      fullname: a.fullname,
      va: a.va,
      sa: a.sa,
      qa: a.qa,
      phone: a.phone,
      category: a.category,
    });
  }

  function cronberryTrigger(
    username,
    u_email,
    u_mobile,
    u_year,
    u_city,
    linke,
  ) {
    var id = Date.now();
    var data = JSON.stringify({
      projectKey: "VW50aXRsZSBQcm9qZWN0MTY1MDAxMzUxMDU5MQ==",
      audienceId: id,
      name: username,
      email: u_email,
      mobile: u_mobile,
      ios_fcm_token: "",
      web_fcm_token: "",
      android_fcm_token: "",
      profile_path: "",
      active: "",
      audience_id: "",
      paramList: [
        { paramKey: "source", paramValue: "" },
        { paramKey: "city", paramValue: u_city },
        { paramKey: "postcode", paramValue: "" },
        { paramKey: "total_amount", paramValue: "" },
        { paramKey: "abondon_cart", paramValue: true },
        { paramKey: "preparing_for_which_year", paramValue: "" },
        { paramKey: "subject", paramValue: "" },
        { paramKey: "formurl", paramValue: linke },
        { paramKey: "formname", paramValue: "Call Predictor" },
      ],
    });
    var xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://register.cronberry.com/api/campaign/register-audience-data",
    );
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
  }

  async function TestApi(a) {
    setData();
    setError();
    if (!a) {
      setError("Please fill the form before predicting.");
      return;
    }
    if (!a.fullname || !validateName(a.fullname)) {
      setError("Name is empty or invalid.");
      return;
    }
    if (!a.category) {
      setError("Please select your category.");
      return;
    }
    if (!a.phone || !validatePhone(a.phone)) {
      setError("Enter a valid 10-digit mobile number (no country code).");
      return;
    }
    if (a.qa === undefined || a.qa === "") {
      setError("Please enter your QA marks.");
      return;
    }
    if (a.sa === undefined || a.sa === "") {
      setError("Please enter your SA marks.");
      return;
    }
    if (a.va === undefined || a.va === "") {
      setError("Please enter your VA marks.");
      return;
    }

    setLoading(true);
    submitLead(a);
    try {
      const response = await axios.post("/api/predictor", {
        category: a.category,
        sa: a.sa,
        va: a.va,
        qa: a.qa,
      });
      console.log("API response:", response?.data);
      cronberryTrigger(
        a.fullname,
        "",
        a.phone,
        "Not Specified",
        "https://register.ipmcareer.com/call",
      );
      setData(response?.data?.colleges);
      if (response?.data?.colleges?.length > 0) {
        setIsVisible(true);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 500);
      }
    } catch (e) {
      console.error("API error:", e);
    }
    setLoading(false);
  }

  const router = useRouter();
  const [live, setLive] = useState(true);
  useEffect(() => {
    if (router?.query?.live) setLive(router.query.live);
  }, [router]);

  const updateField = (key, value) => {
    setError();
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (!live) {
    return (
      <div className={st.mainholder}>
        <div className={st.logo}>
          <img src="/hd-logo.svg" />
        </div>
        <h1>IPMAT Call Predictor Launching Soon</h1>
        <h2>Please Come Back Later</h2>
        <Timer />
      </div>
    );
  }

  if (data) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        <Head>
          <link rel="icon" href="/favicon_ipm.svg" />
        </Head>
        <NextSeo
          title="IPMAT Call Predictor 2026 — Your Results | IPM Careers"
          description="Your IPMAT Call Predictor results are ready. See which IIMs and top IPM colleges will call you for interview based on your IPMAT Indore scores."
          canonical="https://register.ipmcareer.com/call"
          openGraph={{
            url: "https://register.ipmcareer.com/call",
            title: "IPMAT Call Predictor 2026 — Your Results",
            description: "See which IIMs will call you based on your IPMAT scores.",
            images: [
              {
                url: "/callpred.jpg",
                width: 1200,
                height: 630,
                alt: "IPMAT Call Predictor 2026",
              },
            ],
          }}
        />
        {isVisible && <Confetti />}
        <AppShell activePage="/call">
          <div className="cp-root">
            <div className="cp-hero cp-hero-results">
              <div className="cp-left">
                <div className="cp-results">
                  {data.length === 0 ? (
                    <div className="cp-no-result">
                      <img src="/cry.gif" alt="sad" />
                      <h2>No calls predicted</h2>
                      <p>
                        Based on your scores, we couldn't match any college
                        cutoffs. But don't worry — IPM Careers will reach out to
                        help you prepare better!
                      </p>
                    </div>
                  ) : (
                    <div className="cp-results-header">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: "#F0E0F4",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 22,
                          }}
                        >
                          🎉
                        </div>
                        <div>
                          <p className="cp-congrats">
                            You may get {data.length} call
                            {data.length > 1 ? "s" : ""}!
                          </p>
                          <p className="cp-congrats-sub">
                            IPM Careers congratulates you on your hard work
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="cp-college-grid">
                    {[...data].sort((a, b) => (COLLEGE_RANK[a] || 99) - (COLLEGE_RANK[b] || 99)).map((name, idx) => {
                      const c = collegesData[name];
                      if (!c) return null;
                      const statusColor = c.status === "OPEN" ? "#22c55e" : c.status === "CLOSED" ? "#ef4444" : "#f59e0b";
                      const statusBg = c.status === "OPEN" ? "rgba(34,197,94,0.15)" : c.status === "CLOSED" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)";
                      const dateColor = c.status === "OPEN" ? "#22c55e" : c.status === "CLOSED" ? "#ef4444" : "#f59e0b";
                      return (
                        <div className="cp-dark-card" key={name} style={{ animationDelay: `${idx * 80}ms` }}>
                          <h3 className="cp-dark-card-title">{c.title}</h3>

                          <div className="cp-dark-card-row">
                            <div className="cp-dark-card-icon">📅</div>
                            <span className="cp-dark-card-label">Exam Accepted</span>
                            <span className="cp-dark-card-value">{c.exam || "IPMAT"}</span>
                          </div>

                          <div className="cp-dark-card-row">
                            <div className="cp-dark-card-icon">🕐</div>
                            <span className="cp-dark-card-label">Last Date</span>
                            <span className="cp-dark-card-date" style={{ color: dateColor }}>{c.lastDate || "TBA"}</span>
                          </div>

                          <div className="cp-dark-card-divider"></div>

                          <div className="cp-dark-card-footer">
                            <span className="cp-dark-card-status" style={{ color: statusColor, background: statusBg }}>
                              {c.status || "OPEN"}
                            </span>
                            {c.link ? (
                              <a href={c.link} target="_blank" rel="noopener noreferrer" className="cp-dark-card-link">
                                Official Website <span style={{ fontSize: 10 }}>↗</span>
                              </a>
                            ) : (
                              <span className="cp-dark-card-link" style={{ opacity: 0.4, cursor: "default" }}>
                                Coming Soon
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Share / Download Row ── */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20, marginBottom: 12 }}>
                    {/* PDF Download */}
                    <button
                      className="cp-btn"
                      style={{ flex: 1, minWidth: 180, fontSize: '0.85rem', padding: '12px 18px', background: 'linear-gradient(135deg, #833589, #6c63ff)' }}
                      onClick={async () => {
                        const colleges = data.filter(n => collegesData[n]).map(n => ({
                          name: collegesData[n].title,
                          exam: collegesData[n].exam || 'IPMAT Indore',
                          lastDate: collegesData[n].lastDate || 'TBA',
                          status: collegesData[n].status || 'OPEN',
                        }));
                        const total = parseFloat(formData.sa||0)+parseFloat(formData.qa||0)+parseFloat(formData.va||0);
                        try {
                          const res = await fetch('/api/predictor-pdf', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: formData.fullname || 'Student',
                              category: (formData.category || '').toUpperCase(),
                              sa: formData.sa || 0,
                              qa: formData.qa || 0,
                              va: formData.va || 0,
                              total,
                              colleges,
                            }),
                          });
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `IPMAT_Call_Prediction_${(formData.fullname||'Student').replace(/\s+/g,'_')}.pdf`;
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error('PDF error:', err);
                          alert('Failed to generate PDF. Please try again.');
                        }
                      }}
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{marginRight:6}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Download PDF
                    </button>

                    {/* WhatsApp Share */}
                    <button
                      className="cp-btn"
                      style={{ flex: 1, minWidth: 140, fontSize: '0.85rem', padding: '10px 14px', background: '#25D366' }}
                      onClick={() => {
                        const names = data.filter(n => collegesData[n]).map(n => collegesData[n].title);
                        const total = parseFloat(formData.sa||0)+parseFloat(formData.qa||0)+parseFloat(formData.va||0);
                        const msg = `🎯 *IPMAT Call Predictor Result*\n\n📊 My Score: ${total}/360\n📋 Category: ${(formData.category||'').toUpperCase()}\n\n🏆 *Predicted Calls (${names.length}):*\n${names.map((n,i) => `${i+1}. ${n}`).join('\n')}\n\n✅ Check yours free: register.ipmcareer.com/call`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style={{marginRight:6}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.634-1.215A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.237 0-4.308-.744-5.975-1.999l-.427-.318-2.748.721.735-2.686-.35-.556A9.937 9.937 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                      WhatsApp
                    </button>

                  </div>

                  <button
                    className="cp-btn cp-btn-secondary"
                    onClick={() => {
                      setData();
                      setFormData({});
                      setIsVisible(false);
                    }}
                  >
                    ↩ Predict Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </AppShell>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <Head>
        <link rel="icon" href="/favicon_ipm.svg" />
      </Head>
      <NextSeo
        title="IPMAT Call Predictor 2026 — Free IPM Call Predictor Tool | IPM Careers"
        description="Use the free IPMAT Call Predictor 2026 to check which IIMs and top colleges will call you for interview. Enter your IPMAT Indore scores and get instant results. Trusted by 500+ IPM aspirants."
        canonical="https://register.ipmcareer.com/call"
        openGraph={{
          url: "https://register.ipmcareer.com/call",
          title: "IPMAT Call Predictor 2026 — Free IPM Call Predictor Tool",
          description: "Enter your IPMAT Indore scores and instantly check which IIMs will call you for PI. Free IPMAT Call Predictor by IPM Careers.",
          images: [
            {
              url: "/callpred.jpg",
              width: 1200,
              height: 630,
              alt: "IPMAT Call Predictor 2026",
            },
          ],
        }}
        additionalMetaTags={[
          { name: "keywords", content: "IPMAT call predictor, IPM call predictor, IPMAT call predictor 2026, IPM call predictor 2026, IPMAT cutoff predictor, IIM call predictor, IPMAT Indore predictor, IPMAT college predictor" },
          { name: "robots", content: "index, follow" },
        ]}
      />
      {isVisible && <Confetti />}

      <AppShell activePage="/call">
        <div className="cp-root">
          <div className="cp-hero" style={{gridTemplateColumns: '1fr'}}>
            {/* LEFT PANEL */}
            <div className="cp-left" ref={scrolldiv} style={{maxWidth: 680, margin: '0 auto'}}>
              <p className="cp-eyebrow">Free Tool · AI Powered</p>
              <h1 className="cp-heading">
                IPMAT
                <br />
                <span>Call Predictor</span>
              </h1>
              <p className="cp-subheading">
                Enter your scores and profile to instantly find out which IIMs and
                top colleges are likely to call you for admission.
              </p>

              <div className="cp-counter">
                <div className="cp-counter-dot"></div>
                <span>
                  <strong>{count}+</strong> students predicted their call
                </span>
              </div>

              <div className="cp-form">
                <div className="cp-field">
                  <label className="cp-label">Full Name</label>
                  <input
                    className="cp-input"
                    placeholder="Write your Name"
                    type="text"
                    onChange={(e) => updateField("fullname", e.target.value)}
                  />
                </div>

                <div className="cp-row">
                  <div className="cp-field">
                    <label className="cp-label">Category</label>
                    <select
                      className="cp-select"
                      onChange={(e) => updateField("category", e.target.value)}
                    >
                      <option value="">Select</option>
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="cp-field">
                    <label className="cp-label">Mobile Number</label>
                    <input
                      className="cp-input"
                      placeholder="10-digit number"
                      type="tel"
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="cp-marks-divider">
                  <p className="cp-marks-title">Your IPMAT Scores</p>
                  <div className="cp-marks-row">
                    <div className="cp-field">
                      <label className="cp-label">QA (SA)</label>
                      <input
                        className="cp-input"
                        placeholder="0-60"
                        type="number"
                        min="0"
                        max="60"
                        onChange={(e) => updateField("sa", e.target.value)}
                      />
                    </div>
                    <div className="cp-field">
                      <label className="cp-label">QA (MCQ)</label>
                      <input
                        className="cp-input"
                        placeholder="0-120"
                        type="number"
                        min="0"
                        max="120"
                        onChange={(e) => updateField("qa", e.target.value)}
                      />
                    </div>
                    <div className="cp-field">
                      <label className="cp-label">Verbal (VA)</label>
                      <input
                        className="cp-input"
                        placeholder="0-180"
                        type="number"
                        min="0"
                        max="180"
                        onChange={(e) => updateField("va", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {error && <div className="cp-error">{error}</div>}

                <button
                  className="cp-btn"
                  onClick={() => TestApi(formData)}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="cp-spinner"></div>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="white"
                      />
                    </svg>
                  )}
                  {loading ? "Predicting..." : "Predict My Calls"}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── SEO Blog Section ── */}
        <div style={{ maxWidth: 800, margin: '60px auto 0', padding: '0 20px 60px', fontFamily: 'DM Sans, sans-serif', color: '#333', lineHeight: 1.75 }}>
          <article>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#833589', marginBottom: 8 }}>
              IPMAT Call Predictor 2026 — Know Your IIM Interview Chances Instantly
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: 20 }}>
              Updated for IPMAT Indore 2026 with RTI-confirmed cutoff data
            </p>

            <p>
              The <strong>IPMAT Call Predictor</strong> by IPM Careers is India's most accurate free tool that tells you which IIMs and top management colleges are likely to send you an interview call based on your IPMAT Indore scores. Whether you call it an <strong>IPM Call Predictor</strong> or an IPMAT college predictor, this tool uses real cutoff data across all reservation categories to give you reliable, instant results.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#5A2D62', marginTop: 28, marginBottom: 8 }}>How Does the IPMAT Call Predictor Work?</h3>
            <p>
              The predictor matches your sectional scores against actual admission cutoffs for each college. IPMAT Indore has three scored sections: QA Short Answer (out of 60), QA MCQ (out of 120), and Verbal Ability (out of 180), totalling 360 marks. Different colleges use different selection methods. IIM Indore checks all three sectional cutoffs independently. IIM Ranchi and IIM Shillong use a composite score based on total marks. IIM Sirmaur and IIM Amritsar use an Aptitude Test Score (ATS) formula that weights the sections differently. Our <strong>IPMAT Call Predictor 2026</strong> handles all of these methods automatically.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#5A2D62', marginTop: 28, marginBottom: 8 }}>Which Colleges Does the IPM Call Predictor Cover?</h3>
            <p>
              The <strong>IPM Call Predictor 2026</strong> covers every college that accepts IPMAT Indore scores for admission. This includes IIM Indore, IIM Ranchi, IIM Shillong, IIM Sirmaur, IIM Amritsar, IIM Sambalpur, Nirma University, IIFT Kakinada, NALSAR Hyderabad, TAPMI Manipal, Alliance University, Krea University (IFMR), LM Thapar School of Management, and NICMAR University. Cutoffs are updated with each admission cycle, so the results you see reflect the latest available data.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#5A2D62', marginTop: 28, marginBottom: 8 }}>Why Use This Tool Before Results Day?</h3>
            <p>
              Most IPMAT aspirants start panicking after the exam, wondering whether their scores are good enough. The <strong>IPMAT Call Predictor</strong> eliminates that uncertainty. Enter your expected scores right after the exam and get a realistic picture of where you stand. This helps you plan your PI preparation early and focus on colleges where you have a strong chance of getting shortlisted.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#5A2D62', marginTop: 28, marginBottom: 8 }}>Category-Wise Cutoff Predictions</h3>
            <p>
              Every prediction is category-specific. Whether you belong to General, EWS, OBC, SC, ST, or PwD category, the tool applies the correct cutoffs for your reservation group. This is critical because cutoffs can differ significantly across categories. For example, IIM Indore's General VA cutoff was 112 in 2025, while the ST cutoff was 48 — a difference of 64 marks.
            </p>
          </article>

          {/* ── FAQ Section with Schema ── */}
          <section style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#833589', marginBottom: 20 }}>
              Frequently Asked Questions — IPMAT Call Predictor
            </h2>
            {[
              { q: "What is the IPMAT Call Predictor?", a: "The IPMAT Call Predictor is a free tool by IPM Careers that predicts which IIMs and top management colleges are likely to call you for a personal interview based on your IPMAT Indore scores. It uses actual cutoff data across all reservation categories." },
              { q: "Is this IPM Call Predictor accurate?", a: "Yes. The IPM Call Predictor uses 2025 RTI-confirmed cutoff data for IIM Indore and verified cutoffs for other colleges. While cutoffs may shift slightly each year, the predictions are based on the most reliable available data." },
              { q: "How is the IPMAT Call Predictor 2026 different from last year?", a: "The IPMAT Call Predictor 2026 includes updated cutoffs, adds newly participating colleges like IIM Sambalpur (which started accepting IPMAT Indore from 2026), and uses the latest category-wise data from the 2025 admission cycle." },
              { q: "Which colleges accept IPMAT Indore scores?", a: "As of 2026, colleges accepting IPMAT Indore scores include IIM Indore, IIM Ranchi, IIM Shillong, IIM Sirmaur, IIM Amritsar, IIM Sambalpur, Nirma University, IIFT Kakinada, NALSAR Hyderabad, TAPMI Manipal, Alliance University, Krea University (IFMR), LM Thapar, and NICMAR University." },
              { q: "What scores do I need to enter in the IPM Call Predictor?", a: "You need to enter three scores: QA Short Answer (out of 60), QA MCQ (out of 120), and Verbal Ability (out of 180). The tool calculates your total (out of 360) and checks it against each college's cutoff criteria." },
              { q: "Can I use the IPMAT Call Predictor before results are out?", a: "Absolutely. You can enter your expected scores based on the answer key and get a prediction. This helps you start PI preparation early for colleges where you have a strong chance." },
              { q: "What is the ATS formula used by some IIMs?", a: "ATS (Aptitude Test Score) is used by IIM Sirmaur and IIM Amritsar. The formula is: 25% of (MCQ/120 x 100) + 25% of (SA/60 x 100) + 50% of (VA/180 x 100). It gives higher weight to Verbal Ability." },
              { q: "Is this tool free to use?", a: "Yes, the IPMAT Call Predictor is completely free. No login or payment required. Just enter your scores and get instant results." },
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
              { "@type": "Question", "name": "What is the IPMAT Call Predictor?", "acceptedAnswer": { "@type": "Answer", "text": "The IPMAT Call Predictor is a free tool by IPM Careers that predicts which IIMs and top management colleges are likely to call you for a personal interview based on your IPMAT Indore scores." }},
              { "@type": "Question", "name": "Is this IPM Call Predictor accurate?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. The IPM Call Predictor uses 2025 RTI-confirmed cutoff data for IIM Indore and verified cutoffs for other colleges." }},
              { "@type": "Question", "name": "How is the IPMAT Call Predictor 2026 different from last year?", "acceptedAnswer": { "@type": "Answer", "text": "The IPMAT Call Predictor 2026 includes updated cutoffs, adds newly participating colleges like IIM Sambalpur, and uses the latest category-wise data from the 2025 admission cycle." }},
              { "@type": "Question", "name": "Which colleges accept IPMAT Indore scores?", "acceptedAnswer": { "@type": "Answer", "text": "IIM Indore, IIM Ranchi, IIM Shillong, IIM Sirmaur, IIM Amritsar, IIM Sambalpur, Nirma University, IIFT Kakinada, NALSAR Hyderabad, TAPMI Manipal, Alliance University, Krea University (IFMR), LM Thapar, and NICMAR University." }},
              { "@type": "Question", "name": "What scores do I need to enter?", "acceptedAnswer": { "@type": "Answer", "text": "QA Short Answer (out of 60), QA MCQ (out of 120), and Verbal Ability (out of 180). The tool calculates your total out of 360." }},
              { "@type": "Question", "name": "Can I use the IPMAT Call Predictor before results are out?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Enter your expected scores based on the answer key and get a prediction to start PI preparation early." }},
              { "@type": "Question", "name": "What is the ATS formula?", "acceptedAnswer": { "@type": "Answer", "text": "ATS = 25% of (MCQ/120 x 100) + 25% of (SA/60 x 100) + 50% of (VA/180 x 100). Used by IIM Sirmaur and IIM Amritsar." }},
              { "@type": "Question", "name": "Is this tool free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, completely free. No login or payment required." }},
            ]
          }) }} />

          {/* ── WebApplication Schema ── */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "IPMAT Call Predictor 2026",
            "url": "https://register.ipmcareer.com/call",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "All",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
            "description": "Free IPMAT Call Predictor tool to check which IIMs will call you for interview based on your IPMAT Indore scores. Category-wise cutoff predictions for 14+ colleges.",
            "creator": { "@type": "Organization", "name": "IPM Careers", "url": "https://ipmcareer.com" }
          }) }} />
        </div>

      </AppShell>
    </>
  );
}

export default Call;

