import { createClient } from '@supabase/supabase-js'

// Public client — safe for browser use (uses anon key, respects RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-only client — bypasses RLS. NEVER import this in client components.
// Only use inside API routes (/pages/api/*) or getServerSideProps.
// The env var has NO "NEXT_PUBLIC_" prefix, so Next.js will NOT bundle it
// into the client JavaScript.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
