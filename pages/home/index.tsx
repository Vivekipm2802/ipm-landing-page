import React, { useState, useRef } from "react";
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
} from "lucide-react";

const AdsLandingPage: React.FC = () => {
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success"
  >("idle");
  const targetRef = useRef(null);
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

  return (
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
                <Award className="w-4 h-4" /> From the Makers of AIR 1 & IIM
                Alumni
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl xl:text-9xl font-serif font-black mb-8 leading-[0.9] tracking-tighter"
              >
                IPMAT is a <br />
                <span
                  className="bg-clip-text text-transparent italic"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #F59E0B, #FDE68A, #FFFFFF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Battle of Logic.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-xl md:text-2xl mb-12 max-w-xl leading-relaxed font-light"
              >
                The 2025 pattern shift proved that memory fails, but{" "}
                <span className="text-white font-bold">
                  Quantitative Intuition
                </span>{" "}
                wins. Trained by founders who have produced All India Rank 1s.
              </motion.p>

              <div className="flex flex-wrap gap-8 items-center">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full border-2 border-brand-900 overflow-hidden bg-slate-800"
                    >
                      <img
                        src={`https://i.pravatar.cc/150?u=clattribe${i}`}
                        alt="Student"
                      />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-2 border-brand-900 bg-brand-gold flex items-center justify-center text-brand-900 font-black text-xs">
                    +1k
                  </div>
                </div>
                <div className="text-slate-400 text-sm">
                  <span className="text-white font-bold block">
                    1,000+ Students in IIMs so far
                  </span>
                  By IPM Careers
                </div>
              </div>
            </motion.div>

            {/* High-Conversion Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-5"
            >
              <div className="bg-slate-800/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[50px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative">
                <div className="absolute -top-6 -right-6 bg-brand-gold text-brand-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl animate-bounce">
                  Limited Batch Seats
                </div>

                <h3 className="text-3xl font-serif font-bold mb-2">
                  Join Directors Special Batch
                </h3>
                <p className="text-slate-400 text-sm mb-8">
                  Schedule a 1-on-1 Strategy Session with Poorva Didi's Team.
                </p>

                {formStatus === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-16 text-center"
                  >
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h4 className="text-3xl font-bold mb-4 text-white">
                      Application Received!
                    </h4>
                    <p className="text-slate-400">
                      Our Senior Counsellor will call you within 2 working
                      hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="group">
                      <input
                        required
                        type="text"
                        placeholder="Candidate Name"
                        className="w-full bg-brand-900/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-600 group-hover:border-slate-500"
                      />
                    </div>
                    <div className="group">
                      <input
                        required
                        type="tel"
                        placeholder="WhatsApp Number"
                        className="w-full bg-brand-900/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-600 group-hover:border-slate-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <select className="w-full bg-brand-900/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/50 outline-none appearance-none cursor-pointer text-slate-300">
                          <option>Target 2026</option>
                          <option>Target 2027</option>
                          <option>Target 2028</option>
                        </select>
                        <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 rotate-90" />
                      </div>
                      <div className="relative">
                        <input
                          required
                          type="tel"
                          placeholder="City"
                          className="w-full bg-brand-900/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold/50 outline-none appearance-none cursor-pointer text-slate-300"
                        />
                      </div>
                    </div>
                    <button
                      disabled={formStatus === "submitting"}
                      className="w-full py-6 bg-brand-gold text-brand-900 font-black rounded-[20px] text-xl hover:bg-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                    >
                      {formStatus === "submitting" ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <Zap className="w-6 h-6" />
                        </motion.div>
                      ) : (
                        <>
                          Register Now
                          <ArrowRight className="w-6 h-6" />
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Lock className="w-3 h-3 text-slate-600" />
                      <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
                        100% Secure & Private
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
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
                  src="/air1.png"
                  alt="Nikhilesh AIR 1"
                  className="w-full h-full object-cover grayscale-0 brightness-105"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-brand-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-12 left-12 right-12">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"
                  >
                    <h4 className="text-4xl font-serif font-black text-white mb-1">
                      Nikhilesh Sanka
                    </h4>
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="w-5 h-5 text-brand-gold fill-brand-gold" />
                      <span className="text-brand-gold font-black uppercase tracking-widest text-xs">
                        All India Rank 1
                      </span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed italic font-serif">
                      “The Strategy built by IPM Careers isn’t just coaching.
                      It’s mental reprogramming for excellence.”
                    </p>
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
                    Director's Batch: Only 50 Students
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
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Master one high-yield Quant shortcut in under 10 minutes. Our
                bite-sized visual explainers break down complex Arithmetic and
                Algebra into 'no-pen' solutions. Perfect for learning on the go.
              </p>
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
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                1,000+ AI-powered flashcards using Spaced Repetition (SRS). We
                ensure high-frequency GRE-level vocabulary, idioms, and phrasal
                verbs move from your screen to your permanent memory.
              </p>
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
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Don't just calculate; analyze. Strategic marathons designed to
                help you decode complex Caselets, Radars, and Tables in record
                time. Master the art of picking the right sets to solve.
              </p>
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
              <p className="text-slate-500 leading-relaxed">
                Generic math coaching teaches formulas. We teach Logical
                Application. Our Ashutosh Sir{" "}
                <span className="text-white font-bold">(IIM Ahmedabad) </span>
                shows you how to solve complex Algebra and Arithmetic in under
                45 seconds.
              </p>
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
                  className="absolute -top-10 -right-10 p-6 bg-white rounded-3xl shadow-2xl z-20 border border-slate-100 hidden lg:block"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600 font-bold uppercase">
                        Akshat Attri
                      </p>
                      <p className="text-sm font-black text-brand-gold">
                        AIR 7 IPMAT 2025
                      </p>
                      <p className="text-sm font-black text-slate-900">
                        2 year Classroom student
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 h-6 items-end">
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

                <div className="rounded-[40px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-8 border-white">
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
                where every child is a potential All India Ranker. We don't just
                teach—we audit, strategize, and deliver.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-slate-100 group">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:bg-amber-600 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-slate-900">
                    Direct Founder Access
                  </h4>
                  <p className="text-slate-500 text-sm italic">
                    Direct access to our founders for strategic career mapping
                    and IIM Interview prep from Day 1.
                  </p>
                </div>
                <div className="p-6 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-slate-100 group">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:bg-amber-600 transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-slate-900">
                    Legacy of AIR 1
                  </h4>
                  <p className="text-slate-500 text-sm italic">
                    Inherited the proven training methodology of IPM Careers.
                    Our curriculum isn't just 'prep'; it's the exact path taken
                    by 1000+ successful IIM students.
                  </p>
                </div>
              </div>
            </div>
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

              <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black tracking-tighter uppercase italic leading-[0.85]">
                Winning is a <br />
                <span className="underline decoration-brand-900 decoration-8">
                  Choice.
                </span>
              </h2>

              <p className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] opacity-80">
                ONLY 50 SEATS IN THE DIRECTOR'S BATCH.
              </p>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
              className="relative flex justify-center lg:justify-end"
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
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdsLandingPage;
