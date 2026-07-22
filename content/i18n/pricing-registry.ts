import type { MarketingLocale } from "@/lib/i18n/marketing/locales";
import type { PricingCopy } from "./_pricing-copy";
import { dePricing } from "./de/pages/pricing";
import { esPricing } from "./es/pages/pricing";
import { frPricing } from "./fr/pages/pricing";
import { itPricing } from "./it/pages/pricing";
import { nlPricing } from "./nl/pages/pricing";
import { ptPricing } from "./pt/pages/pricing";
import { skPricing } from "./sk/pages/pricing";

// A total Record: adding a locale to MARKETING_LOCALES without adding its
// pricing copy is a compile error, rather than a page that silently renders
// English under a localized URL.
export const PRICING_COPY: Record<MarketingLocale, PricingCopy> = {
  es: esPricing,
  de: dePricing,
  fr: frPricing,
  sk: skPricing,
  it: itPricing,
  pt: ptPricing,
  nl: nlPricing,
};
