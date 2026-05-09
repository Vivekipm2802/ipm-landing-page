import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";

const features = [
  { icon: "🎯", title: "AIR 1 Blueprint", desc: "The exact study system used by Nikhilesh Sanka — All India Rank 1 at IIM Indore IPM." },
  { icon: "📹", title: "Live + Recorded Classes", desc: "Daily live sessions for Quant and Verbal. All classes recorded for revision anytime." },
  { icon: "📝", title: "50+ Mock Tests", desc: "Full-length IPMAT, JIPMAT and IPMAT Rohtak mocks with detailed performance analytics." },
  { icon: "🧠", title: "Doubt Sessions", desc: "3x weekly doubt-clearing sessions. No question goes unanswered before the exam." },
  { icon: "📚", title: "Printed Study Material", desc: "Curated chapter-wise booklets for Quantitative Aptitude and Verbal Ability." },
  { icon: "👨‍🏫", title: "IIM Alumni Faculty", desc: "Learn directly from IIM-A alumni who have cracked IPMAT and now teach it professionally." },
];

const results = [
  { number: "1000+", label: "IIM Selections" },
  { number: "AIR 1", label: "Produced at IIM Indore" },
  { number: "10+", label: "Years of IPMAT Coaching" },
  { number: "3 Exams", label: "IPMAT · JIPMAT · Rohtak" },
];

const methodology = [
  { step: "01", title: "Quantitative Intuition, Not Memory", desc: "IPMAT Quant is not about formulas — it tests speed and pattern recognition. Our coaching builds intuition through 1,000+ concept-drill problems before touching mock tests." },
  { step: "02", title: "Verbal Ability Through Structure", desc: "Reading Comprehension and Grammar are trained using a structured elimination approach. Students consistently score 90th percentile+ on VA after our programme." },
  { step: "03", title: "Mock Test Analysis Protocol", desc: "Every mock has a 2-hour mandatory analysis session. We track error patterns, time distribution and topic-wise accuracy across the batch to course-correct early." },
  { step: "04", title: "Personalised Mentoring", desc: "Each student gets a personal mentor assigned in week 2. Weekly 1:1 check-ins track progress and flag underperforming areas before they become habits." },
];

const faqs = [
  { q: "What is IPMAT coaching and why is it important?", a: "IPMAT (Integrated Programme in Management Aptitude Test) is the entrance exam for IIM Indore's 5-year IPM programme. IPMAT coaching provides structured preparation, mock tests, and expert guidance that significantly increases selection probability. Most IIM IPM selections come from students who took structured coaching." },
  { q: "How is IPM Careers' IPMAT coaching different from other institutes?", a: "IPM Careers is the only IPMAT coaching institute founded by IIM-A alumni who have personally produced All India Rank 1 at IIM Indore. Our batch sizes are limited, faculty are domain experts (not generalists), and our mock test analytics system is built specifically for the IPMAT pattern." },
  { q: "Is IPMAT coaching necessary or can I self-study?", a: "Self-study is possible but statistically risky. IPMAT has a 1-2% selection rate. Structured IPMAT coaching gives you a curated syllabus, error-pattern tracking, timed mock practice, and the accountability of a batch — advantages that are difficult to replicate solo." },
  { q: "Which batches are available for IPMAT coaching 2027?", a: "IPM Careers offers a 12-month foundation batch for Class 11 students (IPMAT 2027 aspirants), a 6-month regular batch for Class 12 students, and a 4-month intensive crash course for repeaters. Call 8299470392 for current batch start dates." },
  { q: "Does IPM Careers offer IPMAT coaching for all three exams?", a: "Yes. Our IPMAT coaching programme covers IPMAT Indore, IPMAT Rohtak, and JIPMAT (IIM Jammu and IIM Bodhgaya) as a single integrated curriculum. One fee, three exam preparations." },
  { q: "Can Class 11 students join IPMAT coaching at IPM Careers?", a: "Yes — and it's strongly recommended. Starting IPMAT coaching in Class 11 gives students a 12-month window to build Quantitative Aptitude from fundamentals. Our Class 11 IPMAT foundation batch starts every June." },
  { q: "What is the typical result after completing IPM Careers' IPMAT coaching?", a: "Students who complete the full programme with consistent mock test participation achieve an average score increase of 40-60 points over their pre-coaching diagnostic. Over 1,000 students have secured IIM admissions through IPM Careers to date." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      "name": "IPMAT Coaching 2027 — IIM IPM Entrance Preparation",
      "description": "India's best IPMAT coaching for IIM Indore, IIM Rohtak and JIPMAT 2027. AIR 1 producing faculty, 50+ mock tests, live classes and personal mentoring.",
      "provider": { "@type": "EducationalOrganization", "name": "IPM Careers", "url": "https://register.ipmcareer.com/" },
      "url": "https://register.ipmcareer.com/ipmat-coaching",
      "educationalLevel": "Undergraduate Entrance Exam",
      "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "url": "https://register.ipmcareer.com/ipmat-coaching" }
    },
    {
      "@type": "FAQPage",
      "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    }
  ]
};

export default function IPMATCoachingPage() {
  const [form, setForm] = useState({ fullname: "", email: "", phone: "", year: "", city: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/contactEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "IPMAT Coaching Page" }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <Head>
        <title>IPMAT Coaching 2027 | Best IPMAT Coaching Institute | IPM Careers</title>
        <meta name="description" content="India's best IPMAT coaching for IIM Indore, Rohtak and JIPMAT 2027. AIR 1 producing faculty, 50+ mock tests, live classes. 1,000+ IIM selections. Enrol now." />
        <meta name="keywords" content="IPMAT coaching, best IPMAT coaching, IPMAT coaching 2027, IPMAT coaching institute, IIM IPM coaching, IPMAT coaching online, IPMAT preparation, IPM coaching" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://register.ipmcareer.com/ipmat-coaching" />
        <meta property="og:title" content="IPMAT Coaching 2027 | Best IPMAT Coaching Institute | IPM Careers" />
        <meta property="og:description" content="India's best IPMAT coaching. AIR 1 producing faculty. 1,000+ IIM selections. Live classes, 50+ mock tests." />
        <meta property="og:url" content="https://register.ipmcareer.com/ipmat-coaching" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://register.ipmcareer.com/ipm.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <div className="min-h-screen bg-[#07090F] text-white font-sans">

        {/* NAV */}
        <nav className="fixed top-0 left-0 right-0 z-30 border-b border-slate-800/50 bg-[#07090F]/95 backdrop-blur-md h-16 flex items-center justify-between px-6 md:px-12">
          <a href="https://ipmcareer.com">
            <img src="https://register.ipmcareer.com/whitelogoipm.svg" alt="IPM Careers — IPMAT Coaching" className="h-10 w-auto" />
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="https://www.ipmcareer.com/courses/" className="hover:text-white transition-colors">Courses</a>
            <a href="https://register.ipmcareer.com/air1commandcenter" className="hover:text-white transition-colors">Free Resources</a>
            <a href="https://www.ipmcareer.com/ipmat-2025-selection/" className="hover:text-white transition-colors">Results</a>
            <a href="tel:8299470392" className="bg-[#F9A01B] text-[#07090F] font-black px-5 py-2 rounded-full text-sm hover:bg-amber-400 transition-colors">Call Now</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F9A01B]/10 border border-[#F9A01B]/20 text-[#F9A01B] text-xs font-black uppercase tracking-widest mb-8">
                🏆 India's #1 IPMAT Coaching Institute
              </div>
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-serif font-black mb-6 leading-[1.0] tracking-tighter">
                IPMAT Coaching<br />
                <span className="text-[#F9A01B] italic">for IIM IPM 2027</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
                The only IPMAT coaching institute built by IIM-A alumni who have produced <strong className="text-white">All India Rank 1</strong> at IIM Indore. 1,000+ IIM selections and counting.
              </p>
              <div className="flex flex-wrap gap-6 mb-10">
                {results.map(r => (
                  <div key={r.label}>
                    <p className="text-2xl font-black text-[#F9A01B]">{r.number}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{r.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <a href="#enrol" className="bg-[#F9A01B] text-[#07090F] font-black px-8 py-4 rounded-full text-base hover:bg-amber-400 transition-all hover:scale-105">
                  Enrol in IPMAT Coaching →
                </a>
                <a href="tel:8299470392" className="border border-slate-700 text-slate-300 font-semibold px-8 py-4 rounded-full text-base hover:border-[#F9A01B] hover:text-[#F9A01B] transition-colors">
                  Call: 8299470392
                </a>
              </div>
            </div>

            {/* FORM */}
            <div id="enrol" className="bg-[#0F1117] border border-slate-800 rounded-3xl p-8">
              <p className="text-[#F9A01B] font-black uppercase tracking-widest text-xs mb-2">Free Counselling Session</p>
              <h2 className="text-2xl font-bold text-white mb-6">Book Your IPMAT Coaching Slot</h2>
              {status === "success" ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-white font-bold text-xl mb-2">We'll call you within 2 hours</p>
                  <p className="text-slate-400">Our counsellor will discuss the right IPMAT coaching batch for you.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input required value={form.fullname} onChange={e => setForm({...form, fullname: e.target.value})} placeholder="Full Name *" className="w-full bg-[#07090F] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#F9A01B] focus:outline-none transition-colors" />
                  <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone Number *" className="w-full bg-[#07090F] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#F9A01B] focus:outline-none transition-colors" />
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email Address *" className="w-full bg-[#07090F] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#F9A01B] focus:outline-none transition-colors" />
                  <select value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="w-full bg-[#07090F] border border-slate-700 rounded-xl px-4 py-3 text-slate-400 focus:border-[#F9A01B] focus:outline-none transition-colors">
                    <option value="">Currently in Class...</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11 (IPMAT 2027)</option>
                    <option value="Class 12">Class 12 (IPMAT 2026)</option>
                    <option value="Dropper">Dropper / Repeater</option>
                  </select>
                  <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City" className="w-full bg-[#07090F] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#F9A01B] focus:outline-none transition-colors" />
                  <button type="submit" disabled={status === "submitting"} className="w-full bg-[#F9A01B] text-[#07090F] font-black py-4 rounded-xl text-base hover:bg-amber-400 transition-all disabled:opacity-60">
                    {status === "submitting" ? "Booking..." : "Book Free Counselling →"}
                  </button>
                  <p className="text-xs text-slate-600 text-center">No spam. Our counsellor will call within 2 hours.</p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* WHAT'S INCLUDED */}
        <section className="py-20 bg-[#05070a] px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#F9A01B] font-black uppercase tracking-widest text-xs mb-3">Everything You Need</p>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-white">What's Inside Our<br /><span className="text-[#F9A01B] italic">IPMAT Coaching Programme</span></h2>
              <p className="text-slate-400 mt-4 max-w-2xl mx-auto">A complete end-to-end system — from Day 1 of Class 11 to the day of the IPMAT exam.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(f => (
                <div key={f.title} className="bg-[#0F1117] border border-slate-800 rounded-2xl p-6 hover:border-[#F9A01B]/30 transition-colors">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* METHODOLOGY */}
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#F9A01B] font-black uppercase tracking-widest text-xs mb-3">The IPM Careers Way</p>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-white">IPMAT Coaching<br /><span className="text-[#F9A01B] italic">Methodology</span></h2>
            </div>
            <div className="space-y-6">
              {methodology.map(m => (
                <div key={m.step} className="flex gap-6 items-start border border-slate-800 rounded-2xl p-6 bg-[#0A0C14]">
                  <div className="text-4xl font-black text-[#F9A01B]/30 font-serif flex-shrink-0 w-12">{m.step}</div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">{m.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO CONTENT BLOCK */}
        <section className="py-16 px-6 md:px-12 bg-[#05070a]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-black text-white mb-6">Why Serious IPMAT Aspirants Choose Structured Coaching</h2>
            <div className="text-slate-400 space-y-4 leading-relaxed">
              <p>IPMAT is among the most competitive undergraduate entrance exams in India — with roughly 50,000+ applicants competing for fewer than 150 General category seats at IIM Indore alone. A selection rate under 0.3% means preparation strategy matters as much as raw intelligence.</p>
              <p>Structured <strong className="text-slate-300">IPMAT coaching</strong> provides a calibrated preparation path that self-study cannot replicate. Mock test analytics track your performance against a competitive batch, not just a static answer key. Faculty intervention corrects conceptual errors before they become patterns. And the accountability of a scheduled batch keeps preparation consistent through the distractions of Class 11 and Class 12.</p>
              <p>IPM Careers' <strong className="text-slate-300">IPMAT coaching programme</strong> is built around one principle: Quantitative Intuition beats memory. The exam rewards students who can solve unfamiliar problems under time pressure — not those who have memorised the most formulas. Our curriculum systematically develops this intuition through structured problem-solving drills, timed sectional practice, and comprehensive mock test analysis.</p>
              <p>The result: over 1,000 students have secured seats at IIM Indore, IIM Rohtak, IIM Jammu, IIM Bodhgaya and other top institutions through our coaching. Our All India Rank 1 at IIM Indore is a proof of system, not luck.</p>
            </div>
            <div className="mt-8 p-6 border border-[#F9A01B]/20 rounded-2xl bg-[#F9A01B]/5">
              <p className="text-[#F9A01B] font-bold mb-2">Also see:</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="/ipmat-online-coaching" className="text-slate-300 hover:text-[#F9A01B] transition-colors underline">IPMAT Online Coaching →</a>
                <a href="/air1commandcenter/forms" className="text-slate-300 hover:text-[#F9A01B] transition-colors underline">IPMAT Application Forms 2027 →</a>
                <a href="/air1commandcenter/pyq" className="text-slate-300 hover:text-[#F9A01B] transition-colors underline">Free IPMAT PYQs →</a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#F9A01B] font-black uppercase tracking-widest text-xs mb-3">Got Questions?</p>
              <h2 className="text-4xl font-serif font-black text-white">IPMAT Coaching — <span className="text-[#F9A01B] italic">FAQs</span></h2>
            </div>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <details key={i} className="group border border-slate-800 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-semibold list-none hover:bg-[#0F1117] transition-colors">
                    <span>{f.q}</span>
                    <span className="ml-4 text-[#F9A01B] text-xl font-light group-open:rotate-45 transition-transform duration-200 flex-shrink-0">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-400 leading-relaxed text-sm">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 px-6 md:px-12 bg-[#F9A01B]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-serif font-black text-[#07090F] leading-tight mb-6">Start Your IPMAT<br />Coaching Today.</h2>
            <p className="text-[#07090F]/70 text-xl mb-10 font-medium">Limited seats per batch. Early enrolment = more mock tests + more improvement time.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#enrol" className="bg-[#07090F] text-white font-black px-10 py-5 rounded-full text-lg hover:bg-slate-800 transition-colors">Enrol in IPMAT Coaching →</a>
              <a href="tel:8299470392" className="border-2 border-[#07090F] text-[#07090F] font-black px-10 py-5 rounded-full text-lg hover:bg-[#07090F]/10 transition-colors">📞 8299470392</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-10 px-6 md:px-12 bg-[#05070a] border-t border-slate-800 text-center">
          <p className="text-slate-600 text-sm">© 2025 IPM Careers | <a href="https://ipmcareer.com" className="text-slate-500 hover:text-[#F9A01B]">ipmcareer.com</a> | <a href="/ipmat-online-coaching" className="text-slate-500 hover:text-[#F9A01B]">IPMAT Online Coaching</a> | <a href="/air1commandcenter" className="text-slate-500 hover:text-[#F9A01B]">Free Resources</a></p>
        </footer>

      </div>
    </>
  );
}
