// pages/api/gemini-live-token.js
// Generates an ephemeral token for Gemini Live API
// Client uses this token to open a direct WebSocket — no API key exposed

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-live-preview:generateEphemeralToken?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Puck' }
              }
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Ephemeral token error:', response.status, errText);
      return res.status(response.status).json({ error: 'Failed to get token', details: errText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Token generation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
