import Head from 'next/head';
import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ThankYou() {
  // Auto-redirect to home after 60 seconds (optional safety net)
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = 'https://www.ipmcareer.com/';
    }, 60000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Head>
        <title>Thank You — IPM Careers New Delhi</title>
        <meta name="description" content="Your registration is confirmed. Our counsellor will contact you within 24 hours." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ background: 'linear-gradient(135deg, #05060A 0%, #0A0D14 60%, #0f1018 100%)' }}>

        {/* Logo */}
        <a href="https://www.ipmcareer.com/" className="mb-10">
          <img src="https://register.ipmcareer.com/whitelogoipm.svg" alt="IPM Careers" className="h-10" />
        </a>

        {/* Card */}
        <div className="w-full max-w-md rounded-3xl p-8 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(232,150,36,0.3)' }}>

          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(232,150,36,0.15)', border: '2px solid #E89624' }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: '#E89624' }} />
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-black text-white mb-2"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Thank You!
          </h1>
          <p className="font-semibold mb-6" style={{ color: '#E89624' }}>
            Your registration is confirmed 🎉
          </p>

          {/* Next steps */}
          <div className="rounded-2xl p-5 mb-6 text-left space-y-4"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              What happens next?
            </p>

            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">📞</span>
              <p className="text-sm text-gray-300 leading-relaxed">
                Our counsellor will call you on your WhatsApp number within{' '}
                <span className="text-white font-semibold">24 hours</span>.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">🗂️</span>
              <p className="text-sm text-gray-300 leading-relaxed">
                We will share your personalised{' '}
                <span className="text-white font-semibold">IPMAT Study Plan</span>{' '}
                and Director's Batch schedule.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">🏆</span>
              <p className="text-sm text-gray-300 leading-relaxed">
                Get ready to begin your journey to{' '}
                <span className="text-white font-semibold">IIM as a future IIMer!</span>
              </p>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/919616383524?text=Hi%20IPM%20Careers%2C%20I%20just%20registered%20on%20the%20New%20Delhi%20page.%20Please%20guide%20me%20on%20next%20steps."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all hover:opacity-90 mb-3"
            style={{ background: '#25D366', color: '#fff' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat with us on WhatsApp
          </a>

          <a
            href="/new-delhi"
            className="block text-sm text-center py-2 transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseOver={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
            onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}
          >
            ← Register another student
          </a>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
          © 2026 IPM Careers Delhi Centre · All rights reserved
        </p>
      </div>
    </>
  );
}
