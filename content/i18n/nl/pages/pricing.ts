// Nederlandse copy voor de prijzenpagina. Status blijft "draft" in
// ../manifest.ts tot een moedertaalspreker de gerenderde pagina heeft
// goedgekeurd - zie content/i18n/nl/manifest.ts.
//
// Register: consequent u, gelijk aan ../pages/home.ts. Prijzen, plan-ids en
// Stripe-prijzen staan in lib/plans.ts en worden hier nooit vertaald. De
// pakketnamen "Solo" en "Team" zijn productnamen en blijven staan.

import type { PricingCopy } from "../../_pricing-copy";

export const nlPricing: PricingCopy = {
  guarantee: "30 dagen niet-goed-geld-terug-garantie",
  h1: "Eenvoudige, transparante prijzen",
  sub: "Kies een pakket en binnen enkele minuten neemt uw AI-receptioniste de gesprekken aan. Altijd opzegbaar.",
  monthly: "Maandelijks",
  annually: "Jaarlijks",
  perMonth: "/ maand",
  billedMonthly: "maandelijks gefactureerd",
  billedYearlyTemplate: "{total} jaarlijks gefactureerd",
  includedLabel: "Inbegrepen",
  featuresLabel: "Functies",
  cta: "Nu beginnen",
  ctaBusy: "Bezig met starten…",
  checkoutError: "Het afrekenen kon niet worden gestart.",
  vatNote:
    "Prijzen in EUR, excl. btw. Extra minuten worden gefactureerd tegen €0,09/min.",
  plans: {
    solo: {
      name: "Solo",
      tagline: "Geschikt voor 1-20 gesprekken per dag",
      included: [
        "1000 minuten - €0,09 per extra minuut",
        "1.000 contacten",
        "Geen gelijktijdige gesprekken",
        "1 telefoonnummer - €7/mnd per extra nummer",
        "Assistenten",
        "1 gebruiker",
      ],
      features: ["20+ stemmen", "25+ talen", "Afsprakenplanner"],
    },
    team: {
      name: "Team",
      tagline: "Geschikt voor 20-100 gesprekken per dag",
      included: [
        "3000 minuten - €0,09 per extra minuut",
        "3.000 contacten",
        "3 gelijktijdige gesprekken",
        "3 telefoonnummers - €7/mnd per extra nummer",
        "Assistenten",
        "Gebruikers",
      ],
      features: [
        "Alles uit Solo",
        "Eigen SIP koppelen",
        "Uitgaande gesprekken en campagnes",
      ],
    },
  },
};
