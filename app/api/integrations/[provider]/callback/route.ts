import { NextResponse, type NextRequest } from "next/server";
import { currentUserId } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/config";
import { exchangeCode } from "@/lib/dashboard/oauth";
import { upsertCalendarIntegration } from "@/lib/dashboard/db";

// OAuth callback: verify state, exchange the code for tokens, store them as the
// calendar integration, and return to the integrations page.

export const dynamic = "force-dynamic";

function fail(req: NextRequest, message: string): Response {
  return NextResponse.redirect(
    new URL(`/dashboard/integrations?error=${encodeURIComponent(message)}`, req.url),
  );
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

  const result = await exchangeCode(provider, code);
  if (!result) return fail(req, `Could not finish login with ${provider}.`);

  // This route lives under /api and is NOT behind the auth proxy — a valid state
  // cookie is the attacker's own. Fail CLOSED when auth is on but no session
  // resolves, otherwise upsertCalendarIntegration would run unscoped and could
  // overwrite another tenant's stored calendar tokens with the caller's.
  const ownerId = await currentUserId();
  if (authConfigured() && ownerId === null) {
    return fail(req, "Please sign in to connect a calendar.");
  }

  try {
    await upsertCalendarIntegration(provider, result.config, ownerId ?? undefined);
  } catch (err) {
    return fail(req, (err as Error).message);
  }

  const res = NextResponse.redirect(new URL("/dashboard/integrations?connected=1", req.url));
  res.cookies.delete("oauth_state");
  return res;
}
