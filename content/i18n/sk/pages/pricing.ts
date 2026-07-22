// Slovak pricing page copy. Status is "draft" in ../manifest.ts until a native
// speaker approves it - see content/i18n/sk/manifest.ts.
//
// Register: vykanie, same brand voice as ./home.ts. Plan names "Solo" and "Team"
// are product names and stay untranslated, as do currency symbols and all
// figures. Thousands use a space separator (1 000), the Slovak convention.
// {total} in billedYearlyTemplate is substituted at runtime and must stay
// verbatim.

import type { PricingCopy } from "../../_pricing-copy";

export const skPricing: PricingCopy = {
  guarantee: "Záruka vrátenia peňazí do 30 dní",
  h1: "Jednoduchý a prehľadný cenník",
  sub: "Vyberte si plán a vaša AI recepcia dvíha hovory už o pár minút. Zrušiť môžete kedykoľvek.",
  monthly: "Mesačne",
  annually: "Ročne",
  perMonth: "/ mesiac",
  billedMonthly: "fakturované mesačne",
  billedYearlyTemplate: "{total} fakturované ročne",
  includedLabel: "V cene",
  featuresLabel: "Funkcie",
  cta: "Začnite hneď",
  ctaBusy: "Spúšťam…",
  checkoutError: "Platbu sa nepodarilo spustiť.",
  vatNote:
    "Ceny sú v EUR bez DPH. Minúty nad rámec plánu účtujeme po €0,09/min.",
  plans: {
    solo: {
      name: "Solo",
      tagline: "Vhodné pre 1-20 hovorov denne",
      included: [
        "1 000 minút - €0,09 za každú ďalšiu minútu",
        "1 000 kontaktov",
        "Bez súbežných hovorov",
        "1 telefónne číslo - €7/mes. za každé ďalšie",
        "Asistenti",
        "1 používateľ",
      ],
      features: ["20+ hlasov", "25+ jazykov", "Plánovač termínov"],
    },
    team: {
      name: "Team",
      tagline: "Vhodné pre 20-100 hovorov denne",
      included: [
        "3 000 minút - €0,09 za každú ďalšiu minútu",
        "3 000 kontaktov",
        "3 súbežné hovory",
        "3 telefónne čísla - €7/mes. za každé ďalšie",
        "Asistenti",
        "Používatelia",
      ],
      features: [
        "Všetko z plánu Solo",
        "Pripojenie vlastného SIP",
        "Odchádzajúce hovory a kampane",
      ],
    },
  },
};
