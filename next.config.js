/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/home' },
      ],
    };
  },
  async redirects() {
    return [
      {
        source: '/magazine/best-bba-colleges-in-india-2026-a-guide-to-placements-fees-roi-1lj0c',
        destination: '/magazine/best-bba-colleges-in-india-2026-placements-roi-fees-compared-jfzqj',
        permanent: true,
      },
      {
        source: '/magazine/best-bba-colleges-in-india-2026-a-guide-to-placements-fees-roi-8owt6',
        destination: '/magazine/best-bba-colleges-in-india-2026-placements-roi-fees-compared-jfzqj',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
