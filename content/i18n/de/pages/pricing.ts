// German pricing page copy. Status is "draft" in ../manifest.ts until a native
// speaker approves it - see content/i18n/de/manifest.ts.
//
// Register: Sie throughout, matching de/pages/home.ts. Product terms follow the
// home page: "KI-Telefonassistent", "Tarif", "Rufnummer", "Jetzt starten".
// Plan names "Solo" and "Team" are product names and stay untranslated, as are
// the currency VALUES (EUR, 0.09, 7) and the {total} token. Only the separators
// follow German convention (0,09 / 1.000), matching de/pages/home.ts ("4,8 von 5").

import type { PricingCopy } from "../../_pricing-copy";

export const dePricing: PricingCopy = {
  guarantee: "30 Tage Geld-zurück-Garantie",
  h1: "Einfache, transparente Preise",
  sub: "Wählen Sie einen Tarif und Ihr KI-Telefonassistent nimmt schon nach wenigen Minuten Anrufe an. Jederzeit kündbar.",
  monthly: "Monatlich",
  annually: "Jährlich",
  perMonth: "/ Monat",
  billedMonthly: "monatlich abgerechnet",
  billedYearlyTemplate: "{total} jährlich abgerechnet",
  includedLabel: "Enthalten",
  featuresLabel: "Funktionen",
  cta: "Jetzt starten",
  ctaBusy: "Wird gestartet...",
  checkoutError: "Bezahlvorgang konnte nicht gestartet werden.",
  vatNote: "Preise in EUR, zzgl. MwSt. Zusätzliche Minuten werden mit €0,09/Min. abgerechnet.",
  plans: {
    solo: {
      name: "Solo",
      tagline: "Ideal für 1-20 Anrufe pro Tag",
      included: [
        "1.000 Minuten - €0,09 je zusätzliche Minute",
        "1.000 Kontakte",
        "Keine gleichzeitigen Anrufe",
        "1 Rufnummer - €7/Monat je weitere",
        "Assistenten",
        "1 Nutzer",
      ],
      features: ["20+ Stimmen", "25+ Sprachen", "Terminplaner"],
    },
    team: {
      name: "Team",
      tagline: "Ideal für 20-100 Anrufe pro Tag",
      included: [
        "3.000 Minuten - €0,09 je zusätzliche Minute",
        "3.000 Kontakte",
        "3 gleichzeitige Anrufe",
        "3 Rufnummern - €7/Monat je weitere",
        "Assistenten",
        "Nutzer",
      ],
      features: [
        "Alles aus Solo",
        "Eigenes SIP anbinden",
        "Ausgehende Anrufe & Kampagnen",
      ],
    },
  },
};
