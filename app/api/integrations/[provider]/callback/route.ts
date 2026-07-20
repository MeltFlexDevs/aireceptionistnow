import { NextResponse, type NextRequest } from "next/server";
import { currentUserId } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/config";
import { exchangeCode } from "@/lib/dashboard/oauth";
import { upsertCalendarIntegration } from "@/lib/dashboard/db";

export const dynamic = "force-dynamic";

// Where to land after the OAuth round-trip: the validated oauth_next cookie
// (set by the connect route, e.g. /onboarding?step=3) or the integrations page.
// Backslashes are rejected because the URL parser treats "/\" like "//"
// (protocol-relative), which would make this an open redirect.
function returnBase(req: NextRequest): string {
  const next = req.cookies.get("oauth_next")?.value;
  if (
    next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\") &&
    !/[\r\n]/.test(next)
  ) {
    return next;
  }
  return "/dashboard/calendar";
}

function redirectTo(req: NextRequest, params: Record<string, string>): Response {
  const base = returnBase(req);
  const sep = base.includes("?") ? "&" : "?";
  const query = new URLSearchParams(params).toString();
  const res = NextResponse.redirect(new URL(`${base}${sep}${query}`, req.url));
  res.cookies.delete("oauth_state");
  res.cookies.delete("oauth_next");
  return res;
}

function fail(req: NextRequest, message: string): Response {
  return redirectTo(req, { error: message });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ provider: string }> },
): Promise<Response> {
  const { provider } = await ctx.params;
  const url = new URL(req.url);

  const oauthError = url.searchParams.get("error");
  if (oauthError) return fail(req, oauthError);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get("oauth_state")?.value;
  if (!code || !state || !cookieState || state !== cookieState) {
    return fail(req, "Login session expired or invalid. Please try again.");
  }

  let result: Awaited<ReturnType<typeof exchangeCode>>;
  try {
    result = await exchangeCode(provider, code);
  } catch (err) {
    return fail(req, (err as Error).message);
  }
  if (!result) return fail(req, `Could not finish login with ${provider}.`);

  const ownerId = await currentUserId();
  if (authConfigured() && ownerId === null) {
    return fail(req, "Please sign in to connect a calendar.");
  }

  try {
    await upsertCalendarIntegration(provider, result.config, ownerId ?? undefined);
  } catch (err) {
    return fail(req, (err as Error).message);
  }

  return redirectTo(req, { connected: "1" });
}
