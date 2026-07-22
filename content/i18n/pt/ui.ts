// Portuguese (pt-PT) site chrome. Status is "draft" in ./manifest.ts until a
// native speaker approves it - see content/i18n/pt/manifest.ts.
//
// Register: European Portuguese, same formal marketing voice and post-AO90
// spelling as ./pages/home.ts and ./pages/pricing.ts ("Preços", "Começar
// agora", "idioma", "privacidade").
//
// Uppercase nav: Portuguese keeps its diacritics in uppercase text, so PREÇOS
// and COMEÇAR AGORA carry the cedilla - dropping it would read as a typo, not
// as a style choice.
//
// "Dashboard" stays untranslated: it is the normal loanword in Portuguese SaaS
// UI and it is also the label the product itself uses. "AI Receptionist Now"
// is a product name and is never translated.

import type { UiCopy } from "../_ui-copy";

export const ptUi: UiCopy = {
  nav: {
    industries: "SETORES",
    pricing: "PREÇOS",
    signIn: "ENTRAR",
    startNow: "COMEÇAR AGORA",
    dashboard: "DASHBOARD",
    logout: "SAIR",
  },
  footer: {
    resources: "Recursos",
    industries: "Setores",
    compare: "Comparar",
    aiInformation: "Informação sobre IA",
    dataProtection: "Privacidade",
    language: "Idioma",
  },
};
