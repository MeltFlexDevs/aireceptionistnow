"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import { dictionaries } from "./dictionaries";
import { setLocaleAction } from "./actions";

// Active locale + dictionary, seeded once by the server (dashboard layout) and
// then owned client-side so switching is instant. Client components read UI
// strings with useT(); server components call getDictionary() directly.
interface I18n {
  t: Dictionary;
  locale: Locale;
  setLocale: (code: Locale) => void;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ value, children }: { value: { locale: Locale }; children: ReactNode }) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(value.locale);

  function change(code: Locale) {
    if (code === locale) return;
    setLocale(code); // instant: every useT() consumer re-renders from the bundled dict
    // Persist + let server-rendered page bodies catch up, without blocking the switch.
    setLocaleAction(code).then(() => router.refresh());
  }

  return (
    <Ctx.Provider value={{ t: dictionaries[locale], locale, setLocale: change }}>
      {children}
    </Ctx.Provider>
  );
}

export function useI18n(): I18n {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Shorthand: the message dictionary for the active locale. */
export function useT(): Dictionary {
  return useI18n().t;
}
