import "server-only";

import { createClient } from "@supabase/supabase-js";

import { serviceClient } from "@/lib/dashboard/supabase";

/**
 * One-time web handoff for the native app.
 *
 * Three things a phone cannot do in-process: Stripe checkout, the Stripe
 * billing portal, and a calendar provider's OAuth consent screen. All three
 * need a *cookie* session on aireceptionistnow.com, which the app does not have
 * - it holds a Supabase bearer token instead.
 *
 * So we mint a single-use magic link with the service-role key and hand back a
 * `/auth/confirm` URL. The app opens it in a browser tab, `/auth/confirm`
 * exchanges the token for cookies, and the browser lands on `next` already
 * signed in. The token is consumed by that one exchange, so a copied URL is
 * worthless a second time.
 *
 * Never log the returned URL: until it is redeemed it IS a credential.
 */

export function appBaseUrl(): string {
  return (process.env.APP_BASE_URL || "https://aireceptionistnow.com").replace(/\/+$/, "");
}

/** Reject anything that is not a same-origin path, the same rule the OAuth connect route uses. */
export function safeNextPath(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || /[\r\n]/.test(value)) return fallback;
  return value;
}

async function userEmail(userId: string): Promise<string | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user?.email) return null;
  return data.user.email;
}

/**
 * A URL that signs the browser in as `userId` and lands it on `next`.
 * Returns null when Supabase admin is not configured or the link is refused -
 * callers fall back to the plain URL, which just asks the user to sign in.
 */
export async function webHandoffUrl(userId: string, next: string): Promise<string | null> {
  const base = appBaseUrl();
  const email = await userEmail(userId);
  if (!email) return null;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${base}${next}` },
    });
    const hashed = data?.properties?.hashed_token;
    if (error || !hashed) return null;
    return `${base}/auth/confirm?token_hash=${encodeURIComponent(hashed)}&type=magiclink&next=${encodeURIComponent(next)}`;
  } catch (err) {
    console.error("[mobile:web-link]", err);
    return null;
  }
}

/** Every mobile write touching organizations needs this - see the knowledge routes. */
export async function ownsOrganization(orgId: string, userId: string): Promise<boolean> {
  const { data } = await serviceClient()
    .from("organizations")
    .select("owner_id")
    .eq("id", orgId)
    .maybeSingle();
  if (!data) return false;
  return !data.owner_id || data.owner_id === userId;
}
