// Minimal sanity-check for @vercel/og.
// If THIS returns content-length: 0, @vercel/og is broken in our setup
// (install issue or Next.js version mismatch). If it returns bytes, the
// problem is specific to /api/og/[slug] and we keep digging there.

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0c14',
          color: '#f9a01b',
          fontSize: 96,
          fontWeight: 900,
        }}
      >
        <span>OG WORKS</span>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
