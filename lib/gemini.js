// Thin wrapper around the Google Gemini API (generateContent).
// We deliberately avoid the official SDK to keep deps lean — one fetch call.
//
// Required env vars:
//   GEMINI_API_KEY   — get at https://aistudio.google.com/apikey
//
// Models in use (May 2026):
//   gemini-2.5-pro     — long-form blog writing
//   gemini-2.5-flash   — news classification + summary (fast + cheap)

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function gemini({
  model        = 'gemini-2.5-pro',
  system       = '',
  prompt,                          // string OR array of strings (will be concatenated)
  temperature  = 0.7,
  max_tokens   = 8192,
  json         = false,             // when true, asks Gemini to return strict JSON
}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY env var is missing.');

  const userText = Array.isArray(prompt) ? prompt.join('\n\n') : String(prompt || '');

  const body = {
    contents: [{ role: 'user', parts: [{ text: userText }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: max_tokens,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const r = await fetch(`${ENDPOINT}/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'x-goog-api-key':  key,
      'content-type':    'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Gemini ${r.status}: ${text}`);
  }
  const data = await r.json();

  // A blocked / safety-filtered response has no parts but a finishReason.
  const cand = data?.candidates?.[0];
  if (!cand?.content?.parts) {
    throw new Error(`Gemini returned no content (finishReason=${cand?.finishReason || 'unknown'}).`);
  }
  const text = cand.content.parts.map(p => p.text || '').join('');
  return { text, raw: data };
}

// Robust extractor: pull the first JSON object/array from a string,
// even if it's wrapped in ```json fences or has prose around it.
export function extractJson(text) {
  // Strip code fences
  let cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  // Try direct parse first (Gemini returns clean JSON when responseMimeType is set)
  try { return JSON.parse(cleaned); } catch (_) { /* fall through */ }

  // Find balanced braces (object) or brackets (array)
  const start = cleaned.search(/[\{\[]/);
  if (start === -1) throw new Error('No JSON found in response.');
  const open  = cleaned[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === open)  depth++;
    else if (cleaned[i] === close) {
      depth--;
      if (depth === 0) {
        return JSON.parse(cleaned.slice(start, i + 1));
      }
    }
  }
  throw new Error('Unbalanced JSON in response.');
}
