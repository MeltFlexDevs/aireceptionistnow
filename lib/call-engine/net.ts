
export const INTEGRATION_TIMEOUT_MS = 6000;

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
