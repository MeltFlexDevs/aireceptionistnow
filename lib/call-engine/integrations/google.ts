import type { BookingRequest, BookingResult } from "../types";
import { cachedAccessToken, persistAccessToken } from "./token-store";
import type {
  AvailabilityQuery,
  AvailabilityResult,
  BusyInterval,
  CalendarFactory,
  CalendarProvider,
} from "./types";

// Google Calendar adapter. Config holds the user's OAuth credentials - an
// access token (refreshed on 401 if a refresh token + client creds are present)
// and the target calendar id.

interface GoogleConfig {
  access_token?: string;
  refresh_token?: string;
  client_id?: string;
  client_secret?: string;
  token_uri?: string;
  calendar_id?: string;
}

// The UTC offset (e.g. "-04:00") of an IANA zone at a given calendar date, so an
// all-day event's YYYY-MM-DD can be pinned to the right instant. Uses Intl only
// - no tz database dependency. Falls back to "Z" if the zone is unknown.
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

async function refreshAccessToken(cfg: GoogleConfig): Promise<string | null> {
  if (!cfg.refresh_token || !cfg.client_id || !cfg.client_secret) return null;
  const res = await fetch(cfg.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: cfg.refresh_token,
      client_id: cfg.client_id,
      client_secret: cfg.client_secret,
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  const token = json.access_token ?? null;
  if (token) persistAccessToken(cfg as Record<string, unknown>, token);
  return token;
}

export const createGoogleCalendar: CalendarFactory = (config): CalendarProvider => {
  const cfg = config as GoogleConfig;
  const storedToken = () => cachedAccessToken(cfg.refresh_token) ?? cfg.access_token ?? null;

  const post = (token: string, req: BookingRequest) =>
    fetch(
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

  // Availability reads use events.list, not freeBusy: the OAuth grant is scoped
  // to calendar.events only, which freeBusy rejects with a 403. Only start/end/
  // transparency are requested, so event details never even reach this adapter.
  const listEvents = (token: string, q: AvailabilityQuery) =>
    fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        cfg.calendar_id || "primary",
      )}/events?${new URLSearchParams({
        timeMin: q.timeMin,
        timeMax: q.timeMax,
        singleEvents: "true",
        fields: "timeZone,items(start,end,transparency)",
      }).toString()}`,
      { headers: { authorization: `Bearer ${token}` } },
    );

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
      const json = (await res.json()) as { id?: string };
      return { ok: true, externalId: json.id };
    },

    async getBusy(q): Promise<AvailabilityResult> {
      let token = storedToken();
      let res = token ? await listEvents(token, q) : null;
      if (!res || res.status === 401) {
        token = await refreshAccessToken(cfg);
        if (token) res = await listEvents(token, q);
      }
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
      // An all-day event carries a bare `date` (YYYY-MM-DD) that spans midnight to
      // midnight in the CALENDAR's zone, not UTC - resolve it in json.timeZone so
      // a same-day busy block isn't shifted by the offset. dateTime is already a
      // full instant. "transparent" events are marked free.
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
  };
};
