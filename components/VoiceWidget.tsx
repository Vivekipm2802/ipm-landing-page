import React, { useState, useEffect } from 'react';
import { Mic, X, Phone } from 'lucide-react';
import { useLiveAPI } from '../hooks/useLiveAPI';

export default function VoiceWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLiveActive, startLive, stopLive } = useLiveAPI();

  // Notify parent window (iframe resize) whenever panel opens or closes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({ vivekOpen: isOpen }, '*');
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (isOpen) {
      if (isLiveActive) stopLive();
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleCallToggle = () => {
    if (isLiveActive) {
      stopLive();
    } else {
      startLive();
    }
  };

  const panelStyle: React.CSSProperties = {
    animation: 'vivekSlideIn 0.3s ease-out',
  };

  return (
    <>
      <style>{`
        @keyframes vivekSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes vivekPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {isOpen && (
          <div style={{
            ...panelStyle,
            marginBottom: '16px',
            width: '320px',
            backgroundColor: '#0F1115',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 50px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            borderRadius: '16px',
          }}>
            {/* Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#F27D26', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: 900, color: 'black', fontSize: '14px' }}>V</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'white' }}>Vivek AI</span>
                  <span style={{ fontSize: '8px', color: '#F27D26', fontFamily: 'monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Voice Assistant</span>
                </div>
              </div>
              <button onClick={handleToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: '4px' }}>
                <X size={20} color="rgba(255,255,255,0.5)" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '240px', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))' }}>
              {isLiveActive ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                  <div style={{ width: '96px', height: '96px', backgroundColor: 'rgba(242,125,38,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'vivekPulse 1.5s ease-in-out infinite' }}>
                    <div style={{ width: '64px', height: '64px', backgroundColor: '#F27D26', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(242,125,38,0.5)' }}>
                      <Mic size={32} color="black" />
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#F27D26', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Listening...</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Speak naturally</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                  <div style={{ width: '96px', height: '96px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mic size={32} color="rgba(255,255,255,0.3)" />
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'white', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ready to talk</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Tap to start voice AI</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <button
                onClick={handleCallToggle}
                style={{
                  padding: '12px 32px',
                  borderRadius: '9999px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: isLiveActive ? '#ef4444' : '#F27D26',
                  color: isLiveActive ? 'white' : 'black',
                  boxShadow: isLiveActive ? '0 0 15px rgba(239,68,68,0.3)' : '0 0 15px rgba(242,125,38,0.3)',
                }}
              >
                {isLiveActive ? 'End Call' : 'Start Call'}
              </button>
            </div>
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={handleToggle}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s',
            backgroundColor: isOpen ? 'rgba(255,255,255,0.1)' : '#F27D26',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          title="Vivek AI — IPM Careers Voice Counsellor"
        >
          {isOpen ? (
            <X size={24} color="white" />
          ) : (
            <Phone size={24} color="black" />
          )}
        </button>
      </div>
    </>
  );
}
