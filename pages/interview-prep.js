import { useState, useRef, useEffect } from 'react';
import { NextSeo } from 'next-seo';
import 'tailwindcss/tailwind.css';
import { Button, Input, Spacer, Chip } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import AppShell from '../components/AppShell';
import styles from './InterviewPrep.module.css';

// IPMAT PI question categories
const QUESTION_CATEGORIES = [
  { id: 'why_ipm', label: 'Why IPM/IIM?', icon: '🎯' },
  { id: 'about_you', label: 'About You', icon: '🧑' },
  { id: 'academics', label: 'Academics', icon: '📚' },
  { id: 'current_affairs', label: 'Current Affairs', icon: '🌍' },
  { id: 'leadership', label: 'Leadership & Teamwork', icon: '👥' },
  { id: 'ethics', label: 'Ethics & Dilemma', icon: '⚖️' },
  { id: 'career', label: 'Career Goals', icon: '🚀' },
  { id: 'general', label: 'General PI', icon: '💬' },
];

const MAX_FREE_MESSAGES = 20; // Free trial: 20 messages (roughly 2 mock sessions)

export default function InterviewPrep() {
  const router = useRouter();
  const { uid } = router.query;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [trialEnded, setTrialEnded] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch student data if uid provided
  useEffect(() => {
    if (uid) {
      fetchStudentData(uid);
    }
  }, [uid]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchStudentData(uuid) {
    try {
      const { data, error } = await supabase.rpc('get_response_data', { uuid_arg: uuid });
      if (data && data.length > 0) {
        const record = data[0];
        const parsed = JSON.parse(record.data);
        setStudentData({
          name: record.name,
          total: record.total,
          category: record.category,
          sa: parsed.sa?.length || 0,
          mcq: parsed.mcq?.length || 0,
          va: parsed.va?.length || 0,
        });
      }
    } catch (e) {
      console.error('Failed to fetch student data:', e);
    }
  }

  function startSession(category) {
    setSelectedCategory(category);
    setSessionStarted(true);

    const studentContext = studentData
      ? `\n\nThe student's name is ${studentData.name}, they scored ${studentData.total}/360 in IPMAT, category: ${studentData.category}.`
      : '';

    const welcomeMessage = {
      role: 'assistant',
      content: `Welcome to your AI Mock PI Session! 🎓\n\nI'll be your interviewer today, focusing on **${category.label}** questions.\n\nI'll ask you questions one at a time, just like a real IIM PI panel. After each answer, I'll give you feedback and tips.\n\nLet's begin! Are you ready?${studentContext ? '\n\n*I can see your IPMAT score — I\'ll factor that into our discussion.*' : ''}`,
    };
    setMessages([welcomeMessage]);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    if (messageCount >= MAX_FREE_MESSAGES) {
      setTrialEnded(true);
      return;
    }

    const userMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const res = await fetch('/api/interviewChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          category: selectedCategory.id,
          studentData,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Something went wrong. Please try again.",
      }]);
    }

    setLoading(false);
  }

  // Landing state — category selector
  if (!sessionStarted) {
    return (
      <AppShell activePage="/interview-prep">
      <div className={styles.prepPage}>
        <NextSeo
          title="AI Mock Interview | IPM Careers"
          description="Practice for your IIM PI round with our AI-powered mock interview tool. Get instant feedback and improve your answers."
        />

        <div className={styles.heroSection}>
          <img src="/hd-logo.svg" alt="IPM Careers" className={styles.heroLogo} />
          <h1 className={styles.heroTitle}>AI Mock PI Interview</h1>
          <p className={styles.heroSubtitle}>
            Practice for your IIM Personal Interview with our AI interviewer.
            Get real-time feedback on your answers.
          </p>
          {studentData && (
            <div className={styles.studentBadge}>
              <span>Welcome, {studentData.name}</span>
              <Chip size="sm" color="secondary">Score: {studentData.total}/360</Chip>
            </div>
          )}
        </div>

        <div className={styles.categorySection}>
          <h2 className={styles.categoryTitle}>Choose Your Interview Topic</h2>
          <p className={styles.categorySubtitle}>Select a category to start your mock PI session</p>
          <div className={styles.categoryGrid}>
            {QUESTION_CATEGORIES.map(cat => (
              <div
                key={cat.id}
                className={styles.categoryCard}
                onClick={() => startSession(cat)}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryLabel}>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.trialNote}>
          <span>✨</span> Free trial includes {MAX_FREE_MESSAGES} messages (~2 mock sessions). For unlimited access, enroll in our PI Batch.
        </div>
      </div>
      </AppShell>
    );
  }

  // Chat state
  return (
    <AppShell activePage="/interview-prep">
    <div className={styles.chatPage}>
      <NextSeo title={`Mock PI: ${selectedCategory.label} | IPM Careers`} />

      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          <Button
            size="sm"
            variant="light"
            onPress={() => { setSessionStarted(false); setMessages([]); setSelectedCategory(null); }}
          >
            ← Back
          </Button>
          <div>
            <div className={styles.chatHeaderTitle}>Mock PI Interview</div>
            <div className={styles.chatHeaderCategory}>{selectedCategory.icon} {selectedCategory.label}</div>
          </div>
        </div>
        <div className={styles.chatHeaderRight}>
          <Chip size="sm" variant="flat" color={messageCount >= MAX_FREE_MESSAGES - 5 ? 'danger' : 'default'}>
            {MAX_FREE_MESSAGES - messageCount} messages left
          </Chip>
        </div>
      </div>

      {/* Chat Messages */}
      <div className={styles.chatMessages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.chatBubble} ${msg.role === 'user' ? styles.chatUser : styles.chatAssistant}`}>
            {msg.role === 'assistant' && <div className={styles.chatAvatar}>🎓</div>}
            <div className={styles.chatContent}>
              <div className={styles.chatText} dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br />')
              }} />
            </div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.chatBubble} ${styles.chatAssistant}`}>
            <div className={styles.chatAvatar}>🎓</div>
            <div className={styles.chatContent}>
              <div className={styles.typingIndicator}>
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Trial Ended Overlay */}
      {trialEnded && (
        <div className={styles.trialOverlay}>
          <div className={styles.trialOverlayCard}>
            <h3>Free Trial Completed!</h3>
            <p>You've used all {MAX_FREE_MESSAGES} free messages. To continue unlimited mock PI sessions:</p>
            <Button
              className={styles.enrollCta}
              onPress={() => router.push('/pi-batch')}
            >
              Enroll in PI Batch — Unlimited Access
            </Button>
            <Button
              variant="light"
              onPress={() => window.open('https://wa.me/918299470392?text=Hi%2C%20I%20tried%20the%20AI%20Mock%20Interview%20and%20want%20to%20know%20about%20PI%20Batch', '_blank')}
            >
              Talk to a Mentor
            </Button>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className={styles.chatInputBar}>
        <input
          className={styles.chatInput}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={trialEnded ? 'Trial ended — enroll for unlimited access' : 'Type your answer...'}
          disabled={loading || trialEnded}
        />
        <Button
          className={styles.sendBtn}
          onPress={sendMessage}
          disabled={loading || trialEnded || !input.trim()}
        >
          Send
        </Button>
      </div>
    </div>
    </AppShell>
  );
}
