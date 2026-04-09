import fs from 'fs';
import path from 'path';

export async function getServerSideProps({ res }) {
  const htmlPath = path.join(process.cwd(), 'public', 'air1commandcenter', 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Fix relative asset paths — the HTML was built to be served from /air1commandcenter/
  // but Next.js serves this page at /air1commandcenter (no trailing slash), so
  // relative paths like "assets/..." resolve to /assets/... (wrong).
  // Injecting <base href> corrects all relative URLs in one shot.
  html = html.replace('<head>', '<head>\n  <base href="/air1commandcenter/">');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.end(html);

  return { props: {} };
}

export default function AirCommandCenter() {
  return null;
}
