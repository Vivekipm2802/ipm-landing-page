export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, category, studentData } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  // Build the system instruction
  const studentContext = studentData
    ? `\nStudent Profile: Name: ${studentData.name}, IPMAT Score: ${studentData.total}/360, Category: ${studentData.category}.`
    : '';

  const systemInstruction = `You are a senior IIM PI (Personal Interview) panel member conducting a mock interview for an IPMAT aspirant preparing for IIM Indore's Integrated Programme in Management.

Your role:
- Ask ONE focused PI question at a time, appropriate for the category: ${category}
- After the student answers, provide brief, actionable feedback (2-3 lines max)
- Rate their answer: Excellent / Good / Needs Improvement
- Then ask the next question
- Be encouraging but honest. Point out weak areas politely
- If the student gives a short or vague answer, probe deeper with follow-up questions
- Occasionally reference real IIM PI scenarios and tips
- Keep your tone professional but warm — like a supportive mentor, not a harsh examiner

Interview categories and what to test:
- why_ipm: Motivation for IPM, understanding of the 5-year program, why IIM Indore
- about_you: Self-introduction, strengths/weaknesses, hobbies, extracurriculars
- academics: Academic background, favorite subjects, academic achievements
- current_affairs: National/international news, economic events, social issues
- leadership: Leadership experiences, teamwork examples, conflict resolution
- ethics: Ethical dilemmas, values, decision-making under pressure
- career: Future career plans, understanding of management, industry interests
- general: Mix of all above categories

Important guidelines:
- Start with easier questions, gradually increase difficulty
- After every 3-4 questions, give a brief summary of how they're doing
- Use markdown (**bold** for emphasis) but keep formatting minimal
- If the student says "I don't know", help them think through it rather than just moving on
- End each response with either a new question or a follow-up probe${studentContext}`;

  try {
    // Convert messages to Gemini format
    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
            topP: 0.9,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return res.status(200).json({
        reply: data.candidates[0].content.parts[0].text,
      });
    } else {
      console.error('[interviewChat] Unexpected Gemini response:', JSON.stringify(data).slice(0, 500));
      return res.status(200).json({
        reply: "I'm having a brief technical difficulty. Let me rephrase — could you tell me about a time you showed leadership in a challenging situation?",
      });
    }
  } catch (error) {
    console.error('[interviewChat] Error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
}
