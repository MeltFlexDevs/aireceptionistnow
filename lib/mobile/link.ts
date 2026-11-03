import "server-only";

import { createClient } from "@supabase/supabase-js";

import { serviceClient } from "@/lib/dashboard/supabase";
import { isOwnedBy } from "@/lib/dashboard/ownership";

/**
 * One-time web handoff for the native app.
 *
 * The one thing the app still cannot do in-process is a calendar provider's
 * OAuth consent screen. It needs a *cookie* session on aireceptionistnow.com
 * to bind the resulting tokens to this user, and the app holds a Supabase
 * bearer token instead. Nothing in the app hands off to web billing, checkout
 * or the Stripe portal any more - subscriptions are bought through the App
 * Store / Google Play.
 *
 * So we mint a single-use magic link with the service-role key and hand back a
 * `/auth/confirm` URL. The app opens it in a browser tab, `/auth/confirm`
 * exchanges the token for cookies, and the browser lands on `next` already
 * signed in. The token is consumed by that one exchange, so a copied URL is
 * worthless a second time. Mint it at tap time only: a link minted on every
 * screen load can be superseded or expire before the user taps it.
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

/** Where a finished web handoff sends the browser back to when the app named nowhere valid. */
export const APP_RETURN_URL = "aireceptionistnow://handoff";

// The app's own scheme, plus Expo Go's (exp://, exps://) for development.
// Never http(s): an arbitrary web return URL would make /mobile/done an open
// redirect that carries a fresh sign-in's outcome to any site.
const APP_SCHEMES = ["aireceptionistnow://", "exp://", "exps://"];

/** The app deep link to return to, or null when it is not one of the app's schemes. */
export function safeAppReturnUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 512) return null;
  if (!APP_SCHEMES.some((s) => value.toLowerCase().startsWith(s))) return null;
  if (/[\s\\<>"']/.test(value)) return null;
  try {
    return new URL(value).href;
  } catch {
    return null;
  }
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

/**
 * Every mobile write touching organizations needs this - see the knowledge
 * routes. Strict (SEC-1): a business with no owner belongs to nobody.
 */
export async function ownsOrganization(orgId: string, userId: string): Promise<boolean> {
  const { data } = await serviceClient()
    .from("organizations")
    .select("owner_id")
    .eq("id", orgId)
    .maybeSingle();
  if (!data) return false;
  return isOwnedBy(data.owner_id as string | null, userId);
}
