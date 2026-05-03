// Thin wrapper around Anthropic's Messages API.
// We deliberately avoid the SDK to keep deps lean — one fetch call.
//
// Required env vars:
//   ANTHROPIC_API_KEY
//
// Models in use (May 2026):
//   claude-sonnet-4-6   — long-form blog writing
//   claude-haiku-4-5    — news classification + summary

const API = 'https://api.anthropic.com/v1/messages';

export async function anthropic({
  model   = 'claude-sonnet-4-6',
  system  = '',
  messages,
  max_tokens = 4096,
  temperature = 0.7,
}) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY env var is missing.');

  const r = await fetch(API, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model, system, messages, max_tokens, temperature }),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Anthropic ${r.status}: ${text}`);
  }
  const json = await r.json();
  // Concatenate all text blocks.
  const text = (json.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  return { text, raw: json };
}

// Robust extractor: pull the first JSON object from Claude's response,
// even if it's wrapped in ```json fences or has commentary around it.
export function extractJson(text) {
  // Strip code fences first
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '');

  // Try direct parse
  try { return JSON.parse(cleaned); } catch (_) { /* fall through */ }

  // Find balanced braces
  const start = cleaned.indexOf('{');
  if (start === -1) throw new Error('No JSON object found in response.');
  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === '{') depth++;
    else if (cleaned[i] === '}') {
      depth--;
      if (depth === 0) {
        const candidate = cleaned.slice(start, i + 1);
        return JSON.parse(candidate);
      }
    }
  }
  throw new Error('Unbalanced JSON braces in response.');
}
