// Minimal Bird WhatsApp sender (server only). Disabled until BIRD_API_KEY and BIRD_WA_FROM are set.
export function birdConfigured() {
  return Boolean(process.env.BIRD_API_KEY && process.env.BIRD_WA_FROM);
}

function baseUrl(key) {
  const m = String(key).match(/^bk_([a-z]{2}\d+)_/);
  return process.env.BIRD_API_URL || `https://${m ? m[1] : "us1"}.platform.bird.com`;
}

// params: { name: "Riya", centre: "…" } for a template with named placeholders
export async function sendWhatsAppTemplate({ to, slug, params = {}, idempotencyKey, tags }) {
  const key = process.env.BIRD_API_KEY;
  const body = {
    to,
    from: process.env.BIRD_WA_FROM,
    template: {
      slug,
      language: "en",
      components: [{ type: "body", parameters: Object.entries(params).map(([name, text]) => ({ type: "text", name, text: String(text ?? "") })) }],
    },
    idempotency_key: idempotencyKey,
    tags,
  };
  const r = await fetch(`${baseUrl(key)}/v1/whatsapp/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error?.message || data?.error?.code || `Bird ${r.status}`);
  return data;
}
