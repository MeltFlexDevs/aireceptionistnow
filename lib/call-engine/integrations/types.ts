import type { BookingRequest, BookingResult } from "../types";

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

export interface CancelResult {
  ok: boolean;
  error?: string;
}

// A real event read back from the provider's calendar - titles and all, unlike
// getBusy which only returns opaque busy windows. Drives the dashboard's
// "what's actually on my calendar" view.
export interface CalendarEvent {
  id: string; // provider-native event id (unique within its calendar)
  title: string;
  start: string; // ISO 8601 instant
  end: string; // ISO 8601 instant
  allDay: boolean;
  location?: string;
  url?: string; // link to open the event in the provider, when it gives one
}

export interface EventsResult {
  ok: boolean;
  events: CalendarEvent[];
  error?: string;
}

// Result of pinging the provider with the stored credentials. `ok` means the
// token actually works right now (not just that a row exists); `account` is the
// connected identity to show the user (email / username) when the provider
// hands one back.
export interface ConnectionCheck {
  ok: boolean;
  account?: string;
  error?: string;
}

export interface CalendarProvider {
  createEvent(req: BookingRequest): Promise<BookingResult>;
  getBusy?(query: AvailabilityQuery): Promise<AvailabilityResult>;
  cancelEvent?(externalId: string, reason?: string): Promise<CancelResult>;
  // Read real events (with titles) in a window, for the dashboard calendar.
  // Separate from getBusy: getBusy is optimized for the booking hot path and
  // returns only busy windows; this returns full event detail.
  listEvents?(query: AvailabilityQuery): Promise<EventsResult>;
  // Verify the stored credentials work and report the connected account. Used
  // by the dashboard to show a truthful "connected" state per calendar.
  checkConnection?(): Promise<ConnectionCheck>;
  // Prime the write-calendar OAuth token at call start. Providers whose
  // getBusy is unauthenticated (Cal.com) or absent (Outlook) never warm their
  // token through the availability prefetch, so the booking pays the
  // 401 -> refresh -> retry chain. Best-effort: resolves regardless of outcome.
  warmAuth?(): Promise<void>;
}

export type CalendarFactory = (
  config: Record<string, unknown>,
) => CalendarProvider;
