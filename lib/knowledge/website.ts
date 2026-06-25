import { extractTitle, htmlToMarkdown, truncate } from "./markdown";
import { MAX_SOURCE_CHARS } from "./sources";

// Fetch a public web page and process it to Markdown for the knowledge base.
// User-supplied URL, so this guards against SSRF: https/http only, and no
// private / loopback / link-local / metadata hosts.

const FETCH_TIMEOUT_MS = 12_000;
const MAX_BYTES = 3_000_000; // 3 MB of HTML is plenty for a content page

export interface WebsiteResult {
  title: string;
  markdown: string;
  charCount: number;
}

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  // IPv6 loopback / unique-local / link-local.
  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) {
    return true;
  }
  // IPv4 private + loopback + link-local + cloud metadata.
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

function assertSafeUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Enter a valid URL, e.g. https://example.com/about");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Only http and https URLs are supported.");
  }
  if (isBlockedHost(url.hostname)) {
    throw new Error("That host isn't allowed.");
  }
  return url;
}

export async function fetchWebsiteMarkdown(input: string): Promise<WebsiteResult> {
  const url = assertSafeUrl(input.trim());

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent": "AIReceptionistBot/1.0 (+knowledge-import)",
        accept: "text/html,application/xhtml+xml",
      },
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw new Error("The page took too long to load.");
    throw new Error("Couldn't reach that URL.");
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
