// pages/api/crudJSON.js
// Writes a JSON file to the public directory.
// SECURITY: Requires bearer token auth + sanitizes fileName to prevent path traversal.

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ── Auth check: require CONTENT_AUTOMATION_TOKEN ──
  const expected = process.env.CONTENT_AUTOMATION_TOKEN;
  if (!expected) {
    return res.status(500).json({ error: 'CONTENT_AUTOMATION_TOKEN not configured' });
  }
  const got = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (got !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { fileName, jso } = req.body;

  if (!fileName || typeof fileName !== 'string') {
    return res.status(400).json({ error: 'fileName is required' });
  }

  // ── Sanitize fileName: strip path separators, dots, and special chars ──
  // Only allow alphanumeric, hyphens, and underscores
  const sanitized = fileName.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!sanitized || sanitized.length === 0) {
    return res.status(400).json({ error: 'Invalid fileName after sanitization' });
  }

  try {
    const jsonData = jso;
    const filePath = path.join(process.cwd(), 'public', `${sanitized}.json`);

    // Verify the resolved path is still inside public/
    const publicDir = path.join(process.cwd(), 'public');
    if (!filePath.startsWith(publicDir)) {
      return res.status(400).json({ error: 'Path traversal detected' });
    }

    fs.writeFileSync(filePath, JSON.stringify(jsonData));

    return res.status(200).json({ success: true, message: 'JSON file created successfully.' });
  } catch (error) {
    console.error('crudJSON error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
