// One "get a number" run for an assistant: reserve a slot under the owner's
// lock (reserve_number_slot, 0015_number_reservation.sql), claim a pool
// number or buy one, store it, then free the slot. Used by the mobile number
// route and getAgentNumberAction. Before this, parallel runs both bought.
//
// The deps are injected so number-assign.test.ts runs without Supabase or
// Twilio; numberAssignDeps() loads the real ones.
import type { NumberSlot } from "./db";

export interface NumberAssignDeps {
  reserve(ownerId: string, assistantId: string, limit: number | null): Promise<NumberSlot>;
  release(assistantId: string): Promise<void>;
  claimFree(assistantId: string, country?: string): Promise<{ id: string; e164: string } | null>;
  buy(country: string): Promise<{ e164: string; sid: string }>;
  store(row: { e164: string; twilioSid: string; assistantId: string }): Promise<string>;
  releaseTwilio(sid: string): Promise<void>;
}

export type AssignResult =
  | { status: "ok"; numberId: string; e164: string }
  | { status: Exclude<NumberSlot, "ok"> };

export async function assignNumber(
  input: { ownerId?: string | null; assistantId: string; country: string; limit: number | null },
  deps: NumberAssignDeps,
): Promise<AssignResult> {
  const { ownerId, assistantId, country } = input;
  // No owner only in dev (auth off). Skip the slot; the unique index
  // phone_numbers_one_active_per_assistant still guards the row.
  if (ownerId) {
    const slot = await deps.reserve(ownerId, assistantId, input.limit);
    if (slot !== "ok") return { status: slot };
  }
  try {
    // Prefer a pool number for the chosen country, then any pool number, and
    // only then buy - a purchase is the one step here that costs money.
    const claimed =
      (await deps.claimFree(assistantId, country)) ?? (await deps.claimFree(assistantId));
    if (claimed) return { status: "ok", numberId: claimed.id, e164: claimed.e164 };

    const bought = await deps.buy(country);
    try {
      const numberId = await deps.store({ e164: bought.e164, twilioSid: bought.sid, assistantId });
      return { status: "ok", numberId, e164: bought.e164 };
    } catch (storeErr) {
      // Bought but not stored: give the number back so it costs nothing.
      try {
        await deps.releaseTwilio(bought.sid);
        console.error("[numbers] released unused number", bought.sid);
      } catch (releaseErr) {
        console.error(
          "[numbers] could not release unused number - release it in Twilio",
          bought.sid,
          releaseErr,
        );
      }
      throw storeErr;
    }
  } finally {
    if (ownerId) {
      await deps
        .release(assistantId)
        .catch((e) => console.error("[numbers] release slot failed", e));
    }
  }
}

/** The real deps. Loaded here, not at module top, so the node test can import
 * assignNumber without Supabase, Twilio or next/cache. */
export async function numberAssignDeps(): Promise<NumberAssignDeps> {
  const data = await import("./db");
  const twilio = await import("./twilio");
  return {
    reserve: data.reserveNumberSlot,
    release: data.releaseNumberSlot,
    claimFree: async (assistantId, country) =>
      (await data.claimFreeNumber(assistantId, country)) ?? null,
    buy: (country) => twilio.buyTwilioNumber({ country }, { configureWebhook: false }),
    store: (row) => data.createNumber(row),
    releaseTwilio: twilio.releaseTwilioNumber,
  };
}
