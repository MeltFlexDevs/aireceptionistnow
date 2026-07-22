import type { LocaleOption } from "@/lib/i18n/marketing/switcher";
import { LocaleMenu, type LocaleMenuItem } from "./LocaleMenu";

// Marketing language menu. Same appearance as the dashboard topbar switcher
// (both render LocaleMenu), but each locale is a separate URL rather than a
// cookie flip, so the items are real links.
//
// `options` is computed on the server from the review manifest and passed down,
// so this client component never imports the publish gate - and only locales
// with an approved translation of THIS page are ever offered.
export default function LocaleSwitcher({
  options,
  label = "Language",
}: {
  options: LocaleOption[];
  /** Accessible name for the menu; localized by the caller. */
  label?: string;
}) {
  const items: LocaleMenuItem[] = options.map((o) => ({
    code: o.locale,
    label: o.label,
    flag: o.flag,
    current: o.current,
    href: o.href,
  }));

  return (
    <LocaleMenu
      items={items}
      label={label}
      triggerClassName="press flex h-10 items-center gap-1.5 rounded-full border border-neutral-900/15 px-3 text-xs text-neutral-800 hover:bg-neutral-900/5 sm:h-8 sm:px-2.5"
    />
  );
}
