export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY not configured on server. Go to Vercel → Settings → Environment Variables and add GEMINI_API_KEY.' }),
      { status: 200, headers: corsHeaders }
    );
  }

  try {
    const { prompt, temperature, maxTokens } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid prompt' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Try v1beta first, then v1 — with multiple models
    const attempts = [
      { ver: 'v1beta', model: 'gemini-2.0-flash' },
      { ver: 'v1beta', model: 'gemini-1.5-flash' },
      { ver: 'v1',     model: 'gemini-2.0-flash' },
      { ver: 'v1',     model: 'gemini-1.5-flash' },
      { ver: 'v1beta', model: 'gemini-pro' },
      { ver: 'v1',     model: 'gemini-pro' },
    ];

    const allErrors: string[] = [];

    for (const { ver, model } of attempts) {
      try {
        const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: temperature ?? 0.7,
              maxOutputTokens: maxTokens ?? 2048
            }
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${res.status}`;
          allErrors.push(`${ver}/${model}: ${errMsg}`);

          // Auth/key errors won't be fixed by trying another model
          if (res.status === 401 || res.status === 403) {
            return new Response(
              JSON.stringify({ error: `API Key error: ${errMsg}` }),
              { status: 200, headers: corsHeaders }
            );
          }
          continue;
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!text) {
          allErrors.push(`${ver}/${model}: empty response`);
          continue;
        }

        // Success!
        return new Response(JSON.stringify({ text }), { status: 200, headers: corsHeaders });
      } catch (e: any) {
        allErrors.push(`${ver}/${model}: ${e.message}`);
      }
    }

    return new Response(
      JSON.stringify({ error: `All models failed: ${allErrors.join(' | ')}` }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: `Server error: ${error?.message || 'Unknown'}` }),
      { status: 500, headers: corsHeaders }
    );
  }
}
