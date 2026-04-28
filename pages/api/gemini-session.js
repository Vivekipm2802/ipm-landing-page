export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }
  // Return key for client-side WebSocket connection
  res.status(200).json({ key });
}
