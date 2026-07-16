import type { BookingRequest, BookingResult } from "../types";
import { timedFetch } from "../net";
import { cachedAccessToken, persistAccessToken } from "./token-store";
import type { CalendarFactory, CalendarProvider, CancelResult } from "./types";

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
  const res = await timedFetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
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
  const token = json.access_token ?? null;
  if (token) persistAccessToken(cfg as Record<string, unknown>, token);
  return token;
}

export const createOutlookCalendar: CalendarFactory = (config): CalendarProvider => {
  const cfg = config as OutlookConfig;

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

  return {
    async createEvent(req): Promise<BookingResult> {
      if (!Number.isFinite(Date.parse(req.startTime)) || !Number.isFinite(Date.parse(req.endTime))) {
        return { ok: false, error: "invalid start/end time" };
      }
      let token = cachedAccessToken(cfg.refresh_token) ?? cfg.access_token ?? null;
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

    async cancelEvent(externalId): Promise<CancelResult> {
      if (!externalId) return { ok: false, error: "no outlook event id" };
      const del = (token: string) =>
        timedFetch(`https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(externalId)}`, {
          method: "DELETE",
          headers: { authorization: `Bearer ${token}` },
        });
      let token = cachedAccessToken(cfg.refresh_token) ?? cfg.access_token ?? null;
      let res = token ? await del(token) : null;
      if (!res || res.status === 401) {
        token = await refreshAccessToken(cfg);
        if (token) res = await del(token);
      }
      if (!res) return { ok: false, error: "outlook not authorized" };
      if (res.ok || res.status === 404) return { ok: true };
      return { ok: false, error: `outlook ${res.status}` };
    },
  };
};
