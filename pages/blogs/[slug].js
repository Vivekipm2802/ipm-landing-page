// /blogs/[slug] → permanent redirect to /magazine/[slug]
export async function getServerSideProps({ params }) {
  return {
    redirect: {
      destination: `/magazine/${params.slug}`,
      permanent: true,
    },
  };
}

export default function BlogRedirect() {
  return null;
}
