import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getCustomerId, saveCustomerId } from "@/lib/billing";
import { getPlan, priceIdFor, type BillingCycle } from "@/lib/plans";
import { saveOnboardingConfig } from "@/lib/dashboard/onboarding-profile";

export const runtime = "nodejs";

function baseUrl(req: Request): string {
  return (
    req.headers.get("origin") ||
    process.env.APP_BASE_URL ||
    "https://aireceptionistnow.com"
  );
}

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
  let onboarding = false;
  let country = "";
  try {
    const body = await req.json();
    planId = typeof body?.plan === "string" ? body.plan : undefined;
    if (body?.cycle === "annual" || body?.cycle === "monthly") {
      cycle = body.cycle;
    }
    // The number country the user confirmed on the plan step - persisted below
    // so provisioning buys the right country even if they changed it here.
    if (typeof body?.country === "string") country = body.country.trim().toUpperCase();
    // The onboarding funnel returns to its provisioning screen and tags the
    // session so the Stripe webhook kicks off background provisioning.
    onboarding = body?.context === "onboarding";
  } catch {
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

  // Lock in the chosen number country before payment. Authoritative over the
  // optimistic client write, and covers a guest who only authenticated here.
  // Best-effort: a persistence hiccup must not block checkout (provisioning
  // falls back to the country saved in step 1, or the default).
  if (onboarding && /^[A-Z]{2}$/.test(country)) {
    await saveOnboardingConfig(userId, { country }).catch(() => {});
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

    const successUrl = onboarding
      ? `${origin}/onboarding?step=go&checkout=success`
      : `${origin}/dashboard?checkout=success`;
    const cancelUrl = onboarding
      ? `${origin}/onboarding?step=plan&checkout=cancel`
      : `${origin}/pricing?checkout=cancel`;

    const createSession = (customerId: string) =>
      stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        client_reference_id: userId,
        subscription_data: {
          metadata: {
            supabase_user_id: userId,
            plan: plan.id,
            cycle,
          },
        },
        metadata: {
          supabase_user_id: userId,
          plan: plan.id,
          cycle,
          ...(onboarding ? { onboarding: "1" } : {}),
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

    let customerId = (await getCustomerId(userId)) || (await newCustomer());

    let session;
    try {
      session = await createSession(customerId);
    } catch (err) {
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
