import { extractTitle, htmlToMarkdown, truncate } from "./markdown";
import { MAX_SOURCE_CHARS } from "./sources";
import { isBlockedHost } from "../net/safe-url";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_BYTES = 3_000_000; // 3 MB of HTML is plenty for a content page

export interface WebsiteResult {
  title: string;
  markdown: string;
  charCount: number;
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
