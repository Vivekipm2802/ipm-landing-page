// /robots.txt — points crawlers to the sitemap and allows everything.

export async function getServerSideProps({ res }) {
  const txt = `User-agent: *
Allow: /

Sitemap: https://register.ipmcareer.com/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
  res.write(txt);
  res.end();
  return { props: {} };
}
export default function Robots() { return null; }
