import type { BookingRequest, BookingResult } from "../types";
import type { CalendarFactory, CalendarProvider } from "./types";

// Google Calendar adapter. Config holds the user's OAuth credentials — an
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
  return json.access_token ?? null;
}

export const createGoogleCalendar: CalendarFactory = (config): CalendarProvider => {
  const cfg = config as GoogleConfig;

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

  return {
    async createEvent(req): Promise<BookingResult> {
      let token = cfg.access_token ?? null;
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
  };
};
