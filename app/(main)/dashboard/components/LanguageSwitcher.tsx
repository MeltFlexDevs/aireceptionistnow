"use client";

import { LOCALES, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { LocaleMenu, type LocaleMenuItem } from "@/app/components/LocaleMenu";
import { Spinner } from "../icons";

// Appearance lives in LocaleMenu, shared with the marketing header. This keeps
// the dashboard's behaviour: an instant client-side switch, with every locale
// always available because the dashboard dictionaries are complete.
export function LanguageSwitcher() {
  const { t, locale, setLocale, preloadLocale, pending } = useI18n();

  const items: LocaleMenuItem[] = LOCALES.map((l) => ({
    code: l.code,
    label: l.label,
    flag: l.flag,
    current: l.code === locale,
    // applies instantly on the client; the server syncs in the background
    onSelect: () => setLocale(l.code as Locale),
  }));

  // Warm every dictionary chunk (a few KB each) so the switch itself is instant.
  const preloadAll = () => {
    for (const l of LOCALES) preloadLocale(l.code);
  };

  return (
    <LocaleMenu
      items={items}
      label={t.topbar.language}
      onOpen={preloadAll}
      trailing={
        pending ? (
          <Spinner className="h-3 w-3 animate-spin text-neutral-400" />
        ) : undefined
      }
    />
  );
}
