import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe";
import {
  claimEvent,
  releaseEvent,
  saveSubscription,
  getUserIdByCustomer,
} from "@/lib/billing";
import { getPlanByPriceId, type BillingCycle, type PlanId } from "@/lib/plans";

export const runtime = "nodejs";
// Stripe signature verification needs the raw, unparsed body.
export const dynamic = "force-dynamic";

/** Pull the Supabase user id off whatever Stripe object we have, preferring
 *  metadata and falling back to the customer→user mapping saved at checkout. */
async function resolveUserId(
  metadataUserId: string | undefined,
  customerId: string | null,
): Promise<string | null> {
  if (metadataUserId) return metadataUserId;
  if (customerId) return getUserIdByCustomer(customerId);
  return null;
}

function customerIdOf(value: string | { id: string } | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/** ISO timestamp for a Stripe unix seconds value, or null. */
function isoFrom(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

/** Persist the state of a Stripe subscription onto our billing row. */
async function applySubscription(sub: Stripe.Subscription): Promise<void> {
  const customerId = customerIdOf(sub.customer);
  const userId = await resolveUserId(
    sub.metadata?.supabase_user_id ?? undefined,
    customerId,
  );
  if (!userId || !customerId) {
    console.error(
      `[webhook] subscription ${sub.id} could not resolve user (customer=${customerId})`,
    );
    return;
  }

  const priceId = sub.items?.data?.[0]?.price?.id;
  const match = priceId ? getPlanByPriceId(priceId) : undefined;
  const active = sub.status === "active" || sub.status === "trialing";

  // Prefer the price→plan mapping; fall back to the metadata stamped at
  // checkout so a renamed/rotated price still resolves a plan.
  const plan: PlanId | null = active
    ? match?.plan.id ?? ((sub.metadata?.plan as PlanId) || null)
    : null;
  const cycle: BillingCycle | null = active
    ? match?.cycle ?? ((sub.metadata?.cycle as BillingCycle) || null)
    : null;

  const periodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    sub.items?.data?.[0]?.current_period_end ??
    null;

  await saveSubscription({
    userId,
    customerId,
    subscriptionId: sub.id,
    plan,
    cycle,
    status: sub.status,
    currentPeriodEnd: isoFrom(periodEnd),
  });
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = getStripe();
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    console.error(`[webhook] signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // Stripe retries until it gets a 2xx, and may deliver an event more than once.
  // Claim it so the state change is applied once. If handling then fails we
  // release the claim (below) so the retry can reprocess instead of being
  // swallowed as a duplicate.
  const fresh = await claimEvent(event.id).catch((err) => {
    console.error(`[webhook] claim failed: ${err}`);
    return null;
  });
  if (fresh === null) {
    return NextResponse.json({ error: "Claim failed." }, { status: 500 });
  }
  if (!fresh) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = customerIdOf(session.subscription);
        // Fetch the full subscription so plan/cycle/period are recorded the
        // same way as on every later update.
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await applySubscription(sub);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await applySubscription(event.data.object as Stripe.Subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = customerIdOf(sub.customer);
        const userId = await resolveUserId(
          sub.metadata?.supabase_user_id ?? undefined,
          customerId,
        );
        if (userId && customerId) {
          await saveSubscription({
            userId,
            customerId,
            subscriptionId: sub.id,
            plan: null,
            cycle: null,
            status: "canceled",
            currentPeriodEnd: null,
          });
        }
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Webhook handler error.";
    console.error(`[webhook] ${event.type} failed: ${message}`);
    // Release the claim so Stripe's retry reprocesses, then 500 so it does.
    await releaseEvent(event.id);
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }
}
