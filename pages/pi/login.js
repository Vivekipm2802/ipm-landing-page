// /pages/pi/login.js — Standalone login page for PI Prep
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { useAuth } from '../../hooks/useAuth';

export default function PILogin() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();

  // If already logged in, redirect to profile
  useEffect(() => {
    if (!loading && user) {
      router.replace('/pi/profile');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'spin 1s linear infinite' }}>⏳</div>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NextSeo
        title="Login — PI Prep | IPM Careers"
        description="Sign in to access PI Prep — AI Mock Interviews, SOP Builder, Question Bank, and Expert Coaching for IIM IPM Personal Interview preparation."
        noindex={true}
      />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: "'Poppins', sans-serif",
      }}>
        {/* Logo / Brand */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎯</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
            PI Prep
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6c63ff', fontWeight: 600, margin: '4px 0 0' }}>
            by IPM Careers
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '2.5rem 2rem',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' }}>
            Welcome to PI Prep
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 8px', lineHeight: 1.6 }}>
            Your AI-powered Personal Interview preparation toolkit for IIM IPM admissions.
          </p>
          <p style={{ color: '#22c55e', fontSize: '0.82rem', fontWeight: 700, margin: '0 0 28px' }}>
            First 24 hours free — then just ₹99 one-time
          </p>

          <button
            onClick={signInWithGoogle}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 32px', border: '2px solid #e5e7eb', borderRadius: 14,
              background: '#fff', cursor: 'pointer', fontSize: '0.95rem',
              fontWeight: 700, color: '#1a1a2e', fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s',
              width: '100%', justifyContent: 'center',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#6c63ff'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(108,99,255,0.15)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ marginTop: 28, padding: '16px 18px', background: '#f8fafc', borderRadius: 14, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a2e', marginBottom: 10 }}>What you get:</div>
            {[
              'AI Mock Interview with IIM-style panel',
              'SOP Builder with AI review & trap detection',
              '40+ curated PI questions with model answers',
              'Expert booking for 1-on-1 coaching',
              'Recorded strategy sessions',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', fontSize: '0.8rem', color: '#475569' }}>
                <span style={{ color: '#22c55e' }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <a
          href="/"
          style={{
            marginTop: 24, color: '#94a3b8', fontSize: '0.8rem',
            textDecoration: 'none', transition: 'color 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.color = '#6c63ff'}
          onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
        >
          ← Back to IPM Careers
        </a>
      </div>
    </>
  );
}
