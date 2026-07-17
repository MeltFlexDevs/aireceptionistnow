import { createAdminClient } from "../../supabase/admin";

const EXPIRY_MARGIN_MS = 2 * 60_000;

const fresh = new Map<string, { token: string; expiresAt: number }>();

export function cachedAccessToken(refreshToken: string | undefined): string | null {
  if (!refreshToken) return null;
  const hit = fresh.get(refreshToken);
  if (!hit) return null;
  // expiresAt 0 = unknown lifetime; serve it and let the 401 path handle it.
  if (hit.expiresAt && Date.now() > hit.expiresAt - EXPIRY_MARGIN_MS) {
    fresh.delete(refreshToken);
    return null;
  }
  return hit.token;
}

// True when the access token stored in the integration config is still usable
// (no recorded expiry, or comfortably before it). Lets cold instances skip the
// guaranteed-401 round trip on an expired stored token.
export function storedTokenUsable(config: Record<string, unknown>): boolean {
  const at = Date.parse(String(config.access_token_expires_at ?? ""));
  return !Number.isFinite(at) || Date.now() < at - EXPIRY_MARGIN_MS;
}

export async function persistAccessToken(
  config: Record<string, unknown>,
  accessToken: string,
  rotatedRefreshToken?: string,
  expiresInSeconds?: number,
): Promise<void> {
  const refreshToken = config.refresh_token;
  if (typeof refreshToken !== "string" || !refreshToken) return;
  const expiresAt =
    typeof expiresInSeconds === "number" && expiresInSeconds > 0
      ? Date.now() + expiresInSeconds * 1000
      : 0;
  fresh.set(refreshToken, { token: accessToken, expiresAt });
  if (rotatedRefreshToken) {
    fresh.set(rotatedRefreshToken, { token: accessToken, expiresAt });
  }
  // Bound on every write, not only rotations - non-rotating providers
  // (Google) would otherwise grow the map without limit.
  if (fresh.size > 500) fresh.clear(); // crude bound; repopulates on demand
  try {
    const { data, error } = await createAdminClient()
      .from("integrations")
      .update({
        config: {
          ...config,
          access_token: accessToken,
          ...(expiresAt ? { access_token_expires_at: new Date(expiresAt).toISOString() } : {}),
          ...(rotatedRefreshToken ? { refresh_token: rotatedRefreshToken } : {}),
        },
      })
      .eq("config->>refresh_token", refreshToken)
      .select("id");
    if (error) console.error("[integrations] token write-back", error);
    else if (!data?.length) {
      console.error("[integrations] token write-back matched no row (rotated elsewhere?)");
    }
  } catch (err) {
    console.error("[integrations] token write-back", err);
  }
}
