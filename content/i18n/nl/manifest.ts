import type { TranslationEntry } from "../_types";

// Review state for the nl marketing pages.
// See content/i18n/de/manifest.ts for the publish workflow.
//
// PUBLISHED 2026-07-27 without a native-speaker read - see
// content/i18n/de/manifest.ts for the decision and its caveat.
export const nl: TranslationEntry[] = [
  { pageId: "ui", status: "reviewed", reviewedAt: "2026-07-27" },
  { pageId: "home", status: "reviewed", reviewedAt: "2026-07-27" },
  { pageId: "pricing", status: "reviewed", reviewedAt: "2026-07-27" },
  // The blog section gate: chrome + index + all 35 articles in
  // content/i18n/nl/blog. One entry, not 35 - see lib/i18n/marketing/blog-nav.ts
  // for why individual articles are resolved from the registry instead.
  //
  // PUBLISHED 2026-08-02. Same trade, and the same honest caveat, as the home
  // and pricing entries above: the articles were machine-translated from the
  // English originals and verified structurally (no dropped sections, links or
  // citations; US legal references remapped to the GDPR; 911 remapped to 112),
  // but only sk was read end to end by a native speaker. Flipping this one line
  // back to "draft" 404s all 35 URLs in that locale again.
  { pageId: "blog", status: "reviewed", reviewedAt: "2026-08-02" },
];
