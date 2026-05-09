import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ShieldCheck,
  Target,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Trophy,
  Users,
  MessageSquare,
  Lock,
  Star,
  Quote,
  Award,
  Activity,
  Headphones,
  BookOpen,
  Layers,
  Menu,
  X,
  Phone,
} from "lucide-react";
import UnifiedRegistrationForm from "./mail";

const AdsLandingPage: React.FC = () => {
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success"
  >("idle");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const targetRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => setFormStatus("success"), 2000);
  };
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <Head>
        <title>Best IPMAT Online Coaching 2026 | IIM IPM Preparation | IPM Careers</title>
        <meta name="description" content="India's #1 IPMAT online coaching for IIM Indore, Rohtak, Shillong and JIPMAT 2026. Produced All India Rank 1. Live classes, mock tests and 1,000+ IIM selections. Enrol now." />
        <meta name="keywords" content="IPMAT coaching, IPMAT online coaching, IPM online coaching, best IPMAT coaching, IPMAT coaching 2026, IIM IPM coaching, IPMAT preparation online, IPM coaching institute" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://register.ipmcareer.com/" />
        <meta property="og:title" content="Best IPMAT Online Coaching 2026 | IPM Careers" />
        <meta property="og:description" content="India's #1 IPMAT online coaching. Produced All India Rank 1. 1,000+ IIM selections. Live classes and mock tests for IIM Indore IPM." />
        <meta property="og:url" content="https://register.ipmcareer.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://register.ipmcareer.com/ipm.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "EducationalOrganization",
              "@id": "https://register.ipmcareer.com/#organization",
              "name": "IPM Careers",
              "url": "https://register.ipmcareer.com/",
              "logo": "https://register.ipmcareer.com/whitelogoipm.svg",
              "description": "India's #1 IPMAT online coaching institute. Produced All India Rank 1 at IIM Indore IPM. 1000+ IIM selections.",
              "telephone": "+918299470392",
              "sameAs": ["https://ipmcareer.com"]
            },
            {
              "@type": "Course",
              "name": "IPMAT Online Coaching 2026",
              "description": "Comprehensive IPMAT online coaching for IIM Indore, IIM Rohtak and JIPMAT 2026. Live classes, mock tests and personal mentoring by AIR 1 producing faculty.",
              "provider": { "@type": "EducationalOrganization", "name": "IPM Careers", "url": "https://register.ipmcareer.com/" },
              "educationalLevel": "Undergraduate Entrance Exam",
              "url": "https://register.ipmcareer.com/"
            },
            {
              "@type": "FAQPage",
              "mainEntity": [
                { "@type": "Question", "name": "What makes IPM Careers the best IPMAT coaching in India?", "acceptedAnswer": { "@type": "Answer", "text": "IPM Careers is founded by IIM-A alumni who produced All India Rank 1 at IIM Indore IPM. Our IPMAT coaching focuses on Quantitative Intuition over rote memory. 1,000+ students have secured IIM admissions through our programme." } },
                { "@type": "Question", "name": "Is IPMAT online coaching as effective as offline?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. IPM Careers online coaching offers live interactive classes, weekly mock tests, recorded sessions and direct WhatsApp access to faculty — equally effective as offline, with the flexibility of learning from anywhere." } },
                { "@type": "Question", "name": "How many months of IPMAT coaching is enough?", "acceptedAnswer": { "@type": "Answer", "text": "A focused 6-month IPMAT coaching programme is ideal for most students. Class 11 students benefit from a 12-month course. For repeaters, a 3-4 month crash course is available." } },
                { "@type": "Question", "name": "What does IPM Careers IPMAT coaching include?", "acceptedAnswer": { "@type": "Answer", "text": "Our IPMAT online coaching includes live Quant and Verbal classes, 50+ mock tests, PYQ analysis, doubt sessions, study material and personal mentoring from the faculty who produced AIR 1." } },
                { "@type": "Question", "name": "Does IPM Careers cover JIPMAT and IIM Rohtak coaching too?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. IPM Careers covers IPMAT Indore, IPMAT Rohtak and JIPMAT as a single integrated programme — one preparation, all three exams." } },
                { "@type": "Question", "name": "Can Class 11 students join IPMAT coaching at IPM Careers?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. We have a dedicated Class 11 IPMAT foundation programme. Starting in Class 11 gives a major advantage in mastering Quantitative Aptitude." } }
              ]
            }
          ]
        }) }} />
      </Head>
      <nav
        className={`h-20 border-b border-slate-800/50 bg-slate-900 backdrop-blur-md fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 md:px-8 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center ml-8 md:ml-8">
          <img
            src="https://register.ipmcareer.com/whitelogoipm.svg"
            alt="Logo"
            className="w-48 h-48 cursor-pointer"
            onClick={() => window.open("https://ipmcareer.com", "_blank")}
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
            <a
              href="https://ipmcareer.com"
              className="hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="https://www.ipmcareer.com/about-us/"
              className="hover:text-white transition-colors"
            >
              About
            </a>
            <a
              href="https://www.ipmcareer.com/courses/"
              className="hover:text-white transition-colors"
            >
              Courses
            </a>
            <a
              href="https://www.ipmcareer.com/ipmat-2025-selection/"
              className="hover:text-white transition-colors"
            >
              Results
            </a>
            <a
              href="https://register.ipmcareer.com/air1commandcenter/"
              className="hover:text-white transition-colors"
            >
              AIR1 Commandcenter
            </a>
          </div>

          <div className="hidden md:block h-6 w-px bg-slate-800"></div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-20 left-0 right-0 z-20 border-b border-slate-800/50 bg-[#05070a]/95 backdrop-blur-md">
          <div className="flex flex-col space-y-1 px-4 py-3">
            <a
              href="https://ipmcareer.com"
              className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="https://www.ipmcareer.com/about-us/"
              className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a
              href="https://www.ipmcareer.com/courses/"
              className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Courses
            </a>
            <a
              href="https://www.ipmcareer.com/ipmat-2025-selection/"
              className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Results
            </a>
          </div>
        </div>
      )}

      <div
        ref={targetRef}
        className="bg-brand-900 text-white selection:bg-brand-gold selection:text-brand-900 overflow-x-hidden font-sans"
      >
        {/* 1. ULTRA-PREMIUM HERO + DYNAMIC LEAD FORM */}
        <section className="relative min-h-screen pt-24 pb-20 lg:pt-32 lg:pb-32 flex items-center overflow-hidden">
          {/* Cinematic Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(245,158,11,0.15)_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          </div>

          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              {/* Value Proposition */}
              <motion.div style={{ opacity, scale }} className="lg:col-span-7">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs font-black uppercase tracking-[0.3em] mb-10 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  <Award className="w-4 h-4" /> From the Makers of AIR 1
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-6xl md:text-8xl xl:text-9xl font-serif font-black mb-8 leading-[0.9] tracking-tighter"
                >
                  IPMAT Online <br />
                  <span
                    className="bg-clip-text text-transparent italic"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #F59E0B, #FDE68A, #FFFFFF)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Coaching.{" "}
                  </span>
                  <span className="block text-2xl md:text-3xl xl:text-4xl text-slate-500 font-sans font-light tracking-normal mt-3 not-italic">
                    A Battle of Logic. Won with Strategy.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-slate-400 text-xl md:text-2xl mb-12 max-w-xl leading-relaxed font-light"
                >
                  India's #1 <span className="text-white font-semibold">IPMAT online coaching</span> institute. The 2025 pattern shift proved that memory fails, but{" "}
                  <span className="text-white font-bold">
                    Quantitative Intuition
                  </span>{" "}
                  wins. Our IPMAT coaching is led by IIM-A alumni who produced All India Rank 1.
                </motion.p>

                <div className="flex flex-wrap gap-8 items-center">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full border-2 border-brand-900 overflow-hidden bg-slate-800"
                      >
                        <img
                          src={`/student-${i}.jpeg`}
                          alt={`Student ${i}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-2 border-brand-900 bg-brand-gold flex items-center justify-center text-brand-900 font-black text-xs">
                      +1k
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm">
                    <span className="text-white font-bold block">
                      1,000+ Students in IIMs
                    </span>
                    By IPM Careers
                  </div>
                </div>
              </motion.div>
              {/* High-Conversion Form */}
              <UnifiedRegistrationForm
                variant="modern"
                className=""
                onSuccess={(data) => {
                  console.log("Form submitted:", data);
                }}
              />{" "}
            </div>
          </div>
        </section>

        {/* 2. THE AIR 1 SHOWCASE: NIKHILESH */}
        <section className="py-32 relative overflow-hidden bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              {/* Image with dynamic 'this could be you' overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="lg:w-1/2 relative group"
              >
                <div className="absolute -inset-4 bg-brand-gold/10 rounded-[60px] blur-2xl group-hover:bg-brand-gold/20 transition-all" />
                <div className="relative rounded-[50px] overflow-hidden border-8 border-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
                  <img
                    src="/Nik.png"
                    alt="Nikhilesh AIR 1"
                    className="w-full h-full object-cover grayscale-0 brightness-105"
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-brand-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-12 left-12 right-12">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"
                    >
                      <h4 className="text-2xl font-serif font-black text-white mb-1">
                        Nikhilesh Sanka
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-brand-gold fill-brand-gold" />
                        <span className="text-brand-gold font-black uppercase tracking-widest text-xs">
                          All India Rank 1
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* FLOATING ACTION OVERLAY */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute -top-12 -right-12 p-8 bg-brand-900 rounded-[40px] shadow-2xl z-20 border border-brand-gold/30"
                >
                  <p className="text-brand-gold font-black text-3xl leading-none uppercase italic tracking-tighter">
                    THIS <br /> COULD <br /> BE <br /> YOU.
                  </p>
                  <div className="mt-4 w-12 h-1 bg-brand-gold rounded-full" />
                </motion.div>
              </motion.div>

              <div className="lg:w-1/2 text-brand-900">
                <span className="text-brand-gold font-black uppercase tracking-widest text-sm mb-6 block">
                  The Pedigree of Success
                </span>
                <p className="text-brand-gold font-black uppercase tracking-widest text-xs mb-2">IPMAT Online Coaching — Results That Speak</p>
                <h2 className="text-5xl md:text-7xl font-serif font-black mb-8 leading-tight tracking-tighter">
                  We Don't Guess. <br />
                  <span className="text-brand-gold italic">We Predict.</span>
                </h2>
                <p className="text-slate-600 text-xl mb-12 leading-relaxed">
                  Nikhilesh followed the same{" "}
                  <span className="text-brand-900 font-bold">
                    AIR 1 Blueprint
                  </span>{" "}
                  that we have perfected Over a decade at IPM Careers. We treat
                  IPMAT like a chess match, not a memory test.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-brand-gold" />
                    </div>
                    <span className="font-bold text-lg">
                      Director's Special Batch: Only 50 Students
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-brand-gold" />
                    </div>
                    <span className="font-bold text-lg">
                      Direct Founder Mentorship
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEW: GK & LEGAL DOMINANCE SECTION */}
        <section className="py-32 bg-brand-800 border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[60%] h-full bg-brand-gold/5 blur-[120px] rounded-full -translate-y-1/2" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest"
              >
                <Zap className="w-4 h-4" /> Mastery Section
              </motion.div>
              <h2 className="text-5xl md:text-7xl font-serif font-black mb-8">
                Master the{" "}
                <span className="text-brand-gold italic">Quant & Verbal</span>{" "}
                Paper.
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                Ditch the rote learning of formulas. Use native-digital tools
                designed by{" "}
                <span className="text-white font-bold">IIM Alumni</span> to to
                dominate the most competitive sections of IPMAT.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Daily GK Audio */}
              <motion.div
                whileHover={{ y: -10 }}
                className="bg-slate-900 border border-slate-800 rounded-[50px] p-10 group relative transition-all duration-500 hover:border-brand-gold/30"
              >
                <div className="w-16 h-16 bg-brand-gold text-brand-900 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                  <Headphones className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Daily Quant Concept Bites
                </h3>
                <div className="flex items-center gap-2 text-brand-gold font-black text-[10px] uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" /> CURATED BY IIM A and L
                  ALUMNI
                </div>
              </motion.div>

              {/* Vocab Flashcards */}
              <motion.div
                whileHover={{ y: -10 }}
                className="bg-slate-900 border border-slate-800 rounded-[50px] p-10 group relative transition-all duration-500 hover:border-brand-gold/30"
              >
                <div className="w-16 h-16 bg-blue-500 text-white rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Vocab & Idiom Flashcards
                </h3>
                <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" /> VERBAL SCORE MAXIMIZER
                  INCLUDED
                </div>
              </motion.div>

              {/* DI Capsules */}
              <motion.div
                whileHover={{ y: -10 }}
                className="bg-slate-900 border border-slate-800 rounded-[50px] p-10 group relative transition-all duration-500 hover:border-brand-gold/30"
              >
                <div className="w-16 h-16 bg-purple-500 text-white rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Data Interpretation (DI) Marathons
                </h3>
                <div className="flex items-center gap-2 text-purple-400 font-black text-[10px] uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" /> 95% ACCURACY RATE IN 2025
                </div>
              </motion.div>
            </div>

            <div className="mt-20 p-12 bg-slate-900/50 rounded-[40px] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="md:w-2/3">
                <h4 className="text-2xl font-bold mb-4">
                  Quantitative Aptitude: The IIM Indore Methodology
                </h4>
                {/* <p className="text-slate-500 leading-relaxed">
                Generic math coaching teaches formulas. We teach Logical
                Application. Our Ashutosh Sir{" "}
                <span className="text-white font-bold">(IIM Ahmedabad) </span>
                shows you how to solve complex Algebra and Arithmetic in under
                45 seconds.
              </p> */}
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-10 py-5 bg-brand-gold text-brand-900 font-black rounded-2xl hover:bg-white transition-all flex items-center gap-2 shadow-2xl shrink-0"
              >
                Get Sample Modules <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* 3. MODERN PARENTAL DASHBOARD: PEACE OF MIND */}
        <section className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(245,158,11,0.05)_0%,transparent_50%)]" />

          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-[55%] order-1 lg:order-1">
                <div className="relative max-w-2xl mx-auto">
                  {/* Floating Dashboard Card */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    className="absolute -top-6 -right-6 lg:-top-10 lg:-right-10 p-4 lg:p-6 bg-white rounded-2xl lg:rounded-3xl shadow-2xl z-20 border border-slate-100"
                  >
                    <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                      <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-[8px] lg:text-[10px] text-slate-600 font-bold uppercase">
                          Akshat Attri
                        </p>
                        <p className="text-xs lg:text-sm font-black text-brand-gold">
                          AIR 7 IPMAT 2025
                        </p>
                        <p className="text-xs lg:text-sm font-black text-slate-900">
                          2 year Classroom student
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 h-4 lg:h-6 items-end">
                      {[40, 60, 45, 80, 70, 95].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          className="w-2 bg-brand-gold rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>

                  <div className="rounded-[25px] lg:rounded-[40px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-4 lg:border-8 border-white">
                    <img
                      src="/akshat-atri.jpeg"
                      alt="Success Mentoring"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:w-[45%] order-2 lg:order-2">
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-slate-900/5 text-slate-900 text-xs font-black uppercase tracking-widest border border-slate-900/10">
                  <ShieldCheck className="w-4 h-4" /> For the Concerned Guardian
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-black mb-8 text-slate-900 leading-[0.9] tracking-tighter">
                  Your Child's Ambition, <br />
                  <span className="text-brand-gold italic">Our Obsession.</span>
                </h2>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed font-light">
                  Typical coachings are factories. IPM Careers is a boutique lab
                  where every child is a potential All India Ranker. We don't
                  just teach—we audit, strategize, and deliver.
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-slate-100 group">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:bg-amber-600 transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold mb-2 text-slate-900">
                      Direct Founder Access
                    </h4>
                  </div>
                  <div className="p-6 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-slate-100 group">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:bg-amber-600 transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold mb-2 text-slate-900">
                      Legacy of AIR 1
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEO: FAQ SECTION — IPMAT COACHING */}
        <section className="py-24 bg-[#05070a]">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center mb-14">
              <span className="text-brand-gold font-black uppercase tracking-widest text-xs mb-4 block">Know Before You Enrol</span>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight">
                IPMAT Coaching — <span className="text-brand-gold italic">FAQs</span>
              </h2>
              <p className="text-slate-400 mt-4 text-lg">Everything you want to know about our IPMAT online coaching programme</p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "What makes IPM Careers the best IPMAT coaching in India?",
                  a: "IPM Careers is founded by IIM-A alumni who have produced All India Rank 1 at IIM Indore IPM. Our IPMAT coaching focuses on Quantitative Intuition over rote memory, directly mirroring the actual exam pattern. Over 1,000 students have secured IIM admissions through our programme."
                },
                {
                  q: "Is IPMAT online coaching as effective as offline?",
                  a: "Yes. Our IPMAT online coaching offers live interactive classes, weekly mock tests, recorded sessions for revision, and direct WhatsApp access to faculty — equally effective as offline, with the flexibility of learning from anywhere in India."
                },
                {
                  q: "How many months of IPMAT coaching is enough?",
                  a: "A focused 6-month programme is ideal for most students. Class 11 students benefit from a 12-month foundation course. For Class 12 droppers or repeaters, our intensive 3–4 month IPMAT crash course is available."
                },
                {
                  q: "What does IPM Careers' IPMAT coaching include?",
                  a: "Our IPMAT online coaching includes live Quant & Verbal classes, 50+ full-length mock tests, previous year paper analysis, doubt sessions, printed study material, and personal mentoring from the faculty who produced AIR 1."
                },
                {
                  q: "Can Class 11 students join IPMAT coaching?",
                  a: "Yes. We have a dedicated Class 11 IPMAT foundation programme. Starting early gives a decisive edge in Quantitative Aptitude — the section that takes the most time to master."
                },
                {
                  q: "Does IPM Careers also cover JIPMAT and IIM Rohtak coaching?",
                  a: "Yes. Our coaching covers IPMAT Indore, IPMAT Rohtak, and JIPMAT (IIM Jammu & IIM Bodhgaya) as a single integrated programme — one preparation, all three exams."
                },
                {
                  q: "What is the fee for IPMAT coaching at IPM Careers?",
                  a: "IPM Careers offers multiple course tiers to suit every budget. Visit this page or call 8299470392 for current batch details and early-enrolment pricing."
                }
              ].map((item, idx) => (
                <details key={idx} className="group border border-slate-800 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer p-6 text-white font-bold text-lg list-none hover:bg-slate-900/50 transition-colors">
                    <span>{item.q}</span>
                    <span className="ml-4 text-brand-gold text-2xl font-light group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>


        {/* SEO FAQ — IPMAT COACHING */}
        <section className="py-24 bg-[#05070a]">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center mb-14">
              <span className="text-brand-gold font-black uppercase tracking-widest text-xs mb-4 block">Know Before You Enrol</span>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight">
                IPMAT Coaching{" "}
                <span className="text-brand-gold italic">FAQs</span>
              </h2>
              <p className="text-slate-400 mt-4 text-lg">Everything about our IPMAT online coaching programme</p>
            </div>
            <div className="space-y-4">
              {[
                { q: "What makes IPM Careers the best IPMAT coaching in India?", a: "IPM Careers is founded by IIM-A alumni who produced All India Rank 1 at IIM Indore IPM. Our IPMAT coaching focuses on Quantitative Intuition over rote memory, directly mirroring the exam pattern. 1,000+ students have secured IIM admissions through our programme." },
                { q: "Is IPMAT online coaching as effective as offline?", a: "Yes. Our IPMAT online coaching includes live interactive classes, weekly mock tests, recorded sessions for revision, and direct WhatsApp access to faculty — equally effective as offline, with the flexibility of studying from anywhere in India." },
                { q: "How many months of IPMAT coaching is enough?", a: "A focused 6-month IPMAT coaching programme is ideal for most students. Class 11 students benefit from a 12-month foundation course. For Class 12 droppers or repeaters, our 3–4 month intensive crash course is available." },
                { q: "What does IPM Careers IPMAT coaching include?", a: "Live Quant and Verbal Ability classes, 50+ full-length mock tests, previous year question paper analysis, doubt-clearing sessions, printed study material, and personal mentoring from the faculty who produced AIR 1." },
                { q: "Can Class 11 students join IPMAT coaching?", a: "Yes. We have a dedicated Class 11 IPMAT foundation programme. Starting in Class 11 gives a decisive advantage in Quantitative Aptitude — the section that takes the most time to master." },
                { q: "Does IPM Careers also cover JIPMAT and IIM Rohtak?", a: "Yes. Our programme covers IPMAT Indore, IPMAT Rohtak, and JIPMAT (IIM Jammu and IIM Bodhgaya) as a single integrated coaching — one preparation, all three exams." },
                { q: "What is the fee for IPMAT coaching at IPM Careers?", a: "IPM Careers offers multiple course tiers. Call 8299470392 or scroll to the courses section for current batch details and early-enrolment pricing." }
              ].map((item, idx) => (
                <details key={idx} className="group border border-slate-800 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer p-6 text-white font-bold text-lg list-none hover:bg-slate-900/60 transition-colors">
                    <span>{item.q}</span>
                    <span className="ml-4 text-brand-gold text-2xl font-light group-open:rotate-45 transition-transform duration-200 flex-shrink-0">+</span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-400 leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 4. FINAL HIGH-CONVERSION CTA */}
        <section className="py-20 relative overflow-hidden bg-brand-gold text-brand-900">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstripe-dark.png')] opacity-10" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <Quote className="w-16 h-16 text-brand-900/10" />

                <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black tracking-tighter uppercase italic leading-[0.85] max-w-[650px]">
                  Winning is a{" "}
                  <span className="underline decoration-brand-900 decoration-8">
                    Choice.
                  </span>
                </h2>
                <p className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] opacity-80">
                  ONLY 50 SEATS IN THE DIRECTOR'S BATCH.
                </p>

                <button
                  onClick={() => {
                    // Try multiple methods for maximum compatibility
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                  className="group relative px-12 py-6 bg-brand-900 text-white rounded-[40px] font-black text-2xl hover:scale-105 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center gap-4 overflow-hidden"
                >
                  <span className="relative z-10">APPLY NOW</span>
                  <ArrowRight className="w-8 h-8 relative z-10 group-hover:translate-x-4 transition-transform" />
                  <div className="absolute inset-0 bg-slate-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>

                <div className="flex gap-8 opacity-40 pt-8">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black italic">AIR 1</span>
                    <span className="text-[9px] uppercase font-bold tracking-[0.4em]">
                      PEDIGREE
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black italic">IIM-A</span>
                    <span className="text-[9px] uppercase font-bold tracking-[0.4em]">
                      ALUMNI
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black italic">IIM L</span>
                    <span className="text-[9px] uppercase font-bold tracking-[0.4em]">
                      STANDARD
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Right Image with Pin Effect */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="relative flex flex-col items-center lg:items-end gap-6"
              >
                {/* Pin */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="relative">
                    {/* Pin Head */}
                    <div className="w-8 h-8 rounded-full bg-red-600 shadow-lg" />
                    {/* Pin Point Shadow */}
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gradient-to-b from-red-600/80 to-transparent" />
                  </div>
                </div>

                {/* Pinned Image Card */}
                <div className="relative transform hover:rotate-1 transition-transform duration-300">
                  <img
                    src="/ipm.png"
                    alt="IPM Careers - AIR 1 and AIR 7 toppers"
                    className="w-full max-w-md h-auto rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] bg-white p-4"
                    style={{
                      transform: "rotate(-2deg)",
                    }}
                  />
                  {/* Paper texture overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 rounded-2xl pointer-events-none" />
                </div>

                {/* Phone Number Card */}
                <motion.a
                  href="tel:8299470392"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="group relative bg-brand-900 text-white px-8 py-4 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <Phone className="w-6 h-6 text-brand-900" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-70">
                        Call Now
                      </p>
                      <p className="text-2xl font-black tracking-wider">
                        8299470392
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-50 group-hover:translate-x-2 group-hover:opacity-100 transition-all" />
                </motion.a>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AdsLandingPage;
