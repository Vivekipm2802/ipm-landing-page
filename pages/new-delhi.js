/**
 * register.ipmcareer.com/new-delhi
 * Drop-in Next.js (pages router) page. Place at: pages/new-delhi.js
 *
 * Deps:  npm i @supabase/supabase-js motion lucide-react
 * Env:   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY  (same as the rest of the site)
 * DB:    `leads` table (run supabase-leads-setup.sql once)
 *
 * Tailwind + fonts are loaded via CDN inside <Head> so this page is fully
 * self-contained and does not depend on the host site's global styles.
 */
import Head from 'next/head';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Phone,
  BarChart2,
  Headphones,
  Smartphone,
  Layers,
  Target,
  CheckCircle2,
  Lock,
  ChevronDown,
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const faqs = [
  {
    question: 'What is IPMAT?',
    answer:
      'IPMAT (Integrated Programme in Management Aptitude Test) is a national-level entrance exam conducted by IIM Indore for admission to its 5-year Integrated Programme in Management (IPM).',
  },
  {
    question: 'Who is eligible to apply for IPMAT?',
    answer:
      'Students who have completed their Class 12 (or are appearing for it) from a recognized board are eligible. General and NC-OBC category applicants should have a minimum of 60% in standard X/SSC and standard XII/HSC or equivalent examinations.',
  },
  {
    question: 'What makes IPM Careers different from regular coaching?',
    answer:
      'Unlike factory-style coaching institutes, we operate as a boutique lab. You get direct access to the founders (IIM alumni), learn using our perfected AIR 1 Blueprint, and benefit from targeted mentorship designed to build your quantitative intuition.',
  },
  {
    question: "What is the Director's Special Batch?",
    answer:
      "It's an exclusive cohort limited to just 50 students, ensuring personalized attention, rigorous audit of each student's progress, and direct mentorship from our founders to maximize your chances of securing a top rank.",
  },
  {
    question: 'How do I enroll in the program?',
    answer:
      "You can start by registering on this page to schedule a 1-on-1 Strategy Session with Deepak Sir's Team. We will evaluate your profile and guide you through the enrollment process.",
  },
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10 group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 text-left focus:outline-none"
      >
        <span className="text-lg lg:text-xl font-bold font-heading group-hover:text-[#E89624] transition-colors">{question}</span>
        <div className={`w-8 h-8 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${isOpen ? 'bg-[#E89624] text-[#0F121E] border-[#E89624]' : 'bg-transparent text-white border-white/20 group-hover:border-[#E89624]'}`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="pb-6 pr-12 text-gray-400 text-lg leading-relaxed">
          {answer}
        </div>
      </motion.div>
    </div>
  );
}

function RegistrationForm() {
  const [formData, setFormData] = useState({
    candidateName: '',
    whatsappNumber: '',
    emailAddress: '',
    targetYear: 'Target 2027',
    city: '',
  });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const { error } = await supabase.from('leads').insert({
        candidate_name: formData.candidateName,
        whatsapp_number: formData.whatsappNumber,
        email_address: formData.emailAddress,
        target_year: formData.targetYear,
        city: formData.city,
      });
      if (error) throw error;

      // Fire-and-forget email to ipmcareersdelhi25@gmail.com
      fetch('/api/sendDelhi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: formData.candidateName,
          whatsappNumber: formData.whatsappNumber,
          emailAddress: formData.emailAddress,
          targetYear: formData.targetYear,
          city: formData.city,
        }),
      }).catch((e) => console.warn('sendDelhi failed:', e));
      setStatus('success');
      setFormData({ candidateName: '', whatsappNumber: '', emailAddress: '', targetYear: 'Target 2027', city: '' });
    } catch (err) {
      console.error('Supabase Error (leads insert):', err);
      setStatus('idle');
      alert('There was an error submitting your registration. Please try again later.');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {status === 'success' ? (
        <div className="rounded-2xl p-6 text-center" style={{background:'linear-gradient(135deg,#1a1200 0%,#0A0D14 100%)',border:'1px solid rgba(232,150,36,0.35)'}}>
          {/* Animated checkmark */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{background:'rgba(232,150,36,0.15)',border:'2px solid #E89624'}}>
            <CheckCircle2 className="w-8 h-8" style={{color:'#E89624'}} />
          </div>

          {/* Headline */}
          <p className="text-2xl font-bold text-white mb-1">Thank You{formData.candidateName ? ', ' + formData.candidateName.split(' ')[0] : ''}! 🎉</p>
          <p className="text-sm font-medium mb-4" style={{color:'#E89624'}}>Your registration is confirmed.</p>

          {/* What happens next */}
          <div className="text-left rounded-xl p-4 mb-5" style={{background:'rgba(255,255,255,0.04)'}}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">What happens next?</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">📞</span>
                <p className="text-sm text-gray-300">Our counsellor will call you on your WhatsApp number within <span className="text-white font-semibold">24 hours</span>.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">🗂️</span>
                <p className="text-sm text-gray-300">We will share your personalised <span className="text-white font-semibold">IPMAT Study Plan</span> and batch schedule.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">🏆</span>
                <p className="text-sm text-gray-300">Get ready to begin your journey to <span className="text-white font-semibold">IIM as a future IIMer!</span></p>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-2">
            <a
              href="https://wa.me/919289232337?text=Hi%20IPM%20Careers%2C%20I%20just%20registered%20on%20the%20New%20Delhi%20page.%20Please%20guide%20me%20on%20next%20steps."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{background:'#25D366',color:'#fff'}}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat on WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.6)'}}
            >
              Register Another Student
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.candidateName}
              onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
              placeholder="Candidate Name"
              className="w-full bg-[#0A0D14] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#E89624] transition-colors placeholder:text-gray-600"
            />
          </div>
          <div className="relative">
            <input
              type="tel"
              required
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="WhatsApp Number"
              className="w-full bg-[#0A0D14] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#E89624] transition-colors placeholder:text-gray-600"
            />
          </div>
          <div className="relative">
            <input
              type="email"
              required
              value={formData.emailAddress}
              onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
              placeholder="Email Address"
              className="w-full bg-[#0A0D14] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#E89624] transition-colors placeholder:text-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.targetYear}
              onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
              className="w-full bg-[#0A0D14] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#E89624] transition-colors text-white appearance-none"
            >
              <option>Target 2027</option>
              <option>Target 2028</option>
              <option>Target 2029</option>
            </select>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="City"
              className="w-full bg-[#0A0D14] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#E89624] transition-colors placeholder:text-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-[#E89624] text-[#0F121E] rounded-2xl px-8 py-5 mt-4 font-bold text-lg hover:bg-[#F2A63B] transition-colors flex justify-center items-center gap-2 disabled:bg-[#E89624]/60 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? 'Registering...' : 'Register Now'} <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-center text-xs text-gray-500 font-medium tracking-widest mt-6 flex justify-center items-center gap-1.5 uppercase">
            <Lock className="w-3.5 h-3.5" /> 100% SECURE &amp; PRIVATE
          </p>
        </>
      )}
    </form>
  );
}

export default function NewDelhi() {
  return (
    <>
      <Head>
        <title>IPM Careers — New Delhi Centre | IPMAT Coaching from the Makers of AIR 1</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="IPMAT coaching in New Delhi from the makers of AIR 1. Join the Director's Special Batch — limited to 50 students. Direct founder mentorship from IIM alumni."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        {/* Tailwind (Play CDN) — scoped to this self-contained landing page */}
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Custom font tokens used by the design: font-heading / font-sans */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .font-heading { font-family: 'Montserrat', ui-sans-serif, system-ui, sans-serif; }
              .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
              body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
            `,
          }}
        />
      </Head>

      <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#E89624] selection:text-white">
        {/* Navbar */}
        <nav className="absolute top-0 w-full z-50 py-6 px-6 lg:px-12 flex justify-between items-center text-white/90">
          <div className="flex items-center gap-2">
            <a href="#" className="inline-block">
              <img src="https://register.ipmcareer.com/whitelogoipm.svg" alt="IPM Careers" className="h-10 lg:h-12" />
            </a>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="https://www.ipmcareer.com/about-us/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">About</a>
            <a href="https://www.ipmcareer.com/courses/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Courses</a>
            <a href="https://www.ipmcareer.com/ipmat-2025-selection/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Results</a>
            <a href="https://register.ipmcareer.com/air1commandcenter" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex justify-center items-center gap-1.5">AIR1 Commandcenter</a>
          </div>
        </nav>

        {/* Section 1: The Registration Form */}
        <section id="registration-form" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 lg:px-12 bg-[#0F121E] text-white overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <div className="inline-block border border-[#E89624]/30 bg-[#E89624]/10 text-[#E89624] rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase mb-8 flex items-center gap-2 w-max">
                <AwardIcon className="w-3.5 h-3.5" /> FROM THE MAKERS OF AIR 1
              </div>

              <h1 className="text-6xl sm:text-7xl lg:text-[7rem] font-black font-heading leading-[0.85] tracking-tight mb-8">
                IPMAT is a <br />
                <span className="text-[#F9CB78] italic">Battle of <br />Logic.</span>
              </h1>

              <p className="text-gray-400 text-lg lg:text-xl leading-relaxed mb-10 max-w-lg">
                The 2025 pattern shift proved that memory fails, but <span className="font-bold text-white">Quantitative Intuition</span> wins. Trained by founders who have produced All India Rank 1.
              </p>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  <div className="w-12 h-12 rounded-full border-2 border-[#0F121E] bg-[#E89624] text-[#0F121E] flex items-center justify-center font-bold text-sm tracking-tighter">
                    +1k
                  </div>
                </div>
                <div>
                  <div className="font-bold text-lg">1,000+ Students in IIMs</div>
                  <div className="text-sm text-gray-500">By IPM Careers</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute top-0 right-4 lg:right-8 -translate-y-1/2 bg-[#E89624] text-[#0F121E] px-6 py-2 rounded-full font-bold text-xs tracking-widest shadow-xl z-20">
                LIMITED BATCH SEATS
              </div>

              <div className="bg-[#181D31] rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative z-10 border border-white/5">
                <h3 className="text-3xl font-bold font-heading mb-2">Join Directors Special Batch</h3>
                <p className="text-sm text-gray-400 mb-8">Schedule a 1-on-1 Strategy Session with Deepak Sir's Team.</p>

                <RegistrationForm />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 2: Success Prediction */}
        <section className="py-24 lg:py-32 px-6 lg:px-12 bg-white text-[#0F121E]">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-100 relative shadow-2xl">
                <img src="https://res.cloudinary.com/dcr8ec2rt/image/upload/v1778052145/WhatsApp_Image_2026-05-06_at_12.51.40_kd7jee.jpg" alt="Top Ranker" className="w-full h-full object-cover" />

                <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="text-2xl font-black font-heading mb-1 text-white">Nikhilesh Sanka</div>
                  <div className="text-[#E89624] text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4" /> ALL INDIA RANK 1
                  </div>
                </div>
              </div>

              <div className="absolute -top-8 -right-8 bg-[#111424] px-8 py-10 rounded-3xl border-2 border-transparent shadow-2xl rotate-3 z-20">
                <div className="font-heading font-black text-2xl text-[#E89624] italic leading-none text-center transform -skew-x-6 gap-1 flex flex-col">
                  <span>THIS</span>
                  <span>COULD</span>
                  <span>BE</span>
                  <span>YOU.</span>
                </div>
                <div className="w-12 h-1 bg-[#E89624] mx-auto mt-4 rounded-full"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-[#E89624] text-xs font-bold tracking-widest uppercase mb-4">
                THE PEDIGREE OF SUCCESS
              </div>
              <h2 className="text-5xl lg:text-7xl font-black font-heading leading-[0.9] tracking-tight mb-8">
                We Don't Guess.<br />
                <span className="text-[#E89624] italic">We Predict.</span>
              </h2>
              <p className="text-gray-500 text-lg lg:text-xl leading-relaxed mb-10">
                Nikhilesh followed the same <span className="font-bold text-[#0F121E]">AIR 1 Blueprint</span> that we have perfected Over a decade at IPM Careers. We treat IPMAT like a chess match, not a memory test.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#E89624]/10 text-[#E89624] flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Director's Special Batch: Only 50 Students</div>
                  </div>
                </div>
                <div className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#E89624]/10 text-[#E89624] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Direct Founder Mentorship</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 3: Dark Section (Master the Quant & Verbal) */}
        <section className="py-24 lg:py-32 px-6 lg:px-12 bg-[#0F121E] text-white relative flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center w-full max-w-4xl"
          >
            <div className="inline-block border border-blue-500/30 bg-blue-500/10 text-blue-400 rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase mb-8 flex items-center gap-2">
              <ZapIcon className="w-3.5 h-3.5" /> MASTERY SECTION
            </div>
            <h2 className="text-4xl lg:text-[4rem] font-black font-heading tracking-tight mb-6 leading-tight">
              Master the <span className="text-[#E89624] italic">Quant &amp; Verbal</span> Paper.
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mb-16">
              Ditch the rote learning of formulas. Use native-digital tools designed by <span className="font-bold text-white">IIM Alumni</span> to dominate the most competitive sections of IPMAT.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 w-full max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-[#15192B] rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="w-14 h-14 bg-[#E89624] text-[#0F121E] rounded-2xl flex items-center justify-center mb-8">
                <Headphones className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-6 pr-4">Daily Quant Concept Bites</h3>
              <div className="inline-flex items-center gap-2 text-[#E89624] text-[10px] font-bold tracking-widest uppercase">
                <CheckCircle2 className="w-4 h-4" /> CURATED BY IIM A AND L ALUMNI
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-[#15192B] rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-8">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-6 pr-4">Vocab &amp; Idiom Flashcards</h3>
              <div className="inline-flex items-center gap-2 text-blue-400 text-[10px] font-bold tracking-widest uppercase">
                <CheckCircle2 className="w-4 h-4" /> VERBAL SCORE MAXIMIZER INCLUDED
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="bg-[#15192B] rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="w-14 h-14 bg-purple-500 text-white rounded-2xl flex items-center justify-center mb-8">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-6 pr-4">Data Interpretation (DI)<br />Marathons</h3>
              <div className="inline-flex items-center gap-2 text-purple-400 text-[10px] font-bold tracking-widest uppercase mt-auto">
                <CheckCircle2 className="w-4 h-4" /> 95% ACCURACY RATE IN 2025
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full max-w-7xl mt-6 bg-[#15192B] rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between border border-white/5 gap-6"
          >
            <div className="text-xl lg:text-2xl font-bold font-heading">
              Quantitative Aptitude: The IIM Indore Methodology
            </div>
            <a href="#registration-form" className="whitespace-nowrap bg-[#E89624] text-[#0F121E] px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#F2A63B] transition-colors">
              Get Sample Modules <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </section>

        {/* Section 4: Your Child's Ambition */}
        <section className="py-24 lg:py-32 px-6 lg:px-12 bg-white text-[#0F121E] overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-gray-200 shadow-xl relative">
                <img src="https://register.ipmcareer.com/akshat-atri.jpeg" alt="Akshat Attri" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="absolute -top-12 lg:-top-16 -right-4 lg:-right-12 bg-white rounded-2xl shadow-xl p-5 flex gap-4 w-72 z-20"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold tracking-widest text-gray-400 mb-1">AKSHAT ATTRI</div>
                  <div className="text-sm font-black text-[#E89624]">AIR 7 IPMAT 2025</div>
                  <div className="text-sm font-semibold text-gray-800">2 year Classroom student</div>
                  <div className="flex gap-1 mt-3 items-end h-6">
                    {[2, 3, 4, 6, 4].map((h, i) => (
                      <div key={i} className="w-2 bg-[#E89624] rounded-sm" style={{ height: `${h * 4}px` }}></div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="inline-block border border-gray-200 rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase mb-6 flex items-center gap-2 w-max">
                <ShieldIcon className="w-3.5 h-3.5" /> FOR THE CONCERNED GUARDIAN
              </div>
              <h2 className="text-4xl lg:text-[4rem] font-bold font-heading leading-[1.05] tracking-tight mb-6">
                Your Child's Ambition,<br />
                <span className="text-[#E89624] italic font-black">Our Obsession.</span>
              </h2>
              <p className="text-gray-500 text-lg lg:text-xl leading-relaxed mb-10">
                Typical coachings are factories. IPM Careers is a boutique lab where every child is a potential All India Ranker. We don't just teach—we audit, strategize, and deliver.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-[#111424] text-white rounded-2xl flex items-center justify-center mb-4">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-lg">Direct Founder<br />Access</div>
                </div>
                <div className="bg-gray-50 rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-[#111424] text-white rounded-2xl flex items-center justify-center mb-4">
                    <UsersIcon className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-lg">Legacy of<br />AIR 1</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 5: FAQ */}
        <section className="py-24 lg:py-32 px-6 lg:px-12 bg-[#0A0D14] text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black font-heading tracking-tight mb-6">
                Frequently Asked <span className="text-[#E89624] italic">Questions</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Everything you need to know about IPMAT and the Director's Batch.
              </p>
            </div>
            <div className="border-t border-white/10">
              {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </motion.div>
        </section>

        {/* Section 6: Winning Is A Choice */}
        <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 px-6 lg:px-12 bg-[#E89624] overflow-hidden text-[#0F121E]">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <div className="text-8xl text-black/10 font-serif leading-none absolute -top-12 -left-6 select-none">
                &rdquo;
              </div>
              <h1 className="text-6xl sm:text-7xl lg:text-[7.5rem] font-black font-heading italic text-[#0F121E] uppercase leading-[0.85] tracking-tight">
                Winning Is A <br />
                <span className="relative inline-block mt-2">
                  Choice.
                  <div className="absolute bottom-0 left-0 w-full h-[8px] bg-[#0F121E] translate-y-3"></div>
                </span>
              </h1>

              <p className="mt-12 text-lg lg:text-xl font-bold text-[#0F121E] tracking-widest uppercase">
                Only 50 seats in the director's batch.
              </p>

              <div className="mt-10">
                <a href="#registration-form" className="inline-flex bg-[#0F121E] text-white rounded-full px-10 py-5 font-bold text-lg tracking-wide items-center gap-3 hover:bg-black transition-transform hover:-translate-y-1">
                  APPLY NOW <ArrowRight className="w-6 h-6" />
                </a>
              </div>

              <div className="mt-20 flex items-center gap-10 text-[#0F121E]">
                <div>
                  <div className="font-black font-heading text-3xl italic tracking-tighter">AIR 1</div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-black/60 mt-1">Pedigree</div>
                </div>
                <div>
                  <div className="font-black font-heading text-3xl italic tracking-tighter">IIM-A</div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-black/60 mt-1">Alumni</div>
                </div>
                <div>
                  <div className="font-black font-heading text-3xl italic tracking-tighter">IIM L</div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-black/60 mt-1">Standard</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 w-full max-w-lg mx-auto">
                <img src="https://res.cloudinary.com/dcr8ec2rt/image/upload/v1778051926/WhatsApp_Image_2026-05-06_at_12.47.57_t4wwip.jpg" alt="IPM Careers Toppers" className="w-full h-auto drop-shadow-2xl" />
              </div>

              <div className="absolute -bottom-8 -right-4 lg:-right-12 z-30">
                <div className="flex flex-col gap-3">
                  <div className="bg-[#0F121E] text-white rounded-2xl p-4 pr-8 flex items-center gap-4 shadow-xl mb-2">
                    <div className="bg-[#E89624] text-[#0F121E] p-3 rounded-full">
                      <Phone className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-widest text-white/50 uppercase">CALL NOW</div>
                      <a href="tel:+919310656662" className="text-2xl font-black font-heading mt-0.5 flex items-center gap-3 hover:text-[#E89624] transition-colors">93106 56662 <ArrowRight className="w-4 h-4 text-white/40" /></a>
                    </div>
                  </div>
                  <div className="bg-[#25D366] text-white rounded-2xl p-4 pr-8 flex items-center gap-4 shadow-xl">
                    <div className="bg-white text-[#25D366] p-3 rounded-full">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-widest text-white uppercase">WHATSAPP US</div>
                      <a href="https://wa.me/919616383524" target="_blank" rel="noopener noreferrer" className="text-2xl font-black font-heading mt-0.5 flex items-center gap-3 hover:text-white/80 transition-colors">96163 83524 <ArrowRight className="w-4 h-4 text-white/40" /></a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0A0D14] text-white py-12 px-6 lg:px-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:items-start items-center">
              <div className="text-white font-black font-heading italic text-xl flex items-center gap-1.5 opacity-80">
                <ShieldIcon className="w-5 h-5" />
                <span>IPM <span className="text-[#E89624]">CAREERS</span></span>
              </div>
              <div className="text-gray-500 text-sm mt-2">© 2026 IPM Careers Delhi Centre. All rights reserved.</div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400 font-medium">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Inline icon helpers (no extra deps)
function ShieldIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
  );
}

function UsersIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  );
}

function ZapIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
  );
}

function TrophyIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
  );
}

function AwardIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
  );
}
