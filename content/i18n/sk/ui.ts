// Slovak site chrome. Status is "draft" in ./manifest.ts until a native speaker
// approves it - see content/i18n/sk/manifest.ts.
//
// Register: vykanie, same brand voice as ./pages/home.ts and ./pages/pricing.ts.
// "ZAČNITE HNEĎ" is lifted verbatim from the CTA those pages already use
// (skHome.useCases.cta, skPricing.cta) so the header button and the in-page
// buttons cannot drift. "CENNÍK" matches skPricing.h1 ("Jednoduchý a prehľadný
// cenník").
//
// Uppercase: Slovak keeps diacritics on capital letters (CENNÍK, ZAČNITE HNEĎ,
// PRIHLÁSENIE, ODVETVIA) - dropping them would be a spelling error, not a style
// choice, so they are kept.
//
// "Dashboard" stays untranslated: it is the ordinary loanword in Slovak SaaS
// products, and it keeps the nav item the same width as the English original.
//
// "PRIHLÁSENIE" (noun) is used instead of the verb phrase "PRIHLÁSIŤ SA" - both
// are idiomatic in Slovak nav, and the noun is a character shorter next to an
// already-long CTA.

import type { UiCopy } from "../_ui-copy";

export const skUi: UiCopy = {
  nav: {
    industries: "ODVETVIA",
    pricing: "CENNÍK",
    signIn: "PRIHLÁSENIE",
    startNow: "ZAČNITE HNEĎ",
    dashboard: "DASHBOARD",
    logout: "ODHLÁSIŤ SA",
  },
  footer: {
    resources: "Zdroje",
    industries: "Odvetvia",
    compare: "Porovnanie",
    aiInformation: "Informácie o AI",
    dataProtection: "Ochrana osobných údajov",
    language: "Jazyk",
  },
};
