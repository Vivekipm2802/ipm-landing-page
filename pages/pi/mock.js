import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import styles from './PIPrep.module.css';
import { NextSeo } from 'next-seo';

const MODES = [
  { key: 'sop', icon: '📝', name: 'SOP Deep-Dive', desc: 'Questions from your SOP', duration: '10 min' },
  { key: 'academic', icon: '🎓', name: 'Academics', desc: 'School, subjects, scores', duration: '8 min' },
  { key: 'gk', icon: '📰', name: 'Current Affairs', desc: 'GK & opinion questions', duration: '8 min' },
  { key: 'situational', icon: '🧩', name: 'Situational', desc: 'HR & behavioral', duration: '10 min' },
  { key: 'full', icon: '🎯', name: 'Full Mock', desc: 'Complete PI simulation', duration: '20 min' },
];

export default function MockInterview() {
  const router = useRouter();
  const [mode, setMode] = useState(null);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [report, setReport] = useState(null);
  const [geminiKey, setGeminiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const maxQuestions = mode === 'full' ? 12 : 6;

  useEffect(() => {
    try {
      const key = localStorage.getItem('gemini_api_key');
      if (key) setGeminiKey(key);
    } catch {}
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveGeminiKey = (key) => {
    setGeminiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowKeyInput(false);
  };

  const startInterview = async () => {
    if (!geminiKey) {
      setShowKeyInput(true);
      return;
    }
    if (!mode) return;

    setStarted(true);
    setMessages([]);
    setFinished(false);
    setReport(null);
    setQuestionCount(0);
    setLoading(true);

    // Load profile and SOP for context
    let profile = {}, sop = {};
    try { profile = JSON.parse(localStorage.getItem('pi_profile') || '{}'); } catch {}
    try { sop = JSON.parse(localStorage.getItem('pi_sop') || '{}'); } catch {}

    try {
      const res = await fetch('/api/pi/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          mode,
          profile,
          sop,
          apiKey: geminiKey,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages([{ role: 'ai', text: data.message }]);
      setQuestionCount(1);
    } catch (err) {
      setMessages([{ role: 'ai', text: 'Error starting interview: ' + err.message }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Load profile and SOP
    let profile = {}, sop = {};
    try { profile = JSON.parse(localStorage.getItem('pi_profile') || '{}'); } catch {}
    try { sop = JSON.parse(localStorage.getItem('pi_sop') || '{}'); } catch {}

    try {
      const res = await fetch('/api/pi/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'continue',
          mode,
          profile,
          sop,
          history: [...messages, { role: 'user', text: userMsg }],
          questionCount: questionCount,
          maxQuestions,
          apiKey: geminiKey,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'ai', text: data.message }]);
      setQuestionCount(prev => prev + 1);

      if (data.finished) {
        setFinished(true);
        // Generate report
        generateReport([...messages, { role: 'user', text: userMsg }, { role: 'ai', text: data.message }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error: ' + err.message }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const generateReport = async (fullHistory) => {
    let profile = {};
    try { profile = JSON.parse(localStorage.getItem('pi_profile') || '{}'); } catch {}

    try {
      const res = await fetch('/api/pi/mock-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          history: fullHistory,
          profile,
          apiKey: geminiKey,
        }),
      });

      const data = await res.json();
      if (!data.error) setReport(data);
    } catch {}
  };

  const endInterview = () => {
    setFinished(true);
    generateReport(messages);
  };

  // Mode selection screen
  if (!started) {
    return (
      <AppShell>
        <NextSeo title="AI Mock Interview — PI Prep | IPM Careers" />
        <div className={styles.pageContainer}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>AI Mock Interview</h1>
            <p className={styles.pageSubtitle}>
              Practice with an AI that reads your SOP and profile — just like a real IIM Indore panel
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Choose Interview Mode</div>
            <div className={styles.cardSubtitle}>Each mode focuses on a different aspect of the PI</div>
            <div className={styles.modeGrid}>
              {MODES.map(m => (
                <div
                  key={m.key}
                  className={`${styles.modeCard} ${mode === m.key ? styles.modeCardActive : ''}`}
                  onClick={() => setMode(m.key)}
                >
                  <div className={styles.modeIcon}>{m.icon}</div>
                  <div className={styles.modeName}>{m.name}</div>
                  <div className={styles.modeDesc}>{m.desc}</div>
                  <div className={styles.modeDuration}>{m.duration}</div>
                </div>
              ))}
            </div>
          </div>

          {showKeyInput && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>🔑 Enter Your Gemini API Key</div>
              <div className={styles.cardSubtitle}>
                Get a free key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style={{ color: '#6c63ff' }}>Google AI Studio</a>. Your key stays in your browser only.
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="AIza..."
                  onChange={e => setGeminiKey(e.target.value)}
                />
                <button className={styles.btnPrimary} onClick={() => saveGeminiKey(geminiKey)}>Save</button>
              </div>
            </div>
          )}

          <div className={styles.btnRow}>
            <button
              className={styles.btnPrimary}
              onClick={startInterview}
              disabled={!mode}
            >
              🎙️ Start Interview
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Interview in progress
  return (
    <AppShell>
      <NextSeo title="AI Mock Interview — In Progress | IPM Careers" />
      <div className={styles.pageContainer} style={{ maxWidth: 700 }}>
        <div className={styles.chatContainer}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderInfo}>
              <div className={styles.chatAvatar}>🎓</div>
              <div>
                <div className={styles.chatName}>IIM Indore PI Panel</div>
                <div className={styles.chatRole}>
                  {MODES.find(m => m.key === mode)?.name} · Q{questionCount}/{maxQuestions}
                </div>
              </div>
            </div>
            {!finished && (
              <button
                className={styles.btnSecondary}
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', padding: '6px 14px', minHeight: 'auto' }}
                onClick={endInterview}
              >
                End Interview
              </button>
            )}
          </div>

          {/* Messages */}
          <div className={styles.chatMessages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.chatBubble} ${msg.role === 'ai' ? styles.chatBubbleAI : styles.chatBubbleUser}`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className={styles.chatTyping}>
                <div className={styles.typingDot}></div>
                <div className={styles.typingDot}></div>
                <div className={styles.typingDot}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!finished ? (
            <div className={styles.chatInputArea}>
              <input
                ref={inputRef}
                className={styles.chatInput}
                placeholder="Type your answer..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                disabled={loading}
              />
              <button className={styles.chatSend} onClick={sendMessage} disabled={loading || !input.trim()}>
                ➤
              </button>
            </div>
          ) : (
            <div className={styles.chatInputArea} style={{ justifyContent: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                Interview ended · {report ? 'Report ready below' : 'Generating report...'}
              </span>
            </div>
          )}
        </div>

        {/* Report Card */}
        {report && (
          <div className={styles.reportCard} style={{ marginTop: '1.5rem' }}>
            <div className={styles.reportTitle}>📊 Interview Report Card</div>
            <div className={styles.reportScoreRow}>
              <div className={styles.reportDimension}>
                <div className={styles.reportDimScore} style={{ color: '#22c55e' }}>{report.communication || '—'}</div>
                <div className={styles.reportDimMax}>/10</div>
                <div className={styles.reportDimLabel}>Communication</div>
              </div>
              <div className={styles.reportDimension}>
                <div className={styles.reportDimScore} style={{ color: '#f5a623' }}>{report.clarity || '—'}</div>
                <div className={styles.reportDimMax}>/10</div>
                <div className={styles.reportDimLabel}>Clarity</div>
              </div>
              <div className={styles.reportDimension}>
                <div className={styles.reportDimScore} style={{ color: '#6c63ff' }}>{report.depth || '—'}</div>
                <div className={styles.reportDimMax}>/10</div>
                <div className={styles.reportDimLabel}>Depth</div>
              </div>
              <div className={styles.reportDimension}>
                <div className={styles.reportDimScore} style={{ color: '#ef4444' }}>{report.confidence || '—'}</div>
                <div className={styles.reportDimMax}>/10</div>
                <div className={styles.reportDimLabel}>Confidence</div>
              </div>
              <div className={styles.reportDimension}>
                <div className={styles.reportDimScore} style={{ color: '#06b6d4' }}>{report.overall || '—'}</div>
                <div className={styles.reportDimMax}>/10</div>
                <div className={styles.reportDimLabel}>Overall</div>
              </div>
            </div>

            {report.strengths && (
              <div className={styles.reportFeedback}>
                <div className={styles.reportFeedbackTitle}>✅ What went well</div>
                <p className={styles.reportFeedbackText}>{report.strengths}</p>
              </div>
            )}

            {report.improvements && (
              <div className={styles.reportFeedback} style={{ marginTop: '0.75rem' }}>
                <div className={styles.reportFeedbackTitle}>🔧 Areas to improve</div>
                <p className={styles.reportFeedbackText}>{report.improvements}</p>
              </div>
            )}

            {report.tips && (
              <div className={styles.reportFeedback} style={{ marginTop: '0.75rem' }}>
                <div className={styles.reportFeedbackTitle}>💡 Pro tips for next time</div>
                <p className={styles.reportFeedbackText}>{report.tips}</p>
              </div>
            )}

            <div className={styles.btnRow} style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className={styles.btnPrimary} onClick={() => { setStarted(false); setMode(null); setFinished(false); setReport(null); setMessages([]); }}>
                🔄 Practice Again
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
