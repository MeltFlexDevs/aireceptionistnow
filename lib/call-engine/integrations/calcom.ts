import type { BookingRequest, BookingResult } from "../types";
import { timedFetch } from "../net";
import { cachedAccessToken, persistAccessToken } from "./token-store";
import type {
  AvailabilityResult,
  BusyInterval,
  CalendarFactory,
  CalendarProvider,
  CancelResult,
} from "./types";

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
  const res = await timedFetch(`${API}/auth/oauth2/token`, {
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
    expires_in?: number;
    data?: {
      access_token?: string;
      refresh_token?: string;
      accessToken?: string;
      refreshToken?: string;
      expires_in?: number;
    };
  };
  const token = json.access_token ?? json.data?.access_token ?? json.data?.accessToken ?? null;
  const rotated = json.refresh_token ?? json.data?.refresh_token ?? json.data?.refreshToken;
  if (token) {
    const rotatedNew =
      typeof rotated === "string" && rotated && rotated !== cfg.refresh_token
        ? rotated
        : undefined;
    const persist = persistAccessToken(
      cfg as Record<string, unknown>,
      token,
      rotatedNew,
      json.expires_in ?? json.data?.expires_in,
    );
    // Cal.com rotates refresh tokens: losing the write-back would brick the
    // integration, so a rotation must be durable before we continue. A plain
    // re-issued access token is best-effort.
    if (rotatedNew) await persist;
    else void persist;
    if (typeof rotated === "string" && rotated) cfg.refresh_token = rotated;
  }
  return token;
}

async function failure(res: Response): Promise<string> {
  let detail = "";
  try {
    const text = (await res.text()).trim();
    try {
      const json = JSON.parse(text) as {
        error?: { message?: string; code?: string; details?: unknown };
        message?: string;
      };
      detail =
        json.error?.message ??
        json.message ??
        (json.error?.code ? String(json.error.code) : "") ??
        "";
      if (!detail && json.error?.details) detail = JSON.stringify(json.error.details);
    } catch {
      detail = text; // not JSON - keep the raw body
    }
  } catch {
    // body already consumed / unreadable - status alone is all we have
  }
  return `cal.com ${res.status}${detail ? `: ${detail.slice(0, 300)}` : ""}`;
}

export const createCalcom: CalendarFactory = (config): CalendarProvider => {
  const cfg = config as CalcomConfig;
  const bearer = () =>
    cachedAccessToken(cfg.refresh_token) ?? cfg.access_token ?? cfg.api_key ?? null;
  const canRefresh = Boolean(cfg.refresh_token && cfg.client_id && cfg.client_secret);

  const post = (token: string, req: BookingRequest, withNotes = true) =>
    timedFetch(`${API}/bookings`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "cal-api-version": "2024-08-13",
      },
      body: JSON.stringify({
        eventTypeId: Number(cfg.event_type_id),
        start: req.startTime,
        attendee: {
          name: req.attendeeName ?? "Phone caller",
          // cal.com verifies the mailbox actually receives mail, so the
          // fallback must be a real inbox: the operator's configured one, then
          // a deployment-wide env override. The noreply@ last resort only works
          // while cal.com's verification lets it through.
          email:
            cfg.attendee_email ??
            process.env.CALCOM_ATTENDEE_EMAIL ??
            "noreply@aireceptionistnow.com",
          timeZone: cfg.time_zone ?? "UTC",
          ...(req.attendeePhone ? { phoneNumber: req.attendeePhone } : {}),
        },
        ...(withNotes && req.notes
          ? {
              bookingFieldsResponses: { notes: req.notes },
              metadata: { notes: req.notes.slice(0, 500) },
            }
          : {}),
      }),
    });

  const isBookingFieldRejection = (status: number, body: string): boolean =>
    status === 400 && /booking ?fields?|notes/i.test(body);

  // Deliberately no warmAuth here. Cal.com's getBusy is unauthenticated so its
  // write token is cold at booking time, but Cal.com hard-invalidates the old
  // refresh token on every rotation. Warming at call start would move the
  // refresh from book time to every call, widening the cross-instance rotation
  // race that can brick the integration - a booking-breaking risk traded for a
  // one-time ~400ms refresh. Not worth it until the token store tolerates
  // rotation grace. (Outlook keeps warmAuth: Microsoft allows a rotation grace
  // window and it is Outlook's only warm path.)
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

      if (!res.ok && req.notes) {
        const body = await res.clone().text().catch(() => "");
        if (isBookingFieldRejection(res.status, body) && token) {
          console.warn(
            `[calcom] booking rejected with notes (${body.slice(0, 160)}) - retrying without them. ` +
              `Add a custom booking field with slug "notes" to this event type to keep the caller's reason on the booking.`,
          );
          res = await post(token, req, false);
        }
      }

      if (!res.ok) {
        const msg = await failure(res);
        // Make the fix obvious in the dashboard when cal.com rejects the
        // attendee mailbox (it verifies deliverability since 2026).
        const hint =
          res.status === 400 && /email/i.test(msg)
            ? "attendee email rejected - reconnect Cal.com or set CALCOM_ATTENDEE_EMAIL to a real inbox. "
            : "";
        return { ok: false, error: hint + msg };
      }
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
      const params = new URLSearchParams({
        eventTypeId: String(cfg.event_type_id),
        start: q.timeMin,
        end: q.timeMax,
        format: "range",
      });
      const res = await timedFetch(`${API}/slots?${params.toString()}`, {
        headers: { "cal-api-version": "2024-09-04" },
      });
      if (!res.ok) return { ok: false, busy: [], error: await failure(res) };
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

    async cancelEvent(externalId, reason): Promise<CancelResult> {
      if (!externalId) return { ok: false, error: "no cal.com booking id" };
      const cancel = (token: string) =>
        timedFetch(`${API}/bookings/${encodeURIComponent(externalId)}/cancel`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
            "content-type": "application/json",
            "cal-api-version": "2024-08-13",
          },
          body: JSON.stringify(reason ? { cancellationReason: reason.slice(0, 500) } : {}),
        });

      let token = bearer();
      let res = token ? await cancel(token) : null;
      if ((!res || res.status === 401) && canRefresh) {
        token = await refreshAccessToken(cfg);
        if (token) res = await cancel(token);
      }
      if (!res) return { ok: false, error: "cal.com not authorized" };
      if (res.status === 404) return { ok: true };
      if (!res.ok) return { ok: false, error: await failure(res) };
      return { ok: true };
    },
  };
};
