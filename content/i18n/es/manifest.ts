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
export const es: TranslationEntry[] = [
  { pageId: "ui", status: "draft" },
  { pageId: "home", status: "draft" },
  { pageId: "pricing", status: "draft" },
];
