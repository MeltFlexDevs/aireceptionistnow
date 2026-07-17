
export const INTEGRATION_TIMEOUT_MS = 6000;

// Booking writes get a longer budget: a create with a token refresh chains up
// to three provider round trips, and the ElevenLabs webhook tool allows 15s.
// Cutting the wait short doesn't cancel the underlying create - it just makes
// us report failure for an event that may still land (ghost double-booking).
export const BOOKING_TIMEOUT_MS = 13_000;

export function timedFetch(
  url: string,
  init?: RequestInit,
  ms: number = INTEGRATION_TIMEOUT_MS,
): Promise<Response> {
  return fetch(url, { ...init, signal: init?.signal ?? AbortSignal.timeout(ms) });
}

export function withDeadline<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}
