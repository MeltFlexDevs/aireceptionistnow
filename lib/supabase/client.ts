import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicSupabaseEnv } from "./config";

export function createClient(): SupabaseClient | null {
  const env = publicSupabaseEnv();
  return env ? createBrowserClient(env.url, env.key) : null;
}
