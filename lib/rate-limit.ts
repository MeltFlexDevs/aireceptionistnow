// Best-effort, per-instance fixed-window limiter - enough to blunt cost abuse
// without extra infra. State lives in this module, so it resets on a cold
// start and is not shared across serverless instances.

export interface WindowLimiterOptions {
  windowMs: number;
  maxRequests: number;
  /** Cap on the summed `chars` a key may spend per window. */
  maxChars: number;
}

export interface WindowLimiter {
  /** Records one request of `chars` for `key`; false once the key is over either cap. */
  allow(key: string, chars: number): boolean;
}

export function createWindowLimiter({
  windowMs,
  maxRequests,
  maxChars,
}: WindowLimiterOptions): WindowLimiter {
  const usage = new Map<string, { start: number; requests: number; chars: number }>();
  return {
    allow(key, chars) {
      const now = Date.now();
      if (usage.size > 5000) {
        for (const [k, u] of usage) if (now - u.start > windowMs) usage.delete(k);
      }
      const u = usage.get(key);
      if (!u || now - u.start > windowMs) {
        usage.set(key, { start: now, requests: 1, chars });
        return true;
      }
      u.requests += 1;
      u.chars += chars;
      return u.requests <= maxRequests && u.chars <= maxChars;
    },
  };
}

/**
 * The translation model's budget, shared by /api/translate (web cookie) and
 * /api/mobile/translate (app bearer). Both key by the Supabase user id, so one
 * user's web and app traffic draw on the same allowance.
 */
export const translateLimiter = createWindowLimiter({
  windowMs: 60_000,
  maxRequests: 30,
  maxChars: 150_000,
});
