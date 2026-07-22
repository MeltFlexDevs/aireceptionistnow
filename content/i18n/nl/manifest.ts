import type { TranslationEntry } from "../_types";

// Review state for the nl marketing pages. Draft until a native speaker reads
// the rendered page, so every nl URL stays a hard 404 and nl never appears in
// the language menu until the status flips to "reviewed".
// See content/i18n/de/manifest.ts for the publish workflow.
export const nl: TranslationEntry[] = [
  { pageId: "ui", status: "draft" },
  { pageId: "home", status: "draft" },
  { pageId: "pricing", status: "draft" },
];
