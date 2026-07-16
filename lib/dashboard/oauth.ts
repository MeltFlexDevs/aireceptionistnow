
interface OAuthDef {
  authUrl: string;
  tokenUrl: string;
  scope: string;
  authParams: Record<string, string>;
  envPrefix: string;
  tokenBody?: "json" | "form";
  enrich?: (config: Record<string, unknown>) => Promise<void>;
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
  calcom: {
    authUrl: "https://app.cal.com/auth/oauth2/authorize",
    tokenUrl: "https://api.cal.com/v2/auth/oauth2/token",
    scope: "PROFILE_READ EVENT_TYPE_READ BOOKING_READ BOOKING_WRITE",
    authParams: {},
    envPrefix: "CALCOM",
    tokenBody: "json",
    enrich: enrichCalcom,
  },
};

async function enrichCalcom(config: Record<string, unknown>): Promise<void> {
  const token = config.access_token;
  if (typeof token !== "string" || !token) return;
  const auth = { authorization: `Bearer ${token}` };

  const me = await fetch("https://api.cal.com/v2/me", { headers: auth });
  if (!me.ok) throw new Error("Could not read your Cal.com profile. Please try again.");
  const profile = (await me.json()) as {
    data?: { username?: string; timeZone?: string };
  };
  if (profile.data?.username) config.username = profile.data.username;
  if (profile.data?.timeZone) config.time_zone = profile.data.timeZone;

  const username = typeof config.username === "string" ? config.username : "";
  const res = await fetch(
    `https://api.cal.com/v2/event-types?username=${encodeURIComponent(username)}`,
    { headers: { ...auth, "cal-api-version": "2024-06-14" } },
  );
  if (!res.ok) throw new Error("Could not read your Cal.com event types. Please try again.");
  const json = (await res.json()) as {
    data?: { id?: number }[] | { eventTypes?: { id?: number }[] };
  };
  const list = Array.isArray(json.data) ? json.data : (json.data?.eventTypes ?? []);
  const first = list.find((et) => et?.id);
  if (!first?.id) {
    throw new Error(
      "No event type found on your Cal.com account. Create one in Cal.com, then reconnect.",
    );
  }
  config.event_type_id = String(first.id);
}

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

export async function exchangeCode(
  id: string,
  code: string,
): Promise<{ config: Record<string, unknown> } | null> {
  const def = PROVIDERS[id];
  const c = creds(id);
  if (!def || !c) return null;

  const grant = {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(id),
    client_id: c.clientId,
    client_secret: c.clientSecret,
  };
  const res = await fetch(
    def.tokenUrl,
    def.tokenBody === "json"
      ? {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify(grant),
        }
      : {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            accept: "application/json",
          },
          body: new URLSearchParams(grant),
        },
  );
  if (!res.ok) return null;
  const tok = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    data?: {
      access_token?: string;
      refresh_token?: string;
      accessToken?: string;
      refreshToken?: string;
    };
  };
  const accessToken = tok.access_token ?? tok.data?.access_token ?? tok.data?.accessToken;
  const refreshToken = tok.refresh_token ?? tok.data?.refresh_token ?? tok.data?.refreshToken;
  if (!accessToken) return null;

  const config: Record<string, unknown> = {
    client_id: c.clientId,
    client_secret: c.clientSecret,
    access_token: accessToken,
    refresh_token: refreshToken,
  };
  if (id === "outlook") config.tenant = "common";
  if (def.enrich) await def.enrich(config);
  return { config };
}
