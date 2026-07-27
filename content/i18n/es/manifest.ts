import type { TranslationEntry } from "../_types";

// Review state for the es marketing pages.
//
// A page becomes publicly routable, sitemapped, hreflang-linked and visible in
// the locale switcher the moment its status here flips to "reviewed". That flip
// is the single atomic publish action - do not set it without a native speaker
// having read the rendered page.
//
// "ui" gates the whole locale: no page publishes while the shared chrome
// (nav, footer, CTA labels) is unreviewed.
//
// PUBLISHED 2026-07-27 without a native-speaker read - see
// content/i18n/de/manifest.ts for the decision and its caveat.
export const es: TranslationEntry[] = [
  { pageId: "ui", status: "reviewed", reviewedAt: "2026-07-27" },
  { pageId: "home", status: "reviewed", reviewedAt: "2026-07-27" },
  { pageId: "pricing", status: "reviewed", reviewedAt: "2026-07-27" },
];
