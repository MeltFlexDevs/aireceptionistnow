import { NUMBER_COUNTRIES, splitPhone } from "@/lib/number-pricing";

/**
 * Limits for the owner's "call me" test call (mobile route and dashboard
 * action). `assertUnderCallCaps` only counts the shared demo agent, so without
 * this a free account could place unlimited calls on its own agent.
 *
 * Pure parts only (country check, caps, messages, the reserve/release flow
 * over a store). The SQL side is reserve_test_call (0017_test_calls.sql),
 * which makes the count and the insert one step under a lock.
 */

/** Test calls per owner in any rolling 24 hours. */
export const TEST_CALLS_FREE_PER_OWNER = 3;
export const TEST_CALLS_PAID_PER_OWNER = 20;
/** All free accounts together, when TEST_CALLS_FREE_DAILY_CAP is unset or invalid. */
export const TEST_CALLS_FREE_SHARED_DEFAULT = 50;

/** NANP area codes outside the US and Canada (Caribbean, premium): toll-fraud routes. */
export const BLOCKED_NANP_AREA_CODES: ReadonlySet<string> = new Set([
  "242", "246", "264", "268", "284", "345", "441", "473", "649", "658", "664",
  "721", "758", "767", "784", "809", "829", "849", "868", "869", "876", "900",
]);

export function freeSharedCap(raw: string | undefined = process.env.TEST_CALLS_FREE_DAILY_CAP): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : TEST_CALLS_FREE_SHARED_DEFAULT;
}

/**
 * The served country (ISO code) of an E.164 number, or null when we do not
 * serve it. +1 resolves to "US" (Canada shares the prefix); NANP area codes
 * outside the US and Canada are refused.
 */
export function testCallCountry(e164: string): string | null {
  if (/^\+1/.test(e164) && BLOCKED_NANP_AREA_CODES.has(e164.slice(2, 5))) return null;
  const { code } = splitPhone(e164, "");
  return code || null;
}

/** True for an upper-case 2-letter code we serve and price (NUMBER_COUNTRIES). */
export function isServedCountry(code: string): boolean {
  return NUMBER_COUNTRIES.some((c) => c.code === code);
}

export type TestCallRefusal = "owner_limit" | "free_limit";

export const TEST_CALL_COUNTRY_MESSAGE =
  "Test calls can go only to numbers in the countries we serve.";

/** English text for the mobile route; the dashboard maps the same reasons to dictionary keys. */
export function testCallRefusalMessage(reason: TestCallRefusal, free: boolean): string {
  if (reason === "free_limit") {
    return "Free test calls are busy today. Pick a plan to call now, or try again tomorrow.";
  }
  return free
    ? `You have used your ${TEST_CALLS_FREE_PER_OWNER} free test calls for today. Pick a plan for more, or try again tomorrow.`
    : `You have used today's ${TEST_CALLS_PAID_PER_OWNER} test calls. Try again tomorrow.`;
}

export interface TestCallReservation {
  owner: string;
  assistant: string;
  free: boolean;
  country: string;
}

/** Reply of reserve_test_call: the new row id, or the reason it refused. */
export type ReserveReply = { id: string } | { refused: TestCallRefusal };

export interface TestCallStore {
  reserve(input: TestCallReservation & { ownerCap: number; freeCap: number }): Promise<ReserveReply>;
  release(id: string): Promise<void>;
}

export type TestCallSlot =
  | { ok: true; release: () => Promise<void> }
  | { ok: false; reason: TestCallRefusal };

/**
 * Takes one test-call slot. The caller must `release()` it when the call is
 * not placed (a failed placement does not count). A store error propagates, so
 * the caller fails closed.
 */
export async function reserveTestCall(
  store: TestCallStore,
  input: TestCallReservation,
  freeCap: number = freeSharedCap(),
): Promise<TestCallSlot> {
  const reply = await store.reserve({
    ...input,
    ownerCap: input.free ? TEST_CALLS_FREE_PER_OWNER : TEST_CALLS_PAID_PER_OWNER,
    freeCap,
  });
  if ("refused" in reply) return { ok: false, reason: reply.refused };
  let released = false;
  return {
    ok: true,
    release: async () => {
      if (released) return;
      released = true;
      await store.release(reply.id);
    },
  };
}
