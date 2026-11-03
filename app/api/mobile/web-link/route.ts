import { CALENDAR_PROVIDERS } from "@/lib/calendar/providers";
import { mobileAuth } from "@/lib/mobile/auth";
import {
  APP_RETURN_URL,
  appBaseUrl,
  safeAppReturnUrl,
  safeNextPath,
  webHandoffUrl,
} from "@/lib/mobile/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A signed-in browser URL for the one thing a phone cannot do in-process:
 * calendar OAuth consent, which needs a cookie session on the site.
 *
 * There is no handoff to web billing, checkout or the Stripe portal. The app
 * sells subscriptions through the App Store / Google Play only, and a link out
 * to a web purchase from inside the binary is exactly what store review
 * rejects - so 'billing' and 'checkout' are refused outright rather than
 * quietly redirected somewhere else.
 *
 * 'calendar' is minted at tap time, once per tap, and ends on /mobile/done,
 * which sends the browser back into the app at `returnUrl` (an app-scheme URL;
 * aireceptionistnow://handoff when missing or invalid). 'dashboard',
 * 'onboarding' and 'knowledge' remain only for app builds already in the field.
 *
 * The response is a single-use credential. The app must open it immediately and
 * never store or log it.
 */

const REFUSED = new Set(["billing", "checkout"]);

const PATHS: Record<string, string> = {
  dashboard: "/dashboard",
  onboarding: "/onboarding",
  knowledge: "/dashboard/knowledge",
};

interface Body {
  target?: unknown;
  path?: unknown;
  provider?: unknown;
  returnUrl?: unknown;
}

export async function POST(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "web-link");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    // Defaults are fine.
  }

  const target = typeof body.target === "string" ? body.target : "dashboard";
  if (REFUSED.has(target)) {
    return Response.json({ error: "Unsupported target." }, { status: 400 });
  }

  let next: string;
  if (target === "calendar") {
    const provider = CALENDAR_PROVIDERS.find((p) => p.oauth && p.id === body.provider);
    if (!provider) return Response.json({ error: "Unsupported calendar." }, { status: 400 });
    const returnUrl = safeAppReturnUrl(body.returnUrl) ?? APP_RETURN_URL;
    const done = `/mobile/done?return=${encodeURIComponent(returnUrl)}`;
    next = `/api/integrations/${provider.id}/connect?next=${encodeURIComponent(done)}`;
  } else {
    const fallback = Object.hasOwn(PATHS, target) ? PATHS[target] : PATHS.dashboard;
    // An explicit path is only honoured when it is same-origin; anything else
    // falls back to the named target, so this can never become an open redirect.
    next = typeof body.path === "string" && body.path ? safeNextPath(body.path, fallback) : fallback;
  }

  const url = await webHandoffUrl(userId, next);
  // Falling back to the plain URL is deliberate: the user lands on a sign-in
  // page rather than on nothing at all.
  return Response.json({ url: url ?? `${appBaseUrl()}${next}`, signedIn: Boolean(url) });
}
