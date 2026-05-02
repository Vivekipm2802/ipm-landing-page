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

  async function getCount() {
    const { data, error } = await supabase
      .from("predictor")
      .select("id", { count: "exact", head: false });
    if (data) setCount(550 + data.length);
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
          title="IPMAT Call Predictor - Best & Easy to Use Predictor"
          description="IPMAT Call Predictor is a tool for IPMAT Aspirants to analyse their profile and explore their chances of landing an admission in IIM or equivalent colleges."
          canonical="https://register.ipmcareer.com/call"
          openGraph={{
            url: "https://register.ipmcareer.com/call",
            title: "IPMAT Call Predictor - Best & Easy to Use Predictor",
            description: "IPMAT Call Predictor for IIM admissions.",
            images: [
              {
                url: "/callpred.jpg",
                width: 1200,
                height: 630,
                alt: "IPMAT Call Predictor",
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
                    {data.map((name, idx) => {
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
        title="IPMAT Call Predictor - Best & Easy to Use Predictor"
        description="IPMAT Call Predictor is a tool for IPMAT Aspirants to analyse their profile and explore their chances of landing an admission in IIM or equivalent colleges."
        canonical="https://register.ipmcareer.com/call"
        openGraph={{
          url: "https://register.ipmcareer.com/call",
          title: "IPMAT Call Predictor - Best & Easy to Use Predictor",
          description: "IPMAT Call Predictor for IIM admissions.",
          images: [
            {
              url: "/callpred.jpg",
              width: 1200,
              height: 630,
              alt: "IPMAT Call Predictor",
            },
          ],
        }}
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
      </AppShell>
    </>
  );
}

export default Call;
