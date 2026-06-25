import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for trusted server code only.
 *
 * This client bypasses Row-Level Security, so it must NEVER be imported into a
 * Client Component or returned to the browser. It is used by the billing API
 * routes to run the SECURITY DEFINER billing functions, whose EXECUTE privilege
 * is revoked from anon/authenticated so they can only be invoked with this key.
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error(
      "Supabase admin client requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createSupabaseClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
