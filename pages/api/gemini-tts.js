// /pages/api/gemini-tts.js
// Server-side Gemini TTS — converts text to speech audio using Gemini TTS model

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const { text, voice } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${key}`;

    const body = {
      contents: [{
        parts: [{ text: text }]
      }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice || 'Kore'
            }
          }
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini TTS error:', response.status, errText);
      return res.status(response.status).json({ error: `TTS error: ${response.status}` });
    }

    const data = await response.json();
    
    // Extract audio data
    const audioPart = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!audioPart) {
      return res.status(500).json({ error: 'No audio in response' });
    }

    return res.status(200).json({ 
      audio: audioPart.inlineData.data,
      mimeType: audioPart.inlineData.mimeType 
    });
  } catch (err) {
    console.error('TTS error:', err);
    return res.status(500).json({ error: 'TTS failed' });
  }
}
