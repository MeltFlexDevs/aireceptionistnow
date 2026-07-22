import type { TranslationEntry } from "../_types";

// Review state for the pt marketing pages. Empty until copy exists, so every
// pt URL is a hard 404 and pt never appears in the language menu.
// See content/i18n/de/manifest.ts for the publish workflow.
export const pt: TranslationEntry[] = [
  { pageId: "ui", status: "draft" },
  { pageId: "home", status: "draft" },
  { pageId: "pricing", status: "draft" },
];
