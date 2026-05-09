import { useState, useRef, useCallback, useEffect } from 'react';
import { LiveServerMessage, Modality } from '@google/genai';
import { aiInstance, tools, handleToolCall } from '../lib/vivek-gemini';

export function useLiveAPI() {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  const initAudio = async () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  const startLive = async () => {
    try {
      await initAudio();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = audioContextRef.current!.createMediaStreamSource(stream);

      // Create AudioWorklet via Blob URL
      const workletCode = `
      class PCMProcessor extends AudioWorkletProcessor {
        process(inputs, outputs, parameters) {
          const input = inputs[0];
          if (input && input.length > 0) {
            const channelData = input[0];
            const pcm16 = new Int16Array(channelData.length);
            for (let i = 0; i < channelData.length; i++) {
              pcm16[i] = Math.max(-1, Math.min(1, channelData[i])) * 32767;
            }
            this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
          }
          return true;
        }
      }
      registerProcessor('pcm-processor', PCMProcessor);
      `;
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      await audioContextRef.current!.audioWorklet.addModule(url);

      workletNodeRef.current = new AudioWorkletNode(audioContextRef.current!, 'pcm-processor');

      // Scheduled audio playback queue
      let nextPlayTime = audioContextRef.current!.currentTime;

      // Connect to Gemini Live API
      const sessionPromise = aiInstance.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
          },
          systemInstruction: "You are Vivek, IPM Careers AI Counsellor. Speak naturally, mix Hindi and English (Hinglish), keep answers short, 2-3 sentences. Never say you are an AI model. Ask follow-up questions.",
          tools: tools,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsLiveActive(true);
            workletNodeRef.current!.port.onmessage = (e) => {
              const buffer = e.data;
              const uint8Array = new Uint8Array(buffer);
              let binary = '';
              for (let i = 0; i < uint8Array.length; i++) binary += String.fromCharCode(uint8Array[i]);
              const base64Data = btoa(binary);

              sessionPromise.then((s: any) => s.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
              }));
            };
            source.connect(workletNodeRef.current!);
            workletNodeRef.current!.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcm16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 32767;
              }

              const playbackContext = audioContextRef.current;
              if (!playbackContext) return;

              const audioBuffer = playbackContext.createBuffer(1, float32.length, 24000);
              audioBuffer.getChannelData(0).set(float32);

              const audioSource = playbackContext.createBufferSource();
              audioSource.buffer = audioBuffer;
              audioSource.connect(playbackContext.destination);

              if (nextPlayTime < playbackContext.currentTime) {
                nextPlayTime = playbackContext.currentTime;
              }
              audioSource.start(nextPlayTime);
              nextPlayTime += audioBuffer.duration;
            }

            if (msg.serverContent?.interrupted) {
              if (audioContextRef.current) {
                nextPlayTime = audioContextRef.current.currentTime;
              }
            }

            if (msg.toolCall) {
              const functionResponses: any[] = [];
              for (const call of msg.toolCall.functionCalls || []) {
                const result = await handleToolCall(call);
                functionResponses.push({
                  id: call.id,
                  name: call.name,
                  response: result,
                });
              }
              sessionPromise.then((s: any) => s.sendToolResponse({ functionResponses }));
            }
          },
          onclose: () => {
            setIsLiveActive(false);
            cleanupAudio();
          },
          onerror: (err: any) => {
            console.error('Vivek AI Live Error:', err);
            setIsLiveActive(false);
            cleanupAudio();
          },
        },
      });

      sessionRef.current = sessionPromise;
    } catch (err) {
      console.error('Failed to start Vivek AI', err);
      cleanupAudio();
    }
  };

  const cleanupAudio = () => {
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const stopLive = useCallback(() => {
    setIsLiveActive(false);
    if (sessionRef.current) {
      sessionRef.current.then((s: any) => {
        try { s.close(); } catch (_) {}
      });
      sessionRef.current = null;
    }
    cleanupAudio();
  }, []);

  useEffect(() => {
    return () => stopLive();
  }, [stopLive]);

  return { isLiveActive, startLive, stopLive };
}
