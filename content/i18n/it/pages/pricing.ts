// Italian pricing page copy. Status is "draft" in ../manifest.ts until a native
// speaker approves it - see content/i18n/it/manifest.ts.
//
// Register: Lei throughout, matching ./home.ts ("Inizi ora", "IA" for the
// technology). Plan names "Solo" and "Team" are product names and stay in
// English. Prices, plan ids and Stripe price ids live in lib/plans.ts; only
// display text is here. Amounts keep Italian separators (comma for decimals,
// dot for thousands) without ever changing a value.

import type { PricingCopy } from "../../_pricing-copy";

export const itPricing: PricingCopy = {
  guarantee: "Garanzia soddisfatti o rimborsati entro 30 giorni",
  h1: "Prezzi semplici e trasparenti",
  sub: "Scelga un piano e in pochi minuti il suo receptionist con IA risponde alle chiamate. Disdica quando vuole.",
  monthly: "Mensile",
  annually: "Annuale",
  perMonth: "/ mese",
  billedMonthly: "con fatturazione mensile",
  billedYearlyTemplate: "{total} con fatturazione annuale",
  includedLabel: "Incluso",
  featuresLabel: "Funzionalità",
  cta: "Inizi ora",
  ctaBusy: "Avvio in corso…",
  checkoutError: "Non è stato possibile avviare il pagamento.",
  vatNote:
    "Prezzi in EUR, IVA esclusa. I minuti extra sono fatturati a €0,09/min.",
  plans: {
    solo: {
      name: "Solo",
      tagline: "Ideale per 1-20 chiamate al giorno",
      included: [
        "1000 minuti - €0,09 per ogni minuto extra",
        "1.000 contatti",
        "Nessuna chiamata simultanea",
        "1 numero di telefono - €7/mese per ogni numero aggiuntivo",
        "Assistenti",
        "1 utente",
      ],
      features: ["20+ voci", "25+ lingue", "Agenda appuntamenti"],
    },
    team: {
      name: "Team",
      tagline: "Ideale per 20-100 chiamate al giorno",
      included: [
        "3000 minuti - €0,09 per ogni minuto extra",
        "3.000 contatti",
        "3 chiamate simultanee",
        "3 numeri di telefono - €7/mese per ogni numero aggiuntivo",
        "Assistenti",
        "Utenti",
      ],
      features: [
        "Tutto ciò che è incluso in Solo",
        "Collegamento del proprio SIP",
        "Chiamate in uscita e campagne",
      ],
    },
  },
};
