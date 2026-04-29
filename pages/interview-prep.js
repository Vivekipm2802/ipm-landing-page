import { useState, useRef, useEffect, useCallback } from 'react';
import { NextSeo } from 'next-seo';
import 'tailwindcss/tailwind.css';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import styles from './InterviewPrep.module.css';
import { supabase } from '../utils/supabaseClient';

// Interviewer Panel Config
const INTERVIEWERS = [
  {
    id: 'sharma',
    name: 'Prof. R.K. Sharma',
    role: 'Chairperson',
    gender: 'male',
    avatar: '👨‍🏫',
    color: '#6c63ff',
    focus: 'Academics, Current Affairs, Career Goals',
  },
  {
    id: 'gupta',
    name: 'Prof. Anil Gupta',
    role: 'Panelist',
    gender: 'male',
    avatar: '👨‍💼',
    color: '#00d4ff',
    focus: 'Personality, Leadership, Situational Questions',
  },
  {
    id: 'mehra',
    name: 'Dr. Priya Mehra',
    role: 'Panelist',
    gender: 'female',
    avatar: '👩‍🏫',
    color: '#ff5e7e',
    focus: 'Ethics, Opinion-based, Why MBA/IPM',
  },
];

function buildSystemPrompt(studentData) {
  let contextBlock = '';
  if (studentData) {
    const parts = [];
    if (studentData.name) parts.push(`Student Name: ${studentData.name}`);
    if (studentData.category) parts.push(`Category: ${studentData.category}`);
    if (studentData.city) parts.push(`City: ${studentData.city}`);
    if (studentData.total_score !== undefined) parts.push(`IPMAT Score: ${studentData.total_score}/${studentData.total_max || 360}`);
    if (studentData.sa_score !== undefined) parts.push(`SA (Quant): ${studentData.sa_score}`);
    if (studentData.mcq_score !== undefined) parts.push(`MCQ (Quant): ${studentData.mcq_score}`);
    if (studentData.va_score !== undefined) parts.push(`VA (Verbal): ${studentData.va_score}`);
    if (studentData.sop) parts.push(`Student's SOP:\n${studentData.sop}`);
    if (parts.length > 0) {
      contextBlock = `\n\nSTUDENT CONTEXT (use this to personalize questions — ask about their city, SOP points, score performance, etc.):\n${parts.join('\n')}`;
    }
  }

  return `You are simulating a 3-person IIM Indore Personal Interview (PI) panel for IPMAT admission. You play ALL Ttic - challenge weak answers, appreciate good ones, probe deeper on vague responses.
- Cover: Introduction, Academics, Why IPM/IIM, Current Affairs, Ethical dilemma, Career goals, Hobbies/Extracurriculars.
- Keep responses concise - each interviewer utterance should be 1-3 sentences max.

IMPORTANT: You are speaking out loud. Be conversational. No markdown, no bullet points, no formatting. Just natural spoken Indian English.${contextBlock}`;
}

// Gemini TTS — converts text to speech via Gemini TTS model
async function speakWithGeminiTTS(text, voiceName) {
  try {
    const res = await fetch('/api/gemini-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: voiceName || 'Kore' }),
    });
    if (!res.ok) throw new Error('TTS failed');
    const data = await res.json();
    if (!data.audio) throw new Error('No audio data');

    // Decode base64 audio and play
    const audioBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBytes], { type: data.mimeType || 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);

    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      audio.onended = () => { URL.revokeObjectURL(audioUrl); resolve(); };
      audio.onerror = () => { URL.revokeObjectURL(audioUrl); resolve(); };
      audio.play().catch(() => resolve());
    });
  } catch (err) {
    console.error('Gemini TTS error, falling back to browser TTS:', err);
    // Fallback to browser SpeechSynthesis
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.lang = 'en-IN';
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }
}

// Voice mapping for each interviewer (Gemini TTS voice names)
const INTERVIEWER_VOICES = {
  'Prof. Sharma': 'Kore',    // Male, authoritative
  'Prof. Gupta': 'Puck',     // Male, friendly
  'Dr. Mehra': 'Kore',       // Will use different voice if available
};

// Main Component
export default function InterviewPrep() {
  const router = useRouter();
  const [phase, setPhase] = useState('lobby');
  const [activeInterviewer, setActiveInterviewer] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);
  const [liveText, setLiveText] = useState('');
  const [studentData, setStudentData] = useState(null);

  const messagesRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const phaseRef = useRef('lobby');
  const systemPromptRef = useRef('');
  const shouldListenRef = useRef(false);
  const stopRequestedRef = useRef(false);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Load student data from URL param
  useEffect(() => {
    const loadStudentData = async () => {
      const uid = router.query.uid;
      if (!uid) return;
      try {
        const { data } = await supabase.rpc('get_response_data', { uuid_arg: uid });
        if (data && data.length > 0) {
          setStudentData(data[0]);
        }
      } catch (e) {
        console.log('Could not load student data:', e);
      }
    };
    if (router.isReady) loadStudentData();
  }, [router.isReady, router.query.uid]);

  // Timer
  useEffect(() => {
    if (phase === 'live') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Detect active interviewer from text
  const detectInterviewer = useCallback((text) => {
    if (text.includes('[Prof. Sharma]') || text.includes('Prof. Sharma:')) return 0;
    if (text.includes('[Prof. Gupta]') || text.includes('Prof. Gupta:')) return 1;
    if (text.includes('[Dr. Mehra]') || text.includes('Dr. Mehra:')) return 2;
    return null;
  }, []);

  // Get Gemini TTS voice name for interviewer
  const getVoiceForText = useCallback((text) => {
    if (text.includes('[Prof. Sharma]')) return INTERVIEWER_VOICES['Prof. Sharma'];
    if (text.includes('[Prof. Gupta]')) return INTERVIEWER_VOICES['Prof. Gupta'];
    if (text.includes('[Dr. Mehra]')) return INTERVIEWER_VOICES['Dr. Mehra'];
    return 'Kore';
  }, []);

  // Send message to Gemini and get response
  const sendToGemini = useCallback(async (userText) => {
    messagesRef.current.push({ role: 'user', content: userText });
    setTranscript(prev => [...prev, { role: 'student', speaker: 'You', text: userText }]);
    setIsThinking(true);
    setIsListening(false);

    try {
      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesRef.current,
          systemPrompt: systemPromptRef.current,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const aiText = data.text;

      if (!aiText) throw new Error('Empty response from AI');

      messagesRef.current.push({ role: 'assistant', content: aiText });
      setIsThinking(false);

      // Parse and speak each interviewer's part
      // Split by interviewer tags
      const segments = aiText.split(/(?=\[(?:Prof\. Sharma|Prof\. Gupta|Dr\. Mehra)\])/);
      
      for (const segment of segments) {
        if (stopRequestedRef.current) break;
        const trimmed = segment.trim();
        if (!trimmed) continue;

        // Detect interviewer
        const idx = detectInterviewer(trimmed);
        if (idx !== null) setActiveInterviewer(idx);

        // Clean text for display
        let speaker = INTERVIEWERS[idx || 0].name;
        const match = trimmed.match(/\[(Prof\. Sharma|Prof\. Gupta|Dr\. Mehra)\]/);
        if (match) speaker = match[1];
        const cleanText = trimmed.replace(/\[(Prof\. Sharma|Prof\. Gupta|Dr\. Mehra)\]\s*/g, '');

        if (cleanText) {
          setTranscript(prev => [...prev, { role: 'interviewer', speaker, text: cleanText }]);
          setIsAISpeaking(true);
          const voice = getVoiceForText(trimmed);
          await speakWithGeminiTTS(cleanText, voice);
        }
      }

      setIsAISpeaking(false);

      // Check if interview is over
      const lowerText = aiText.toLowerCase();
      if (lowerText.includes('interview is over') || lowerText.includes('interview is complete') || 
          lowerText.includes('all the best') || lowerText.includes('that concludes')) {
        setTimeout(() => setPhase('ended'), 1500);
        return;
      }

      // Start listening again
      if (phaseRef.current === 'live') {
        shouldListenRef.current = true;
        startListening();
      }
    } catch (err) {
      console.error('Gemini error:', err);
      setIsThinking(false);
      setError('AI response failed. Tap the mic to try again.');
      if (phaseRef.current === 'live') {
        shouldListenRef.current = true;
        startListening();
      }
    }
  }, [detectInterviewer, getVoiceForText]);

  // Speech Recognition
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser. Use Chrome for best experience.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognitionRef.current = recognition;

    let finalText = '';
    let silenceTimer = null;

    recognition.onresult = (event) => {
      let interim = '';
      finalText = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setLiveText(finalText + interim);

      // Reset silence timer on new speech
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        const fullText = (finalText + interim).trim();
        if (fullText.length > 5) { // Only send if meaningful input
          recognition.stop();
          setLiveText('');
          sendToGemini(fullText);
        }
      }, 2000); // 2 second silence = done speaking
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if we should still be listening
      if (shouldListenRef.current && phaseRef.current === 'live') {
        try { recognition.start(); } catch(e) {}
      }
    };

    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart silently
        if (shouldListenRef.current && phaseRef.current === 'live') {
          try { recognition.start(); } catch(e) {}
        }
      } else if (event.error !== 'aborted') {
        setError(`Mic error: ${event.error}. Tap mic to retry.`);
      }
    };

    try {
      recognition.start();
    } catch(e) {
      console.error('Failed to start recognition:', e);
    }
  }, [sendToGemini]);

  // Start Interview
  const startInterview = async () => {
    setPhase('connecting');
    setError(null);
    setTranscript([]);
    setTimer(0);
    messagesRef.current = [];
    stopRequestedRef.current = false;

    // Build system prompt with student context
    systemPromptRef.current = buildSystemPrompt(studentData);

    try {
      // Request mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // Release immediately, Web Speech API handles mic

      setPhase('live');

      // Send initial empty message to get the panel's welcome
      // We simulate this by sending a "start" message
      await sendToGemini('(The student has just entered the interview room and sat down. Begin the interview.)');
    } catch (err) {
      console.error('Start error:', err);
      setError(err.message || 'Failed to start. Allow microphone access and try again.');
      setPhase('lobby');
    }
  };

  // Stop Interview
  const stopInterview = useCallback(() => {
    setPhase('ended');
    shouldListenRef.current = false;
    stopRequestedRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
      recognitionRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    // Stop any playing audio elements
    document.querySelectorAll('audio').forEach(a => { a.pause(); a.src = ''; });
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsAISpeaking(false);
    setIsListening(false);
    setIsThinking(false);
    setLiveText('');
  }, []);

  // Manual mic toggle
  const toggleMic = () => {
    if (isListening) {
      shouldListenRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      shouldListenRef.current = true;
      startListening();
    }
  };

  useEffect(() => { return () => stopInterview(); }, [stopInterview]);

  // Scroll transcript to bottom
  const transcriptEndRef = useRef(null);
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  return (
    <AppShell>
      <NextSeo 
        title="AI Mock Interview | IPM Careers" 
        description="Practice your IIM Personal Interview with AI-powered voice interview panel" 
      />

      <div className={styles.container}>
        {/* LOBBY */}
        {phase === 'lobby' && (
          <div className={styles.lobby}>
            <div className={styles.lobbyIcon}>{'🎙️'}</div>
            <h1 className={styles.lobbyTitle}>AI Mock Interview</h1>
            <p className={styles.lobbySubtitle}>
              Practice with a realistic 3-person IIM PI panel. Speak naturally — the AI listens, thinks, and responds by voice.
            </p>

            {studentData && (
              <div className={styles.studentContext}>
                <div className={styles.contextBadge}>{'✅'} Student profile loaded</div>
                <p className={styles.contextInfo}>
                  {studentData.name} | Score: {studentData.total_score || '—'} | {studentData.category || 'GEN'}
                </p>
                <p className={styles.contextNote}>The panel will personalize questions based on your profile and SOP</p>
              </div>
            )}

            <div className={styles.panelPreview}>
              {INTERVIEWERS.map((iv) => (
                <div key={iv.id} className={styles.panelCard}>
                  <div className={styles.panelAvatar} style={{ background: iv.color }}>{iv.avatar}</div>
                  <div className={styles.panelName}>{iv.name}</div>
                  <div className={styles.panelRole}>{iv.role}</div>
                  <div className={styles.panelFocus}>{iv.focus}</div>
                </div>
              ))}
            </div>

            <div className={styles.lobbyTips}>
              <h3>{'💡'} Tips for your mock PI</h3>
              <ul>
                <li>Use Chrome browser for best speech recognition</li>
                <li>Use a quiet room — speak clearly in English</li>
                <li>Answer in 30-60 seconds per question</li>
                <li>Wait for the panel to finish speaking before you respond</li>
                <li>The panel will ask follow-ups based on YOUR answers</li>
              </ul>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}
            <button className={styles.startBtn} onClick={startInterview}>
              {'🎤'} Start Mock Interview
            </button>
          </div>
        )}

        {/* CONNECTING */}
        {phase === 'connecting' && (
          <div className={styles.lobby}>
            <div className={styles.connectingSpinner}></div>
            <h2 className={styles.lobbyTitle}>Setting up your interview room...</h2>
            <p className={styles.lobbySubtitle}>Requesting mic access and preparing the panel</p>
          </div>
        )}

        {/* LIVE */}
        {phase === 'live' && (
          <div className={styles.liveRoom}>
            <div className={styles.timerBar}>
              <span className={styles.liveIndicator}>{'🔴'} LIVE</span>
              <span className={styles.timerText}>{formatTime(timer)}</span>
              <button className={styles.endBtn} onClick={stopInterview}>End Interview</button>
            </div>

            <div className={styles.interviewerPanel}>
              {INTERVIEWERS.map((iv, i) => (
                <div key={iv.id} className={`${styles.interviewer} ${i === activeInterviewer && isAISpeaking ? styles.interviewerActive : ''}`}>
                  <div className={styles.avatarRing} style={{ borderColor: i === activeInterviewer && isAISpeaking ? iv.color : 'transparent' }}>
                    <div className={styles.avatar} style={{ background: iv.color }}>{iv.avatar}</div>
                    {i === activeInterviewer && isAISpeaking && (
                      <div className={styles.speakingWave}><span></span><span></span><span></span></div>
                    )}
                  </div>
                  <div className={styles.ivName}>{iv.name}</div>
                  <div className={styles.ivRole}>{iv.role}</div>
                </div>
              ))}
            </div>

            <div className={styles.studentArea}>
              <div 
                className={`${styles.micCircle} ${isListening && !isAISpeaking ? styles.micActive : ''} ${isThinking ? styles.micThinking : ''}`}
                onClick={!isAISpeaking ? toggleMic : undefined}
              >
                <span>{isThinking ? '🤔' : isListening ? '🎤' : '🔇'}</span>
              </div>
              <div className={styles.studentLabel}>
                {isAISpeaking ? 'Panel is speaking...' : 
                 isThinking ? 'Panel is thinking...' :
                 isListening ? 'Listening to you... (speak now)' : 
                 'Tap mic to speak'}
              </div>
              {liveText && (
                <div className={styles.liveTranscript}>
                  <span className={styles.liveTranscriptLabel}>You: </span>{liveText}
                </div>
              )}
              {!isAISpeaking && !isThinking && (
                <div className={styles.micControls}>
                  <button className={`${styles.micBtn} ${!isListening ? styles.micBtnMuted : ''}`} onClick={toggleMic}>
                    {isListening ? '🎤 Mute' : '🔇 Unmute'}
                  </button>
                </div>
              )}
            </div>

            {error && <div className={styles.errorMsg} style={{margin: '0.5rem 1rem'}}>{error}</div>}

            <div className={styles.transcriptArea}>
              <h3 className={styles.transcriptTitle}>Interview Transcript</h3>
              <div className={styles.transcriptScroll}>
                {transcript.map((entry, i) => (
                  <div key={i} className={`${styles.transcriptEntry} ${entry.role === 'student' ? styles.transcriptStudent : ''}`}>
                    <span className={styles.transcriptSpeaker}>{entry.speaker}:</span>
                    <span className={styles.transcriptText}> {entry.text}</span>
                  </div>
                ))}
                {transcript.length === 0 && (
                  <div className={styles.transcriptEmpty}>Interview will begin shortly... The panel will greet you first.</div>
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* ENDED */}
        {phase === 'ended' && (
          <div className={styles.lobby}>
            <div className={styles.lobbyIcon}>{'✅'}</div>
            <h1 className={styles.lobbyTitle}>Interview Complete!</h1>
            <p className={styles.lobbySubtitle}>Duration: {formatTime(timer)} | {transcript.filter(t => t.role === 'student').length} responses</p>
            
            <div className={styles.reviewTranscript}>
              <h3>Full Transcript</h3>
              {transcript.map((entry, i) => (
                <div key={i} className={`${styles.reviewEntry} ${entry.role === 'student' ? styles.reviewStudent : ''}`}>
                  <strong>{entry.speaker}:</strong> {entry.text}
                </div>
              ))}
            </div>

            <div className={styles.endActions}>
              <button className={styles.startBtn} onClick={() => { setPhase('lobby'); setTranscript([]); setTimer(0); }}>
                {'🔄'} Practice Again
              </button>
              <button className={styles.secondaryBtn} onClick={() => router.push('/pi-prep')}>
                {'⬅️'} Back to PI Prep
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
