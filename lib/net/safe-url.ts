// Shared SSRF guard for user-supplied outbound URLs (CRM push, webhook calendar,
// knowledge website import). String-level check only: it blocks obvious private /
// loopback / link-local / cloud-metadata hosts and non-https schemes. It CANNOT
// stop DNS rebinding on its own - a hostname that resolves public at save time can
// resolve private at fetch time - so callers that fetch on a schedule must also set
// `redirect: "manual"` (an open redirect otherwise walks straight past this) and
// re-run the check immediately before the request.

/** Private / loopback / "this host" (0.x) / link-local / cloud-metadata IPv4. */
function isBlockedV4(octets: [number, number, number, number]): boolean {
  const [a, b] = octets;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true; // link-local + 169.254.169.254 metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/**
 * Parse an IPv4 host the way inet_aton does: 1-4 dot-separated parts, each
 * decimal, octal (leading 0) or hex (0x…), the last part filling the remaining
 * bytes - so "2130706433", "0x7f000001", "0177.0.0.1" and "127.1" are all
 * 127.0.0.1. Returns the four octets, or null when the host isn't numeric IPv4
 * at all (then it's a DNS name and range checks don't apply).
 */
function parseIPv4(host: string): [number, number, number, number] | null {
  const parts = host.split(".");
  if (parts.length > 4) return null;
  const nums: number[] = [];
  for (const part of parts) {
    let v: number;
    if (/^0x[0-9a-f]+$/.test(part)) v = parseInt(part.slice(2), 16);
    else if (/^0[0-7]*$/.test(part)) v = parseInt(part, 8);
    else if (/^[1-9][0-9]*$/.test(part)) v = parseInt(part, 10);
    else return null;
    nums.push(v);
  }
  // All but the last part are single octets; the last spans the rest.
  const head = nums.slice(0, -1);
  const last = nums[nums.length - 1];
  if (head.some((n) => n > 255)) return null;
  if (last >= 256 ** (4 - head.length)) return null;
  const octets = [...head];
  for (let i = 4 - head.length - 1; i >= 0; i--) octets.push((last >>> (8 * i)) & 0xff);
  return octets as [number, number, number, number];
}

/** Expand an IPv6 literal (brackets already stripped) into its 8 16-bit groups,
 *  resolving a "::" gap and a trailing embedded dotted-quad ("::ffff:127.0.0.1").
 *  Returns null when the string isn't valid IPv6. */
function parseIPv6(host: string): number[] | null {
  let h = host;
  // Fold an embedded IPv4 tail into its two hex groups first.
  const tail = /^(.*:)((?:\d{1,3}\.){3}\d{1,3})$/.exec(h);
  if (tail) {
    const quad = tail[2].split(".").map(Number);
    if (quad.some((n) => n > 255)) return null;
    h =
      tail[1] +
      (((quad[0] << 8) | quad[1]).toString(16) + ":" + ((quad[2] << 8) | quad[3]).toString(16));
  }
  const halves = h.split("::");
  if (halves.length > 2) return null;
  const groupsOf = (s: string): number[] | null => {
    if (!s) return [];
    const out: number[] = [];
    for (const g of s.split(":")) {
      if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
      out.push(parseInt(g, 16));
    }
    return out;
  };
  const headG = groupsOf(halves[0]);
  const tailG = halves.length === 2 ? groupsOf(halves[1]) : [];
  if (!headG || !tailG) return null;
  if (halves.length === 1) return headG.length === 8 ? headG : null;
  if (headG.length + tailG.length > 7) return null; // "::" stands for ≥1 group
  return [...headG, ...Array(8 - headG.length - tailG.length).fill(0), ...tailG];
}

/** Loopback / unspecified / unique-local / link-local IPv6, plus any form that
 *  embeds an IPv4 address - the fetch would reach that IPv4, so judge it with
 *  the IPv4 rules. */
function isBlockedV6(g: number[]): boolean {
  const zeroThrough = (n: number) => g.slice(0, n).every((x) => x === 0);
  if (zeroThrough(7) && g[7] <= 1) return true; // :: unspecified, ::1 loopback
  if ((g[0] & 0xfe00) === 0xfc00) return true; // fc00::/7 unique-local
  if ((g[0] & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  // IPv4-mapped ::ffff:a.b.c.d, IPv4-compatible ::a.b.c.d, translated
  // ::ffff:0:a.b.c.d - all carry the IPv4 in the last two groups.
  const embedsV4 =
    (zeroThrough(5) && (g[5] === 0 || g[5] === 0xffff)) ||
    (zeroThrough(4) && g[4] === 0xffff && g[5] === 0);
  if (embedsV4) {
    return isBlockedV4([g[6] >> 8, g[6] & 0xff, g[7] >> 8, g[7] & 0xff]);
  }
  return false;
}

/** True if the hostname is a private / loopback / link-local / metadata address we
 *  must never let a server-side fetch reach. */
export function isBlockedHost(hostname: string): boolean {
  // URL.hostname wraps IPv6 in brackets ("[::1]"); strip them (and a trailing dot)
  // so the checks below actually match.
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  if (host.includes(":")) {
    // IPv6. Expand to the full 8 groups so compressed ("::1"), IPv4-mapped
    // ("::ffff:127.0.0.1" - and its hex spelling "::ffff:7f00:1", which is how
    // the URL parser re-serializes it) and IPv4-compatible forms can't sneak an
    // internal IPv4 past a string-prefix check. A colon-host that isn't valid
    // IPv6 is never a valid DNS name either, so fail closed.
    const groups = parseIPv6(host);
    return !groups || isBlockedV6(groups);
  }
  // IPv4, including inet_aton's non-dotted spellings ("2130706433",
  // "0x7f000001", "0177.0.0.1"). The URL parser normalizes those to dotted-quad
  // for http(s) URLs, but normalize here too - isBlockedHost is the last line
  // of defense and is also called on hostnames outside a full-URL context.
  const v4 = parseIPv4(host);
  if (v4) return isBlockedV4(v4);
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
