/**
 * Whose authorization code was it? Apple answers a code exchange with an
 * id_token next to the refresh token. Its `sub` is the Apple user id the code
 * belongs to. lib/mobile/apple-signin.ts stores the refresh token only when
 * that `sub` is one of the signed-in user's own Apple identities.
 *
 * This file has no `server-only` import, so node:test can load it.
 */

const APPLE_ISSUER = "https://appleid.apple.com";

/** The fields of a Supabase `UserIdentity` that this file reads. */
export interface IdentityLike {
  provider: string;
  id: string;
  identity_data?: { [key: string]: unknown };
}

/**
 * The Apple user ids on a user's Apple identities. GoTrue keeps Apple's `sub`
 * as the identity `id` (its provider_id) and in `identity_data.sub`.
 */
export function appleSubs(identities: readonly IdentityLike[] | undefined): string[] {
  const subs = new Set<string>();
  for (const identity of identities ?? []) {
    if (identity.provider !== "apple") continue;
    for (const value of [identity.id, identity.identity_data?.sub]) {
      if (typeof value === "string" && value) subs.add(value);
    }
  }
  return [...subs];
}

/**
 * True only when Apple issued the id_token for `clientId` and its `sub` is
 * `expectedSub`. There is no signature check: the token comes straight from
 * Apple's token endpoint over TLS (OpenID Connect Core 3.1.3.7). A token it
 * cannot read is false.
 */
export function appleSubMatches(idToken: string, expectedSub: string, clientId: string): boolean {
  const parts = idToken.split(".");
  if (parts.length !== 3 || !expectedSub) return false;
  let claims: unknown;
  try {
    claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return false;
  }
  if (!claims || typeof claims !== "object") return false;
  const { iss, aud, sub } = claims as { iss?: unknown; aud?: unknown; sub?: unknown };
  const audOk = aud === clientId || (Array.isArray(aud) && aud.includes(clientId));
  return iss === APPLE_ISSUER && audOk && sub === expectedSub;
}
