import { getCustomerId } from "@/lib/billing";
import { isCompCustomerId } from "@/lib/comp-accounts";
import { mobileUserId } from "@/lib/mobile/auth";
import { appBaseUrl, safeNextPath, webHandoffUrl } from "@/lib/mobile/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A signed-in browser URL for the three things a phone cannot do in-process:
 * Stripe checkout, the Stripe billing portal, and calendar OAuth consent.
 *
 * Anything that takes a payment inside an iOS binary falls under App Store
 * in-app purchase rules; a SaaS subscription bought on the web does not - which
 * is why these open a browser rather than a screen.
 *
 * The response is a single-use credential. The app must open it immediately and
 * never store or log it.
 */

const ALLOWED = new Set(["billing", "checkout", "dashboard", "onboarding", "knowledge"]);

const PATHS: Record<string, string> = {
  billing: "/dashboard/settings",
  checkout: "/onboarding?step=plan",
  dashboard: "/dashboard",
  onboarding: "/onboarding",
  knowledge: "/dashboard/knowledge",
};

export async function POST(req: Request): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  let target = "dashboard";
  let raw = "";
  try {
    const body = (await req.json()) as { target?: unknown; path?: unknown };
    if (typeof body.target === "string" && ALLOWED.has(body.target)) target = body.target;
    if (typeof body.path === "string") raw = body.path;
  } catch {
    // Defaults are fine.
  }

  // An explicit path is only honoured when it is same-origin; anything else
  // falls back to the named target, so this can never become an open redirect.
  const next = raw ? safeNextPath(raw, PATHS[target]) : PATHS[target];

  if (target === "billing") {
    // Complimentary accounts have no Stripe customer, so the portal would open
    // on an error page. Say so here instead.
    const customerId = await getCustomerId(userId).catch(() => null);
    if (customerId && isCompCustomerId(customerId)) {
      return Response.json(
        { error: "This is a complimentary account with no billing to manage." },
        { status: 400 },
      );
    }
  }

  const url = await webHandoffUrl(userId, next);
  // Falling back to the plain URL is deliberate: the user lands on a sign-in
  // page rather than on nothing at all.
  return Response.json({ url: url ?? `${appBaseUrl()}${next}`, signedIn: Boolean(url) });
}
