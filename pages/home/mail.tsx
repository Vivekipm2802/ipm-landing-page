import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, CheckCircle2, Zap } from 'lucide-react';

// FormSubmit - Production email service
const sendViaFormSubmit = async (fullname: string, email: string, phone: string, city: string, year: string) => {
  try {
    const formData = new FormData();
    formData.append('_subject', '🎓 New IPM Registration Alert!');
    formData.append('_template', 'table'); // Use clean table format
    formData.append('Name', fullname);
    formData.append('Email', email);
    formData.append('Phone', phone);
    formData.append('City', city || 'Not provided');
    formData.append('Target Year', year);
    formData.append('Submitted At', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
    
    const response = await fetch('https://formsubmit.co/rishabhsingh0363@gmail.com', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('FormSubmit failed');
    }
    
    console.log('✅ Email sent successfully');
    return response;
  } catch (error) {
    console.error('❌ FormSubmit error:', error);
    throw error;
  }
};

interface UnifiedRegistrationFormProps {
  variant?: 'classic' | 'modern';
  onSuccess?: (data: any) => void;
  className?: string;
}

const UnifiedRegistrationForm: React.FC<UnifiedRegistrationFormProps> = ({ 
  variant = 'modern',
  onSuccess,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    city: '',
    year: 'Target 2026'
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [notificationText, setNotificationText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullname || !formData.email || !formData.phone) {
      setNotificationText('Please fill all required fields');
      setTimeout(() => setNotificationText(''), 3000);
      return;
    }

    setFormStatus('submitting');

    try {
      await sendViaFormSubmit(
        formData.fullname,
        formData.email,
        formData.phone,
        formData.city,
        formData.year
      );

      setFormStatus('success');
      
      if (onSuccess) {
        onSuccess(formData);
      }

      setTimeout(() => {
        setFormStatus('idle');
        setFormData({
          fullname: '',
          email: '',
          phone: '',
          city: '',
          year: 'Target 2026'
        });
      }, 3000);

    } catch (error) {
      console.error('❌ Form submission error:', error);
      setFormStatus('idle');
      setNotificationText('Submission failed. Please try again.');
      setTimeout(() => setNotificationText(''), 3000);
    }
  };

  // Classic variant
  if (variant === 'classic') {
    return (
      <div className={`bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl ${className}`}>
        <h1 className="text-2xl font-bold text-white mb-6">
          Fill out the form to Schedule FREE 1-1 Consultation with an Expert
        </h1>
        
        {formStatus === 'success' ? (
          <div className="py-16 text-center">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h4 className="text-3xl font-bold mb-4 text-white">
              Application Received!
            </h4>
            <p className="text-slate-400">
              Our team will contact you within 2 working hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              type="text"
              placeholder="Enter your Full Name"
              className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500"
              value={formData.fullname}
              onChange={(e) => setFormData(prev => ({ ...prev, fullname: e.target.value }))}
            />
            
            <input
              required
              type="email"
              placeholder="Enter your Email Address"
              className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
            
            <input
              required
              type="tel"
              placeholder="Enter your Phone Number"
              className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
            
            <input
              type="text"
              placeholder="Enter your City"
              className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            />
            
            <select
              className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
            >
              <option value="">When are you planning to take IPM?</option>
              <option value="Target 2026">Target 2026</option>
              <option value="Target 2027">Target 2027</option>
              <option value="Target 2028">Target 2028</option>
            </select>
            
            <button
              type="submit"
              disabled={formStatus === 'submitting'}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formStatus === 'submitting' ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
            
            <div className="flex items-center justify-center gap-2 pt-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <p className="text-xs text-slate-500">Your Data is End-to-End Encrypted!</p>
            </div>
          </form>
        )}
        
        {notificationText && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
            {notificationText}
          </div>
        )}
      </div>
    );
  }

  // Modern variant
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className={`lg:col-span-5 ${className}`}
    >
      <div className="bg-slate-800/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[50px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative">
        <div className="absolute -top-6 -right-6 bg-yellow-400 text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl animate-bounce">
          Limited Batch Seats
        </div>

        <h3 className="text-3xl font-serif font-bold mb-2 text-white">
          Join Directors Special Batch
        </h3>
        <p className="text-slate-400 text-sm mb-8">
          Schedule a 1-on-1 Strategy Session with Poorva Didi's Team.
        </p>

        {formStatus === 'success' ? (
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
              Our Senior Counsellor will call you within 2 working hours.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <input
                required
                type="text"
                placeholder="Candidate Name"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-yellow-400/50 outline-none transition-all placeholder:text-slate-600 group-hover:border-slate-500 text-white"
                value={formData.fullname}
                onChange={(e) => setFormData(prev => ({ ...prev, fullname: e.target.value }))}
              />
            </div>
            
            <div className="group">
              <input
                required
                type="tel"
                placeholder="WhatsApp Number"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-yellow-400/50 outline-none transition-all placeholder:text-slate-600 group-hover:border-slate-500 text-white"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div className="group">
              <input
                required
                type="email"
                placeholder="Email Address"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-yellow-400/50 outline-none transition-all placeholder:text-slate-600 group-hover:border-slate-500 text-white"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <select 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-yellow-400/50 outline-none appearance-none cursor-pointer text-slate-300"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                >
                  <option value="Target 2026">Target 2026</option>
                  <option value="Target 2027">Target 2027</option>
                  <option value="Target 2028">Target 2028</option>
                </select>
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 rotate-90 pointer-events-none" />
              </div>
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder="City"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-yellow-400/50 outline-none text-slate-300 placeholder:text-slate-600"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={formStatus === 'submitting'}
              className="w-full py-6 bg-yellow-400 text-slate-900 font-black rounded-[20px] text-xl hover:bg-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {formStatus === 'submitting' ? (
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
        
        {notificationText && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
            {notificationText}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UnifiedRegistrationForm;