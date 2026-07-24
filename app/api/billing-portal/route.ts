import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getCustomerId } from "@/lib/billing";
import { isCompCustomerId } from "@/lib/comp-accounts";

export const runtime = "nodejs";

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
    // Complimentary test accounts have no real Stripe customer - there is no
    // billing portal to open for them.
    if (isCompCustomerId(customerId)) {
      return NextResponse.json(
        { error: "This is a complimentary account with no billing to manage." },
        { status: 400 },
      );
    }
    const origin =
      req.headers.get("origin") ||
      process.env.APP_BASE_URL ||
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
