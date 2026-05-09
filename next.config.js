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
};

module.exports = nextConfig;
