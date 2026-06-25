import type { BookingRequest, BookingResult } from "../types";
import type { CalendarFactory, CalendarProvider } from "./types";

// Microsoft Outlook / Microsoft 365 adapter via Microsoft Graph. Config holds an
// OAuth refresh token + app registration, refreshed on demand; calendar_id is
// optional (defaults to the primary calendar).

interface OutlookConfig {
  access_token?: string;
  refresh_token?: string;
  client_id?: string;
  client_secret?: string;
  tenant?: string;
  calendar_id?: string;
}

async function refreshAccessToken(cfg: OutlookConfig): Promise<string | null> {
  if (!cfg.refresh_token || !cfg.client_id || !cfg.client_secret) return null;
  const tenant = cfg.tenant || "common";
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: cfg.refresh_token,
      client_id: cfg.client_id,
      client_secret: cfg.client_secret,
      scope: "https://graph.microsoft.com/Calendars.ReadWrite offline_access",
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

export const createOutlookCalendar: CalendarFactory = (config): CalendarProvider => {
  const cfg = config as OutlookConfig;

  const post = (token: string, req: BookingRequest) => {
    const calendarId = req.calendarId || cfg.calendar_id;
    const path = calendarId
      ? `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/events`
      : "https://graph.microsoft.com/v1.0/me/events";
    return fetch(path, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        subject: req.title,
        body: { contentType: "text", content: req.notes ?? "" },
        start: { dateTime: req.startTime, timeZone: "UTC" },
        end: { dateTime: req.endTime, timeZone: "UTC" },
      }),
    });
  };

  return {
    async createEvent(req): Promise<BookingResult> {
      let token = cfg.access_token ?? null;
      let res = token ? await post(token, req) : null;
      if (!res || res.status === 401) {
        token = await refreshAccessToken(cfg);
        if (token) res = await post(token, req);
      }
      if (!res) return { ok: false, error: "outlook not authorized" };
      if (!res.ok) return { ok: false, error: `outlook ${res.status}` };
      const json = (await res.json()) as { id?: string };
      return { ok: true, externalId: json.id };
    },
  };
};
