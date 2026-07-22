// French site chrome. Status is "draft" in ./manifest.ts until a native speaker
// approves it - see content/i18n/fr/manifest.ts.
//
// Register: vouvoiement, same brand voice as ./pages/home.ts and
// ./pages/pricing.ts. The pricing page calls the concept "tarification" /
// "Tarifs", so the nav says TARIFS. "Secteurs" is the standard French label for
// the industries concept and is far shorter than "Secteurs d'activite".
//
// Nav labels are uppercase because the header styles them that way. French
// typographic convention (Academie francaise, Imprimerie nationale) keeps
// diacritics on capitals, so accents would be preserved here - but none of the
// five chosen nav labels contain an accented letter, so the question does not
// arise. "Dashboard" is kept as the loanword: it is the normal term in French
// SaaS products and "Tableau de bord" (15 chars) would break the header.
// "AI Receptionist Now" is never translated.
//
// Footer stays sentence case. The privacy link is "Confidentialite" (with the
// accent), matching home.ts which already says "politique de confidentialite".
// Full Unicode diacritics, straight ASCII apostrophes only.

import type { UiCopy } from "../_ui-copy";

export const frUi: UiCopy = {
  nav: {
    industries: "SECTEURS",
    pricing: "TARIFS",
    signIn: "CONNEXION",
    startNow: "COMMENCER",
    dashboard: "DASHBOARD",
    logout: "DÉCONNEXION",
  },
  footer: {
    resources: "Ressources",
    industries: "Secteurs",
    compare: "Comparatifs",
    aiInformation: "Informations IA",
    dataProtection: "Confidentialité",
    language: "Langue",
  },
};
