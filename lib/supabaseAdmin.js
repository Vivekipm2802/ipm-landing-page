// Server-only Supabase client. Uses the service role key — bypasses RLS.
// NEVER import this from a client-side file. Use only in pages/api/* or getServerSideProps.
//
// Required env vars:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_KEY

import { createClient } from '@supabase/supabase-js';

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_KEY;

if (!url || !service) {
  console.warn('[supabaseAdmin] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY env var.');
}

export const supabaseAdmin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false }
});
