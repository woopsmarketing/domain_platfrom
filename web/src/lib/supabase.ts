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

// Server client using anon key (respects RLS — fresh instance per request)
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key, { auth: { persistSession: false } });
}

// Server client using service role key (bypasses RLS — use only in trusted server code)
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role env vars not set");
  return createClient(url, key, { auth: { persistSession: false } });
}
