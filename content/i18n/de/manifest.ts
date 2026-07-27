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
//
// PUBLISHED 2026-07-27 on the site owner's instruction. Until then every locale
// sat at "draft", so the whole app/[locale] tree was a hard 404 and the site had
// exactly one indexable language - the single largest cap on impressions.
//
// HONEST CAVEAT, recorded because this file is the audit trail: the copy is
// complete and reads as native prose, but only sk was read by a native speaker
// (the owner). de/es/fr/it/nl/pt are published ahead of that read. This is the
// deliberate trade the gate's comment above warns about, taken with eyes open.
// If a native speaker later finds the copy wrong, flipping the entry back to
// "draft" 404s the URL again in one commit - the gate makes that reversible.
export const de: TranslationEntry[] = [
  { pageId: "ui", status: "reviewed", reviewedAt: "2026-07-27" },
  { pageId: "home", status: "reviewed", reviewedAt: "2026-07-27" },
  { pageId: "pricing", status: "reviewed", reviewedAt: "2026-07-27" },
];
