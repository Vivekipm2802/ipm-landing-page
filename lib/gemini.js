// Thin wrapper around the Google Gemini API (generateContent).
// We deliberately avoid the official SDK to keep deps lean — one fetch call.
//
// Required env vars:
//   GEMINI_API_KEY   — get at https://aistudio.google.com/apikey
//
// Models in use (May 2026):
//   gemini-2.5-pro     — long-form blog writing
//   gemini-2.5-flash   — news classification + summary (fast + cheap)
//
// Resilience:
//   - Auto-retry on 429 / 500 / 503 with exponential backoff (1s, 3s, 8s).
//   - Optional fallbackModel: when the primary model returns 503 after retries,
//     re-attempt the same request on the fallback model. Useful for keeping the
//     daily blog generation running when gemini-2.5-pro is in capacity crunch.

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [1000, 3000, 8000];   // 3 retries

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function callOnce({ model, system, userText, temperature, max_tokens, json, key }) {
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
    headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r;
}

export async function gemini({
  model          = 'gemini-2.5-pro',
  fallbackModel  = null,            // e.g. 'gemini-2.5-flash' — used after retries fail
  system         = '',
  prompt,                           // string OR array of strings
  temperature    = 0.7,
  max_tokens     = 8192,
  json           = false,
}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY env var is missing.');

  const userText = Array.isArray(prompt) ? prompt.join('\n\n') : String(prompt || '');
  const args = { system, userText, temperature, max_tokens, json, key };

  const tryModel = async (m) => {
    let lastErr;
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      const r = await callOnce({ model: m, ...args });
      if (r.ok) {
        const data = await r.json();
        const cand = data?.candidates?.[0];
        if (!cand?.content?.parts) {
          throw new Error(`Gemini ${m} returned no content (finishReason=${cand?.finishReason || 'unknown'}).`);
        }
        const text = cand.content.parts.map(p => p.text || '').join('');
        return { text, raw: data, modelUsed: m, attempts: attempt + 1 };
      }
      const errText = await r.text();
      lastErr = new Error(`Gemini ${m} ${r.status}: ${errText}`);
      if (!RETRY_STATUSES.has(r.status) || attempt === RETRY_DELAYS_MS.length) {
        throw lastErr;
      }
      // Retry-eligible status — wait then loop
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
    throw lastErr;
  };

  try {
    return await tryModel(model);
  } catch (err) {
    if (!fallbackModel || fallbackModel === model) throw err;
    // Primary exhausted — fall back. Don't retry as much on the fallback (assume same upstream).
    console.warn(`[gemini] primary ${model} exhausted, falling back to ${fallbackModel}. err: ${err.message.slice(0, 200)}`);
    return await tryModel(fallbackModel);
  }
}

// Robust extractor: pull the first JSON object/array from a string,
// even if it's wrapped in ```json fences or has prose around it.
export function extractJson(text) {
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
