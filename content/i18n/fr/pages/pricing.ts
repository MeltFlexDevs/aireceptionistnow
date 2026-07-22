// French pricing page copy. Status is "draft" in ../manifest.ts until a native
// speaker approves it - see content/i18n/fr/manifest.ts.
//
// Register: vouvoiement, same brand voice as ./home.ts ("standardiste IA",
// "Commencer maintenant"). VAT is rendered as TVA. Plan names Solo and Team are
// product names and stay in English. Amounts, currency symbols and the {total}
// token are never touched; only the thousands separator follows the French
// convention (space). Full Unicode diacritics, straight ASCII apostrophes only.

import type { PricingCopy } from "../../_pricing-copy";

export const frPricing: PricingCopy = {
  guarantee: "Satisfait ou remboursé sous 30 jours",
  h1: "Une tarification simple et transparente",
  sub: "Choisissez une formule et votre standardiste IA répond à vos appels en quelques minutes. Résiliable à tout moment.",
  monthly: "Mensuel",
  annually: "Annuel",
  perMonth: "/ mois",
  billedMonthly: "facturation mensuelle",
  billedYearlyTemplate: "facturation annuelle de {total}",
  includedLabel: "Inclus",
  featuresLabel: "Fonctionnalités",
  cta: "Commencer maintenant",
  ctaBusy: "Lancement...",
  checkoutError: "Impossible de lancer le paiement.",
  vatNote:
    "Tarifs en EUR, hors TVA. Minutes supplémentaires facturées à €0,09/min.",
  plans: {
    solo: {
      name: "Solo",
      tagline: "Idéal pour 1 à 20 appels par jour",
      included: [
        "1 000 minutes - €0,09 par minute supplémentaire",
        "1 000 contacts",
        "Pas d'appels simultanés",
        "1 numéro de téléphone - €7/mois par numéro supplémentaire",
        "Assistants",
        "1 utilisateur",
      ],
      features: ["Plus de 20 voix", "Plus de 25 langues", "Prise de rendez-vous"],
    },
    team: {
      name: "Team",
      tagline: "Idéal pour 20 à 100 appels par jour",
      included: [
        "3 000 minutes - €0,09 par minute supplémentaire",
        "3 000 contacts",
        "3 appels simultanés",
        "3 numéros de téléphone - €7/mois par numéro supplémentaire",
        "Assistants",
        "Utilisateurs",
      ],
      features: [
        "Tout ce qui est inclus dans Solo",
        "Connectez votre propre SIP",
        "Appels sortants et campagnes",
      ],
    },
  },
};
