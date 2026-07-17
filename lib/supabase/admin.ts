import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Memoized: this is called on the per-turn call-engine hot path (snapshot and
// token stores), so don't rebuild the client on every operation.
let cached: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) {
    throw new Error(
      "Supabase admin client requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  cached = createSupabaseClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
