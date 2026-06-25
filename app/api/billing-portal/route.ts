import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getCustomerId } from "@/lib/billing";

export const runtime = "nodejs";

/**
 * Open the Stripe Customer Portal so a subscriber can update payment details,
 * switch plans, or cancel. Requires an existing Stripe customer for the user.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (typeof userId !== "string" || !userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const customerId = await getCustomerId(userId);
    if (!customerId) {
      return NextResponse.json(
        { error: "No subscription found." },
        { status: 404 },
      );
    }
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://aireceptionistnow.com";
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not open billing portal.";
    console.error(`[billing-portal] ${message}`);
    return NextResponse.json(
      { error: "Could not open billing portal." },
      { status: 500 },
    );
  }
}
