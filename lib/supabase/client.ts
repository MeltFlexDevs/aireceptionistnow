import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicSupabaseEnv } from "./config";

// Browser client for Client Components. Returns null when auth isn't configured
// yet (missing public env) so the UI can degrade instead of crashing.
export function createClient(): SupabaseClient | null {
  const env = publicSupabaseEnv();
  return env ? createBrowserClient(env.url, env.key) : null;
}
