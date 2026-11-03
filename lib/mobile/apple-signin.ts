import "server-only";

import { createPrivateKey, sign } from "node:crypto";

import { serviceClient } from "@/lib/dashboard/supabase";
import { appleSubMatches, appleSubs } from "@/lib/mobile/apple-id-token";

/**
 * Sign in with Apple - the server half of the native iOS flow.
 *
 * Supabase signs the user in from Apple's identity token; that part needs
 * nothing here. What Supabase does not do is keep the *refresh token*, and
 * Apple requires an app that lets users delete their account to also revoke
 * their Sign in with Apple token when it does (App Review 5.1.1(v)). Revoking
 * needs a refresh token, and the only way to get one is to exchange the
 * one-shot authorization code the native dialog hands the app. So the app
 * posts that code to /api/mobile/auth/apple-token right after signing in, the
 * exchange happens here, and the token waits in `apple_signin_tokens` until
 * account deletion revokes it.
 *
 * Everything is gated on the SIWA env: unset means "not configured" and every
 * call resolves to a soft no. The app never shows the user an error for this.
 *
 * The client secret Apple expects is an ES256 JWT signed with the .p8 key from
 * the developer portal. node:crypto signs it directly - `dsaEncoding:
 * 'ieee-p1363'` gives the raw r||s signature JWS wants - so there is no JWT
 * dependency.
 */

const APPLE_AUDIENCE = "https://appleid.apple.com";
const TOKEN_URL = "https://appleid.apple.com/auth/token";
const REVOKE_URL = "https://appleid.apple.com/auth/revoke";

/** Apple caps the client secret's lifetime at 6 months; an hour is plenty for one request. */
const SECRET_TTL_SECONDS = 3600;

const TIMEOUT_MS = 10_000;

interface SiwaEnv {
  teamId: string;
  keyId: string;
  privateKey: string;
  clientId: string;
}

function env(): SiwaEnv | null {
  const teamId = process.env.APPLE_SIWA_TEAM_ID;
  const keyId = process.env.APPLE_SIWA_KEY_ID;
  const privateKey = process.env.APPLE_SIWA_PRIVATE_KEY;
  if (!teamId || !keyId || !privateKey) return null;
  return {
    teamId,
    keyId,
    // Env editors tend to flatten the PEM onto one line with literal "\n".
    privateKey: privateKey.replace(/\\n/g, "\n"),
    clientId: process.env.APPLE_SIWA_CLIENT_ID || "com.aireceptionistnow.app",
  };
}

export function appleSignInConfigured(): boolean {
  return env() !== null;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/**
 * The `client_secret` for Apple's token endpoints: an ES256 JWT with the team
 * as issuer and the app's client id as subject. Null when not configured.
 */
export function clientSecret(nowMs: number = Date.now()): string | null {
  const e = env();
  if (!e) return null;
  const iat = Math.floor(nowMs / 1000);
  const header = base64url(JSON.stringify({ alg: "ES256", kid: e.keyId, typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: e.teamId,
      iat,
      exp: iat + SECRET_TTL_SECONDS,
      aud: APPLE_AUDIENCE,
      sub: e.clientId,
    }),
  );
  const data = `${header}.${claims}`;
  const signature = sign("sha256", Buffer.from(data), {
    key: createPrivateKey(e.privateKey),
    dsaEncoding: "ieee-p1363",
  });
  return `${data}.${base64url(signature)}`;
}

async function postForm(url: string, form: Record<string, string>): Promise<Response> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "POST",
      signal: abort.signal,
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body: new URLSearchParams(form),
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Exchange the native dialog's authorization code for a refresh token and the
 * id_token that says whose code it was. The code is single-use and expires in
 * five minutes, so the app sends it as soon as it has it. Null when not
 * configured or when Apple refused.
 */
export async function exchangeCode(
  authorizationCode: string,
): Promise<{ refreshToken: string; idToken: string; clientId: string } | null> {
  const e = env();
  const secret = clientSecret();
  if (!e || !secret) return null;

  const res = await postForm(TOKEN_URL, {
    client_id: e.clientId,
    client_secret: secret,
    code: authorizationCode,
    grant_type: "authorization_code",
  });
  if (!res.ok) {
    // Apple's error body is {error: 'invalid_grant'} and friends - no secrets in it.
    const detail = await res.text().catch(() => "");
    console.error(`[apple-signin] token exchange failed (${res.status}) ${detail}`.trim());
    return null;
  }
  const data = (await res.json()) as { refresh_token?: string; id_token?: string };
  if (!data.refresh_token || !data.id_token) return null;
  return { refreshToken: data.refresh_token, idToken: data.id_token, clientId: e.clientId };
}

/**
 * What `storeAppleToken` did. "mismatch": Apple says the code belongs to an
 * Apple account that is not this user's Apple sign-in, so nothing was stored.
 * "skipped": not configured, Apple refused, or the user lookup or the write
 * failed; the app treats that as "nothing to do".
 */
export type AppleTokenResult = "stored" | "skipped" | "mismatch";

/**
 * Exchange, check and store, in one go. The check matters: with another
 * Apple account's token stored, account deletion would revoke that grant and
 * leave this user's own grant in place.
 */
export async function storeAppleToken(userId: string, authorizationCode: string): Promise<AppleTokenResult> {
  let token: { refreshToken: string; idToken: string; clientId: string } | null;
  try {
    token = await exchangeCode(authorizationCode);
  } catch (err) {
    console.error("[apple-signin] token exchange threw", err);
    return "skipped";
  }
  if (!token) return "skipped";

  const { data: found, error: userError } = await serviceClient().auth.admin.getUserById(userId);
  if (userError) {
    console.error("[apple-signin] could not load the user", userError.message);
    return "skipped";
  }
  const { idToken, clientId } = token;
  if (!appleSubs(found.user?.identities).some((sub) => appleSubMatches(idToken, sub, clientId))) {
    return "mismatch";
  }

  const { error } = await serviceClient()
    .from("apple_signin_tokens")
    .upsert(
      {
        user_id: userId,
        refresh_token: token.refreshToken,
        client_id: token.clientId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (error) {
    console.error("[apple-signin] could not store token", error.message);
    return "skipped";
  }
  return "stored";
}

/**
 * Revoke the user's Sign in with Apple grant and forget the token.
 *
 * Resolves false when the user never signed in with Apple (nothing to revoke),
 * true when Apple accepted the revoke. Throws when Apple refused, so account
 * deletion can record a warning; the row is removed either way, because the
 * auth user is about to cascade it anyway.
 */
export async function revokeAppleToken(userId: string): Promise<boolean> {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("apple_signin_tokens")
    .select("refresh_token, client_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return false;

  const row = data as { refresh_token: string; client_id: string };
  try {
    const secret = clientSecret();
    if (!secret) throw new Error("Sign in with Apple is not configured; token not revoked.");
    const res = await postForm(REVOKE_URL, {
      client_id: row.client_id,
      client_secret: secret,
      token: row.refresh_token,
      token_type_hint: "refresh_token",
    });
    if (!res.ok) throw new Error(`Apple revoke responded ${res.status}`);
    return true;
  } finally {
    await sb.from("apple_signin_tokens").delete().eq("user_id", userId);
  }
}
