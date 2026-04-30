import { useEffect, useRef, useState } from "react";
import Timer from "../components/Timer";
import st from "./TestPredictor.module.css";
import Head from "next/head";
import { NextSeo } from "next-seo";
import Marquee from "react-fast-marquee";
import axios from "axios";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";
import "tailwindcss/tailwind.css";
import Confetti from "../components/CanvasCofetti";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .cp-root * { box-sizing: border-box; }
  .cp-root {
    font-family: 'DM Sans', sans-serif;
    background: #FAF5FB;
    color: #1a0a1e;
    min-height: 100vh;
  }
  .cp-hero {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
  @media (max-width: 768px) {
    .cp-hero { grid-template-columns: 1fr; }
    .cp-right { display: none; }
  }
  .cp-left {
    padding: 48px 40px 60px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
  }
  .cp-right {
    background: #F3E8F5;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    border-left: 1px solid #E5C9EA;
  }
  .cp-logo { width: 120px; margin-bottom: 32px; }
  .cp-eyebrow {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #833589;
    margin-bottom: 12px;
  }
  .cp-heading {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 800;
    line-height: 1.05;
    color: #1a0a1e;
    margin: 0 0 8px;
  }
  .cp-heading span { color: #833589; }
  .cp-subheading {
    font-size: 15px;
    color: #6B4D72;
    margin-bottom: 28px;
    line-height: 1.6;
  }
  .cp-counter {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #F0E0F4;
    border: 1px solid #D9B3E0;
    border-radius: 100px;
    padding: 8px 16px;
    font-size: 13px;
    color: #6B4D72;
    margin-bottom: 28px;
    width: fit-content;
  }
  .cp-counter strong { color: #833589; }
  .cp-counter-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #833589;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .cp-form { display: flex; flex-direction: column; gap: 14px; }
  .cp-field { display: flex; flex-direction: column; gap: 6px; }
  .cp-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    color: #833589;
    text-transform: uppercase;
  }
  .cp-input, .cp-select {
    background: #FFFFFF;
    border: 1.5px solid #E5C9EA;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 14px;
    color: #1a0a1e;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
    appearance: none;
  }
  .cp-input:focus, .cp-select:focus {
    border-color: #833589;
    box-shadow: 0 0 0 3px rgba(131,53,137,0.1);
  }
  .cp-input::placeholder { color: #C9A0D0; }
  .cp-select option { background: #fff; color: #1a0a1e; }
  .cp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .cp-marks-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .cp-marks-divider {
    border-top: 1.5px solid #E5C9EA;
    padding-top: 14px;
  }
  .cp-marks-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    color: #833589;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .cp-error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #DC2626;
  }
  .cp-btn {
    background: #833589;
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 16px 24px;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: transform 0.15s, box-shadow 0.15s;
    margin-top: 4px;
    box-shadow: 0 4px 14px rgba(131,53,137,0.25);
  }
  .cp-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(131,53,137,0.35);
  }
  .cp-btn:active { transform: translateY(0); }
  .cp-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
  .cp-btn-secondary {
    background: #fff;
    border: 1.5px solid #E5C9EA;
    color: #833589;
    box-shadow: none;
  }
  .cp-btn-secondary:hover {
    border-color: #833589;
    background: #FAF5FB;
    box-shadow: none;
  }

  /* Results */
  .cp-results { padding: 0; }
  .cp-results-header { margin-bottom: 20px; }
  .cp-congrats {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: #1a0a1e;
    line-height: 1.3;
    margin-bottom: 4px;
  }
  .cp-congrats-sub { font-size: 14px; color: #6B4D72; }
.cp-college-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}
@media (max-width: 500px) {
  .cp-college-grid { grid-template-columns: 1fr; }
}
.cp-college-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  background: #FFFFFF;
  border: 1.5px solid #E5C9EA;
  border-radius: 14px;
  padding: 14px;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  animation: slideIn 0.4s ease forwards;
  opacity: 0;
}
.cp-college-img {
  width: 100%;
  height: 110px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background: #F0E0F4;
}
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .cp-college-card:hover {
    border-color: #833589;
    transform: translateX(4px);
    box-shadow: 0 2px 12px rgba(131,53,137,0.1);
  }

  .cp-college-name {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #1a0a1e;
    margin-bottom: 2px;
  }
  .cp-college-loc { font-size: 12px; color: #6B4D72; }
.cp-college-badge {
  background: #F0E0F4;
  border: 1px solid #D9B3E0;
  border-radius: 100px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #833589;
  white-space: nowrap;
  align-self: flex-start;  /* change from margin-left: auto */
}
  .cp-no-result { text-align: center; padding: 32px 16px; }
  .cp-no-result img { width: 80px; margin-bottom: 16px; }
  .cp-no-result h2 {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 700;
    color: #1a0a1e; margin-bottom: 8px;
  }
  .cp-no-result p { font-size: 14px; color: #6B4D72; line-height: 1.6; }

  /* Right panel */
  .cp-right-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 48px 0 0;
  }
  .cp-right-title {
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #B07AB8;
    padding: 0 32px;
    margin-bottom: 24px;
  }
  .cp-images-col {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 12px;
    mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  }
  .cp-marquee-img {
    height: 90px;
    width: 130px;
    object-fit: cover;
    border-radius: 12px;
    margin-right: 12px;
    flex-shrink: 0;
    border: 1px solid #E5C9EA;
  }
  .cp-promo {
    background: linear-gradient(135deg, #833589, #A855B5);
    border-radius: 16px;
    padding: 24px;
    margin: 24px;
    position: relative;
    overflow: hidden;
  }
  .cp-promo::before {
    content: '';
    position: absolute;
    top: -20px; right: -20px;
    width: 100px; height: 100px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
  }
  .cp-promo h2 {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 800;
    color: #fff; margin-bottom: 4px;
  }
  .cp-promo p { font-size: 13px; color: rgba(255,255,255,0.85); margin-bottom: 14px; }
  .cp-promo a {
    display: inline-block;
    background: #fff;
    color: #833589;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 13px;
    padding: 8px 18px;
    border-radius: 100px;
    text-decoration: none;
  }
  .cp-spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .cp-hero-results {
  grid-template-columns: 1fr !important;
}
.cp-hero-results .cp-right {
  display: none !important;
}
.cp-hero-results .cp-left {
  max-width: 860px;
  margin: 0 auto;
  width: 100%;
}
.cp-hero-results .cp-college-grid {
  grid-template-columns: 1fr 1fr 1fr;
}
@media (max-width: 768px) {
  .cp-hero-results .cp-college-grid {
    grid-template-columns: 1fr 1fr;
  }
}
`;

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
  const genders = [
    { value: "male", title: "Male" },
    { value: "female", title: "Female" },
    { value: "nos", title: "Prefer not to say" },
  ];

  const collegesData = {
    "IIM Indore": {
      title: "IIM Indore",
      location: "Indore, Madhya Pradesh",
      // Wikimedia Commons - confirmed working
     picture: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/IIM_Indore_pano.jpg/1200px-IIM_Indore_pano.jpg",
    },
    "IIM Rohtak": {
      title: "IIM Rohtak",
      location: "Rohtak, Haryana",
      picture: "https://images.collegedunia.com/public/college_data/images/appImage/1498036347IIM_Ranchi.jpg",
    },
    "IIM Ranchi": {
      title: "IIM Ranchi",
      location: "Ranchi, Jharkhand",
      // Wikimedia Commons - confirmed filename
      picture:
        "https://commons.wikimedia.org/wiki/Special:FilePath/IIM_Ranchi_academic_building.JPG",
    },
    "IIM Jammu": {
      title: "IIM Jammu",
      location: "Jammu, J&K",
      picture:
        "https://commons.wikimedia.org/wiki/Special:FilePath/IIM_Jammu.jpg",
    },
    "IIM Bodh Gaya": {
      title: "IIM Bodh Gaya",
      location: "Bodh Gaya, Bihar",
      picture:
        "https://commons.wikimedia.org/wiki/Special:FilePath/IIM_Bodh_Gaya.jpg",
    },
    "IIM Sirmaur": {
      title: "IIM Sirmaur",
      location: "Sirmaur, Himachal Pradesh",
      // Wikimedia Commons - confirmed filename
      picture:
        "https://commons.wikimedia.org/wiki/Special:FilePath/IIM_Sirmaur_Permanent_Campus.jpg",
    },
    "IIM Sambalpur": {
      title: "IIM Sambalpur",
      location: "Sambalpur, Odisha",
      picture:
        "https://commons.wikimedia.org/wiki/Special:FilePath/IIM_Sambalpur.jpg",
    },
    NALSAR: {
      title: "NALSAR University",
      location: "Hyderabad, Telangana",
      picture:
        "https://www.indcareer.com/files/notices/2015-03/nalsar-university-law-hyderabad.jpg", // already working
    },
    IIFT: {
      title: "IIFT Delhi",
      location: "Multiple Locations",
      picture:
        "https://images.collegedunia.com/public/college_data/images/appImage/25453_IIFTD_NEW.jpg", // already working
    },
    NIRMA: {
      title: "NIRMA University",
      location: "Ahmedabad, Gujarat",
      picture:
        "https://nirmawebsite.s3.ap-south-1.amazonaws.com/wp-content/uploads/2022/07/Homepage-NU-950x732.jpg", // already working
    },
    TAPMI: {
      title: "TAPMI Manipal",
      location: "Manipal, Karnataka",
      picture:
        "https://images.collegedunia.com/public/college_data/images/appImage/1502449284tapmi.jpg",
    },
    "Christ University": {
      title: "Christ University",
      location: "Bangalore, Karnataka",
      // Wikimedia Commons - confirmed filename
      picture:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Christ_University%2C_Bangalore%2C_main_campus.jpg",
    },
  };

  const images = [
    "/7dr.png",
    "/1dr_1.png",
    "/3dr.png",
    "/4dr.png",
    "/6dr.png",
    "https://www.ipmcareer.com/wp-content/uploads/2024/03/coppred.png",
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
  function validateEmail(email) {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      String(email).toLowerCase(),
    );
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
      email: a.email,
      phone: a.phone,
      gender: a.gender,
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
    if (!a.gender) {
      setError("Please select your gender.");
      return;
    }
    if (!a.phone || !validatePhone(a.phone)) {
      setError("Enter a valid 10-digit mobile number (no country code).");
      return;
    }
    if (!a.email || !validateEmail(a.email)) {
      setError("Enter a valid email address.");
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
      cronberryTrigger(
        a.fullname,
        a.email,
        a.phone,
        "Not Specified",
        "https://register.ipmcareer.com/call",
      );
      setData(response?.data?.colleges);
      if (response?.data?.colleges?.length > 0) {
        setIsVisible(true);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 500);
      }
    } catch (e) {}
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

      <div className="cp-root">
        <div className={`cp-hero${data ? " cp-hero-results" : ""}`}>
          {/* LEFT PANEL */}
          <div className="cp-left" ref={scrolldiv}>
            <img src="/hd-logo.svg" className="cp-logo" alt="IPM Careers" />

            {!data ? (
              <>
                <p className="cp-eyebrow">Free Tool · AI Powered</p>
                <h1 className="cp-heading">
                  IPMAT
                  <br />
                  <span>Call Predictor</span>
                </h1>
                <p className="cp-subheading">
                  Enter your scores and profile to instantly find out which IIMs
                  and top colleges are likely to call you for admission.
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
                      placeholder="e.g. Rahul Sharma"
                      type="text"
                      onChange={(e) => updateField("fullname", e.target.value)}
                    />
                  </div>

                  <div className="cp-row">
                    <div className="cp-field">
                      <label className="cp-label">Category</label>
                      <select
                        className="cp-select"
                        onChange={(e) =>
                          updateField("category", e.target.value)
                        }
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
                      <label className="cp-label">Gender</label>
                      <select
                        className="cp-select"
                        onChange={(e) => updateField("gender", e.target.value)}
                      >
                        <option value="">Select</option>
                        {genders.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="cp-row">
                    <div className="cp-field">
                      <label className="cp-label">Mobile Number</label>
                      <input
                        className="cp-input"
                        placeholder="10-digit number"
                        type="tel"
                        onChange={(e) => updateField("phone", e.target.value)}
                      />
                    </div>
                    <div className="cp-field">
                      <label className="cp-label">Email Address</label>
                      <input
                        className="cp-input"
                        placeholder="you@email.com"
                        type="email"
                        onChange={(e) => updateField("email", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="cp-marks-divider">
                    <p className="cp-marks-title">Your IPMAT Scores</p>
                    <div className="cp-marks-row">
                      <div className="cp-field">
                        <label className="cp-label">QA (MCQ)</label>
                        <input
                          className="cp-input"
                          placeholder="0–100"
                          type="number"
                          min="0"
                          max="100"
                          onChange={(e) => updateField("qa", e.target.value)}
                        />
                      </div>
                      <div className="cp-field">
                        <label className="cp-label">QA (SA)</label>
                        <input
                          className="cp-input"
                          placeholder="0–100"
                          type="number"
                          min="0"
                          max="100"
                          onChange={(e) => updateField("sa", e.target.value)}
                        />
                      </div>
                      <div className="cp-field">
                        <label className="cp-label">Verbal (VA)</label>
                        <input
                          className="cp-input"
                          placeholder="0–100"
                          type="number"
                          min="0"
                          max="100"
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
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                          fill="white"
                        />
                      </svg>
                    )}
                    {loading ? "Predicting..." : "Predict My Calls"}
                  </button>
                </div>
              </>
            ) : (
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
                    return (
                      <div
                        className="cp-college-card"
                        key={name}
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <img
                          className="cp-college-img"
                          src={c.picture}
                          alt={c.title}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/50x50/F0E0F4/833589?text=IIM";
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div className="cp-college-name">{c.title}</div>
                          <div className="cp-college-loc">📍 {c.location}</div>
                        </div>
                        <div className="cp-college-badge">Likely Call</div>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="cp-promo"
                  style={{ margin: "0 0 16px", borderRadius: 14 }}
                >
                  <h2>Special PI Batch</h2>
                  <p>Ace your IPMAT Personal Interview with expert guidance.</p>
                  <a href="https://register.ipmcareer.com/pi-batch">
                    Enroll Now @ ₹99 →
                  </a>
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
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="cp-right">
            <div className="cp-right-inner">
              <p className="cp-right-title">Featured in</p>
              <div className="cp-images-col">
                <Marquee autoFill speed={40} gradient={false} direction="left">
                  {images.map((i, d) => (
                    <img key={d} src={i} className="cp-marquee-img" alt="" />
                  ))}
                </Marquee>
                <Marquee autoFill speed={30} gradient={false} direction="right">
                  {images.map((i, d) => (
                    <img key={d} src={i} className="cp-marquee-img" alt="" />
                  ))}
                </Marquee>
                <Marquee autoFill speed={50} gradient={false} direction="left">
                  {images.map((i, d) => (
                    <img key={d} src={i} className="cp-marquee-img" alt="" />
                  ))}
                </Marquee>
                <Marquee autoFill speed={35} gradient={false} direction="right">
                  {images.map((i, d) => (
                    <img key={d} src={i} className="cp-marquee-img" alt="" />
                  ))}
                </Marquee>
              </div>
              <div className="cp-promo">
                <h2>Special PI Batch</h2>
                <p>Ace your IPMAT Personal Interview with expert guidance.</p>
                <a href="https://register.ipmcareer.com/pi-batch">
                  Enroll Now @ ₹99 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Call;
