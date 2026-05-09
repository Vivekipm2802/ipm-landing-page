import React, { useState } from "react";
import Head from "next/head";

const onlineFeatures = [
  { icon: "🔴", title: "Daily Live Classes", desc: "Scheduled live sessions on Zoom/Google Meet for Quant and Verbal. Interact with faculty in real time — not passive video watching." },
  { icon: "🎬", title: "All Classes Recorded", desc: "Missed a session? Every live class is recorded and available within 2 hours. Study at your own pace without missing content." },
  { icon: "💬", title: "WhatsApp Doubt Groups", desc: "Dedicated chapter-wise doubt groups. Post a question, get an answer from faculty within 3 hours — even on weekends." },
  { icon: "📊", title: "Performance Dashboard", desc: "Real-time analytics on mock tests — section-wise accuracy, time spent per question, rank within the batch." },
  { icon: "📱", title: "Mobile + Desktop Access", desc: "Study from any device. All resources — notes, recordings, mock tests — accessible via browser. No app download needed." },
  { icon: "🗓️", title: "Flexible Batch Timing", desc: "Morning and evening batch slots to accommodate Class 11 and Class 12 school schedules." },
];

const comparison = [
  { aspect: "Faculty Quality", online: "Same IIM-A alumni faculty", offline: "Same IIM-A alumni faculty" },
  { aspect: "Mock Tests", online: "50+ full-length mocks", offline: "50+ full-length mocks" },
  { aspect: "Study Material", online: "Digital + courier printed", offline: "Printed, in-person" },
  { aspect: "Doubt Solving", online: "WhatsApp + live sessions", offline: "In-class + WhatsApp" },
  { aspect: "Flexibility", online: "✅ Study from anywhere", offline: "Fixed location" },
  { aspect: "Recordings", online: "✅ All classes recorded", offline: "Not available" },
  { aspect: "Best For", online: "Pan-India / Tier 2-3 cities", offline: "Local students" },
];

const howItWorks = [
  { step: "1", title: "Enrol & Get Access", desc: "Complete enrolment, receive your login credentials, WhatsApp group invite, and printed study material (couriered to your address within 5 days)." },
  { step: "2", title: "Attend Live Classes Daily", desc: "Join the scheduled live sessions. Ask questions in real time. All sessions recorded automatically — nothing is missed." },
  { step: "3", title: "Take Weekly Mock Tests", desc: "Every Saturday, a full IPMAT mock test. Sunday: 2-hour batch analysis session with faculty to review every section's mistakes." },
  { step: "4", title: "Doubt Clearance & Mentoring", desc: "3x weekly doubt sessions online. Monthly 1:1 with your personal mentor to review progress and adjust the study plan." },
];

const faqs = [
  { q: "Are the IPMAT online coaching classes live or recorded?", a: "Both. IPM Careers' IPMAT online coaching runs daily live sessions — scheduled batches with real-time interaction. Every live class is also automatically recorded and available within 2 hours for students who need to revise or missed the session." },
  { q: "What technology or device do I need for IPMAT online coaching?", a: "A laptop or desktop with a stable internet connection (minimum 4 Mbps) is ideal. Mobile works for recordings and doubt sessions. Live classes work on any device with Zoom or Google Meet installed. No paid software is required." },
  { q: "How are doubts resolved in the online coaching format?", a: "IPM Careers has chapter-wise WhatsApp doubt groups monitored by faculty. Doubts are typically answered within 3 hours. Additionally, 3x weekly live doubt sessions are held online where students can ask questions directly to faculty." },
  { q: "Is IPMAT online coaching suitable for students in Tier 2 and 3 cities?", a: "Yes — this is the primary advantage of online coaching. Students from any city in India get the same faculty quality, mock tests, and study material as students in metro cities. IPM Careers has produced IIM selections from 50+ cities across India through online coaching." },
  { q: "Can I access recordings if I miss a live class?", a: "Yes. Every live session is recorded and uploaded to the student portal within 2 hours of the class ending. Recordings are available for the entire duration of your course — you can rewatch any session as many times as needed." },
  { q: "What is the difference between IPMAT online coaching and offline coaching at IPM Careers?", a: "The faculty, mock tests, curriculum and study material are identical in both modes. The key difference is delivery format: online coaching gives you flexibility (any device, any location, recorded backups), while offline coaching is location-specific. Most students outside Kanpur opt for the online mode." },
  { q: "How many students are in an IPMAT online coaching batch?", a: "IPM Careers deliberately limits batch sizes to ensure individual attention. Online batches have a maximum of 35-40 students per session. This allows faculty to track each student's progress and intervene early when performance dips." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      "name": "IPMAT Online Coaching 2027 — Live Classes from Home",
      "description": "IPMAT online coaching with daily live classes, 50+ mock tests, recorded sessions and WhatsApp doubt support. Prepare for IIM Indore IPM, Rohtak and JIPMAT 2027 from anywhere in India.",
      "provider": { "@type": "EducationalOrganization", "name": "IPM Careers", "url": "https://register.ipmcareer.com/" },
      "url": "https://register.ipmcareer.com/ipmat-online-coaching",
      "educationalLevel": "Undergraduate Entrance Exam",
      "deliveryFormat": "OnlineEventAttendanceMode",
      "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "url": "https://register.ipmcareer.com/ipmat-online-coaching" }
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

export default function IPMATOnlineCoachingPage() {
  const [form, setForm] = useState({ fullname: "", email: "", phone: "", year: "", city: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/contactEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "IPMAT Online Coaching Page" }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <Head>
        <title>IPMAT Online Coaching 2027 | Live Classes from Home | IPM Careers</title>
        <meta name="description" content="IPMAT online coaching with daily live classes, 50+ mock tests and WhatsApp doubt support. Prepare for IIM Indore IPM 2027 from anywhere in India. AIR 1 faculty." />
        <meta name="keywords" content="IPMAT online coaching, IPMAT online coaching 2027, IPM online coaching, IPMAT online preparation, online IPMAT classes, IPMAT online course, best IPMAT online coaching" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://register.ipmcareer.com/ipmat-online-coaching" />
        <meta property="og:title" content="IPMAT Online Coaching 2027 | Live Classes | IPM Careers" />
        <meta property="og:description" content="IPMAT online coaching — daily live classes, 50+ mocks, WhatsApp doubts. Prepare from anywhere. IIM Indore IPM 2027." />
        <meta property="og:url" content="https://register.ipmcareer.com/ipmat-online-coaching" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://register.ipmcareer.com/ipm.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <div className="min-h-screen bg-[#07090F] text-white font-sans">

        {/* NAV */}
        <nav className="fixed top-0 left-0 right-0 z-30 border-b border-slate-800/50 bg-[#07090F]/95 backdrop-blur-md h-16 flex items-center justify-between px-6 md:px-12">
          <a href="https://ipmcareer.com">
            <img src="https://register.ipmcareer.com/whitelogoipm.svg" alt="IPM Careers — IPMAT Online Coaching" className="h-10 w-auto" />
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="https://www.ipmcareer.com/courses/" className="hover:text-white transition-colors">Courses</a>
            <a href="/ipmat-coaching" className="hover:text-white transition-colors">IPMAT Coaching</a>
            <a href="https://register.ipmcareer.com/air1commandcenter" className="hover:text-white transition-colors">Free Resources</a>
            <a href="tel:8299470392" className="bg-[#F9A01B] text-[#07090F] font-black px-5 py-2 rounded-full text-sm hover:bg-amber-400 transition-colors">Call Now</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F9A01B]/10 border border-[#F9A01B]/20 text-[#F9A01B] text-xs font-black uppercase tracking-widest mb-8">
                🌐 Prepare from Anywhere in India
              </div>
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-serif font-black mb-6 leading-[1.0] tracking-tighter">
                IPMAT Online<br />
                <span className="text-[#F9A01B] italic">Coaching 2027</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
                Daily live classes. 50+ mock tests. WhatsApp doubt support. Everything you need to crack IPMAT — from your room, anywhere in India.
              </p>
              <div className="flex flex-wrap gap-4 mb-10 text-sm">
                {["Daily Live Classes", "Recorded Backups", "50+ Mock Tests", "WhatsApp Doubts", "AIR 1 Faculty", "Pan-India"].map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-[#0F1117] border border-slate-700 text-slate-300">{tag}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <a href="#enrol" className="bg-[#F9A01B] text-[#07090F] font-black px-8 py-4 rounded-full text-base hover:bg-amber-400 transition-all hover:scale-105">
                  Join Online Coaching →
                </a>
                <a href="tel:8299470392" className="border border-slate-700 text-slate-300 font-semibold px-8 py-4 rounded-full text-base hover:border-[#F9A01B] hover:text-[#F9A01B] transition-colors">
                  Call: 8299470392
                </a>
              </div>
            </div>

            {/* FORM */}
            <div id="enrol" className="bg-[#0F1117] border border-slate-800 rounded-3xl p-8">
              <p className="text-[#F9A01B] font-black uppercase tracking-widest text-xs mb-2">Get a Free Demo Class</p>
              <h2 className="text-2xl font-bold text-white mb-6">Book Your Free IPMAT Online Demo</h2>
              {status === "success" ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-white font-bold text-xl mb-2">Demo class booked!</p>
                  <p className="text-slate-400">We'll send you the demo class link on WhatsApp within 2 hours.</p>
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
                  <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City (we serve all of India)" className="w-full bg-[#07090F] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#F9A01B] focus:outline-none transition-colors" />
                  <button type="submit" disabled={status === "submitting"} className="w-full bg-[#F9A01B] text-[#07090F] font-black py-4 rounded-xl text-base hover:bg-amber-400 transition-all disabled:opacity-60">
                    {status === "submitting" ? "Booking..." : "Book Free Demo Class →"}
                  </button>
                  <p className="text-xs text-slate-600 text-center">No spam. Demo class link sent on WhatsApp.</p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 bg-[#05070a] px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#F9A01B] font-black uppercase tracking-widest text-xs mb-3">Simple. Structured. Effective.</p>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-white">How IPMAT Online Coaching<br /><span className="text-[#F9A01B] italic">Works at IPM Careers</span></h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {howItWorks.map(h => (
                <div key={h.step} className="bg-[#0F1117] border border-slate-800 rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-full bg-[#F9A01B]/10 border border-[#F9A01B]/30 text-[#F9A01B] font-black text-lg flex items-center justify-center mb-4">{h.step}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{h.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#F9A01B] font-black uppercase tracking-widest text-xs mb-3">What You Get</p>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-white">Everything in Our<br /><span className="text-[#F9A01B] italic">IPMAT Online Programme</span></h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {onlineFeatures.map(f => (
                <div key={f.title} className="border border-slate-800 rounded-2xl p-6 hover:border-[#F9A01B]/30 transition-colors bg-[#0A0C14]">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ONLINE vs OFFLINE TABLE */}
        <section className="py-16 px-6 md:px-12 bg-[#05070a]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-serif font-black text-white">IPMAT Online Coaching vs Offline — <span className="text-[#F9A01B] italic">Compared</span></h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0F1117] border-b border-slate-800">
                    <th className="text-left p-4 text-[#F9A01B] font-bold">Aspect</th>
                    <th className="text-center p-4 text-[#F9A01B] font-bold">Online Coaching</th>
                    <th className="text-center p-4 text-slate-400 font-bold">Offline Coaching</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr key={i} className={`border-b border-slate-800 ${i % 2 === 0 ? "bg-[#0A0C14]" : ""}`}>
                      <td className="p-4 text-slate-300 font-medium">{row.aspect}</td>
                      <td className="p-4 text-center text-slate-300">{row.online}</td>
                      <td className="p-4 text-center text-slate-500">{row.offline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SEO CONTENT BLOCK */}
        <section className="py-16 px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-black text-white mb-6">Why IPMAT Online Coaching is the Smart Choice for 2027 Aspirants</h2>
            <div className="text-slate-400 space-y-4 leading-relaxed">
              <p>The geography of IIM IPM preparation has changed fundamentally. A student in Patna or Coimbatore now has access to the same quality of <strong className="text-slate-300">IPMAT online coaching</strong> as a student attending a coaching centre in Delhi or Kanpur — at a fraction of the travel and accommodation cost.</p>
              <p>IPM Careers' <strong className="text-slate-300">IPMAT online coaching programme</strong> was designed from the ground up for the online format — not a conversion of offline notes to PDFs. Live sessions are interactive, not lectures. Doubt resolution happens on WhatsApp within hours. Mock test analytics are tracked individually, not batch-average.</p>
              <p>For Class 11 students targeting IPMAT 2027, starting online coaching now means 18 months of consistent preparation — the single biggest factor in achieving a top-100 rank. For Class 12 students, our 6-month online programme provides structured coverage of the entire IPMAT syllabus with weekly mocks to benchmark progress.</p>
              <p>Students from over 50 cities across India have secured IIM admissions through IPM Careers' online coaching — making it the most geographically diverse IPMAT coaching programme in the country.</p>
            </div>
            <div className="mt-8 p-6 border border-[#F9A01B]/20 rounded-2xl bg-[#F9A01B]/5">
              <p className="text-[#F9A01B] font-bold mb-2">Related pages:</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="/ipmat-coaching" className="text-slate-300 hover:text-[#F9A01B] transition-colors underline">IPMAT Coaching (All Modes) →</a>
                <a href="/air1commandcenter/forms" className="text-slate-300 hover:text-[#F9A01B] transition-colors underline">IPMAT Application Forms 2027 →</a>
                <a href="/air1commandcenter/pyq" className="text-slate-300 hover:text-[#F9A01B] transition-colors underline">Free IPMAT PYQs →</a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 md:px-12 bg-[#05070a]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#F9A01B] font-black uppercase tracking-widest text-xs mb-3">Common Questions</p>
              <h2 className="text-4xl font-serif font-black text-white">IPMAT Online Coaching — <span className="text-[#F9A01B] italic">FAQs</span></h2>
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
            <h2 className="text-5xl md:text-7xl font-serif font-black text-[#07090F] leading-tight mb-6">Your IIM Journey<br />Starts Online.</h2>
            <p className="text-[#07090F]/70 text-xl mb-10 font-medium">City doesn't matter. Effort does. Join from anywhere in India.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#enrol" className="bg-[#07090F] text-white font-black px-10 py-5 rounded-full text-lg hover:bg-slate-800 transition-colors">Start IPMAT Online Coaching →</a>
              <a href="tel:8299470392" className="border-2 border-[#07090F] text-[#07090F] font-black px-10 py-5 rounded-full text-lg hover:bg-[#07090F]/10 transition-colors">📞 8299470392</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-10 px-6 md:px-12 bg-[#05070a] border-t border-slate-800 text-center">
          <p className="text-slate-600 text-sm">© 2025 IPM Careers | <a href="https://ipmcareer.com" className="text-slate-500 hover:text-[#F9A01B]">ipmcareer.com</a> | <a href="/ipmat-coaching" className="text-slate-500 hover:text-[#F9A01B]">IPMAT Coaching</a> | <a href="/air1commandcenter" className="text-slate-500 hover:text-[#F9A01B]">Free Resources</a></p>
        </footer>

      </div>
    </>
  );
}
