import type { BookingRequest, BookingResult } from "../types";

// Provider-agnostic calendar boundary. The caller brings their own calendar;
// each concrete adapter (google, calcom, webhook…) implements these methods,
// and the registry picks the right one from the integration's `provider`.
//
// `createEvent` is the write path (booking). `getBusy` is the read path used for
// availability — it returns only busy intervals, never event details, so the
// assistant can compute free times to offer without ever revealing what is on
// the calendar. `getBusy` is optional: an adapter that can't read availability
// simply omits it, and the assistant degrades to taking a message.

/** A busy time window (ISO 8601). No title/attendee — read access is for
 *  availability only, so details never leave the adapter. */
export interface BusyInterval {
  start: string;
  end: string;
}

export interface AvailabilityQuery {
  timeMin: string; // ISO 8601
  timeMax: string; // ISO 8601
}

export interface AvailabilityResult {
  ok: boolean;
  busy: BusyInterval[];
  error?: string;
}

export interface CalendarProvider {
  createEvent(req: BookingRequest): Promise<BookingResult>;
  /** Read busy intervals in a window. Omitted when the provider can't read. */
  getBusy?(query: AvailabilityQuery): Promise<AvailabilityResult>;
}

export type CalendarFactory = (
  config: Record<string, unknown>,
) => CalendarProvider;
