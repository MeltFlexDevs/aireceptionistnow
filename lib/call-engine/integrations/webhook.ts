import { isSafeHttpsUrl } from "../../net/safe-url";
import { timedFetch } from "../net";
import type { BookingRequest, BookingResult } from "../types";
import type {
  AvailabilityResult,
  BusyInterval,
  CalendarFactory,
  CalendarProvider,
  CancelResult,
} from "./types";

interface WebhookConfig {
  url?: string;
  secret?: string;
}

export const createWebhookCalendar: CalendarFactory = (config): CalendarProvider => {
  const cfg = config as WebhookConfig;

  return {
    async createEvent(req): Promise<BookingResult> {
      if (!cfg.url) return { ok: false, error: "no webhook url configured" };
      if (!isSafeHttpsUrl(cfg.url)) return { ok: false, error: "webhook url not allowed" };
      const res = await timedFetch(cfg.url, {
        method: "POST",
        redirect: "manual", // don't follow a 3xx into an internal host (SSRF)
        headers: {
          "content-type": "application/json",
          ...(cfg.secret ? { "x-webhook-secret": cfg.secret } : {}),
        },
        body: JSON.stringify({
          type: "booking",
          title: req.title,
          start: req.startTime,
          end: req.endTime,
          calendarId: req.calendarId,
          attendeeName: req.attendeeName,
          attendeePhone: req.attendeePhone,
          notes: req.notes,
        }),
      });
      if (!res.ok) return { ok: false, error: `webhook ${res.status}` };
      let externalId: string | undefined;
      try {
        const json = (await res.json()) as { id?: string; external_id?: string };
        externalId = json.id ?? json.external_id;
      } catch {
        // non-JSON 2xx is still a success
      }
      return { ok: true, externalId };
    },

    async cancelEvent(externalId, reason): Promise<CancelResult> {
      if (!cfg.url) return { ok: false, error: "no webhook url configured" };
      if (!isSafeHttpsUrl(cfg.url)) return { ok: false, error: "webhook url not allowed" };
      const res = await timedFetch(cfg.url, {
        method: "POST",
        redirect: "manual",
        headers: {
          "content-type": "application/json",
          ...(cfg.secret ? { "x-webhook-secret": cfg.secret } : {}),
        },
        body: JSON.stringify({ type: "cancellation", externalId, reason }),
      });
      if (!res.ok) return { ok: false, error: `webhook ${res.status}` };
      return { ok: true };
    },

    async getBusy(query): Promise<AvailabilityResult> {
      if (!cfg.url) return { ok: false, busy: [], error: "no webhook url configured" };
      if (!isSafeHttpsUrl(cfg.url)) return { ok: false, busy: [], error: "webhook url not allowed" };
      const res = await timedFetch(cfg.url, {
        method: "POST",
        redirect: "manual", // don't follow a 3xx into an internal host (SSRF)
        headers: {
          "content-type": "application/json",
          ...(cfg.secret ? { "x-webhook-secret": cfg.secret } : {}),
        },
        body: JSON.stringify({
          type: "freebusy",
          timeMin: query.timeMin,
          timeMax: query.timeMax,
        }),
      });
      if (!res.ok) return { ok: false, busy: [], error: `webhook ${res.status}` };
      try {
        const json = (await res.json()) as { busy?: BusyInterval[] };
        return { ok: true, busy: json.busy ?? [] };
      } catch {
        return { ok: true, busy: [] };
      }
    },
  };
};
