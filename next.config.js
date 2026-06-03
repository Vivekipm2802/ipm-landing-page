/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async rewrites() {
    return { beforeFiles: [ { source: '/', destination: '/home' } ] };
  },
  async redirects() {
    const jfzqj = '/magazine/best-bba-colleges-in-india-2026-placements-roi-fees-compared-jfzqj';
    const studymat = '/magazine/free-ipmat-2027-study-material-best-books-pdfs-resources-30ra2';
    return [
      { source: '/magazine/best-bba-colleges-in-india-2026-a-guide-to-placements-fees-roi-1lj0c', destination: jfzqj, permanent: true },
      { source: '/magazine/best-bba-colleges-in-india-2026-a-guide-to-placements-fees-roi-8owt6', destination: jfzqj, permanent: true },
      { source: '/magazine/free-ipmat-2027-study-material-best-books-pdfs-online-resources-fllix', destination: studymat, permanent: true },
    ];
  },
};
module.exports = nextConfig;
