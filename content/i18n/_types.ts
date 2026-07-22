// Review state for localized marketing pages.
//
// This lives in git as TypeScript rather than a database because
// generateStaticParams runs at build time and must be hermetic and
// reproducible: what is routable has to be decidable from the commit alone.

export type TranslationStatus = "draft" | "in-review" | "reviewed";

// "ui" is the shared chrome (nav, footer, breadcrumbs, CTA labels). It is a
// hard dependency of every page: a perfectly translated article sitting inside
// an English header is exactly the half-translated leak this gate exists to
// prevent, so no page publishes in a locale whose ui is unreviewed.
export type PageId =
  | "ui"
  | "home"
  | "pricing"
  | "privacy-policy"
  | "industries"
  | "answers"
  | "blog"
  | "compare"
  | `industries/${string}`
  | `answers/${string}`
  | `blog/${string}`
  | `compare/${string}`;

export interface TranslationEntry {
  pageId: PageId;
  status: TranslationStatus;
  /** Required when status is "reviewed". */
  reviewedAt?: string;
  reviewer?: string;
}
