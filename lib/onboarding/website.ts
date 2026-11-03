/**
 * The funnel's website rule. Plain words such as "my company" are not a
 * website: saved as one, they passed step 1 and named the business. Used by the
 * web basics step (saveBasicsAction), the app's basics step
 * (/api/mobile/onboarding), the step 1 gates and the provisioner. The app
 * checks the same rule before it sends (aireceptionistnowapp lib/website.ts,
 * looksLikeWebsite): change both together. No imports, so a Node script can
 * check this file.
 */
export function looksLikeWebsite(raw: string): boolean {
  const text = raw.trim();
  if (!text || /\s/.test(text)) return false;
  // Ideographic and full-width dots are dots, as in Node and browsers (UTS 46).
  const rest = text.replace(/^https?:\/\//i, "").replace(/[。．｡]/g, ".");
  let url: URL;
  try {
    url = new URL(`https://${rest}`);
  } catch {
    return false;
  }
  // "info@bakery.com" parses as a login at bakery.com: an email, not a site.
  if (url.username) return false;
  // Lowercased here: Node and browsers lowercase the host.
  const host = url.hostname.toLowerCase();
  if (!host.includes(".") || host.startsWith(".") || host.endsWith(".")) return false;
  const top = host.slice(host.lastIndexOf(".") + 1);
  // A letter of any script, then letters or the marks some scripts need ("рф"
  // and "भारत"), or an internationalised top-level domain in punycode.
  return /^\p{L}[\p{L}\p{M}]+$/u.test(top) || /^xn--[a-z0-9-]+$/.test(top);
}

/**
 * The website as stored (trimmed, as typed), "" when empty (the field is
 * optional), or null when the text is not a website.
 */
export function normalizeWebsite(raw: string): string | null {
  const text = raw.trim();
  if (!text) return "";
  return looksLikeWebsite(text) ? text : null;
}
