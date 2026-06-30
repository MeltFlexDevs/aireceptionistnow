import { extractText, getDocumentProxy } from "unpdf";
import { truncate } from "./markdown";
import { MAX_SOURCE_CHARS } from "./sources";

// Extract a PDF's text to Markdown for the knowledge base. unpdf is a pure-JS,
// serverless-friendly PDF reader (no native deps), so this runs fine on Vercel.

const MAX_PDF_BYTES = 15_000_000; // 15 MB

export interface PdfResult {
  markdown: string;
  charCount: number;
}

export async function parsePdfMarkdown(bytes: Uint8Array): Promise<PdfResult> {
  if (bytes.byteLength === 0) throw new Error("The PDF is empty.");
  if (bytes.byteLength > MAX_PDF_BYTES) throw new Error("PDF is too large (max 15 MB).");

  let text: string;
  try {
    const pdf = await getDocumentProxy(bytes);
    const result = await extractText(pdf, { mergePages: true });
    text = Array.isArray(result.text) ? result.text.join("\n\n") : result.text;
  } catch {
    throw new Error("Couldn't read that PDF — it may be scanned images or corrupted.");
  }

  // Normalize PDF text into clean Markdown prose. PDF extraction emits a hard
  // line break at every visual line, hyphenates words split across lines, and
  // scatters runs of spaces — all of which read badly in the system prompt.
  const cleaned = text
    .replace(/\r\n?/g, "\n") // normalize line endings
    .replace(/[ \t]+/g, " ") // collapse runs of spaces
    .replace(/(\w)-\n(\w)/g, "$1$2") // re-join words hyphenated across a line break
    .replace(/([^\n])\n(?!\n)(?=\S)/g, "$1 ") // single line break inside a paragraph → space
    .replace(/[ \t]*\n[ \t]*/g, "\n") // trim whitespace around the kept breaks
    .replace(/\n{3,}/g, "\n\n") // cap blank runs at one blank line (paragraph break)
    .trim();

  if (!cleaned) {
    throw new Error("No selectable text found — this looks like a scanned PDF.");
  }

  const markdown = truncate(cleaned, MAX_SOURCE_CHARS);
  return { markdown, charCount: markdown.length };
}
