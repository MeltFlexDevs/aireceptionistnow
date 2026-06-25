import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { buildAuthorizeUrl, isOAuthConfigured } from "@/lib/dashboard/oauth";

// Kicks off the OAuth login: set a CSRF state cookie and redirect the user to
// the provider's consent screen.

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ provider: string }> },
): Promise<Response> {
  const { provider } = await ctx.params;

  if (!isOAuthConfigured(provider)) {
    return NextResponse.redirect(
      new URL(
        `/dashboard/integrations?error=${encodeURIComponent(`${provider} login is not configured`)}`,
        req.url,
      ),
    );
  }

  const state = randomUUID();
  const res = NextResponse.redirect(buildAuthorizeUrl(provider, state));
  res.cookies.set("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: (process.env.APP_BASE_URL ?? "").startsWith("https"),
    path: "/",
    maxAge: 600,
  });
  return res;
}
