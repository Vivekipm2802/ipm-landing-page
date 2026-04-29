// pages/api/gemini-live-token.js
// Returns the API key for client-side Gemini Live API WebSocket connection
// Key is kept server-side in env vars, fetched only when needed

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  // Return the key for client-side WebSocket connection
  return res.status(200).json({ token: key });
}
