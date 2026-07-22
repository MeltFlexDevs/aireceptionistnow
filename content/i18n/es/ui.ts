// Spanish site chrome. Status is "draft" in ./manifest.ts until a native
// speaker approves it - see content/i18n/es/manifest.ts.
//
// Register: neutral international Spanish, matching ./pages/home.ts and
// ./pages/pricing.ts. "Empezar ahora" is the brand CTA on both pages and is
// reused verbatim (uppercased) for nav.startNow. "Precios" is the pricing page
// h1 wording. "Sectores" is the idiomatic Spanish for business verticals;
// "Industrias" is a false friend that reads as heavy industry.
//
// Nav labels are uppercase because the header styles them that way, matching
// ../en/ui.ts. Per RAE, uppercase Spanish keeps its diacritics - none of the
// chosen nav labels carry one, but the footer keeps "Información" accented.
//
// "AI Receptionist Now" is never translated. "Dashboard" is rendered as
// "PANEL": the loanword is understood, but "panel" is the standard Spanish
// product term and is 4 characters shorter, which matters in a fixed-height
// header sitting next to the CTA button.

import type { UiCopy } from "../_ui-copy";

export const esUi: UiCopy = {
  nav: {
    industries: "SECTORES",
    pricing: "PRECIOS",
    signIn: "ENTRAR",
    startNow: "EMPEZAR AHORA",
    dashboard: "PANEL",
    logout: "CERRAR SESIÓN",
  },
  footer: {
    resources: "Recursos",
    industries: "Sectores",
    compare: "Comparativas",
    aiInformation: "Información sobre IA",
    dataProtection: "Privacidad",
    language: "Idioma",
  },
};
