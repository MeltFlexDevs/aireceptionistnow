import { createAdminClient } from "../../supabase/admin";

const fresh = new Map<string, string>();

export function cachedAccessToken(refreshToken: string | undefined): string | null {
  return (refreshToken && fresh.get(refreshToken)) || null;
}

export async function persistAccessToken(
  config: Record<string, unknown>,
  accessToken: string,
  rotatedRefreshToken?: string,
): Promise<void> {
  const refreshToken = config.refresh_token;
  if (typeof refreshToken !== "string" || !refreshToken) return;
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
    else if (!data?.length) {
      console.error("[integrations] token write-back matched no row (rotated elsewhere?)");
    }
  } catch (err) {
    console.error("[integrations] token write-back", err);
  }
}
