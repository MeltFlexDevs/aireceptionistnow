import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { buildAuthorizeUrl, isOAuthConfigured } from "@/lib/dashboard/oauth";

export const dynamic = "force-dynamic";

// Optional same-origin return path (e.g. /onboarding?step=3) carried through
// the OAuth round-trip in a short-lived cookie; the state param stays a pure
// CSRF nonce. Backslashes are rejected because the URL parser treats "/\" like
// "//" (protocol-relative), which would make this an open redirect.
function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("\\") || /[\r\n]/.test(value)) return null;
  return value;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ provider: string }> },
): Promise<Response> {
  const { provider } = await ctx.params;
  const next = safeNext(req.nextUrl.searchParams.get("next"));

  if (!isOAuthConfigured(provider)) {
    const back = next ?? "/dashboard/calendar";
    const sep = back.includes("?") ? "&" : "?";
    return NextResponse.redirect(
      new URL(
        `${back}${sep}error=${encodeURIComponent(`${provider} login is not configured`)}`,
        req.url,
      ),
    );
  }

  const state = randomUUID();
  const res = NextResponse.redirect(buildAuthorizeUrl(provider, state));
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: (process.env.APP_BASE_URL ?? "").startsWith("https"),
    path: "/",
    maxAge: 600,
  };
  res.cookies.set("oauth_state", state, cookieOpts);
  if (next) res.cookies.set("oauth_next", next, cookieOpts);
  else res.cookies.delete("oauth_next");
  return res;
}
