"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import { dictionaryLoaders } from "./dictionaries/loaders";
import { persistLocaleAction, setLocaleAction } from "./actions";

interface I18n {
  t: Dictionary;
  locale: Locale;
  setLocale: (code: Locale) => void;
  /** Warm a locale's dictionary chunk so the actual switch is instant. */
  preloadLocale: (code: Locale) => void;
  /** True while the background server refresh is in flight. */
  pending: boolean;
}

const Ctx = createContext<I18n | null>(null);

// Resolved dictionaries, so revisiting a locale never re-downloads its chunk.
const loadedDicts = new Map<Locale, Dictionary>();

const ONE_YEAR = 60 * 60 * 24 * 365;

// The locale cookie is not httpOnly, so the client writes it directly. That
// removes the server-action round-trip from the critical path: the refresh
// fired in the same tick already renders in the new locale.
function writeLocaleCookie(code: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

// A client-side switch, applied instantly while the server catches up. The
// override is honored while the server still renders a different locale and
// is dropped (asynchronously) the first time the server agrees, so a stale
// override can never resurface later.
interface Override {
  locale: Locale;
  dict: Dictionary;
}

// The server passes ONLY the active locale's dictionary - the other locales
// stay out of the initial bundle. A switch applies instantly on the client
// (client components re-render from the freshly imported dictionary chunk)
// while a background refresh brings server-rendered text in sync; the DB
// persistence happens off the critical path.
export function I18nProvider({
  value,
  children,
}: {
  value: { locale: Locale; dict: Dictionary };
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [override, setOverride] = useState<Override | null>(null);
  const switchSeq = useRef(0);
  const cookieFallbackFor = useRef<Locale | null>(null);

  loadedDicts.set(value.locale, value.dict);

  const active = override && override.locale !== value.locale ? override : null;
  const locale = active?.locale ?? value.locale;
  const t = active?.dict ?? value.dict;

  // The server caught up: retire the override (asynchronously - the rendered
  // output is already identical either way, and clearing it prevents an old
  // override from resurfacing if the server locale changes again later).
  useEffect(() => {
    if (!override || override.locale !== value.locale) return;
    const spent = override;
    const id = setTimeout(() => setOverride((prev) => (prev === spent ? null : prev)), 0);
    return () => clearTimeout(id);
  }, [override, value.locale]);

  // Keep the document language in sync for a11y and spellcheckers.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const preloadLocale = useCallback((code: Locale) => {
    if (loadedDicts.has(code)) return;
    // import() dedupes in-flight loads of the same chunk itself.
    dictionaryLoaders[code]()
      .then((dict) => loadedDicts.set(code, dict))
      .catch(() => {});
  }, []);

  const setLocale = useCallback(
    (code: Locale) => {
      if (code === locale) return;
      const seq = ++switchSeq.current;
      const apply = (dict: Dictionary) => {
        if (switchSeq.current === seq) setOverride({ locale: code, dict });
      };
      const cached = loadedDicts.get(code);
      if (cached) {
        apply(cached);
      } else {
        dictionaryLoaders[code]()
          .then((dict) => {
            loadedDicts.set(code, dict);
            apply(dict);
          })
          // Chunk failed to load: the background refresh still switches everything.
          .catch(() => {});
      }
      writeLocaleCookie(code);
      void persistLocaleAction(code);
      startTransition(() => router.refresh());
    },
    [router, locale],
  );

  // Safety net: the refresh finished but the server still renders the locale
  // we switched away from - the client-side cookie write didn't stick. Set it
  // via the server action once and refresh again.
  useEffect(() => {
    if (pending) return;
    if (!active) {
      cookieFallbackFor.current = null;
      return;
    }
    if (cookieFallbackFor.current === active.locale) return;
    cookieFallbackFor.current = active.locale;
    const code = active.locale;
    startTransition(async () => {
      await setLocaleAction(code);
      router.refresh();
    });
  }, [active, pending, router]);

  const ctx = useMemo(
    () => ({ t, locale, setLocale, preloadLocale, pending }),
    [t, locale, setLocale, preloadLocale, pending],
  );

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

export function useT(): Dictionary {
  return useI18n().t;
}
