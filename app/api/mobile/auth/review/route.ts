import { reviewLogin } from "@/lib/mobile/review-login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * App Review / Play review sign-in: `{ email, code }` -> a Supabase session.
 *
 * No bearer - this IS the sign-in. See lib/mobile/review-login.ts for the
 * rules; the route only shapes the answer. Every refusal is a 404 with the
 * same body so the route is indistinguishable from "not deployed" to anyone
 * but the reviewer holding the code.
 */

export async function POST(req: Request): Promise<Response> {
  let email: unknown;
  let code: unknown;
  try {
    const body = (await req.json()) as { email?: unknown; code?: unknown };
    email = body.email;
    code = body.code;
  } catch {
    // A bad body is just a non-match.
  }

  const result = await reviewLogin({ email, code });
  if (result.status === 404) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }
  return Response.json({
    access_token: result.access_token,
    refresh_token: result.refresh_token,
  });
}
