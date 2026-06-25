// OAuth "Login with…" for calendar providers. The app's own OAuth client
// credentials live in env (GOOGLE_OAUTH_*, MICROSOFT_OAUTH_*, CALENDLY_OAUTH_*);
// the user authorizes with their own account and we store the returned tokens
// as the integration config. Optional — when a provider's creds aren't set, the
// integrations page falls back to manual credential entry.

interface OAuthDef {
  authUrl: string;
  tokenUrl: string;
  scope: string;
  authParams: Record<string, string>;
  envPrefix: string;
}

const PROVIDERS: Record<string, OAuthDef> = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/calendar.events",
    authParams: { access_type: "offline", prompt: "consent", include_granted_scopes: "true" },
    envPrefix: "GOOGLE",
  },
  outlook: {
    authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scope: "offline_access https://graph.microsoft.com/Calendars.ReadWrite",
    authParams: { prompt: "consent" },
    envPrefix: "MICROSOFT",
  },
  calendly: {
    authUrl: "https://auth.calendly.com/oauth/authorize",
    tokenUrl: "https://auth.calendly.com/oauth/token",
    scope: "",
    authParams: {},
    envPrefix: "CALENDLY",
  },
};

function creds(id: string): { clientId: string; clientSecret: string } | null {
  const def = PROVIDERS[id];
  if (!def) return null;
  const clientId = process.env[`${def.envPrefix}_OAUTH_CLIENT_ID`];
  const clientSecret = process.env[`${def.envPrefix}_OAUTH_CLIENT_SECRET`];
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

const baseUrl = (): string => process.env.APP_BASE_URL ?? "";

export function isOAuthConfigured(id: string): boolean {
  return Boolean(PROVIDERS[id] && creds(id) && baseUrl());
}

export function redirectUri(id: string): string {
  return `${baseUrl()}/api/integrations/${id}/callback`;
}

export function buildAuthorizeUrl(id: string, state: string): string {
  const def = PROVIDERS[id];
  const c = creds(id);
  if (!def || !c) throw new Error("oauth not configured");
  const params = new URLSearchParams({
    client_id: c.clientId,
    redirect_uri: redirectUri(id),
    response_type: "code",
    state,
    ...def.authParams,
  });
  if (def.scope) params.set("scope", def.scope);
  return `${def.authUrl}?${params.toString()}`;
}

/** Exchange the authorization code for tokens and build the integration config. */
export async function exchangeCode(
  id: string,
  code: string,
): Promise<{ config: Record<string, unknown> } | null> {
  const def = PROVIDERS[id];
  const c = creds(id);
  if (!def || !c) return null;

  const res = await fetch(def.tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(id),
      client_id: c.clientId,
      client_secret: c.clientSecret,
    }),
  });
  if (!res.ok) return null;
  const tok = (await res.json()) as { access_token?: string; refresh_token?: string };

  const config: Record<string, unknown> = {
    client_id: c.clientId,
    client_secret: c.clientSecret,
    access_token: tok.access_token,
    refresh_token: tok.refresh_token,
  };
  if (id === "outlook") config.tenant = "common";
  return { config };
}
