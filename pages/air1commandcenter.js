import fs from 'fs';
import path from 'path';

export async function getServerSideProps({ res }) {
  const htmlPath = path.join(process.cwd(), 'public', 'air1commandcenter', 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Inject base href so relative asset paths resolve correctly from /air1commandcenter
  html = html.replace('<head>', '<head>\n  <base href="/air1commandcenter/">');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.end(html);

  return { props: {} };
}

export default function AirCommandCenter() {
  return null;
}
