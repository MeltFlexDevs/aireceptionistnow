import type { BookingRequest, BookingResult } from "../types";
import { cachedAccessToken, persistAccessToken } from "./token-store";
import type {
  AvailabilityResult,
  BusyInterval,
  CalendarFactory,
  CalendarProvider,
} from "./types";

// Cal.com adapter (API v2 - v1 was shut down in April 2026). Auth is a Bearer
// token: either the OAuth access token from "Continue with Cal.com" (30-minute
// lifetime, refreshed on 401 - Cal.com rotates the refresh token too) or a
// pasted personal API key (cal_/cal_live_). Config: access_token/refresh_token/
// client_id/client_secret (OAuth) or api_key, plus event_type_id, time_zone,
// and an optional attendee_email used when the caller doesn't give one.

interface CalcomConfig {
  api_key?: string;
  access_token?: string;
  refresh_token?: string;
  client_id?: string;
  client_secret?: string;
  event_type_id?: string | number;
  time_zone?: string;
  attendee_email?: string;
  username?: string;
}

const API = "https://api.cal.com/v2";

// Single-flight per refresh token: Cal.com ROTATES the refresh token on every
// refresh, so two concurrent refreshes with the same token aren't just wasteful
// - the loser's grant is dead. Concurrent callers share one exchange.
const inflightRefresh = new Map<string, Promise<string | null>>();

function refreshAccessToken(cfg: CalcomConfig): Promise<string | null> {
  const key = cfg.refresh_token;
  if (!key || !cfg.client_id || !cfg.client_secret) return Promise.resolve(null);
  const pending = inflightRefresh.get(key);
  if (pending) return pending;
  const exchange = doRefresh(cfg).finally(() => inflightRefresh.delete(key));
  inflightRefresh.set(key, exchange);
  return exchange;
}

async function doRefresh(cfg: CalcomConfig): Promise<string | null> {
  const res = await fetch(`${API}/auth/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: cfg.refresh_token,
      client_id: cfg.client_id,
      client_secret: cfg.client_secret,
    }),
  });
  if (!res.ok) return null;
  // Same defensive parse as the exchange: bare OAuth shape or { data } wrapped.
  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    data?: {
      access_token?: string;
      refresh_token?: string;
      accessToken?: string;
      refreshToken?: string;
    };
  };
  const token = json.access_token ?? json.data?.access_token ?? json.data?.accessToken ?? null;
  const rotated = json.refresh_token ?? json.data?.refresh_token ?? json.data?.refreshToken;
  if (token) {
    // Awaited, not fire-and-forget: the old refresh token is already dead after
    // rotation, so this write is the only durable copy of the new one.
    await persistAccessToken(
      cfg as Record<string, unknown>,
      token,
      typeof rotated === "string" && rotated && rotated !== cfg.refresh_token
        ? rotated
        : undefined,
    );
    // Keep this instance refreshable after rotation (persist located the row by
    // the old token, so only swap afterwards).
    if (typeof rotated === "string" && rotated) cfg.refresh_token = rotated;
  }
  return token;
}

export const createCalcom: CalendarFactory = (config): CalendarProvider => {
  const cfg = config as CalcomConfig;
  const bearer = () =>
    cachedAccessToken(cfg.refresh_token) ?? cfg.access_token ?? cfg.api_key ?? null;
  const canRefresh = Boolean(cfg.refresh_token && cfg.client_id && cfg.client_secret);

  const post = (token: string, req: BookingRequest) =>
    fetch(`${API}/bookings`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "cal-api-version": "2024-08-13",
      },
      // No `end`: v2 derives the duration from the event type, so req.endTime
      // is intentionally unused - Cal.com books the event type's length.
      body: JSON.stringify({
        eventTypeId: Number(cfg.event_type_id),
        start: req.startTime,
        attendee: {
          name: req.attendeeName ?? "Phone caller",
          email: cfg.attendee_email ?? "noreply@aireceptionistnow.com",
          timeZone: cfg.time_zone ?? "UTC",
          ...(req.attendeePhone ? { phoneNumber: req.attendeePhone } : {}),
        },
        ...(req.notes ? { bookingFieldsResponses: { notes: req.notes } } : {}),
      }),
    });

  return {
    async createEvent(req): Promise<BookingResult> {
      if (!cfg.event_type_id) return { ok: false, error: "cal.com not configured" };
      let token = bearer();
      let res = token ? await post(token, req) : null;
      if ((!res || res.status === 401) && canRefresh) {
        token = await refreshAccessToken(cfg);
        if (token) res = await post(token, req);
      }
      if (!res) return { ok: false, error: "cal.com not authorized" };
      if (!res.ok) return { ok: false, error: `cal.com ${res.status}` };
      const json = (await res.json()) as {
        data?: { id?: number; uid?: string };
        id?: number;
        uid?: string;
      };
      const uid = json.data?.uid ?? json.uid;
      const id = json.data?.id ?? json.id;
      return { ok: true, externalId: uid ?? (id ? String(id) : undefined) };
    },

    async getBusy(q): Promise<AvailabilityResult> {
      if (!cfg.event_type_id) {
        return { ok: false, busy: [], error: "cal.com not configured" };
      }
      // Cal.com exposes bookable slots, not busy times, so invert: everything in
      // the window outside a free slot is reported busy. That also folds the
      // user's Cal.com availability schedule (working hours) into free/busy,
      // which is what the receptionist should offer anyway. format=range gives
      // each slot an end; if only starts come back, slot length is inferred from
      // the smallest gap between consecutive slots (30-min fallback when a
      // single slot leaves no gap to measure). The endpoint is public - no auth.
      const params = new URLSearchParams({
        eventTypeId: String(cfg.event_type_id),
        start: q.timeMin,
        end: q.timeMax,
        format: "range",
      });
      const res = await fetch(`${API}/slots?${params.toString()}`, {
        headers: { "cal-api-version": "2024-09-04" },
      });
      if (!res.ok) return { ok: false, busy: [], error: `cal.com ${res.status}` };
      const json = (await res.json()) as {
        data?: Record<string, (string | { start?: string; end?: string })[]>;
      };
      const parsed = Object.values(json.data ?? {})
        .flat()
        .map((s) =>
          typeof s === "string"
            ? { start: Date.parse(s), end: NaN }
            : { start: Date.parse(s.start ?? ""), end: Date.parse(s.end ?? "") },
        )
        .filter((s) => Number.isFinite(s.start))
        .sort((a, b) => a.start - b.start);

      let step = Infinity;
      for (let i = 1; i < parsed.length; i++) {
        const gap = parsed[i].start - parsed[i - 1].start;
        if (gap > 0 && gap < step) step = gap;
      }
      if (!Number.isFinite(step)) step = 30 * 60 * 1000;
      // Merge contiguous slots into free windows, then emit the gaps as busy.
      const free: Array<[number, number]> = [];
      for (const s of parsed) {
        const end = Number.isFinite(s.end) ? s.end : s.start + step;
        const last = free[free.length - 1];
        if (last && s.start <= last[1]) last[1] = Math.max(last[1], end);
        else free.push([s.start, end]);
      }
      const busy: BusyInterval[] = [];
      let cursor = Date.parse(q.timeMin);
      for (const [s, e] of free) {
        if (s > cursor) {
          busy.push({ start: new Date(cursor).toISOString(), end: new Date(s).toISOString() });
        }
        cursor = Math.max(cursor, e);
      }
      const windowEnd = Date.parse(q.timeMax);
      if (cursor < windowEnd) {
        busy.push({ start: new Date(cursor).toISOString(), end: new Date(windowEnd).toISOString() });
      }
      return { ok: true, busy };
    },
  };
};
