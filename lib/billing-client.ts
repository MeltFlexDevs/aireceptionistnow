import type { BillingCycle } from "@/lib/plans";
import { loginHomePath } from "@/lib/i18n/marketing/login-redirect";

// acceptedTerms must be true only after the visitor ticked the Terms box:
// /api/checkout records it as the acceptance and refuses a plan without it.
export async function startCheckout(
  plan: string,
  cycle: BillingCycle,
  acceptedTerms: boolean,
): Promise<void> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, cycle, acceptedTerms }),
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401) {
    // Not signed in - send them through auth, then back to pricing. <html lang>
    // is the page locale, so the dialog opens on the matching localized home.
    const home = loginHomePath({ cookieLocale: globalThis.document?.documentElement.lang });
    // Come back to the pricing page the visitor was on (/de/pricing keeps German). Other
    // callers (onboarding PlanStep) go to /pricing as before.
    const path = window.location.pathname;
    const back = typeof path === "string" && path.endsWith("/pricing") ? path : "/pricing";
    window.location.assign(`${home}?auth=login&next=${back}`);
    return;
  }
  if (res.status === 409 && data?.portal === true) {
    // Already on a live Stripe plan (app/api/checkout/route.ts): a plan change
    // goes through the Billing Portal (one subscription, prorated), never a
    // second checkout next to it.
    await openBillingPortal();
    return;
  }
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Could not start checkout.");
  }
  window.location.assign(data.url as string);
}

export async function openBillingPortal(): Promise<void> {
  const res = await fetch("/api/billing-portal", { method: "POST" });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Could not open billing portal.");
  }
  window.location.assign(data.url as string);
}
