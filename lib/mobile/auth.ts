import "server-only";

import { createClient, isAuthSessionMissingError, type SupabaseClient } from "@supabase/supabase-js";

import { publicSupabaseEnv } from "@/lib/supabase/config";
import { checkMobileAuth } from "@/lib/mobile/auth-check";

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

/**
 * The signed-in user's id, or null when the token is missing, bad or expired.
 *
 * Throws when the token could not be checked (Supabase down, a 5xx, a timeout,
 * rate limited): the app signs out on a 401, so an outage must surface as a
 * 5xx it retries, not as "Not signed in."
 */
export async function mobileUserId(req: Request): Promise<string | null> {
  const token = bearer(req);
  if (!token) return null;
  const client = authClient();
  if (!client) throw new Error("Supabase auth is not configured");
  const { data, error } = await client.auth.getUser(token);
  if (error) {
    // GoTrue rejects a token with a 4xx and an error code (bad_jwt,
    // user_not_found; session_not_found arrives as AuthSessionMissingError).
    // A 4xx without a code is the gateway, not GoTrue - a rotated anon key
    // answers 401 "Invalid API key" for every token - so it throws like a 5xx.
    const status = error.status ?? 0;
    const rejected =
      isAuthSessionMissingError(error) ||
      (status >= 400 && status < 500 && status !== 429 && typeof error.code === "string");
    if (rejected) return null;
    throw error;
  }
  return data.user?.id ?? null;
}

/**
 * Auth for a route handler that builds its own responses. Returns the user id,
 * null when the token was rejected (answer 401), or a 503 Response to return as
 * is when the check itself failed. Handlers that only return data use
 * `mobileRoute`, which does the same.
 */
export function mobileAuth(req: Request, label: string): Promise<string | null | Response> {
  return checkMobileAuth(req, label, mobileUserId);
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
    const userId = await mobileAuth(req, label);
    if (userId instanceof Response) return userId;
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
