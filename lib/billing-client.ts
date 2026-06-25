/**
 * Browser-side helpers to kick off Stripe Checkout and the Customer Portal.
 * They call our server routes (which hold the secret key) and then redirect the
 * browser to the Stripe-hosted page.
 */
import type { BillingCycle } from "@/lib/plans";

/** Start checkout for a plan + billing cycle; resolves only if it fails
 *  (otherwise navigates away). Throws with a user-facing message on failure. */
export async function startCheckout(
  plan: string,
  cycle: BillingCycle,
): Promise<void> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, cycle }),
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401) {
    // Not signed in — send them through auth, then back to pricing.
    window.location.assign("/?auth=login&next=/pricing");
    return;
  }
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Could not start checkout.");
  }
  window.location.assign(data.url as string);
}

/** Open the Stripe Customer Portal for the signed-in subscriber. */
export async function openBillingPortal(): Promise<void> {
  const res = await fetch("/api/billing-portal", { method: "POST" });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Could not open billing portal.");
  }
  window.location.assign(data.url as string);
}
