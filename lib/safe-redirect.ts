/**
 * Resolve a caller-supplied `next` into an absolute same-origin URL.
 *
 * Returns the full href, query string included. That is the point of this
 * helper: /auth/confirm used to assign `next` to `url.pathname`, and the URL
 * setter percent-encodes '?', so `/api/integrations/google/connect?next=/x`
 * became the path `/api/integrations/google/connect%3Fnext=/x` - a 404 reached
 * only after the one-time magic-link token was already spent. Every calendar
 * Connect from the app went through it.
 *
 * Same rules as the OAuth connect route's `safeNext`: it must be a path
 * ("/..."), not protocol-relative ("//host"), and carry no backslash (the URL
 * parser reads "/\host" like "//host") and no CR/LF. The resolved URL must
 * still be on `origin` - a final guard against any parser surprise the string
 * checks missed. Anything else yields `fallback` on the same origin.
 */
export function resolveSameOriginNext(
  next: string | null | undefined,
  origin: string,
  fallback = "/dashboard",
): string {
  const base = new URL(origin).origin;
  const fallbackHref = new URL(fallback, base).href;
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallbackHref;
  if (next.includes("\\") || /[\r\n]/.test(next)) return fallbackHref;

  let url: URL;
  try {
    url = new URL(next, base);
  } catch {
    return fallbackHref;
  }
  return url.origin === base ? url.href : fallbackHref;
}

/**
 * The path form of resolveSameOriginNext: "/x?y#z", not a full URL. For client
 * code that keeps `next` and hands it on - the sign-in dialog passes it to
 * /auth/callback, which takes only a path. Same rules; anything unsafe yields
 * `fallback`. The parser drops dot segments, so an accepted "/.//host" becomes
 * the path "//host", which a browser reads as another site: that falls back
 * too. The base origin only anchors the parse; it never shows in the result.
 */
export function sameOriginNextPath(
  next: string | null | undefined,
  fallback = "/dashboard",
): string {
  const url = new URL(resolveSameOriginNext(next, "http://localhost", fallback));
  const path = `${url.pathname}${url.search}${url.hash}`;
  return path.startsWith("//") ? fallback : path;
}

const CONFIRM_PARAMS = ["token_hash", "type", "next"];

/**
 * Both exits of /auth/confirm, from its own request URL.
 *
 * token_hash/type/next are removed from THIS request's parameters only; any
 * other parameter it carried rides along to both exits, as before. The target
 * resolved from `next` is never trimmed - it may carry its own `next` (the
 * OAuth connect route's), and its own values win over a carried-over one.
 */
export function authConfirmRedirects(requestUrl: string): { success: string; failure: string } {
  const req = new URL(requestUrl);
  const extra = [...req.searchParams].filter(([key]) => !CONFIRM_PARAMS.includes(key));

  const success = new URL(resolveSameOriginNext(req.searchParams.get("next"), req.origin));
  for (const [key, value] of extra) {
    if (!success.searchParams.has(key)) success.searchParams.append(key, value);
  }

  const failure = new URL("/auth/auth-error", req.origin);
  for (const [key, value] of extra) failure.searchParams.append(key, value);

  return { success: success.href, failure: failure.href };
}
