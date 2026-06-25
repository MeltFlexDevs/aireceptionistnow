// Minimal, dependency-free HTML → Markdown extraction. Good enough to turn a
// business web page or a PDF's raw text into clean, readable Markdown the
// receptionist can be primed with. Not a full converter — it strips chrome,
// keeps headings/lists/links/paragraphs, and collapses noise.

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  copy: "©",
  reg: "®",
  trade: "™",
};

/** Decode the handful of HTML entities that actually show up in body copy. */
export function decodeEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&([a-z]+);/gi, (m, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

/** Pull the document title from <title> or the first <h1>, if present. */
export function extractTitle(html: string): string {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  if (title) return collapseWhitespace(decodeEntities(stripTags(title)));
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1];
  if (h1) return collapseWhitespace(decodeEntities(stripTags(h1)));
  return "";
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

function collapseWhitespace(text: string): string {
  return text.replace(/[ \t\f\v]+/g, " ").trim();
}

/**
 * Convert an HTML document to Markdown. Removes non-content regions
 * (scripts, styles, nav, etc.), maps structural tags to Markdown, then strips
 * any remaining tags and tidies whitespace.
 */
export function htmlToMarkdown(html: string): string {
  let s = html;

  // Drop regions that never carry useful business content.
  s = s.replace(
    /<(script|style|noscript|svg|head|nav|footer|form|iframe|template)[^>]*>[\s\S]*?<\/\1>/gi,
    " ",
  );
  s = s.replace(/<!--[\s\S]*?-->/g, " ");

  // Headings.
  for (let level = 1; level <= 6; level++) {
    const hashes = "#".repeat(level);
    s = s.replace(
      new RegExp(`<h${level}[^>]*>([\\s\\S]*?)<\\/h${level}>`, "gi"),
      (_, inner: string) => `\n\n${hashes} ${collapseWhitespace(stripTags(inner))}\n\n`,
    );
  }

  // Links: keep the text plus the destination when it's an http(s) URL.
  s = s.replace(
    /<a\b[^>]*\bhref=["']?(https?:\/\/[^"'\s>]+)["']?[^>]*>([\s\S]*?)<\/a>/gi,
    (_, href: string, text: string) => {
      const label = collapseWhitespace(stripTags(text));
      return label ? `[${label}](${href})` : href;
    },
  );

  // List items and block separators.
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner: string) => `\n- ${collapseWhitespace(stripTags(inner))}`);
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|div|section|article|tr|ul|ol|table|h[1-6])>/gi, "\n\n");

  // Everything else: drop tags, decode entities.
  s = decodeEntities(stripTags(s));

  // Tidy: trim each line, collapse 3+ blank lines to one gap.
  s = s
    .split("\n")
    .map((line) => collapseWhitespace(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return s;
}

/** Cap text to a character budget on a word/line boundary, with an ellipsis note. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastBreak = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(" "));
  const body = lastBreak > max * 0.6 ? cut.slice(0, lastBreak) : cut;
  return `${body.trimEnd()}\n\n…(truncated)`;
}
