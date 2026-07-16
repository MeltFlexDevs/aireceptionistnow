
function isBlockedV4(octets: [number, number, number, number]): boolean {
  const [a, b] = octets;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true; // link-local + 169.254.169.254 metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

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

function isBlockedV6(g: number[]): boolean {
  const zeroThrough = (n: number) => g.slice(0, n).every((x) => x === 0);
  if (zeroThrough(7) && g[7] <= 1) return true; // :: unspecified, ::1 loopback
  if ((g[0] & 0xfe00) === 0xfc00) return true; // fc00::/7 unique-local
  if ((g[0] & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  const embedsV4 =
    (zeroThrough(5) && (g[5] === 0 || g[5] === 0xffff)) ||
    (zeroThrough(4) && g[4] === 0xffff && g[5] === 0);
  if (embedsV4) {
    return isBlockedV4([g[6] >> 8, g[6] & 0xff, g[7] >> 8, g[7] & 0xff]);
  }
  return false;
}

export function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  if (host.includes(":")) {
    const groups = parseIPv6(host);
    return !groups || isBlockedV6(groups);
  }
  const v4 = parseIPv4(host);
  if (v4) return isBlockedV4(v4);
  return false;
}

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
