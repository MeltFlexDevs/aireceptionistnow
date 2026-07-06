"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

// The dictionary + active locale, seeded once by the server in the dashboard
// layout. Client components read UI strings with useT(); server components call
// getDictionary() directly.
interface I18n {
  t: Dictionary;
  locale: Locale;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ value, children }: { value: I18n; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
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
