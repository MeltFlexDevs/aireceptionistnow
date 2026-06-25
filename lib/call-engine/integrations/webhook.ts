import type { BookingRequest, BookingResult } from "../types";
import type { CalendarFactory, CalendarProvider } from "./types";

// Generic "bring your own" adapter: POST the booking to a URL the user supplies.
// This is the broad-compatibility path — point it at Zapier, Make, n8n, or a
// custom endpoint and any calendar can be driven from there. Used as the
// fallback for providers without a dedicated adapter.

interface WebhookConfig {
  url?: string;
  secret?: string;
}

export const createWebhookCalendar: CalendarFactory = (config): CalendarProvider => {
  const cfg = config as WebhookConfig;

  return {
    async createEvent(req): Promise<BookingResult> {
      if (!cfg.url) return { ok: false, error: "no webhook url configured" };
      const res = await fetch(cfg.url, {
        method: "POST",
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
  };
};
