import { useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import AppShell from '../components/AppShell';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

export default function InterviewPrep() {
    const router = useRouter();
    const [uid, setUid] = useState('');
    const [loading, setLoading] = useState(true);

  useEffect(() => {
        // Priority: URL param uid > logged-in user's response uid
                const getUid = async () => {
                        if (router.isReady && router.query.uid) {
                                  setUid(router.query.uid);
                                  setLoading(false);
                                  return;
                        }

                        // Try to get uid from logged-in user's latest response
                        try {
                                  const { data: { user } } = await supabase.auth.getUser();
                                  if (user) {
                                              const { data } = await supabase
                                                .from('responses')
                                                .select('uid')
                                                .eq('email', user.email)
                                                .order('created_at', { ascending: false })
                                                .limit(1)
                                                .single();

                                    if (data?.uid) {
                                                  setUid(data.uid);
                                    }
                                  }
                        } catch (e) {
                                  console.log('Could not auto-fetch uid:', e);
                        }
                        setLoading(false);
                };

                getUid();
  }, [router.isReady, router.query.uid]);

  // Standalone mock interview app URL
  const interviewAppUrl = `https://ipm-mock-interview.vercel.app${uid ? `?uid=${uid}` : ''}`;

  return (
        <AppShell>
          <NextSeo
          title="AI Mock Interview | IPM Careers"
          description="Practice for your IIM Indore PI with our AI-powered mock interview panel."
        />
                  <div style={{ width: '100%', height: 'calc(100vh - 64px)', position: 'relative' }}>
{loading ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
                          height: '100%', color: '#999', fontSize: '14px'
            }}>
            Loading your interview session...
  </div>
          ) : !uid ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', height: '100%', gap: '16px', padding: '24px'
            }}>
            <p style={{ color: '#999', fontSize: '16px', textAlign: 'center' }}>
              Please complete the Score Analyzer first to set up your interview profile.
  </p>
             <a
               href="https://register.ipmcareer.com"
               style={{
                                 padding: '12px 32px', background: '#C5A059', color: '#000',
                                 borderRadius: '12px', fontWeight: 700, textDecoration: 'none',
                                 fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px'
               }}
            >
              Take Score Analyzer
                </a>
                </div>
        ) : (
                    <iframe
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
