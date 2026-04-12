import { createClient } from '@supabase/supabase-js'

// Public client — safe for browser use (uses anon key, respects RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-only client — bypasses RLS. NEVER import this in client components.
// Only use inside API routes (/pages/api/*) or getServerSideProps.
// Created lazily so the module can be imported on the client without crashing
// (the env var is intentionally undefined in the browser).
let _supabaseServer = null
export function getSupabaseServer() {
  if (!_supabaseServer) {
    _supabaseServer = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY)
  }
  return _supabaseServer
}

// Backward-compatible export: evaluates to null on client, real client on server.
// Existing code that does `supabaseServer.from(...)` in API routes / getServerSideProps
// will keep working. Client-side code that accidentally imports this file won't crash.
export const supabaseServer = typeof window === 'undefined'
  ? getSupabaseServer()
  : null
