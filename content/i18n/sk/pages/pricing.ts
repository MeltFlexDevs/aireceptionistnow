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
  metaTitle: "Virtuálna asistentka s AI: cenník a plány bez viazanosti",
  metaDescription:
    "Plány Solo a Team virtuálnej asistentky s AI, s mesačnou alebo ročnou platbou so zľavou 15 %. Záruka vrátenia peňazí do 30 dní.",
  guarantee: "Záruka vrátenia peňazí do 30 dní",
  // H1 leads with the category term; the "jednoduchý a prehľadný" reassurance
  // moved into `sub`. "Virtuálna asistentka" matches ./home.ts.
  h1: "Cenník virtuálnej asistentky s AI",
  sub: "Jednoducho a prehľadne: vyberte si plán a vaša virtuálna asistentka s AI dvíha hovory už o pár minút. Zrušiť môžete kedykoľvek.",
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
