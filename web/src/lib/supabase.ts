import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton for browser (client components)
let _browserClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_browserClient) return _browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  _browserClient = createClient(url, key);
  return _browserClient;
}

// Server client (fresh instance per request — no session persistence)
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key, { auth: { persistSession: false } });
}
