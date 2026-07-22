import type { PageId } from "@/content/i18n/_types";
import { LOCALES } from "@/lib/i18n/config";
import { pageIdToPath } from "./ids";
import type { ContentLocale } from "./locales";
import { localesFor } from "./manifest";

export interface LocaleOption {
  locale: ContentLocale;
  /** Display name, e.g. "Deutsch". */
  label: string;
  flag: string;
  href: string;
  current: boolean;
}

// Flags and labels come from the dashboard locale config, which is the single
// source of truth for how a language is presented. Duplicating them here is how
// the two menus would drift apart.
const META: Record<string, { label: string; flag: string }> = Object.fromEntries(
  LOCALES.map((l) => [l.code, { label: l.label, flag: l.flag }]),
);

/**
 * Options for the language menu on ONE page.
 *
 * Built from localesFor(pageId), not from the static locale list, so a locale
 * that has no reviewed version of THIS page never appears. That is what makes
 * the menu structurally incapable of producing a 404 or of sending a visitor to
 * a page that is still in English. This is the key difference from the
 * dashboard menu, where every locale is always available because the dashboard
 * dictionaries are complete.
 *
 * Returns [] when the page exists only in English, so callers can render
 * nothing rather than a dead one-item control.
 */
export function localeOptions(
  pageId: PageId,
  current: ContentLocale,
): LocaleOption[] {
  const translated = localesFor(pageId);
  if (translated.length === 0) return [];

  const path = pageIdToPath(pageId);
  const build = (locale: ContentLocale, href: string): LocaleOption => ({
    locale,
    label: META[locale]?.label ?? locale.toUpperCase(),
    flag: META[locale]?.flag ?? "",
    href,
    current: current === locale,
  });

  return [
    build("en", path),
    ...translated.map((locale) =>
      build(locale, `/${locale}${path === "/" ? "" : path}`),
    ),
  ];
}
