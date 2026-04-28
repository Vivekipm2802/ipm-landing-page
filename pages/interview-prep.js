import { useState, useRef, useEffect, useCallback } from 'react';
import { NextSeo } from 'next-seo';
import 'tailwindcss/tailwind.css';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import styles from './InterviewPrep.module.css';

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

const SYSTEM_PROMPT = `You are simulating a 3-person IIM Indore Personal Interview (PI) panel for IPMAT admission. You play ALL THREE interviewers who take turns naturally.

THE PANEL:
1. Prof. R.K. Sharma (Chairperson, Male) - Senior economics professor. Asks about academics, current affairs, career goals. Probing, serious tone. Speaks with authority.
2. Prof. Anil Gupta (Panelist, Male) - Management faculty. Asks about personality, hobbies, leadership, situational/HR questions. Friendly but sharp. Occasionally cracks dry jokes.
3. Dr. Priya Mehra (Panelist, Female) - Law and Ethics faculty. Asks ethical dilemmas, opinion-based questions, why MBA/IPM. Analytical, warm, encouraging but challenging.

CRITICAL RULES:
- Start by having Prof. Sharma welcome the student and ask them to introduce themselves.
- Each interviewer asks 3-5 questions before passing to the next. They may interject or follow up on each others questions naturally.
- ALWAYS prefix your speech with the interviewer name in square brackets exactly like: [Prof. Sharma] or [Prof. Gupta] or [Dr. Mehra]
- Ask follow-up questions based on student answers - do not use pre-scripted questions.
- Use Indian English naturally - say "kindly", "could you elaborate", "what is your take on", "tell me about yourself", etc.
- The interview should last about 15-20 exchanges total (across all 3 panelists).
- At the end, Prof. Sharma should thank the student and say the interview is over.
- Be realistic - challenge weak answers, appreciate good ones, probe deeper on vague responses.
- Cover: Introduction, Academics, Why IPM/IIM, Current Affairs, Ethical dilemma, Career goals, Hobbies/Extracurriculars.
- Keep responses concise - this is a conversation, not a lecture. Each interviewer utterance should be 1-3 sentences max.

IMPORTANT: You are speaking out loud. Be conversational. No markdown, no bullet points, no formatting. Just natural spoken Indian English.`;

const MODEL = 'models/gemini-3.1-flash-live-preview';

// Audio Helpers
function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

function downsampleBuffer(buffer, inputRate, outputRate) {
  if (inputRate === outputRate) return buffer;
  const ratio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const idx = Math.round(i * ratio);
    result[i] = buffer[idx] || 0;
  }
  return result;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Main Component
export default function InterviewPrep() {
  const router = useRouter();
  const [phase, setPhase] = useState('lobby');
  const [activeInterviewer, setActiveInterviewer] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(0);

  const wsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const playbackCtxRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const timerRef = useRef(null);
  const currentTextRef = useRef('');
  const sourceRef = useRef(null);
  const phaseRef = useRef('lobby');
  const isMicOnRef = useRef(true);
  const volumeRafRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);

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
    if (text.includes('[Prof. Sharma]') || text.includes('Prof. Sharma')) setActiveInterviewer(0);
    else if (text.includes('[Prof. Gupta]') || text.includes('Prof. Gupta')) setActiveInterviewer(1);
    else if (text.includes('[Dr. Mehra]') || text.includes('Dr. Mehra')) setActiveInterviewer(2);
  }, []);

  // Play audio queue
  const playNextChunk = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsAISpeaking(false);
      return;
    }
    isPlayingRef.current = true;
    setIsAISpeaking(true);
    const chunk = audioQueueRef.current.shift();
    const pcmData = base64ToArrayBuffer(chunk);
    const int16 = new Int16Array(pcmData);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }
    if (!playbackCtxRef.current || playbackCtxRef.current.state === 'closed') {
      playbackCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = playbackCtxRef.current;
    const buf = ctx.createBuffer(1, float32.length, 24000);
    buf.getChannelData(0).set(float32);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.onended = () => playNextChunk();
    sourceRef.current = src;
    src.start();
  }, []);

  // Start Interview
  const startInterview = async () => {
    setPhase('connecting');
    setError(null);
    setTranscript([]);
    setTimer(0);

    try {
      const res = await fetch('/api/gemini-session');
      const { key } = await res.json();
      if (!key) throw new Error('No API key configured');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      streamRef.current = stream;

      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${key}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          setup: {
            model: MODEL,
            generationConfig: {
              responseModalities: ['AUDIO', 'TEXT'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Kore'
                  }
                }
              }
            },
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }]
            }
          }
        }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.setupComplete) {
          setPhase('live');
          startAudioCapture(stream, ws);
          return;
        }
        if (msg.serverContent) {
          const sc = msg.serverContent;
          if (sc.modelTurn && sc.modelTurn.parts) {
            for (const part of sc.modelTurn.parts) {
              if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.includes('audio')) {
                audioQueueRef.current.push(part.inlineData.data);
                if (!isPlayingRef.current) playNextChunk();
              }
              if (part.text) {
                currentTextRef.current += part.text;
                detectInterviewer(currentTextRef.current);
              }
            }
          }
          if (sc.turnComplete) {
            const fullText = currentTextRef.current.trim();
            if (fullText) {
              let speaker = INTERVIEWERS[0].name;
              const match = fullText.match(/\[(Prof\. Sharma|Prof\. Gupta|Dr\. Mehra)\]/);
              if (match) speaker = match[1];
              const cleanText = fullText.replace(/\[(Prof\. Sharma|Prof\. Gupta|Dr\. Mehra)\]\s*/g, '');
              setTranscript(prev => [...prev, { role: 'interviewer', speaker, text: cleanText }]);
            }
            currentTextRef.current = '';
          }
        }
      };

      ws.onerror = () => {
        setError('Connection failed. Check your internet and try again.');
        setPhase('lobby');
      };

      ws.onclose = () => {
        if (phaseRef.current === 'live') stopInterview();
      };

    } catch (err) {
      console.error('Start error:', err);
      setError(err.message || 'Failed to start. Allow microphone access and try again.');
      setPhase('lobby');
    }
  };

  // Audio Capture
  const startAudioCapture = (stream, ws) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const updateVolume = () => {
      if (phaseRef.current !== 'live') return;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setVolume(avg / 255);
      volumeRafRef.current = requestAnimationFrame(updateVolume);
    };
    volumeRafRef.current = requestAnimationFrame(updateVolume);

    processor.onaudioprocess = (e) => {
      if (!isMicOnRef.current || ws.readyState !== WebSocket.OPEN) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const downsampled = downsampleBuffer(inputData, audioCtx.sampleRate, 16000);
      const pcm = floatTo16BitPCM(downsampled);
      const base64 = arrayBufferToBase64(pcm);
      ws.send(JSON.stringify({
        realtimeInput: {
          mediaChunks: [{
            mimeType: 'audio/pcm;rate=16000',
            data: base64
          }]
        }
      }));
    };

    source.connect(processor);
    processor.connect(audioCtx.destination);
  };

  // Stop Interview
  const stopInterview = useCallback(() => {
    setPhase('ended');
    if (volumeRafRef.current) cancelAnimationFrame(volumeRafRef.current);
    if (wsRef.current) { try { wsRef.current.close(); } catch(e) {} wsRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') { audioCtxRef.current.close(); audioCtxRef.current = null; }
    if (playbackCtxRef.current && playbackCtxRef.current.state !== 'closed') { playbackCtxRef.current.close(); playbackCtxRef.current = null; }
    if (sourceRef.current) { try { sourceRef.current.stop(); } catch(e) {} sourceRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsAISpeaking(false);
  }, []);

  const toggleMic = () => setIsMicOn(prev => !prev);

  useEffect(() => { return () => stopInterview(); }, [stopInterview]);

  return (
    <AppShell>
      <NextSeo title="AI Mock Interview | IPM Careers" description="Practice your IIM Personal Interview with AI-powered voice interview panel" />
      <div className={styles.container}>

        {/* LOBBY */}
        {phase === 'lobby' && (
          <div className={styles.lobby}>
            <div className={styles.lobbyIcon}>{'🎙️'}</div>
            <h1 className={styles.lobbyTitle}>AI Mock Interview</h1>
            <p className={styles.lobbySubtitle}>Practice with a realistic 3-person IIM PI panel. Voice-to-voice, just like the real thing.</p>
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
                <li>Use a quiet room with good internet</li>
                <li>Speak clearly in English, like a real interview</li>
                <li>Answer in 30-60 seconds per question</li>
                <li>The panel will ask follow-ups based on your answers</li>
              </ul>
            </div>
            {error && <div className={styles.errorMsg}>{error}</div>}
            <button className={styles.startBtn} onClick={startInterview}>{'🎤'} Start Mock Interview</button>
          </div>
        )}

        {/* CONNECTING */}
        {phase === 'connecting' && (
          <div className={styles.lobby}>
            <div className={styles.connectingSpinner}></div>
            <h2 className={styles.lobbyTitle}>Setting up your interview room...</h2>
            <p className={styles.lobbySubtitle}>Connecting to AI panel and requesting mic access</p>
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
              <div className={`${styles.micCircle} ${isMicOn && !isAISpeaking ? styles.micActive : ''}`} style={{ transform: `scale(${1 + (isMicOn ? volume * 0.3 : 0)})` }}>
                <span>{isMicOn ? '🎤' : '🔇'}</span>
              </div>
              <div className={styles.studentLabel}>
                {isAISpeaking ? 'Panel is speaking...' : isMicOn ? 'Listening to you...' : 'Mic is muted'}
              </div>
              <div className={styles.micControls}>
                <button className={`${styles.micBtn} ${!isMicOn ? styles.micBtnMuted : ''}`} onClick={toggleMic}>
                  {isMicOn ? '🎤 Mute' : '🔇 Unmute'}
                </button>
              </div>
            </div>
            <div className={styles.transcriptArea}>
              <h3 className={styles.transcriptTitle}>Interview Transcript</h3>
              <div className={styles.transcriptScroll}>
                {transcript.map((entry, i) => (
                  <div key={i} className={styles.transcriptEntry}>
                    <span className={styles.transcriptSpeaker}>{entry.speaker}:</span>
                    <span className={styles.transcriptText}> {entry.text}</span>
                  </div>
                ))}
                {transcript.length === 0 && (
                  <div className={styles.transcriptEmpty}>Interview will begin shortly... The panel will greet you first.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ENDED */}
        {phase === 'ended' && (
          <div className={styles.lobby}>
            <div className={styles.lobbyIcon}>{'✅'}</div>
            <h1 className={styles.lobbyTitle}>Interview Complete!</h1>
            <p className={styles.lobbySubtitle}>Duration: {formatTime(timer)} | {transcript.length} exchanges</p>
            <div className={styles.reviewTranscript}>
              <h3>Full Transcript</h3>
              {transcript.map((entry, i) => (
                <div key={i} className={styles.reviewEntry}>
                  <strong>{entry.speaker}:</strong> {entry.text}
                </div>
              ))}
            </div>
            <div className={styles.endActions}>
              <button className={styles.startBtn} onClick={() => { setPhase('lobby'); setTranscript([]); }}>{'🔄'} Practice Again</button>
              <button className={styles.secondaryBtn} onClick={() => router.push('/pi-prep')}>{'⬅️'} Back to PI Prep</button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
