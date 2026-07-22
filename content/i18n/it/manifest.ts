import type { TranslationEntry } from "../_types";

// Review state for the Italian marketing pages. Every entry stays "draft" until
// a native speaker approves the rendered page, so every /it URL is a hard 404
// and Italian never appears in the language menu until then.
// See content/i18n/de/manifest.ts for the publish workflow.
export const it: TranslationEntry[] = [
  { pageId: "ui", status: "draft" },
  { pageId: "home", status: "draft" },
  { pageId: "pricing", status: "draft" },
];
