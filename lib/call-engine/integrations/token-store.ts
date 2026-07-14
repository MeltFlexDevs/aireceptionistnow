import { createAdminClient } from "../../supabase/admin";

// Write-back for OAuth access tokens refreshed mid-call. Without it every tool
// call after expiry pays a stale-request → 401 → refresh → retry round trip.
// Calendar factories only receive the integration's config (never its row id),
// so the row is located by its refresh_token - unique per grant, and exactly
// how the config was loaded (integrations.config jsonb). A warm-instance cache
// serves the token immediately; the DB write covers the next cold start.

const fresh = new Map<string, string>();

/** Access token refreshed since this config was loaded, if any. */
export function cachedAccessToken(refreshToken: string | undefined): string | null {
  return (refreshToken && fresh.get(refreshToken)) || null;
}

/** Remember a refreshed access token and write it back to the integration row.
 *  Providers that rotate the refresh token on every refresh (Cal.com) pass the
 *  new one so the row - still located by the OLD token - stays refreshable.
 *
 *  For non-rotating providers a lost write is harmless (one extra refresh after
 *  the next cold start), so callers may fire-and-forget. Under rotation the old
 *  token is already dead server-side and losing the write bricks the grant -
 *  rotating callers must AWAIT this so the write happens before the response
 *  path can be torn down. Never rejects; failures are logged. */
export async function persistAccessToken(
  config: Record<string, unknown>,
  accessToken: string,
  rotatedRefreshToken?: string,
): Promise<void> {
  const refreshToken = config.refresh_token;
  if (typeof refreshToken !== "string" || !refreshToken) return;
  // Cache under BOTH tokens on rotation: a warm instance still holding the old
  // config keys its lookup by the old (now dead) refresh token, and the fresh
  // access token is the only thing keeping it bookable.
  fresh.set(refreshToken, accessToken);
  if (rotatedRefreshToken) {
    fresh.set(rotatedRefreshToken, accessToken);
    if (fresh.size > 500) fresh.clear(); // crude bound; repopulates on demand
  }
  try {
    const { data, error } = await createAdminClient()
      .from("integrations")
      .update({
        config: {
          ...config,
          access_token: accessToken,
          ...(rotatedRefreshToken ? { refresh_token: rotatedRefreshToken } : {}),
        },
      })
      .eq("config->>refresh_token", refreshToken)
      .select("id");
    if (error) console.error("[integrations] token write-back", error);
    // A 0-row update reports no error - surface it, it means the row was
    // already rewritten (or gone) and this grant's tokens may be diverging.
    else if (!data?.length) {
      console.error("[integrations] token write-back matched no row (rotated elsewhere?)");
    }
  } catch (err) {
    console.error("[integrations] token write-back", err);
  }
}
