import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { dictionaries } from "./dictionaries";
import type { Dictionary } from "./dictionaries/en";

// Server-side locale + dictionary access. cookies()/headers() are async in Next 15/16.
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (value && isLocale(value)) return value;
  // No explicit choice yet: default to the visitor's browser language.
  return negotiateFromHeader((await headers()).get("accept-language"));
}

// Pick the best supported locale from an Accept-Language header, matching on the
// base language subtag (e.g. "sk-SK" -> "sk"). Falls back to DEFAULT_LOCALE.
function negotiateFromHeader(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number.parseFloat(q.slice(2)) : 1;
      return {
        base: tag.trim().toLowerCase().split("-")[0],
        weight: Number.isFinite(weight) ? weight : 0,
      };
    })
    .filter((x) => x.base && x.base !== "*" && x.weight > 0)
    .sort((a, b) => b.weight - a.weight);
  for (const { base } of ranked) {
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}
