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

export interface CalendarProvider {
  createEvent(req: BookingRequest): Promise<BookingResult>;
  getBusy?(query: AvailabilityQuery): Promise<AvailabilityResult>;
  cancelEvent?(externalId: string, reason?: string): Promise<CancelResult>;
}

export type CalendarFactory = (
  config: Record<string, unknown>,
) => CalendarProvider;
