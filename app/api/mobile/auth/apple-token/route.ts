import { mobileAuth } from "@/lib/mobile/auth";
import { appleSignInConfigured, storeAppleToken } from "@/lib/mobile/apple-signin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * After a native Sign in with Apple: `{ authorizationCode }` -> `{ ok }`.
 *
 * The app is already signed in (bearer) by the time it calls this; the code
 * is only for the refresh token that account deletion needs to revoke the
 * Apple grant. `ok: false` is the answer when the SIWA env is unset, and the
 * app never shows it to anyone. Deletion then has no token to revoke, which
 * App Review 5.1.1(v) requires, so that case logs an error on every call.
 *
 * A code from an Apple account that is not this user's Apple sign-in answers
 * 403 and stores nothing, so deletion never revokes someone else's grant.
 */

export async function POST(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "apple-token");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  let code = "";
  try {
    const body = (await req.json()) as { authorizationCode?: unknown };
    if (typeof body.authorizationCode === "string") code = body.authorizationCode.trim();
  } catch {
    // Falls through to the soft no below.
  }
  // Apple's native response can carry a null authorizationCode. The contract
  // is `{ ok }` and nothing the user sees, so that is a soft no, not a 400.
  if (!code) return Response.json({ ok: false });
  if (!appleSignInConfigured()) {
    // No ids or tokens in this log line.
    console.error("[mobile:apple-token] SIWA not configured");
    return Response.json({ ok: false });
  }

  try {
    const result = await storeAppleToken(userId, code);
    if (result === "mismatch") {
      // No ids or tokens in this log line.
      console.warn("[mobile:apple-token] sub mismatch");
      return Response.json({ error: "This Apple account does not match your sign-in." }, { status: 403 });
    }
    return Response.json({ ok: result === "stored" });
  } catch (err) {
    console.error("[mobile:apple-token]", err);
    return Response.json({ ok: false });
  }
}
