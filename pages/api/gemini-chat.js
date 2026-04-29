// /pages/api/gemini-chat.js
// Server-side Gemini chat API for AI Mock Interview
// Uses gemini-3.1-flash-lite-preview with retry logic

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const { messages, systemPrompt } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const body = {
      contents,
      systemInstruction: {
        parts: [{ text: systemPrompt || '' }]
      },
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const MODEL = 'gemini-3.1-flash-lite-preview';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

    // Retry up to 3 times on 503
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return res.status(200).json({ text });
      }

      if (response.status === 503 && attempt < 2) {
        // Wait before retry: 1s, 2s
        await new Promise(r => setTimeout(r, (attempt + 1) * 1000));
        lastError = `503 (attempt ${attempt + 1})`;
        continue;
      }

      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(response.status).json({ error: `API error: ${response.status}` });
    }

    return res.status(503).json({ error: 'Model temporarily unavailable. Please try again.' });
  } catch (err) {
    console.error('Gemini chat error:', err);
    return res.status(500).json({ error: 'Failed to get response from Gemini' });
  }
}
