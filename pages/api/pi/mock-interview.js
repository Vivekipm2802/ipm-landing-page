// /pages/api/pi/mock-interview.js
// Gemini API route for AI mock interview (start + continue)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured on server' });

  const { action, mode, profile, sop, history, questionCount, maxQuestions } = req.body;

  const profileContext = profile
    ? `Student Profile:
- Name: ${profile.name || 'Student'}
- School: ${profile.school || 'N/A'}
- Board: ${profile.board || 'N/A'} | Stream: ${profile.stream || 'N/A'}
- Class 10: ${profile.class10_pct || 'N/A'}% | Class 12: ${profile.class12_pct || 'N/A'}%
- IPMAT Score: ${profile.ipmat_score || 'N/A'} | Estimated Rank: ${profile.ipmat_rank_est || 'N/A'}
- Other Exams: ${profile.other_exams || 'None'}
- Extracurriculars: ${(profile.extracurriculars || []).join(', ') || 'None listed'}
- Achievements: ${(profile.achievements || []).join(', ') || 'None listed'}
- Why MBA: ${profile.why_mba || 'Not stated'}
- Career Goal: ${profile.career_goal || 'Not stated'}
- Strengths: ${profile.strengths || 'Not stated'}
- Weaknesses: ${profile.weaknesses || 'Not stated'}`
    : '';

  const sopContext = sop
    ? `Student's SOP:\n${Object.entries(sop).map(([k, v]) => v ? `${k}: ${v}` : '').filter(Boolean).join('\n')}`
    : '';

  const modeInstructions = {
    sop: `Focus ONLY on questions derived from the student's SOP. Dig deep into every claim they made — ask for specifics, challenge vague statements, find contradictions. If they said "I led a team," ask "How many people? What was the outcome? What went wrong?"`,
    academic: `Focus on academics — board, subjects, scores, favorite subjects, projects, why they chose their stream, gaps in scores, comparison between Class 10 and 12. Ask about specific topics from their subjects to test depth.`,
    gk: `Focus on current affairs, general knowledge, and opinion-based questions. Ask about recent events (last 6 months), government policies, business news, social issues. Ask "What do you think about X?" and then challenge their opinion to test conviction.`,
    situational: `Focus on situational/behavioral questions — "Tell me about a time when...", "What would you do if...", ethical dilemmas, teamwork challenges, leadership moments, failure stories. Use the STAR method to probe depth.`,
    full: `This is a FULL MOCK PI. Cover ALL areas: start with introduction, then move to SOP-based questions, academics, extracurriculars, current affairs, situational questions, and career goals. Allocate roughly equal time to each area. This simulates the real 15-20 minute IIM Indore PI panel.`,
  };

  const systemPrompt = `You are a PANEL of 3 senior IIM Indore professors conducting a Personal Interview (PI) for the IPM (Integrated Programme in Management) admission. You are experienced, sharp, and thorough.

Your interview style:
- Ask ONE question at a time (never multiple questions in one message)
- Be conversational but probing — always follow up on vague answers
- Occasionally show warmth ("That's interesting, tell me more") but also challenge ("But that contradicts what you said earlier")
- If the student gives a textbook/rehearsed answer, push them off-script
- Use their profile and SOP to ask personalized questions — never ask generic questions when you have their data
- Keep questions concise (1-3 sentences max)
- Occasionally ask unexpected questions to test composure ("If you don't get into IIM Indore, what's your Plan B?")

${profileContext}

${sopContext}

Interview Mode: ${modeInstructions[mode] || modeInstructions.full}

IMPORTANT RULES:
- NEVER break character. You ARE the IIM panel.
- ONE question per message only.
- Do NOT provide feedback during the interview — save that for the report.
- Keep the tone professional but not intimidating.
- Address the student by first name if available.`;

  try {
    let prompt;

    if (action === 'start') {
      prompt = `${systemPrompt}

Begin the interview now. Greet the student, make them comfortable with a brief warm-up comment (about their city, school, or something from their profile), and then ask your FIRST question. Remember: one question only.`;
    } else {
      // Continue the interview
      const isLastQuestion = questionCount >= (maxQuestions - 1);
      const conversationHistory = (history || []).map(msg =>
        msg.role === 'ai'
          ? `Panel: ${msg.text}`
          : `Student: ${msg.text}`
      ).join('\n\n');

      prompt = `${systemPrompt}

Interview so far:
${conversationHistory}

${isLastQuestion
  ? `This is the LAST question. Ask a strong closing question (e.g., "Any questions for us?" or "Is there anything you want us to know that we haven't covered?") and then end warmly with "Thank you, [name]. We'll let you know. All the best." Set finished=true in your intent.`
  : `Ask the NEXT question. You may briefly acknowledge their previous answer (1 short sentence) before asking. Remember: ONE question only. Be natural — vary between follow-ups and new topics.`
}

${isLastQuestion ? 'IMPORTANT: This is the final exchange. Wrap up the interview gracefully.' : ''}`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Gemini API error' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const isLast = questionCount >= (maxQuestions - 1);

    return res.status(200).json({
      message: text.trim(),
      finished: isLast,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to connect to Gemini: ' + err.message });
  }
}
