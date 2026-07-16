"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import { setLocaleAction } from "./actions";

interface I18n {
  t: Dictionary;
  locale: Locale;
  setLocale: (code: Locale) => void;
  /** True while a locale switch is refreshing the page. */
  pending: boolean;
}

const Ctx = createContext<I18n | null>(null);

// The server passes ONLY the active locale's dictionary. Bundling all locales
// client-side (the old approach) shipped ~8 unused dictionaries in the dashboard
// bundle; a switch now persists the cookie and refreshes, so server + client
// text update together from the new prop.
export function I18nProvider({
  value,
  children,
}: {
  value: { locale: Locale; dict: Dictionary };
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(code: Locale) {
    if (code === value.locale) return;
    startTransition(async () => {
      await setLocaleAction(code);
      router.refresh();
    });
  }

  return (
    <Ctx.Provider value={{ t: value.dict, locale: value.locale, setLocale: change, pending }}>
      {children}
    </Ctx.Provider>
  );
}

export function useI18n(): I18n {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

export function useT(): Dictionary {
  return useI18n().t;
}
