import { useState, useRef, useEffect, useCallback } from 'react';
import { NextSeo } from 'next-seo';
import 'tailwindcss/tailwind.css';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import styles from './InterviewPrep.module.css';
import { supabase } from '../utils/supabaseClient';

// ─── Panel Config ───
const INTERVIEWERS = [
  { id: 'sharma', name: 'Prof. R.K. Sharma', role: 'Chairperson', avatar: '👨‍🏫', color: '#6c63ff', focus: 'Academics, Current Affairs, Career Goals' },
  { id: 'gupta', name: 'Prof. Anil Gupta', role: 'Panelist', avatar: '👨‍💼', color: '#00d4ff', focus: 'Personality, Leadership, Situational Questions' },
  { id: 'mehra', name: 'Dr. Priya Mehra', role: 'Panelist', avatar: '👩‍🏫', color: '#ff5e7e', focus: 'Ethics, Opinion-based, Why MBA/IPM' },
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

  return `You are simulating a 3-person IIM Indore Personal Interview (PI) panel for IPMAT admission. You play ALL THREE interviewers who take turns naturally.

THE PANEL:
1. Prof. R.K. Sharma (Chairperson, Male) - Senior economics professor. Asks about academics, current affairs, career goals. Probing, serious tone. Speaks with authority.
2. Prof. Anil Gupta (Panelist, Male) - Management faculty. Asks about personality, hobbies, leadership, situational/HR questions. Friendly but sharp. Occasionally cracks dry jokes.
3. Dr. Priya Mehra (Panelist, Female) - Law and Ethics faculty. Asks ethical dilemmas, opinion-based questions, why MBA/IPM. Analytical, warm, encouraging but challenging.

CRITICAL RULES:
- Start by having Prof. Sharma welcome the student by name (if available) and ask them to introduce themselves.
- Each interviewer asks 1-2 questions before passing to the next. They may interject or follow up on each other's questions naturally.
- ALWAYS prefix your speech with the interviewer name in square brackets exactly like: [Prof. Sharma] or [Prof. Gupta] or [Dr. Mehra]. This is critical for the transcript.
- Ask follow-up questions based on student answers — do not use pre-scripted questions.
- If you have the student's SOP, reference specific points from it.
- If you have their IPMAT scores, you may reference their performance.
- Use natural Indian English — say "kindly", "could you elaborate", "what is your take on", etc.
- Keep responses concise — each interviewer utterance should be 1-3 sentences max.
- The interview should last about 15-20 exchanges total (across all 3 panelists).
- At the end, Prof. Sharma should thank the student and say the interview is over.
- Be realistic — challenge weak answers, appreciate good ones, probe deeper on vague responses.
- Cover: Introduction, Academics, Why IPM/IIM, Current Affairs, Ethical dilemma, Career goals, Hobbies/Extracurriculars.

IMPORTANT: You are speaking out loud. Be conversational. No markdown, no bullet points, no formatting. Just natural spoken Indian English.${contextBlock}`;
}

// ─── AudioPlayer: plays PCM base64 chunks via Web Audio API ───
class AudioPlayer {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    this.nextTime = 0;
  }
  resume() {
    if (this.context.state === 'suspended') this.context.resume();
  }
  playBase64PCM(base64) {
    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      const samples = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(samples.length);
      for (let i = 0; i < samples.length; i++) float32[i] = samples[i] / 32768.0;
      const buffer = this.context.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.context.destination);
      const currentTime = this.context.currentTime;
      if (this.nextTime < currentTime) this.nextTime = currentTime + 0.05;
      source.start(this.nextTime);
      this.nextTime += buffer.duration;
    } catch (e) {
      console.error('Playback error:', e);
    }
  }
  stop() {
    try { this.context.close(); } catch (e) {}
  }
}

// ─── AudioRecorder: captures PCM 16kHz via AudioWorklet ───
class AudioRecorder {
  constructor(onAudioData) {
    this.onAudioData = onAudioData;
    this.context = null;
    this.stream = null;
    this.processor = null;
  }
  async start() {
    this.context = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = this.context.createMediaStreamSource(this.stream);
    const workletCode = `
      class PCMProcessor extends AudioWorkletProcessor {
        process(inputs) {
          const input = inputs[0];
          if (input && input.length > 0) this.port.postMessage(input[0]);
          return true;
        }
      }
      registerProcessor('pcm-processor', PCMProcessor);
    `;
    const blob = new Blob([workletCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    await this.context.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);
    this.processor = new AudioWorkletNode(this.context, 'pcm-processor');
    this.processor.port.onmessage = (e) => {
      const float32 = e.data;
      const int16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        let s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      const bytes = new Uint8Array(int16.buffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
      }
      this.onAudioData(btoa(binary));
    };
    source.connect(this.processor);
    this.processor.connect(this.context.destination);
  }
  stop() {
    if (this.processor) { this.processor.disconnect(); this.processor = null; }
    if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
    if (this.context && this.context.state !== 'closed') { this.context.close(); this.context = null; }
  }
}

// ─── Detect interviewer from text ───
function detectInterviewer(text) {
  if (text.includes('[Prof. Sharma]') || text.includes('Prof. Sharma')) return 0;
  if (text.includes('[Prof. Gupta]') || text.includes('Prof. Gupta')) return 1;
  if (text.includes('[Dr. Mehra]') || text.includes('Dr. Mehra')) return 2;
  return null;
}

export default function InterviewPrep() {
  const router = useRouter();
  const [phase, setPhase] = useState('lobby'); // lobby | connecting | live | ended | feedback
  const [studentData, setStudentData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [activeInterviewer, setActiveInterviewer] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const sessionRef = useRef(null);
  const recorderRef = useRef(null);
  const playerRef = useRef(null);
  const activeSpeakerRef = useRef(null);
  const currentTextRef = useRef('');
  const transcriptRef = useRef([]);
  const timerRef = useRef(null);

  // Sync transcript ref
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  // Load student data from Supabase
  useEffect(() => {
    const loadStudentData = async () => {
      const uid = router.query.uid;
      if (!uid) return;
      try {
        const { data } = await supabase.rpc('get_response_data', { uuid_arg: uid });
        if (data && data.length > 0) setStudentData(data[0]);
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

  const addTranscript = useCallback((role, text) => {
    if (!text.trim()) return;
    const speaker = role === 'user' ? 'You' : 'Panel';
    setTranscript(prev => [...prev, { role, speaker, text }]);
    // Detect active interviewer from model text
    if (role === 'model') {
      const idx = detectInterviewer(text);
      if (idx !== null) setActiveInterviewer(idx);
    }
  }, []);

  // ─── Start Interview: get ephemeral token, open WebSocket ───
  const startInterview = async () => {
    setPhase('connecting');
    setError(null);
    setTranscript([]);
    setTimer(0);

    try {
      // 1. Get ephemeral token from our server
      const tokenRes = await fetch('/api/gemini-live-token', { method: 'POST' });
      if (!tokenRes.ok) throw new Error('Failed to get session token');
      const tokenData = await tokenRes.json();
      const ephemeralToken = tokenData.token || tokenData.ephemeralToken || tokenData;

      // 2. Create audio player & recorder
      playerRef.current = new AudioPlayer();
      playerRef.current.resume();

      // 3. Build system prompt
      const systemInstruction = buildSystemPrompt(studentData);

      // 4. Connect to Gemini Live API via WebSocket
      const model = 'gemini-3.1-flash-live-preview';
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${typeof ephemeralToken === 'string' ? ephemeralToken : ephemeralToken.token || ''}`;

      const ws = new WebSocket(wsUrl);
      sessionRef.current = ws;

      ws.onopen = () => {
        // Send setup message
        ws.send(JSON.stringify({
          setup: {
            model: `models/${model}`,
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Puck' }
                }
              }
            },
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            outputAudioTranscription: {},
            inputAudioTranscription: {},
          }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // Setup complete
          if (msg.setupComplete) {
            setConnected(true);
            setPhase('live');
            startMic(ws);
            return;
          }

          // Server content
          const serverContent = msg.serverContent;
          if (!serverContent) return;

          // Audio data — play immediately
          if (serverContent.modelTurn && serverContent.modelTurn.parts) {
            for (const part of serverContent.modelTurn.parts) {
              if (part.inlineData && part.inlineData.data) {
                setIsAISpeaking(true);
                playerRef.current?.playBase64PCM(part.inlineData.data);
              }
              // Model text transcription
              if (part.text) {
                if (activeSpeakerRef.current === 'user') {
                  addTranscript('user', currentTextRef.current);
                  currentTextRef.current = '';
                }
                activeSpeakerRef.current = 'model';
                currentTextRef.current += part.text;
              }
            }
          }

          // Input (user) transcription
          if (serverContent.inputTranscription && serverContent.inputTranscription.text) {
            if (activeSpeakerRef.current === 'model') {
              addTranscript('model', currentTextRef.current);
              currentTextRef.current = '';
            }
            activeSpeakerRef.current = 'user';
            currentTextRef.current += serverContent.inputTranscription.text;
          }

          // Output (model) transcription
          if (serverContent.outputTranscription && serverContent.outputTranscription.text) {
            if (activeSpeakerRef.current === 'user') {
              addTranscript('user', currentTextRef.current);
              currentTextRef.current = '';
            }
            activeSpeakerRef.current = 'model';
            currentTextRef.current += serverContent.outputTranscription.text;
          }

          // Turn complete
          if (serverContent.turnComplete) {
            if (activeSpeakerRef.current && currentTextRef.current.trim()) {
              addTranscript(activeSpeakerRef.current, currentTextRef.current);
              currentTextRef.current = '';
            }
            activeSpeakerRef.current = null;
            setIsAISpeaking(false);
          }

          // Interrupted
          if (serverContent.interrupted) {
            setIsAISpeaking(false);
          }

        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        setMicActive(false);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error. Please try again.');
        setPhase('lobby');
      };

    } catch (err) {
      console.error('Start error:', err);
      setError(err.message || 'Failed to start. Try again.');
      setPhase('lobby');
    }
  };

  // ─── Start Mic ───
  const startMic = async (ws) => {
    try {
      recorderRef.current = new AudioRecorder((base64) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [{
                data: base64,
                mimeType: 'audio/pcm;rate=16000'
              }]
            }
          }));
        }
      });
      await recorderRef.current.start();
      setMicActive(true);
    } catch (err) {
      console.error('Mic error:', err);
      setError('Microphone access denied. Please allow mic and try again.');
    }
  };

  // ─── Stop Interview ───
  const stopInterview = useCallback(() => {
    // Flush any remaining text
    if (activeSpeakerRef.current && currentTextRef.current.trim()) {
      addTranscript(activeSpeakerRef.current, currentTextRef.current);
      currentTextRef.current = '';
      activeSpeakerRef.current = null;
    }
    recorderRef.current?.stop();
    playerRef.current?.stop();
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
    }
    setConnected(false);
    setMicActive(false);
    setIsAISpeaking(false);
    setPhase('ended');
  }, [addTranscript]);

  // Cleanup on unmount
  useEffect(() => { return () => { stopInterview(); }; }, [stopInterview]);

  // ─── Generate Feedback ───
  const generateFeedback = async () => {
    setFeedbackLoading(true);
    setPhase('feedback');
    try {
      const transcriptText = transcriptRef.current.map(t => `[${t.role === 'user' ? 'STUDENT' : 'PANEL'}] ${t.text}`).join('\n');
      const prompt = `You are an expert IIM Interview coach. Review this mock PI transcript for IPMAT admission.

STUDENT PROFILE:
Name: ${studentData?.name || 'Unknown'}
City: ${studentData?.city || 'Unknown'}
IPMAT Scores: ${studentData?.total_score || '?'}/360 (SA: ${studentData?.sa_score || '?'}, MCQ: ${studentData?.mcq_score || '?'}, VA: ${studentData?.va_score || '?'})

TRANSCRIPT:
${transcriptText}

Provide structured feedback:
1. Overall Impression (2-3 sentences)
2. Strengths (3-4 bullet points)
3. Areas to Improve (3-4 actionable bullet points)
4. Score out of 10
Keep it concise and encouraging.`;

      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], systemPrompt: 'You are an expert IIM interview coach. Be constructive and specific.' }),
      });
      const data = await res.json();
      setFeedback(data.text || 'Could not generate feedback.');
    } catch (e) {
      setFeedback('Sorry, feedback generation failed. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // ─── RENDER ───
  return (
    <AppShell>
      <NextSeo title="AI Mock Interview | IPM Careers" description="Practice for your IIM Indore PI with our AI-powered mock interview panel." />
      <div className={styles.interviewPage}>

        {/* ─── LOBBY ─── */}
        {phase === 'lobby' && (
          <div className={styles.lobbyContainer}>
            <div className={styles.lobbyHeader}>
              <h1 className={styles.lobbyTitle}>IIM Indore Mock PI Panel</h1>
              <p className={styles.lobbySubtitle}>AI-powered Personal Interview simulation with real-time voice</p>
            </div>

            {studentData && (
              <div className={styles.studentContext}>
                <div className={styles.contextBadge}>Profile Loaded</div>
                <p className={styles.contextInfo}>{studentData.name} &bull; {studentData.city || 'India'}</p>
                <p className={styles.contextInfo}>IPMAT Score: {studentData.total_score}/{studentData.total_max || 360}</p>
                <p className={styles.contextNote}>Your scores and SOP will be used to personalize the interview</p>
              </div>
            )}

            <div className={styles.panelGrid}>
              {INTERVIEWERS.map((prof, i) => (
                <div key={prof.id} className={styles.panelCard}>
                  <div className={styles.panelAvatar}>{prof.avatar}</div>
                  <div className={styles.panelName}>{prof.name}</div>
                  <div className={styles.panelRole}>{prof.role}</div>
                </div>
              ))}
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <button className={styles.startBtn} onClick={startInterview}>
              Start Mock Interview
            </button>
            <p className={styles.lobbyNote}>Uses your microphone for real-time voice conversation. Works best in Chrome.</p>
          </div>
        )}

        {/* ─── CONNECTING ─── */}
        {phase === 'connecting' && (
          <div className={styles.connectingContainer}>
            <div className={styles.connectingSpinner}></div>
            <h2 className={styles.connectingTitle}>Setting up your interview room...</h2>
            <p className={styles.connectingSubtitle}>Requesting mic access and connecting to the panel</p>
          </div>
        )}

        {/* ─── LIVE INTERVIEW ─── */}
        {phase === 'live' && (
          <div className={styles.liveContainer}>
            {/* Top bar */}
            <div className={styles.liveTopBar}>
              <div className={styles.liveStatus}>
                <span className={styles.liveDot}></span>
                <span>LIVE</span>
              </div>
              <div className={styles.liveTimer}>{formatTime(timer)}</div>
              <button className={styles.endBtn} onClick={stopInterview}>End Interview</button>
            </div>

            {/* Interviewer panel */}
            <div className={styles.interviewerRow}>
              {INTERVIEWERS.map((prof, i) => (
                <div key={prof.id} className={`${styles.interviewerCard} ${activeInterviewer === i ? styles.activeInterviewer : ''}`}>
                  <div className={styles.interviewerAvatar} style={{ borderColor: activeInterviewer === i ? prof.color : 'transparent' }}>
                    {prof.avatar}
                  </div>
                  <div className={styles.interviewerName}>{prof.name}</div>
                  <div className={styles.interviewerRole}>{prof.role}</div>
                </div>
              ))}
            </div>

            {/* AI Speaking indicator */}
            {isAISpeaking && (
              <div className={styles.speakingIndicator}>
                <div className={styles.soundWave}><span></span><span></span><span></span><span></span><span></span></div>
                <span>{INTERVIEWERS[activeInterviewer].name} is speaking...</span>
              </div>
            )}

            {/* Mic button */}
            <div className={styles.micSection}>
              <button
                className={`${styles.micBtn} ${micActive ? styles.micActive : ''} ${isAISpeaking ? styles.micThinking : ''}`}
                onClick={() => {
                  if (micActive) {
                    recorderRef.current?.stop();
                    setMicActive(false);
                  } else if (sessionRef.current) {
                    startMic(sessionRef.current);
                  }
                }}
              >
                {micActive ? '🎙️' : '🎤'}
              </button>
              <p className={styles.micLabel}>{micActive ? (isAISpeaking ? 'Panel is speaking...' : 'Listening...') : 'Tap mic to speak'}</p>
              {!micActive && !isAISpeaking && (
                <button className={styles.unmuteBtn} onClick={() => { if (sessionRef.current) startMic(sessionRef.current); }}>
                  🔇 Unmute
                </button>
              )}
            </div>

            {/* Transcript */}
            {transcript.length > 0 && (
              <div className={styles.transcriptSection}>
                <h3 className={styles.transcriptTitle}>INTERVIEW TRANSCRIPT</h3>
                <div className={styles.transcriptList}>
                  {transcript.map((msg, i) => (
                    <div key={i} className={`${styles.transcriptItem} ${msg.role === 'user' ? styles.transcriptStudent : ''}`}>
                      <span className={styles.transcriptSpeaker} style={{ color: msg.role === 'user' ? '#6c63ff' : '#ff5e7e' }}>
                        {msg.role === 'user' ? 'You' : 'Panel'}:
                      </span>{' '}
                      {msg.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── ENDED ─── */}
        {phase === 'ended' && (
          <div className={styles.endedContainer}>
            <div className={styles.endedIcon}>✅</div>
            <h2 className={styles.endedTitle}>Interview Complete!</h2>
            <p className={styles.endedSubtitle}>Duration: {formatTime(timer)} &bull; {transcript.filter(t => t.role === 'user').length} responses</p>

            <div className={styles.endedActions}>
              <button className={styles.feedbackBtn} onClick={generateFeedback}>
                Get AI Feedback & Score
              </button>
              <button className={styles.restartBtn} onClick={() => { setPhase('lobby'); setTranscript([]); setTimer(0); setFeedback(null); }}>
                Try Again
              </button>
            </div>

            {/* Transcript review */}
            {transcript.length > 0 && (
              <div className={styles.reviewSection}>
                <h3 className={styles.reviewTitle}>Interview Transcript</h3>
                {transcript.map((msg, i) => (
                  <div key={i} className={`${styles.reviewItem} ${msg.role === 'user' ? styles.reviewStudent : ''}`}>
                    <strong>{msg.role === 'user' ? 'You' : 'Panel'}:</strong> {msg.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── FEEDBACK ─── */}
        {phase === 'feedback' && (
          <div className={styles.endedContainer}>
            <h2 className={styles.endedTitle}>Performance Feedback</h2>
            {feedbackLoading ? (
              <div className={styles.connectingContainer}>
                <div className={styles.connectingSpinner}></div>
                <p className={styles.connectingSubtitle}>Panel is reviewing your interview...</p>
              </div>
            ) : (
              <>
                <div className={styles.feedbackCard}>
                  {feedback && feedback.split('\n').map((line, i) => (
                    <p key={i} className={styles.feedbackLine}>{line}</p>
                  ))}
                </div>
                <div className={styles.endedActions}>
                  <button className={styles.restartBtn} onClick={() => { setPhase('lobby'); setTranscript([]); setTimer(0); setFeedback(null); }}>
                    Start New Interview
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
