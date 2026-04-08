import fs from 'fs';
import path from 'path';

/**
 * Serves public/air1commandcenter/index.html through Next.js SSR.
 * This bypasses Vercel's static-file edge cache which was serving a stale
 * version of the file even after new deployments with the bell injection code.
 */
export async function getServerSideProps({ res }) {
  const htmlPath = path.join(process.cwd(), 'public', 'air1commandcenter', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.end(html);

  return { props: {} };
}

// Component never renders because res.end() fires first in getServerSideProps
export default function AirCommandCenter() {
  return null;
}
