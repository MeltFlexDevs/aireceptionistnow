import { createHash, timingSafeEqual } from "node:crypto";

import {
  OtherAccountError,
  StripeActiveError,
  claimBillingEvent,
  claimConflictResponse,
  markBillingEventProcessed,
  releaseBillingEvent,
  userExists,
} from "@/lib/billing";
import { applyStoreUpdate } from "@/lib/store-billing/entitle";
import { entitlementUpdate, fetchSubscriber } from "@/lib/store-billing/revenuecat";
import { canceledUpdate } from "@/lib/store-billing/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * RevenueCat webhook - Google Play renewals, cancellations, billing issues,
 * expirations, pauses and account transfers.
 *
 * Authenticated by the `Authorization` header RevenueCat is configured to
 * send, compared in constant time. The event payload is used only to find the
 * user and the event kind: the entitlement itself is always re-read from the
 * RevenueCat API and mapped by the same function as /api/mobile/billing/google/sync,
 * so a webhook and a sync can never disagree, and a stale delivery cannot
 * write stale data. App Store events (RevenueCat also sees iOS when the app
 * runs both) are ignored: Apple's own notifications own that provider.
 *
 * RevenueCat retries on non-2xx, so anything not worth retrying answers 200.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RcEvent {
  id?: unknown;
  type?: unknown;
  store?: unknown;
  app_user_id?: unknown;
  original_app_user_id?: unknown;
  aliases?: unknown;
  transferred_from?: unknown;
  transferred_to?: unknown;
}

const json = (body: Record<string, unknown>, status: number) => Response.json(body, { status });

function authorized(header: string | null): boolean {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH ?? "";
  if (!expected) {
    console.error("[rc] REVENUECAT_WEBHOOK_AUTH is not set.");
    return false;
  }
  if (!header) return false;
  // Digests equalise the lengths so the comparison leaks nothing about either.
  const a = createHash("sha256").update(header).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/** The ids in `candidates` that are UUIDs of accounts that exist, in order. */
async function existingUsers(candidates: string[]): Promise<string[]> {
  const found: string[] = [];
  for (const raw of candidates) {
    const id = raw.toLowerCase();
    if (!UUID_RE.test(id) || found.includes(id)) continue;
    if (await userExists(id)) found.push(id);
  }
  return found;
}

/** Re-read the subscriber and record what it is entitled to (nothing -> canceled). */
async function syncSubscriber(userId: string): Promise<void> {
  const subscriber = await fetchSubscriber(userId);
  const update = (subscriber && entitlementUpdate(subscriber, new Date())) ?? canceledUpdate();
  await write(userId, update);
}

async function write(userId: string, update: ReturnType<typeof canceledUpdate>): Promise<void> {
  try {
    await applyStoreUpdate(userId, "google", userId, update);
  } catch (err) {
    // Not retryable: Stripe still bills the account (needs a manual refund),
    // or the store subscription is bound to another account.
    if (err instanceof StripeActiveError) {
      console.error(`[rc] user ${userId} ignored: live Stripe subscription`);
      return;
    }
    if (err instanceof OtherAccountError) {
      console.error(`[rc] user ${userId} ignored: subscription bound to another account`);
      return;
    }
    throw err;
  }
}

export async function POST(req: Request): Promise<Response> {
  if (!authorized(req.headers.get("authorization"))) {
    return json({ error: "Unauthorized." }, 401);
  }

  let event: RcEvent;
  try {
    const body = (await req.json()) as { event?: RcEvent };
    event = body?.event ?? {};
  } catch {
    return json({ error: "Bad request." }, 400);
  }
  const id = typeof event.id === "string" ? event.id : "";
  const type = typeof event.type === "string" ? event.type : "";
  if (!id || !type) return json({ error: "Bad request." }, 400);

  if (event.store !== "PLAY_STORE") return Response.json({ received: true, ignored: true });

  const claim = await claimBillingEvent("rc", id).catch((err) => {
    console.error(`[rc] claim failed: ${err}`);
    return null;
  });
  if (claim === null) return json({ error: "Claim failed." }, 500);
  // Processed: 200 duplicate. Busy (another run holds the claim): 409, so RevenueCat retries later.
  const early = claimConflictResponse(claim);
  if (early) return early;

  // A 2xx means the delivery is handled: mark the claim processed so a later
  // retry of the same id is skipped (0014). A failure releases it below.
  const done = async (body: Record<string, unknown>) => {
    await markBillingEventProcessed("rc", id);
    return Response.json(body);
  };

  try {
    if (type === "TRANSFER") {
      // The subscription moved between RevenueCat app user ids: the old
      // accounts lose it, the new one is read back from RevenueCat.
      for (const userId of await existingUsers(strings(event.transferred_from))) {
        await write(userId, canceledUpdate());
      }
      for (const userId of await existingUsers(strings(event.transferred_to))) {
        await syncSubscriber(userId);
      }
      return done({ received: true });
    }

    const candidates = [
      ...(typeof event.app_user_id === "string" ? [event.app_user_id] : []),
      ...strings(event.aliases),
      ...(typeof event.original_app_user_id === "string" ? [event.original_app_user_id] : []),
    ];
    const [userId] = await existingUsers(candidates);
    if (!userId) {
      console.error(`[rc] ${type} ${id}: no account among app user ids`);
      return done({ received: true, unknown: true });
    }
    await syncSubscriber(userId);
    return done({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Handler error.";
    console.error(`[rc] ${type} ${id} failed: ${message}`);
    await releaseBillingEvent("rc", id);
    return json({ error: "Handler error." }, 500);
  }
}
