import type { BillingCycle } from "./plans";

// The Terms tick on /pricing must survive the sign-up round trip, but a link
// must not be able to fake it. So it lives in this tab's sessionStorage, not
// in the URL.
export const TERMS_TICK_KEY = "arn:terms-accepted";
export const TERMS_TICK_MAX_AGE_MS = 30 * 60 * 1000;

export function encodeTermsTick(plan: string, cycle: BillingCycle, now: number): string {
  return JSON.stringify({ plan, cycle, at: now });
}

// True only for a recent tick stored for this exact plan and cycle.
export function shouldResumeCheckout(raw: string | null, plan: string, cycle: BillingCycle, now: number): boolean {
  if (!raw) return false;
  let tick: unknown;
  try {
    tick = JSON.parse(raw);
  } catch {
    return false;
  }
  if (!tick || typeof tick !== "object") return false;
  const { plan: p, cycle: c, at } = tick as Record<string, unknown>;
  if (p !== plan || c !== cycle || typeof at !== "number") return false;
  const age = now - at;
  return age >= 0 && age <= TERMS_TICK_MAX_AGE_MS;
}

// sessionStorage can throw (private mode, storage disabled): never let that
// break the pricing page.
export function rememberTermsTick(plan: string, cycle: BillingCycle): void {
  try {
    window.sessionStorage.setItem(TERMS_TICK_KEY, encodeTermsTick(plan, cycle, Date.now()));
  } catch { /* storage unavailable */ }
}

// Reads the tick once and clears it, so it cannot resume twice.
export function takeTermsTick(): string | null {
  try {
    const raw = window.sessionStorage.getItem(TERMS_TICK_KEY);
    window.sessionStorage.removeItem(TERMS_TICK_KEY);
    return raw;
  } catch {
    return null;
  }
}
