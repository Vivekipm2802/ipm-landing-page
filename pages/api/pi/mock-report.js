// /pages/api/pi/mock-report.js
// Gemini API route for generating post-interview report card

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { mode, history, profile, apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Gemini API key required' });
  if (!history || history.length < 2) return res.status(400).json({ error: 'Interview history required' });

  const profileContext = profile
    ? `Student: ${profile.name || 'Unknown'} | School: ${profile.school || 'N/A'} | IPMAT: ${profile.ipmat_score || 'N/A'}`
    : '';

  const conversationText = history
    .map(msg => `${msg.role === 'ai' ? 'Panel' : 'Student'}: ${msg.text}`)
    .join('\n\n');

  const prompt = `You are an expert IIM Indore PI evaluator. You just observed a mock Personal Interview. Evaluate the student's performance.

${profileContext}

Interview Mode: ${mode}

Full Interview Transcript:
${conversationText}

Score the student on these 5 dimensions (each out of 10):

1. **Communication** — Fluency, grammar, vocabulary, articulation. Did they express ideas clearly?
2. **Clarity** — Were answers structured and to-the-point? Or rambling and unfocused?
3. **Depth** — Did they go beyond surface-level? Did they show genuine understanding vs rehearsed answers?
4. **Confidence** — Were they composed? Did they handle pressure and curveballs well? Did they admit when they didn't know something (good) or bluff (bad)?
5. **Overall** — Holistic impression. Would this student survive a real IIM Indore panel?

Also provide:
- **Strengths**: 2-3 specific things the student did well (with quotes from their answers if possible)
- **Improvements**: 2-3 specific areas to work on (with concrete suggestions, not generic advice)
- **Tips**: 2-3 pro tips for the next mock (tactical advice they can immediately apply)

Respond in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "communication": 7,
  "clarity": 6,
  "depth": 5,
  "confidence": 7,
  "overall": 6,
  "strengths": "Your specific feedback on what went well...",
  "improvements": "Your specific feedback on what to improve...",
  "tips": "Your tactical tips for next time..."
}

IMPORTANT:
- Be honest but encouraging. A score of 5-6 is average, 7-8 is good, 9-10 is exceptional.
- Don't inflate scores. Most students score 5-7 on first attempts.
- Reference specific answers from the transcript in your feedback.
- Keep each text field under 150 words.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Gemini API error' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON from response (handle possible markdown code blocks)
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const report = JSON.parse(cleanText);

      // Validate and clamp scores
      const clamp = (val) => {
        const n = parseInt(val);
        return isNaN(n) ? 5 : Math.min(10, Math.max(1, n));
      };

      return res.status(200).json({
        communication: clamp(report.communication),
        clarity: clamp(report.clarity),
        depth: clamp(report.depth),
        confidence: clamp(report.confidence),
        overall: clamp(report.overall),
        strengths: report.strengths || 'No specific feedback available.',
        improvements: report.improvements || 'No specific feedback available.',
        tips: report.tips || 'Keep practicing with more mock interviews.',
      });
    } catch {
      // If JSON parsing fails, return a generic report
      return res.status(200).json({
        communication: 5,
        clarity: 5,
        depth: 5,
        confidence: 5,
        overall: 5,
        strengths: text.substring(0, 300),
        improvements: 'Could not parse detailed feedback. Try another mock interview.',
        tips: 'Ensure your API key is working correctly and try again.',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to connect to Gemini: ' + err.message });
  }
}
