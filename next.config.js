/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

let redirectList = [];
try {
  redirectList = JSON.parse(fs.readFileSync(path.join(__dirname, 'redirects.json'), 'utf8'));
} catch (e) {
  console.warn('[next.config] redirects.json not found or invalid — no redirects loaded.');
}

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
    return redirectList;
  },
};
module.exports = nextConfig;
