import type { BookingRequest, BookingResult } from "../types";

// Provider-agnostic calendar boundary. The caller brings their own calendar;
// each concrete adapter (google, calcom, webhook…) implements this one method,
// and the registry picks the right one from the integration's `provider`.

export interface CalendarProvider {
  createEvent(req: BookingRequest): Promise<BookingResult>;
}

export type CalendarFactory = (
  config: Record<string, unknown>,
) => CalendarProvider;
