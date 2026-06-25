import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getCustomerId, saveCustomerId } from "@/lib/billing";
import { getPlan, priceIdFor, type BillingCycle } from "@/lib/plans";

export const runtime = "nodejs";

/** Base URL to send the customer back to, preferring the real request origin
 *  (so previews and localhost work) and falling back to the configured site. */
function baseUrl(req: Request): string {
  return (
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://aireceptionistnow.com"
  );
}

/**
 * Start a Stripe Checkout session for the chosen subscription plan + billing
 * cycle. The user must be signed in; the Stripe customer is linked to their
 * Supabase id so the webhook can record the subscription on the right account.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : undefined;
  if (typeof userId !== "string" || !userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let planId: string | undefined;
  let cycle: BillingCycle = "monthly";
  try {
    const body = await req.json();
    planId = typeof body?.plan === "string" ? body.plan : undefined;
    if (body?.cycle === "annual" || body?.cycle === "monthly") {
      cycle = body.cycle;
    }
  } catch {
    /* no body */
  }

  const plan = planId ? getPlan(planId) : undefined;
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }
  const priceId = priceIdFor(plan, cycle);
  if (!priceId) {
    console.error(
      `[checkout] plan "${plan.id}" (${cycle}) has no Stripe price configured.`,
    );
    return NextResponse.json(
      { error: "Billing is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  try {
    const stripe = getStripe();
    const origin = baseUrl(req);

    const newCustomer = async () => {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      });
      await saveCustomerId(userId, customer.id);
      return customer.id;
    };

    const createSession = (customerId: string) =>
      stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        client_reference_id: userId,
        // Mirrored onto the subscription so the webhook can map any future
        // renewal back to the user, plan and cycle without extra lookups.
        subscription_data: {
          metadata: {
            supabase_user_id: userId,
            plan: plan.id,
            cycle,
          },
        },
        metadata: { supabase_user_id: userId, plan: plan.id, cycle },
        success_url: `${origin}/dashboard?checkout=success`,
        cancel_url: `${origin}/pricing?checkout=cancel`,
      });

    // Reuse the stored customer for returning subscribers; create one on first
    // checkout and store it so we never make duplicates.
    let customerId = (await getCustomerId(userId)) || (await newCustomer());

    let session;
    try {
      session = await createSession(customerId);
    } catch (err) {
      // The stored customer can be stale — e.g. it belongs to the other Stripe
      // mode (test vs live) or was deleted. Create a fresh one and retry once.
      const code = (err as { code?: string })?.code;
      if (code === "resource_missing") {
        customerId = await newCustomer();
        session = await createSession(customerId);
      } else {
        throw err;
      }
    }

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start checkout.";
    console.error(`[checkout] ${message}`);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
