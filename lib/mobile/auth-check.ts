/**
 * The auth step every mobile route shares. It lives outside `auth.ts`, which
 * is server-only, so node:test can load it.
 *
 * Returns the user id, or null when the token was rejected (the caller answers
 * 401), or a ready 503 Response when the check itself failed. The app signs
 * out on a 401, so an outage must never turn into "Not signed in."
 */
export async function checkMobileAuth(
  req: Request,
  label: string,
  resolve: (req: Request) => Promise<string | null>,
): Promise<string | null | Response> {
  try {
    return await resolve(req);
  } catch (err) {
    console.error(`[mobile:${label}] auth check failed`, err);
    return Response.json({ error: "Can't check your sign-in right now. Try again." }, { status: 503 });
  }
}
