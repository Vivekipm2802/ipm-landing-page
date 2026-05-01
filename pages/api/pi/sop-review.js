// /pages/api/pi/sop-review.js
// Gemini API route for SOP review + trap detection

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured on server' });

  const { sop, profile } = req.body;
  if (!sop) return res.status(400).json({ error: 'SOP content required' });

  const profileContext = profile
    ? `Student Profile:\n- Name: ${profile.name || 'N/A'}\n- School: ${profile.school || 'N/A'}\n- Board: ${profile.board || 'N/A'}\n- Stream: ${profile.stream || 'N/A'}\n- Class 10: ${profile.class10_pct || 'N/A'}%\n- Class 12: ${profile.class12_pct || 'N/A'}%\n- IPMAT Score: ${profile.ipmat_score || 'N/A'}\n- Extracurriculars: ${(profile.extracurriculars || []).join(', ') || 'None listed'}\n- Achievements: ${(profile.achievements || []).join(', ') || 'None listed'}\n- Why MBA: ${profile.why_mba || 'Not stated'}\n- Career Goal: ${profile.career_goal || 'Not stated'}`
    : '';

  const prompt = `You are a senior IIM Indore PI (Personal Interview) panel expert who has conducted 500+ interviews. You are reviewing a student's Statement of Purpose (SOP) that they will use during their IIM Indore IPM interview.

${profileContext}

Student's SOP:
${sop}

Provide TWO things in your response:

1. **FEEDBACK** (200-300 words): Give specific, actionable feedback on the SOP. Cover:
   - Is the opening hook strong enough to grab attention in a 15-minute interview?
   - Are the "Why MBA at 18" and "Why IIM Indore" answers specific or generic?
   - Are strengths backed by concrete examples?
   - Are career goals realistic and well-connected to IPM?
   - Is there anything that sounds rehearsed, clichéd, or copied from the internet?
   - Word count and flow assessment
   - Overall impression (would this SOP impress a panel?)

2. **TRAPS** (as a JSON array): Identify 3-5 "trap questions" the panel is MOST LIKELY to ask based on this specific SOP. These are questions where the student could get caught off-guard. For each trap, explain WHY it's a trap.

Format your response EXACTLY like this (no markdown, no extra formatting):
FEEDBACK:
[your feedback text here]

TRAPS:
["Trap question 1 — WHY: explanation", "Trap question 2 — WHY: explanation", ...]

Important: Be tough but constructive. IIM panels are sharp — flag anything that won't survive a 2-minute cross-examination.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Gemini API error' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse feedback and traps
    let feedback = text;
    let traps = [];

    const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]*?)(?=TRAPS:|$)/i);
    const trapsMatch = text.match(/TRAPS:\s*(\[[\s\S]*?\])/i);

    if (feedbackMatch) feedback = feedbackMatch[1].trim();

    if (trapsMatch) {
      try {
        traps = JSON.parse(trapsMatch[1]);
      } catch {
        // If JSON parsing fails, try to extract traps manually
        const trapText = trapsMatch[1];
        const trapItems = trapText.match(/"([^"]+)"/g);
        if (trapItems) {
          traps = trapItems.map(t => t.replace(/^"|"$/g, ''));
        }
      }
    }

    return res.status(200).json({ feedback, traps });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to connect to Gemini: ' + err.message });
  }
}

