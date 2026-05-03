// Bearer-token gate for our automation endpoints.
// The scheduled task hits these endpoints with `Authorization: Bearer <token>`.
// Set CONTENT_AUTOMATION_TOKEN to a long random string in Vercel env.

export function requireAuth(req, res) {
  const expected = process.env.CONTENT_AUTOMATION_TOKEN;
  if (!expected) {
    res.status(500).json({ ok: false, error: 'CONTENT_AUTOMATION_TOKEN not set on server.' });
    return false;
  }
  const got = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (got !== expected) {
    res.status(401).json({ ok: false, error: 'Unauthorized.' });
    return false;
  }
  return true;
}

// Slugify: lowercase, strip non-alphanumerics, collapse hyphens, max 80 chars.
export function slugify(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// 5-letter random suffix to prevent slug collisions on similar topics.
export function randSuffix() {
  return Math.random().toString(36).slice(2, 7);
}
