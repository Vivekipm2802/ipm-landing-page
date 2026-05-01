import { useEffect, useState, useRef } from 'react';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';

export default function InterviewPrep() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [missingItems, setMissingItems] = useState([]);
  const iframeRef = useRef(null);
  const dataSentRef = useRef(false);

  useEffect(() => {
    // Check if profile and SOP are filled in localStorage
    let profile = null;
    let sop = null;

    try {
      const profileStr = localStorage.getItem('pi_profile');
      if (profileStr) profile = JSON.parse(profileStr);
    } catch {}

    try {
      const sopStr = localStorage.getItem('pi_sop');
      if (sopStr) sop = JSON.parse(sopStr);
    } catch {}

    // Validate profile completeness — need at least name
    const missing = [];
    if (!profile || !profile.name) {
      missing.push('My Profile');
    }

    // Validate SOP — need at least 2 sections filled (20+ words each)
    const sopSections = ['intro', 'why_mba', 'why_iim', 'strengths', 'career', 'conclusion'];
    const filledSections = sopSections.filter(
      (key) => sop && sop[key] && sop[key].trim().split(/\s+/).length >= 20
    );
    if (filledSections.length < 2) {
      missing.push('SOP Builder');
    }

    if (missing.length > 0) {
      setMissingItems(missing);
      setLoading(false);
      return;
    }

    // Both are ready — build the SOP text for the interview
    const sopText = sopSections
      .map((key) => {
        const labels = {
          intro: 'Introduction',
          why_mba: 'Why MBA at 18',
          why_iim: 'Why IIM Indore IPM',
          strengths: 'Strengths & Evidence',
          career: 'Career Goals',
          conclusion: 'Closing Statement',
        };
        return sop[key] ? `${labels[key]}: ${sop[key]}` : '';
      })
      .filter(Boolean)
      .join('\n');

    // Store the data to send via postMessage once iframe is ready
    window.__interviewStudentData = {
      name: profile.name || 'Student',
      city: profile.city || 'India',
      sop: sopText,
      profile: {
        school: profile.school || '',
        board: profile.board || '',
        stream: profile.stream || '',
        class10_pct: profile.class10_pct || '',
        class12_pct: profile.class12_pct || '',
        extracurriculars: profile.extracurriculars || [],
        achievements: profile.achievements || [],
        why_mba: profile.why_mba || '',
        career_goal: profile.career_goal || '',
        strengths: profile.strengths || '',
        weaknesses: profile.weaknesses || '',
      },
    };

    // If they also have Score Analyzer scores, include them
    if (profile.ipmat_score) {
      window.__interviewStudentData.scores = {
        total: profile.ipmat_score,
        sa: profile.sa_score || '',
        mcq: profile.mcq_score || '',
        va: profile.va_score || '',
      };
    }

    setReady(true);
    setLoading(false);
  }, []);

  // Send student data to iframe via postMessage
  const sendDataToIframe = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow && window.__interviewStudentData) {
      iframe.contentWindow.postMessage(
        {
          type: 'STUDENT_DATA',
          payload: window.__interviewStudentData,
        },
        'https://interview.ipmcareer.com'
      );
    }
  };

  // Listen for INTERVIEW_READY message from iframe, then send student data
  useEffect(() => {
    if (!ready) return;

    const handleMessage = (event) => {
      if (event.data?.type === 'INTERVIEW_READY') {
        sendDataToIframe();
      }
    };

    window.addEventListener('message', handleMessage);

    // Also send on iframe load (backup for race condition)
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', () => {
        // Small delay to let iframe set up its listener
        setTimeout(sendDataToIframe, 500);
      });
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [ready]);

  const interviewAppUrl = 'https://interview.ipmcareer.com?mode=postmessage';

  return (
    <AppShell>
      <NextSeo
        title="AI Mock Interview | IPM Careers"
        description="Practice for your IIM Indore PI with our AI-powered mock interview panel."
      />
      <div style={{ width: '100%', height: 'calc(100vh - 64px)', position: 'relative' }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#999',
              fontSize: '14px',
            }}
          >
            Loading your interview session...
          </div>
        ) : missingItems.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '20px',
              padding: '24px',
            }}
          >
            <p
              style={{
                color: '#999',
                fontSize: '16px',
                textAlign: 'center',
                maxWidth: '400px',
                lineHeight: '1.6',
              }}
            >
              Please complete{' '}
              <strong style={{ color: '#C5A059' }}>
                {missingItems.join(' and ')}
              </strong>{' '}
              first to set up your interview profile.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {missingItems.includes('My Profile') && (
                <a
                  href="/pi/profile"
                  style={{
                    padding: '12px 28px',
                    background: '#C5A059',
                    color: '#000',
                    borderRadius: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Fill My Profile
                </a>
              )}
              {missingItems.includes('SOP Builder') && (
                <a
                  href="/pi/sop"
                  style={{
                    padding: '12px 28px',
                    background: missingItems.includes('My Profile')
                      ? 'transparent'
                      : '#C5A059',
                    color: missingItems.includes('My Profile') ? '#C5A059' : '#000',
                    borderRadius: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: '2px solid #C5A059',
                  }}
                >
                  Build Your SOP
                </a>
              )}
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={interviewAppUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '12px',
            }}
            allow="microphone; autoplay"
            title="AI Mock Interview"
          />
        )}
      </div>
    </AppShell>
  );
}
