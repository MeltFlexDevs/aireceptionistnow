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

/** Remember a refreshed access token and write it back to the integration row. */
export function persistAccessToken(
  config: Record<string, unknown>,
  accessToken: string,
): void {
  const refreshToken = config.refresh_token;
  if (typeof refreshToken !== "string" || !refreshToken) return;
  fresh.set(refreshToken, accessToken);
  try {
    // Best effort, off the call path - a lost write just means one extra
    // refresh after the next cold start.
    void createAdminClient()
      .from("integrations")
      .update({ config: { ...config, access_token: accessToken } })
      .eq("config->>refresh_token", refreshToken)
      .then(({ error }) => {
        if (error) console.error("[integrations] token write-back", error);
      });
  } catch (err) {
    console.error("[integrations] token write-back", err);
  }
}
