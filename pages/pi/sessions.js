import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import styles from './PIPrep.module.css';
import { NextSeo } from 'next-seo';
import PIAuthGuard from '../../components/PIAuthGuard';
import { supabase } from '../../utils/supabaseClient';

const TAG_COLORS = {
  'Strategy': '#6c63ff',
  'PI Tips': '#22c55e',
  'SOP': '#f5a623',
  'Writing': '#06b6d4',
  'GK': '#ef4444',
  'Current Affairs': '#ef4444',
  'Mock PI': '#8b5cf6',
  'Live Demo': '#ec4899',
  'Soft Skills': '#14b8a6',
  'Confidence': '#f59e0b',
  'Interactive': '#3b82f6',
  'Last Minute': '#f97316',
};

function getCountdown(dateStr) {
  const target = new Date(dateStr + 'T00:00:00+05:30');
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00+05:30');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Sessions() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedSession, setSelectedSession] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [pastSessions, setPastSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch sessions from Supabase
  useEffect(() => {
    async function fetchSessions() {
      try {
        const { data, error } = await supabase
          .from('pi_sessions')
          .select('*')
          .eq('is_published', true)
          .order('session_date', { ascending: false });
        if (!error && data) {
          const past = [];
          const upcoming = [];
          data.forEach(s => {
            if (s.session_type === 'recorded') {
              past.push({
                id: s.id,
                title: s.title,
                speaker: s.speaker || 'Vivek Sharma',
                date: s.session_date,
                duration: s.duration,
                youtubeId: s.youtube_id || '',
                tags: Array.isArray(s.tags) ? s.tags : [],
                description: s.description || '',
              });
            } else {
              upcoming.push({
                id: s.id,
                title: s.title,
                speaker: s.speaker || 'Vivek Sharma',
                date: s.session_date,
                time: s.session_time || '',
                duration: s.duration,
                youtubeLink: s.youtube_link || '',
                tags: Array.isArray(s.tags) ? s.tags : [],
                description: s.description || '',
                isLive: false,
              });
            }
          });
          setPastSessions(past);
          setUpcomingSessions(upcoming);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  // Update countdowns every minute
  useEffect(() => {
    const updateCountdowns = () => {
      const cd = {};
      upcomingSessions.forEach(s => {
        if (s.date) cd[s.id] = getCountdown(s.date);
      });
      setCountdowns(cd);
    };
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000);
    return () => clearInterval(interval);
  }, [upcomingSessions]);

  const tabs = [
    { key: 'upcoming', label: '🔴 Upcoming Live', count: upcomingSessions.length },
    { key: 'past', label: '📼 Recorded', count: pastSessions.length },
  ];

  return (
    <AppShell>
      <PIAuthGuard>
      <NextSeo title="Sessions — PI Prep | IPM Careers" />
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Sessions</h1>
          <p className={styles.pageSubtitle}>
            Watch recorded PI strategy sessions and join upcoming live sessions on YouTube
          </p>
        </div>

        {/* Tab Bar */}
        <div className={styles.tabBar}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className={styles.tabCount}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⏳</div>
            <div className={styles.emptyTitle}>Loading sessions...</div>
          </div>
        )}

        {/* Upcoming Sessions */}
        {!loading && activeTab === 'upcoming' && (
          <div className={styles.sessionList}>
            {upcomingSessions.map(session => (
              <div key={session.id} className={styles.sessionCard}>
                <div className={styles.sessionCardHeader}>
                  <div className={styles.sessionDate}>
                    <div className={styles.sessionDateDay}>
                      {session.date ? new Date(session.date + 'T00:00:00+05:30').getDate() : '--'}
                    </div>
                    <div className={styles.sessionDateMonth}>
                      {session.date ? new Date(session.date + 'T00:00:00+05:30').toLocaleString('en-IN', { month: 'short' }) : ''}
                    </div>
                  </div>
                  <div className={styles.sessionInfo}>
                    <h3 className={styles.sessionTitle}>{session.title}</h3>
                    <div className={styles.sessionMeta}>
                      <span>🎙 {session.speaker}</span>
                      <span>⏱ {session.duration}</span>
                      {session.time && <span>🕐 {session.time}</span>}
                    </div>
                    <div className={styles.sessionTags}>
                      {session.tags.map(tag => (
                        <span key={tag} className={styles.sessionTag} style={{ background: (TAG_COLORS[tag] || '#6c63ff') + '18', color: TAG_COLORS[tag] || '#6c63ff' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {countdowns[session.id] && (
                    <div className={styles.countdown}>
                      <div className={styles.countdownValue}>{countdowns[session.id]}</div>
                      <div className={styles.countdownLabel}>until live</div>
                    </div>
                  )}
                </div>
                <p className={styles.sessionDesc}>{session.description}</p>
                <div className={styles.sessionActions}>
                  {session.youtubeLink ? (
                    <a href={session.youtubeLink} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                      🔴 Set Reminder on YouTube
                    </a>
                  ) : (
                    <button className={styles.btnSecondary} disabled style={{ opacity: 0.6 }}>
                      🔗 YouTube link coming soon
                    </button>
                  )}
                  <button className={styles.btnSecondary} onClick={() => {
                    const text = `📅 Reminder: "${session.title}" on ${formatDate(session.date)}${session.time ? ` at ${session.time}` : ''}. Don't miss it!`;
                    if (navigator.share) {
                      navigator.share({ text });
                    } else {
                      navigator.clipboard.writeText(text);
                      alert('Session details copied!');
                    }
                  }}>
                    📤 Share
                  </button>
                </div>
              </div>
            ))}

            {upcomingSessions.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📅</div>
                <div className={styles.emptyTitle}>No upcoming sessions</div>
                <div className={styles.emptyDesc}>Check back soon — new live sessions are added every week.</div>
              </div>
            )}
          </div>
        )}

        {/* Past Sessions */}
        {!loading && activeTab === 'past' && (
          <div className={styles.sessionList}>
            {pastSessions.map(session => (
              <div key={session.id} className={styles.sessionCard}>
                {/* YouTube Embed */}
                {session.youtubeId ? (
                  <div className={styles.videoEmbed}>
                    <iframe
                      src={`https://www.youtube.com/embed/${session.youtubeId}`}
                      title={session.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <span className={styles.videoPlaceholderIcon}>🎬</span>
                    <span>Video coming soon</span>
                  </div>
                )}

                <div className={styles.sessionInfo} style={{ padding: '1rem 0 0' }}>
                  <h3 className={styles.sessionTitle}>{session.title}</h3>
                  <div className={styles.sessionMeta}>
                    <span>🎙 {session.speaker}</span>
                    <span>⏱ {session.duration}</span>
                    <span>📅 {formatDate(session.date)}</span>
                  </div>
                  <div className={styles.sessionTags}>
                    {session.tags.map(tag => (
                      <span key={tag} className={styles.sessionTag} style={{ background: (TAG_COLORS[tag] || '#6c63ff') + '18', color: TAG_COLORS[tag] || '#6c63ff' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p className={styles.sessionDesc}>{session.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Subscribe CTA */}
        <div className={styles.card} style={{ textAlign: 'center', marginTop: '2rem', background: 'linear-gradient(135deg, #6c63ff10, #f5a62310)', border: '1px solid #6c63ff30' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔔</div>
          <div className={styles.cardTitle} style={{ textAlign: 'center' }}>Never miss a session</div>
          <div className={styles.cardSubtitle} style={{ textAlign: 'center' }}>
            Subscribe to our YouTube channel for live PI strategy sessions, mock interviews, and more
          </div>
          <div className={styles.btnRow} style={{ justifyContent: 'center', marginTop: '1rem' }}>
            <a
              href="https://www.youtube.com/@ipmcareers"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
            >
              Subscribe on YouTube
            </a>
          </div>
        </div>
      </div>
    </PIAuthGuard>
    </AppShell>
  );
}
