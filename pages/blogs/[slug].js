// /blogs/[slug] → redirect to /magazine/[slug]
// The blog system uses /magazine/ routes. This redirect catches old /blogs/ links.

export async function getServerSideProps({ params, res }) {
  res.writeHead(301, { Location: `/magazine/${params.slug}` });
  res.end();
  return { props: {} };
}

export default function BlogRedirect() {
  return null;
}
