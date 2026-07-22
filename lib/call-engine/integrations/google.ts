import type { BookingRequest, BookingResult } from "../types";
import { timedFetch } from "../net";
import { cachedAccessToken, persistAccessToken, storedTokenUsable } from "./token-store";
import type {
  AvailabilityQuery,
  AvailabilityResult,
  BusyInterval,
  CalendarEvent,
  CalendarFactory,
  CalendarProvider,
  CancelResult,
  ConnectionCheck,
  EventsResult,
} from "./types";

interface GoogleConfig {
  access_token?: string;
  refresh_token?: string;
  client_id?: string;
  client_secret?: string;
  token_uri?: string;
  calendar_id?: string;
}

function zoneOffset(date: string, timeZone: string): string {
  try {
    const at = new Date(`${date}T12:00:00Z`); // midday avoids DST-edge rounding
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    }).formatToParts(at);
    const name = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    const m = name.match(/GMT([+-]\d{2}:?\d{2})?/);
    if (!m) return "Z";
    if (!m[1]) return "+00:00"; // "GMT" with no offset = UTC
    return m[1].includes(":") ? m[1] : `${m[1].slice(0, 3)}:${m[1].slice(3)}`;
  } catch {
    return "Z";
  }
}

const inflightRefresh = new Map<string, Promise<string | null>>();

function refreshAccessToken(cfg: GoogleConfig): Promise<string | null> {
  const key = cfg.refresh_token;
  if (!key || !cfg.client_id || !cfg.client_secret) return Promise.resolve(null);
  const pending = inflightRefresh.get(key);
  if (pending) return pending;
  const exchange = doRefresh(cfg).finally(() => inflightRefresh.delete(key));
  inflightRefresh.set(key, exchange);
  return exchange;
}

async function doRefresh(cfg: GoogleConfig): Promise<string | null> {
  const res = await timedFetch(cfg.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: cfg.refresh_token!,
      client_id: cfg.client_id!,
      client_secret: cfg.client_secret!,
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  const token = json.access_token ?? null;
  if (token) void persistAccessToken(cfg as Record<string, unknown>, token, undefined, json.expires_in);
  return token;
}

export const createGoogleCalendar: CalendarFactory = (config): CalendarProvider => {
  const cfg = config as GoogleConfig;
  const storedToken = () =>
    cachedAccessToken(cfg.refresh_token) ??
    (storedTokenUsable(config) ? (cfg.access_token ?? null) : null);

  const post = (token: string, req: BookingRequest) =>
    timedFetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        req.calendarId || cfg.calendar_id || "primary",
      )}/events`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          summary: req.title,
          description: req.notes,
          start: { dateTime: req.startTime },
          end: { dateTime: req.endTime },
        }),
      },
    );

  const eventsUrl = (q: AvailabilityQuery, fields: string, maxResults = 250) =>
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      cfg.calendar_id || "primary",
    )}/events?${new URLSearchParams({
      timeMin: q.timeMin,
      timeMax: q.timeMax,
      singleEvents: "true", // required for orderBy=startTime and to expand recurrences
      orderBy: "startTime",
      maxResults: String(maxResults),
      fields,
    }).toString()}`;

  // GET with the stored token, refreshing once on a 401. Shared by the read
  // paths (getBusy / listEvents / checkConnection).
  const authedGet = async (url: string): Promise<Response | null> => {
    const run = (token: string) =>
      timedFetch(url, { headers: { authorization: `Bearer ${token}` } });
    let token = storedToken();
    let res = token ? await run(token) : null;
    if (!res || res.status === 401) {
      token = await refreshAccessToken(cfg);
      if (token) res = await run(token);
    }
    return res;
  };

  return {
    async createEvent(req): Promise<BookingResult> {
      let token = storedToken();
      let res = token ? await post(token, req) : null;
      if (!res || res.status === 401) {
        token = await refreshAccessToken(cfg);
        if (token) res = await post(token, req);
      }
      if (!res) return { ok: false, error: "google calendar not authorized" };
      if (!res.ok) return { ok: false, error: `google calendar ${res.status}` };
      const json = (await res.json()) as { id?: string; htmlLink?: string };
      return { ok: true, externalId: json.id, url: json.htmlLink };
    },

    async cancelEvent(externalId): Promise<CancelResult> {
      if (!externalId) return { ok: false, error: "no google event id" };
      const del = (token: string) =>
        timedFetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
            cfg.calendar_id || "primary",
          )}/events/${encodeURIComponent(externalId)}`,
          { method: "DELETE", headers: { authorization: `Bearer ${token}` } },
        );
      let token = storedToken();
      let res = token ? await del(token) : null;
      if (!res || res.status === 401) {
        token = await refreshAccessToken(cfg);
        if (token) res = await del(token);
      }
      if (!res) return { ok: false, error: "google calendar not authorized" };
      // 204 = deleted; 404/410 = already gone. All mean "no live event" - success.
      if (res.ok || res.status === 404 || res.status === 410) return { ok: true };
      return { ok: false, error: `google calendar ${res.status}` };
    },

    async getBusy(q): Promise<AvailabilityResult> {
      const res = await authedGet(eventsUrl(q, "timeZone,items(start,end,transparency)"));
      if (!res) return { ok: false, busy: [], error: "google calendar not authorized" };
      if (!res.ok) return { ok: false, busy: [], error: `google calendar ${res.status}` };
      const json = (await res.json()) as {
        timeZone?: string;
        items?: {
          start?: { dateTime?: string; date?: string };
          end?: { dateTime?: string; date?: string };
          transparency?: string;
        }[];
      };
      const zone = json.timeZone || "UTC";
      const toInstant = (dateTime?: string, date?: string): string | null => {
        if (dateTime) return dateTime;
        if (date) return `${date}T00:00:00${zoneOffset(date, zone)}`;
        return null;
      };
      const busy: BusyInterval[] = (json.items ?? [])
        .filter((ev) => ev.transparency !== "transparent")
        .flatMap((ev) => {
          const start = toInstant(ev.start?.dateTime, ev.start?.date);
          const end = toInstant(ev.end?.dateTime, ev.end?.date);
          return start && end ? [{ start, end }] : [];
        });
      return { ok: true, busy };
    },

    async listEvents(q): Promise<EventsResult> {
      const res = await authedGet(
        eventsUrl(
          q,
          "items(id,status,summary,location,htmlLink,start(dateTime,date),end(dateTime,date))",
        ),
      );
      if (!res) return { ok: false, events: [], error: "google calendar not authorized" };
      if (!res.ok) return { ok: false, events: [], error: `google calendar ${res.status}` };
      const json = (await res.json()) as {
        items?: {
          id?: string;
          status?: string;
          summary?: string;
          location?: string;
          htmlLink?: string;
          start?: { dateTime?: string; date?: string };
          end?: { dateTime?: string; date?: string };
        }[];
      };
      const events: CalendarEvent[] = (json.items ?? [])
        .filter((ev) => ev.status !== "cancelled")
        .flatMap((ev) => {
          const allDay = !ev.start?.dateTime && Boolean(ev.start?.date);
          // All-day events carry date-only bounds; anchor them at UTC midnight so
          // the date prefix is stable. Timed events already carry an offset.
          const start = ev.start?.dateTime ?? (ev.start?.date ? `${ev.start.date}T00:00:00Z` : null);
          const end = ev.end?.dateTime ?? (ev.end?.date ? `${ev.end.date}T00:00:00Z` : null);
          if (!start || !end) return [];
          return [
            {
              id: ev.id || start,
              title: ev.summary ?? "",
              start,
              end,
              allDay,
              location: ev.location,
              url: ev.htmlLink,
            },
          ];
        });
      return { ok: true, events };
    },

    async checkConnection(): Promise<ConnectionCheck> {
      // calendar.events scope cannot read calendars.get/calendarList, so the
      // account identity is derived from events.list: the primary calendar's
      // title (its email) or a self-owned event's organizer/creator email.
      const now = Date.now();
      const q = {
        timeMin: new Date(now - 30 * 86_400_000).toISOString(),
        timeMax: new Date(now + 120 * 86_400_000).toISOString(),
      };
      const res = await authedGet(
        eventsUrl(q, "summary,items(organizer(email,self),creator(email,self))", 50),
      );
      if (!res) return { ok: false };
      if (!res.ok) return { ok: false, error: `google calendar ${res.status}` };
      const json = (await res.json()) as {
        summary?: string;
        items?: {
          organizer?: { email?: string; self?: boolean };
          creator?: { email?: string; self?: boolean };
        }[];
      };
      const fromEvent = (json.items ?? [])
        .map((i) =>
          i.organizer?.self ? i.organizer.email : i.creator?.self ? i.creator.email : undefined,
        )
        .find((e): e is string => Boolean(e));
      const account =
        (json.summary && json.summary.includes("@") ? json.summary : undefined) ?? fromEvent ?? "";
      return { ok: true, account };
    },
  };
};
