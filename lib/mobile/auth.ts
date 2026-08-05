import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { publicSupabaseEnv } from "@/lib/supabase/config";

/**
 * Bearer-token auth for the native app (`aireceptionistnowapp`).
 *
 * The web dashboard authenticates from a Supabase cookie session that the proxy
 * refreshes on every `/dashboard/*` request. A native client has no cookie jar
 * we control, so it sends the Supabase access token in `Authorization: Bearer
 * <jwt>` instead and each route verifies it here.
 *
 * `/api/mobile/*` sits OUTSIDE the proxy matcher (`/dashboard/:path*`), exactly
 * like `/api/notifications`, so nothing guards these routes but this helper.
 * Every handler must go through `mobileRoute` - an unauthenticated read here
 * would hand one tenant's calls to another, because everything downstream runs
 * on the service-role client with RLS bypassed.
 */

let cached: SupabaseClient | null = null;

function authClient(): SupabaseClient | null {
  if (cached) return cached;
  const env = publicSupabaseEnv();
  if (!env) return null;
  // The anon key is enough to *verify* a token: getUser(jwt) asks GoTrue, it
  // does not read any table. Keeping the service-role key out of this path
  // means a bad token can never be escalated into a privileged client.
  cached = createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return cached;
}

function bearer(req: Request): string {
  const header = req.headers.get("authorization") ?? "";
  return /^Bearer\s+/i.test(header) ? header.replace(/^Bearer\s+/i, "").trim() : "";
}

/** The signed-in user's id, or null when the token is missing, bad or expired. */
export async function mobileUserId(req: Request): Promise<string | null> {
  const token = bearer(req);
  if (!token) return null;
  const client = authClient();
  if (!client) return null;
  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

export interface MobileUser {
  id: string;
  email: string;
}

/**
 * Wraps a handler with auth + JSON error handling.
 *
 * A thrown error becomes a 500 with a generic message: these payloads reach a
 * shipped binary we cannot patch as fast as the server, so never leak a
 * Supabase/Twilio error string into it.
 */
export function mobileRoute<T>(
  handler: (userId: string, req: Request) => Promise<T>,
  label: string,
) {
  return async (req: Request): Promise<Response> => {
    const userId = await mobileUserId(req);
    if (!userId) {
      return Response.json({ error: "Not signed in." }, { status: 401 });
    }
    try {
      return Response.json(await handler(userId, req));
    } catch (err) {
      console.error(`[mobile:${label}]`, err);
      return Response.json({ error: "Something went wrong." }, { status: 500 });
    }
  };
}
