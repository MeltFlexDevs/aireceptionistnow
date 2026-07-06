import type { BookingRequest, BookingResult } from "../types";
import type {
  AvailabilityResult,
  BusyInterval,
  CalendarFactory,
  CalendarProvider,
} from "./types";

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

    async getBusy(q): Promise<AvailabilityResult> {
      if (!cfg.api_key || !cfg.event_type_id) {
        return { ok: false, busy: [], error: "cal.com not configured" };
      }
      // v1 exposes bookable slots (GET /v1/slots), not busy times, so invert:
      // everything in the window outside a free slot is reported busy. Slot
      // length is inferred from the smallest gap between consecutive slots.
      // ponytail: 30-min fallback when only one slot comes back - read the
      // event type's length via /v1/event-types/{id} if that ever misleads.
      const params = new URLSearchParams({
        apiKey: cfg.api_key,
        eventTypeId: String(cfg.event_type_id),
        startTime: q.timeMin,
        endTime: q.timeMax,
      });
      const res = await fetch(`https://api.cal.com/v1/slots?${params.toString()}`);
      if (!res.ok) return { ok: false, busy: [], error: `cal.com ${res.status}` };
      const json = (await res.json()) as {
        slots?: Record<string, { time?: string }[]>;
      };
      const starts = Object.values(json.slots ?? {})
        .flat()
        .map((s) => Date.parse(s.time ?? ""))
        .filter((t) => Number.isFinite(t))
        .sort((a, b) => a - b);

      // Slot length = the smallest gap between consecutive slot starts (hourly
      // slots ⇒ 60m, not the old 30m floor that truncated every free hour and
      // emitted phantom busy stripes). Fall back to 30m only when a single slot
      // comes back so there's no gap to measure.
      let step = Infinity;
      for (let i = 1; i < starts.length; i++) {
        const gap = starts[i] - starts[i - 1];
        if (gap > 0 && gap < step) step = gap;
      }
      if (!Number.isFinite(step)) step = 30 * 60 * 1000;
      // Merge contiguous slots into free windows, then emit the gaps as busy.
      const free: Array<[number, number]> = [];
      for (const t of starts) {
        const last = free[free.length - 1];
        if (last && t <= last[1]) last[1] = Math.max(last[1], t + step);
        else free.push([t, t + step]);
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
