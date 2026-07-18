import { lookup } from "node:dns/promises";
import { extractTitle, htmlToMarkdown, truncate } from "./markdown";
import { MAX_SOURCE_CHARS } from "./sources";
import { isBlockedHost } from "../net/safe-url";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_BYTES = 3_000_000; // 3 MB of HTML is plenty for a content page
const MAX_REDIRECTS = 3;

export interface WebsiteResult {
  title: string;
  markdown: string;
  charCount: number;
}

function parseUrl(input: string): URL {
  // Users type "www.example.com" - default the scheme for them.
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(input) ? input : `https://${input}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new Error("Enter a valid URL, e.g. https://example.com/about");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Only http and https URLs are supported.");
  }
  return url;
}

// SSRF guard: the literal host must pass the blocklist AND, for hostnames,
// every resolved address must too - otherwise an attacker-controlled domain
// pointing at 169.254.169.254 or 10.x walks right past the literal check.
async function assertPublicHost(url: URL): Promise<void> {
  const host = url.hostname;
  if (isBlockedHost(host)) throw new Error("That host isn't allowed.");
  const isLiteralIp = /^[\d.]+$/.test(host) || host.includes(":") || host.startsWith("[");
  if (isLiteralIp) return; // fully covered by isBlockedHost
  let addrs: { address: string }[];
  try {
    addrs = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new Error("Couldn't reach that URL.");
  }
  if (addrs.length === 0 || addrs.some((a) => isBlockedHost(a.address))) {
    throw new Error("That host isn't allowed.");
  }
}

// Manual redirect handling so every hop is re-validated against the SSRF
// guard (redirect: "follow" would happily follow a hop to an internal IP).
async function guardedFetch(start: URL, signal: AbortSignal): Promise<Response> {
  let current = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHost(current);
    let res: Response;
    try {
      res = await fetch(current, {
        signal,
        redirect: "manual",
        headers: {
          "user-agent": "AIReceptionistBot/1.0 (+knowledge-import)",
          accept: "text/html,application/xhtml+xml",
        },
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") throw err;
      throw new Error("Couldn't reach that URL.");
    }
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return res;
      let next: URL;
      try {
        next = new URL(location, current);
      } catch {
        throw new Error("Couldn't reach that URL.");
      }
      if (next.protocol !== "https:" && next.protocol !== "http:") {
        throw new Error("Only http and https URLs are supported.");
      }
      current = next;
      continue;
    }
    return res;
  }
  throw new Error("That page redirects too many times.");
}

export async function fetchWebsiteMarkdown(input: string): Promise<WebsiteResult> {
  const url = parseUrl(input.trim());

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await guardedFetch(url, controller.signal);
  } catch (err) {
    if ((err as Error).name === "AbortError") throw new Error("The page took too long to load.");
    // Everything else guardedFetch throws is already a user-facing message.
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new Error(`The page returned ${res.status}.`);
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("html") && !contentType.includes("text")) {
    throw new Error("That URL isn't an HTML page.");
  }

  const html = (await res.text()).slice(0, MAX_BYTES);
  const markdown = truncate(htmlToMarkdown(html), MAX_SOURCE_CHARS);
  if (!markdown.trim()) throw new Error("No readable text found on that page.");

  const title = extractTitle(html) || url.hostname;
  return { title, markdown, charCount: markdown.length };
}
