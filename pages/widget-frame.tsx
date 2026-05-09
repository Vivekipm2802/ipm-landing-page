import dynamic from 'next/dynamic';

const VoiceWidget = dynamic(() => import('../components/VoiceWidget'), { ssr: false });

export default function WidgetFrame() {
  return (
    <>
      <style>{`
        html, body {
          background: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
      <VoiceWidget />
    </>
  );
}
