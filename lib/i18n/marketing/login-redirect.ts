import { isMarketingLocale, type MarketingLocale } from "./locales";
import { isPublished } from "./manifest";

/**
 * Where a signed-out visitor lands to sign in: the home page in their language.
 *
 * The auth dialog opens from `?auth=login` on the marketing home, which is
 * localized (/sk, /de ...). A redirect to "/" would show the English dialog to
 * everyone. The locale comes from the `dash_locale` cookie, else the
 * Accept-Language header. Only a value in the locale list is used, so a raw
 * header value never reaches the path. An English visitor, or a locale whose
 * home is not published yet, gets "/".
 *
 * Pure and client-safe (no next/headers): the proxy, the onboarding layout and
 * server actions pass in the cookie and header values.
 */
export function loginHomePath(
  input: { cookieLocale?: string | null; acceptLanguage?: string | null },
  homePublished: (locale: MarketingLocale) => boolean = (l) => isPublished(l, "home"),
): string {
  const locale = pickLocale(input.cookieLocale, input.acceptLanguage);
  return locale && homePublished(locale) ? `/${locale}` : "/";
}

// "en" is a valid cookie value and means "stay on /", so it returns undefined.
function pickLocale(cookieLocale?: string | null, acceptLanguage?: string | null): MarketingLocale | undefined {
  if (cookieLocale) {
    const c = cookieLocale.trim().toLowerCase();
    if (c === "en") return undefined;
    if (isMarketingLocale(c)) return c;
    // An unknown cookie value is ignored, like lib/i18n/server.ts getLocale.
  }
  if (!acceptLanguage) return undefined;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number.parseFloat(q.slice(2)) : 1;
      return { base: tag.trim().toLowerCase().split("-")[0], weight: Number.isFinite(weight) ? weight : 0 };
    })
    .filter((x) => x.base && x.base !== "*" && x.weight > 0)
    .sort((a, b) => b.weight - a.weight);
  for (const { base } of ranked) {
    if (base === "en") return undefined;
    if (isMarketingLocale(base)) return base;
  }
  return undefined;
}
