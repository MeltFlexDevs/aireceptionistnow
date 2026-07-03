// Shared SSRF guard for user-supplied outbound URLs (CRM push, webhook calendar,
// knowledge website import). String-level check only: it blocks obvious private /
// loopback / link-local / cloud-metadata hosts and non-https schemes. It CANNOT
// stop DNS rebinding on its own — a hostname that resolves public at save time can
// resolve private at fetch time — so callers that fetch on a schedule must also set
// `redirect: "manual"` (an open redirect otherwise walks straight past this) and
// re-run the check immediately before the request.

/** True if the hostname is a private / loopback / link-local / metadata address we
 *  must never let a server-side fetch reach. */
export function isBlockedHost(hostname: string): boolean {
  // URL.hostname wraps IPv6 in brackets ("[::1]"); strip them (and a trailing dot)
  // so the loopback/link-local checks below actually match.
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  // IPv6 loopback / unique-local / link-local.
  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) {
    return true;
  }
  // IPv4 private + loopback + "this host" (0.x) + link-local + cloud metadata.
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local + 169.254.169.254 metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

/** Whether a URL is a public https:// address safe to POST to from the server.
 *  Requires https (no http) and a non-blocked host. */
export function isSafeHttpsUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  return !isBlockedHost(u.hostname);
}
