import type { BookingRequest, BookingResult } from "../types";
import type { CalendarFactory, CalendarProvider } from "./types";

// Cal.com adapter (API v1). Config: api_key, event_type_id, time_zone, and an
// optional attendee_email used when the caller doesn't give one.

interface CalcomConfig {
  api_key?: string;
  event_type_id?: string | number;
  time_zone?: string;
  attendee_email?: string;
}

export const createCalcom: CalendarFactory = (config): CalendarProvider => {
  const cfg = config as CalcomConfig;

  return {
    async createEvent(req): Promise<BookingResult> {
      if (!cfg.api_key || !cfg.event_type_id) {
        return { ok: false, error: "cal.com not configured" };
      }
      const res = await fetch(
        `https://api.cal.com/v1/bookings?apiKey=${encodeURIComponent(cfg.api_key)}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            eventTypeId: Number(cfg.event_type_id),
            start: req.startTime,
            end: req.endTime,
            timeZone: cfg.time_zone ?? "UTC",
            language: "en",
            metadata: {},
            responses: {
              name: req.attendeeName ?? "Phone caller",
              email: cfg.attendee_email ?? "noreply@aireceptionistnow.com",
              location: { value: "phone", optionValue: req.attendeePhone ?? "" },
              notes: req.notes ?? "",
            },
          }),
        },
      );
      if (!res.ok) return { ok: false, error: `cal.com ${res.status}` };
      const json = (await res.json()) as { id?: number; uid?: string };
      return { ok: true, externalId: json.uid ?? (json.id ? String(json.id) : undefined) };
    },
  };
};
