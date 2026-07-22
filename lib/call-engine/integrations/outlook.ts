import type { BookingRequest, BookingResult } from "../types";
import { timedFetch } from "../net";
import { cachedAccessToken, persistAccessToken, storedTokenUsable } from "./token-store";
import type {
  CalendarEvent,
  CalendarFactory,
  CalendarProvider,
  CancelResult,
  ConnectionCheck,
  EventsResult,
} from "./types";

interface OutlookConfig {
  access_token?: string;
  refresh_token?: string;
  client_id?: string;
  client_secret?: string;
  tenant?: string;
  calendar_id?: string;
}

const inflightRefresh = new Map<string, Promise<string | null>>();

function refreshAccessToken(cfg: OutlookConfig): Promise<string | null> {
  const key = cfg.refresh_token;
  if (!key || !cfg.client_id || !cfg.client_secret) return Promise.resolve(null);
  const pending = inflightRefresh.get(key);
  if (pending) return pending;
  const exchange = doRefresh(cfg).finally(() => inflightRefresh.delete(key));
  inflightRefresh.set(key, exchange);
  return exchange;
}

async function doRefresh(cfg: OutlookConfig): Promise<string | null> {
  const tenant = cfg.tenant || "common";
  const res = await timedFetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: cfg.refresh_token!,
      client_id: cfg.client_id!,
      client_secret: cfg.client_secret!,
      scope: "https://graph.microsoft.com/Calendars.ReadWrite offline_access",
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  const token = json.access_token ?? null;
  // Microsoft rotates refresh tokens - persist the new one or it eventually dies.
  const rotated =
    json.refresh_token && json.refresh_token !== cfg.refresh_token ? json.refresh_token : undefined;
  if (token) {
    const persist = persistAccessToken(cfg as Record<string, unknown>, token, rotated, json.expires_in);
    // A rotation must be durable before we continue; a re-issued access token
    // is best-effort.
    if (rotated) await persist;
    else void persist;
    if (rotated) cfg.refresh_token = rotated;
  }
  return token;
}

export const createOutlookCalendar: CalendarFactory = (config): CalendarProvider => {
  const cfg = config as OutlookConfig;
  const storedToken = () =>
    cachedAccessToken(cfg.refresh_token) ??
    (storedTokenUsable(config) ? (cfg.access_token ?? null) : null);

  const post = (token: string, req: BookingRequest) => {
    const calendarId = req.calendarId || cfg.calendar_id;
    const path = calendarId
      ? `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/events`
      : "https://graph.microsoft.com/v1.0/me/events";
    return timedFetch(path, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        subject: req.title,
        body: { contentType: "text", content: req.notes ?? "" },
        start: { dateTime: new Date(req.startTime).toISOString().slice(0, 19), timeZone: "UTC" },
        end: { dateTime: new Date(req.endTime).toISOString().slice(0, 19), timeZone: "UTC" },
      }),
    });
  };

  const me = (token: string) =>
    timedFetch("https://graph.microsoft.com/v1.0/me?$select=id", {
      headers: { authorization: `Bearer ${token}` },
    });

  const graph = "https://graph.microsoft.com/v1.0";

  // GET with the stored token, refreshing once on a 401. Shared by the read
  // paths (listEvents / checkConnection).
  const authedGet = async (
    url: string,
    headers: Record<string, string> = {},
  ): Promise<Response | null> => {
    const run = (token: string) =>
      timedFetch(url, { headers: { authorization: `Bearer ${token}`, ...headers } });
    let token = storedToken();
    let res = token ? await run(token) : null;
    if (!res || res.status === 401) {
      token = await refreshAccessToken(cfg);
      if (token) res = await run(token);
    }
    return res;
  };

  // With the Prefer header, Graph renders start/end as UTC wall-clock time with
  // no trailing Z and up to 7 sub-second digits; normalize to a real instant.
  const toInstant = (dt?: { dateTime?: string; timeZone?: string }): string | null => {
    const raw = dt?.dateTime;
    if (!raw) return null;
    const trimmed = raw.replace(/\.\d+$/, "");
    return /[zZ]|[+-]\d\d:?\d\d$/.test(trimmed) ? trimmed : `${trimmed}Z`;
  };

  return {
    // Outlook exposes no getBusy, so its token never warms through the
    // availability prefetch. Ping a cheap authenticated endpoint at call start
    // so createEvent's first try uses a warm token instead of paying the
    // 401 -> refresh -> retry chain on the booking critical path.
    async warmAuth(): Promise<void> {
      const token = storedToken();
      const res = token ? await me(token).catch(() => null) : null;
      if (!res || res.status === 401) {
        const refreshed = await refreshAccessToken(cfg);
        if (refreshed) await me(refreshed).catch(() => null);
      }
    },

    async createEvent(req): Promise<BookingResult> {
      if (!Number.isFinite(Date.parse(req.startTime)) || !Number.isFinite(Date.parse(req.endTime))) {
        return { ok: false, error: "invalid start/end time" };
      }
      let token = storedToken();
      let res = token ? await post(token, req) : null;
      if (!res || res.status === 401) {
        token = await refreshAccessToken(cfg);
        if (token) res = await post(token, req);
      }
      if (!res) return { ok: false, error: "outlook not authorized" };
      if (!res.ok) return { ok: false, error: `outlook ${res.status}` };
      const json = (await res.json()) as { id?: string; webLink?: string };
      return { ok: true, externalId: json.id, url: json.webLink };
    },

    async cancelEvent(externalId): Promise<CancelResult> {
      if (!externalId) return { ok: false, error: "no outlook event id" };
      const del = (token: string) =>
        timedFetch(`https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(externalId)}`, {
          method: "DELETE",
          headers: { authorization: `Bearer ${token}` },
        });
      let token = storedToken();
      let res = token ? await del(token) : null;
      if (!res || res.status === 401) {
        token = await refreshAccessToken(cfg);
        if (token) res = await del(token);
      }
      if (!res) return { ok: false, error: "outlook not authorized" };
      if (res.ok || res.status === 404) return { ok: true };
      return { ok: false, error: `outlook ${res.status}` };
    },

    async listEvents(q): Promise<EventsResult> {
      // calendarView expands recurrences across the range (unlike /me/events).
      // A single page (top 100) covers a month without paging.
      const params = new URLSearchParams({
        startDateTime: q.timeMin,
        endDateTime: q.timeMax,
        $select: "id,subject,start,end,location,webLink,isAllDay,isCancelled",
        $orderby: "start/dateTime",
        $top: "100",
      });
      const res = await authedGet(`${graph}/me/calendarView?${params.toString()}`, {
        prefer: 'outlook.timezone="UTC"',
      });
      if (!res) return { ok: false, events: [], error: "outlook not authorized" };
      if (!res.ok) return { ok: false, events: [], error: `outlook ${res.status}` };
      const json = (await res.json()) as {
        value?: {
          id?: string;
          subject?: string;
          isAllDay?: boolean;
          isCancelled?: boolean;
          webLink?: string;
          start?: { dateTime?: string; timeZone?: string };
          end?: { dateTime?: string; timeZone?: string };
          location?: { displayName?: string };
        }[];
      };
      const events: CalendarEvent[] = (json.value ?? [])
        .filter((ev) => !ev.isCancelled)
        .flatMap((ev) => {
          const start = toInstant(ev.start);
          const end = toInstant(ev.end);
          if (!start || !end) return [];
          return [
            {
              id: ev.id || start,
              title: ev.subject ?? "",
              start,
              end,
              allDay: Boolean(ev.isAllDay),
              location: ev.location?.displayName,
              url: ev.webLink,
            },
          ];
        });
      return { ok: true, events };
    },

    async checkConnection(): Promise<ConnectionCheck> {
      // GET /me needs User.Read (not in our Calendars scope); the default
      // calendar's owner is the mailbox email and stays within scope.
      const res = await authedGet(`${graph}/me/calendar?$select=name,owner`);
      if (!res) return { ok: false };
      if (!res.ok) return { ok: false, error: `outlook ${res.status}` };
      const json = (await res.json()) as { owner?: { name?: string; address?: string } };
      return { ok: true, account: json.owner?.address ?? "" };
    },
  };
};
