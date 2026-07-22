import type { TranslationEntry } from "../_types";

// Review state for the German marketing pages.
//
// A page becomes publicly routable, sitemapped, hreflang-linked and visible in
// the locale switcher the moment its status flips to "reviewed". That flip is
// the single atomic publish action - do not set it without a native speaker
// having read the rendered page.
//
// To review locally: NEXT_PUBLIC_I18N_PREVIEW=1 npm run dev, then open /de.
// Preview also sends X-Robots-Tag: noindex on every route.
export const de: TranslationEntry[] = [
  { pageId: "ui", status: "draft" },
  { pageId: "home", status: "draft" },
  { pageId: "pricing", status: "draft" },
];
