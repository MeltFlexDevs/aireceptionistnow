import { NextResponse } from "next/server";
import { after } from "next/server";
import { revalidateTag } from "next/cache";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe";
import { planCacheTag } from "@/lib/dashboard/plan";
import { provisionOnboarding } from "@/lib/dashboard/provision";
import {
  BillingRpcError,
  StoreActiveError,
  claimConflictResponse,
  claimEvent,
  markStripeEventProcessed,
  releaseEvent,
  saveSubscription,
  getUserIdByCustomer,
} from "@/lib/billing";
import {
  cancelsAtPeriodEnd,
  grantsPlanStatus,
  periodEndOf,
  planFromSubscription,
  siblingToFollow,
} from "@/lib/stripe-subscription";

export const runtime = "nodejs";
// Stripe signature verification needs the raw, unparsed body.
export const dynamic = "force-dynamic";

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

function isoFrom(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

// Writes the row and expires the dashboard's cached plan so the new state is
// visible on the next read. Two outcomes are terminal, not retryable, so they
// log (the subscription id, never the email) and return normally - the route
// answers 200 and Stripe stops retrying:
//   (a) the account is billed by the App Store / Google Play: set_subscription
//       refuses to overwrite that row (it would lose the store ref and
//       double-bill), so the Stripe subscription needs a manual refund;
//   (b) the account no longer exists (deleted after the subscription was
//       cancelled): the SQL function is already a no-op, and a foreign key
//       violation (23503) is caught here as the second line of defence.
async function persistSubscription(
  params: Parameters<typeof saveSubscription>[0],
): Promise<void> {
  try {
    await saveSubscription(params);
  } catch (err) {
    if (err instanceof StoreActiveError) {
      console.error(
        `[webhook] stripe subscription ${params.subscriptionId} ignored: user has an active App Store / Google Play subscription`,
      );
      return;
    }
    if (err instanceof BillingRpcError && err.code === "23503") {
      console.error(
        `[webhook] stripe subscription ${params.subscriptionId} ignored: user no longer exists`,
      );
      return;
    }
    throw err;
  }
  revalidateTag(planCacheTag(params.userId), { expire: 0 });
}

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

  const { plan, cycle } = planFromSubscription(sub);

  const periodEnd = periodEndOf(sub);

  await persistSubscription({
    userId,
    customerId,
    subscriptionId: sub.id,
    plan,
    cycle,
    status: sub.status,
    currentPeriodEnd: isoFrom(periodEnd),
    cancelAtPeriodEnd: cancelsAtPeriodEnd(sub, periodEnd),
  });
}

// Call after the write of a subscription that grants no plan: deleted, updated
// to a status that is not live, or one Stripe still collects for (past_due,
// unpaid, incomplete). set_subscription ignores the events of another
// subscription while the stored one is live (0013), so a second live
// subscription of the customer may have been dropped, and Stripe sends nothing
// new for it until it renews. An ended write made the row not live, so any
// live sibling's write now goes through. A stored one that Stripe still
// collects for gives way only to a sibling that grants a plan
// (siblingToFollow). A Stripe error throws: the route answers 500 and Stripe
// retries the event.
async function applyLiveSibling(from: Stripe.Subscription): Promise<void> {
  const customerId = customerIdOf(from.customer);
  if (!customerId) return;
  // No status filter: Stripe returns every subscription that is not canceled.
  const { data } = await getStripe().subscriptions.list({
    customer: customerId,
    limit: 100,
  });
  const live = siblingToFollow(data, from);
  if (!live) return;
  console.log(
    `[webhook] subscription ${from.id} is ${from.status}: following subscription ${live.id}`,
  );
  await applySubscription(live);
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

  const claim = await claimEvent(event.id).catch((err) => {
    console.error(`[webhook] claim failed: ${err}`);
    return null;
  });
  if (claim === null) {
    return NextResponse.json({ error: "Claim failed." }, { status: 500 });
  }
  // Processed: 200 duplicate. Busy (another run holds the claim): 409, so Stripe retries later.
  const early = claimConflictResponse(claim);
  if (early) return early;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = customerIdOf(session.subscription);
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await applySubscription(sub);
        }
        // Onboarding purchase: kick off background provisioning after the
        // response so the webhook stays fast. Errors land in the onboarding
        // profile (status=error) and never trigger Stripe retries; the
        // provisioning screen also retries as a fallback.
        const onboardingUserId =
          session.metadata?.onboarding === "1"
            ? session.metadata?.supabase_user_id || session.client_reference_id
            : null;
        if (onboardingUserId) {
          after(() =>
            provisionOnboarding(onboardingUserId).catch((err) =>
              console.error(`[webhook] onboarding provision failed: ${err}`),
            ),
          );
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const current = await stripe.subscriptions.retrieve(sub.id);
        await applySubscription(current);
        // Grants no plan: ended without a delete event (incomplete_expired,
        // paused), or Stripe still collects for it (past_due, unpaid). Follow
        // another subscription of the customer that bills, if any.
        if (!grantsPlanStatus(current.status)) await applyLiveSibling(current);
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
          await persistSubscription({
            userId,
            customerId,
            subscriptionId: sub.id,
            plan: null,
            cycle: null,
            status: "canceled",
            currentPeriodEnd: null,
          });
          // Another live subscription of the customer may still bill.
          await applyLiveSibling(sub);
        }
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }

    // Mark the claim processed so a later retry of this id is skipped (0014).
    await markStripeEventProcessed(event.id);
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
