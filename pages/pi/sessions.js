import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import styles from './PIPrep.module.css';
import { NextSeo } from 'next-seo';
import PIAuthGuard from '../../components/PIAuthGuard';

// ── Session Data (editable — add/remove sessions here) ──
const PAST_SESSIONS = [
  {
    id: 'ps1',
    title: 'How to Crack the IIM Indore PI — Complete Strategy',
    speaker: 'Vivek Sharma',
    date: '2026-03-15',
    duration: '45 min',
    youtubeId: '',
    tags: ['Strategy', 'PI Tips'],
    description: 'Full breakdown of the IIM Indore PI process — what panels look for, common mistakes, and how to structure your answers.',
  },
  {
    id: 'ps2',
    title: 'SOP Masterclass — How to Write an SOP That Survives Cross-Questioning',
    speaker: 'Vivek Sharma',
    date: '2026-03-22',
    duration: '38 min',
    youtubeId: '',
    tags: ['SOP', 'Writing'],
    description: 'Step-by-step guide to writing an SOP that the panel can\'t poke holes in. With live examples and rewrites.',
  },
  {
    id: 'ps3',
    title: 'Current Affairs Rapid Fire — Top 30 GK Questions for PI',
    speaker: 'Vivek Sharma',
    date: '2026-04-01',
    duration: '30 min',
    youtubeId: '',
    tags: ['GK', 'Current Affairs'],
    description: 'Quick-fire session covering the 30 most likely current affairs questions you\'ll face in your PI.',
  },
  {
    id: 'ps4',
    title: 'Mock PI Live — Watch a Real Student Get Grilled',
    speaker: 'Vivek Sharma',
    date: '2026-04-10',
    duration: '55 min',
    youtubeId: '',
    tags: ['Mock PI', 'Live Demo'],
    description: 'Live mock PI with a real IPMAT student. Panel asks tough questions, student answers, expert breaks down what worked and what didn\'t.',
  },
];

const UPCOMING_SESSIONS = [
  {
    id: 'us1',
    title: 'Body Language & Confidence Hacks for PI Day',
    speaker: 'Vivek Sharma',
    date: '2026-04-28',
    time: '6:00 PM IST',
    duration: '40 min',
    youtubeLink: '',
    tags: ['Soft Skills', 'Confidence'],
    description: 'Non-verbal cues that make or break your PI. How to sit, where to look, when to smile, and how to handle awkward silences.',
    isLive: false,
  },
  {
    id: 'us2',
    title: 'Live Mock PI — Open Slots for 3 Students',
    speaker: 'Vivek Sharma',
    date: '2026-05-03',
    time: '5:00 PM IST',
    duration: '60 min',
    youtubeLink: '',
    tags: ['Mock PI', 'Interactive'],
    description: 'Live mock PI on YouTube. 3 students will be selected to face the panel live — submit your name to participate!',
    isLive: false,
  },
  {
    id: 'us3',
    title: 'Last-Minute PI Checklist — 48 Hours Before Your Interview',
    speaker: 'Vivek Sharma',
    date: '2026-05-10',
    time: '7:00 PM IST',
    duration: '35 min',
    youtubeLink: '',
    tags: ['Strategy', 'Last Minute'],
    description: 'Everything you need to do in the final 48 hours. Document checklist, revision plan, sleep schedule, and mental preparation.',
    isLive: false,
  },
];

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
  const d = new Date(dateStr + 'T00:00:00+05:30');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Sessions() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedSession, setSelectedSession] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  // Update countdowns every minute
  useEffect(() => {
    const updateCountdowns = () => {
      const cd = {};
      UPCOMING_SESSIONS.forEach(s => {
        cd[s.id] = getCountdown(s.date);
      });
      setCountdowns(cd);
    };
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { key: 'upcoming', label: '🔴 Upcoming Live', count: UPCOMING_SESSIONS.length },
    { key: 'past', label: '📼 Recorded', count: PAST_SESSIONS.length },
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

        {/* Upcoming Sessions */}
        {activeTab === 'upcoming' && (
          <div className={styles.sessionList}>
            {UPCOMING_SESSIONS.map(session => (
              <div key={session.id} className={styles.sessionCard}>
                <div className={styles.sessionCardHeader}>
                  <div className={styles.sessionDate}>
                    <div className={styles.sessionDateDay}>
                      {new Date(session.date + 'T00:00:00+05:30').getDate()}
                    </div>
                    <div className={styles.sessionDateMonth}>
                      {new Date(session.date + 'T00:00:00+05:30').toLocaleString('en-IN', { month: 'short' })}
                    </div>
                  </div>
                  <div className={styles.sessionInfo}>
                    <h3 className={styles.sessionTitle}>{session.title}</h3>
                    <div className={styles.sessionMeta}>
                      <span>🎤 {session.speaker}</span>
                      <span>⏱ {session.duration}</span>
                      <span>🕐 {session.time}</span>
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
                    const text = `📅 Reminder: "${session.title}" on ${formatDate(session.date)} at ${session.time}. Don't miss it!`;
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

            {UPCOMING_SESSIONS.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📅</div>
                <div className={styles.emptyTitle}>No upcoming sessions</div>
                <div className={styles.emptyDesc}>Check back soon — new live sessions are added every week.</div>
              </div>
            )}
          </div>
        )}

        {/* Past Sessions */}
        {activeTab === 'past' && (
          <div className={styles.sessionList}>
            {PAST_SESSIONS.map(session => (
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
                    <span>🎤 {session.speaker}</span>
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
