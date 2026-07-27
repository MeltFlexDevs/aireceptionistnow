import type { MarketingLocale } from "@/lib/i18n/marketing/locales";
import type { HomeCopy } from "./_home-copy";
import { deHome } from "./de/pages/home";
import { esHome } from "./es/pages/home";
import { frHome } from "./fr/pages/home";
import { itHome } from "./it/pages/home";
import { nlHome } from "./nl/pages/home";
import { ptHome } from "./pt/pages/home";
import { skHome } from "./sk/pages/home";

// Mirror of pricing-registry.ts, extracted from app/[locale]/page.tsx where this
// map used to live inline. Two reasons it moved: the pricing half was already a
// registry and the asymmetry was arbitrary, and a map buried in a route file
// cannot be imported by a test without dragging the whole page in. The meta
// budget assertions in lib/i18n/marketing/manifest.test.ts need exactly this.
//
// A total Record: adding a locale to MARKETING_LOCALES without adding its home
// copy is a compile error, rather than a page that silently renders English
// under a localized URL.
export const HOME_COPY: Record<MarketingLocale, HomeCopy> = {
  es: esHome,
  de: deHome,
  fr: frHome,
  sk: skHome,
  it: itHome,
  pt: ptHome,
  nl: nlHome,
};
