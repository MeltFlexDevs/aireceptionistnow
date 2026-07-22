// German site chrome. Status is "draft" in ./manifest.ts until a native speaker
// approves it - see content/i18n/de/manifest.ts.
//
// Register: Sie throughout, same brand voice as ./pages/home.ts and
// ./pages/pricing.ts. The pricing page headline is "Einfache, transparente
// Preise", so the nav says PREISE (not the narrower "Tarife", which the pricing
// page reserves for the individual plans). "Branchen" is the standard German
// label for the industries concept and is short enough for the header.
//
// The nav CTA is "JETZT STARTEN", reusing the exact CTA wording already shared
// by pricing.ts ("cta") and home.ts useCases/footerCta ("Jetzt starten"). It is
// 13 chars vs 9 in English; the shorter "STARTEN" was rejected because it would
// break terminology with the two pages that ship the button today.
//
// Nav labels are uppercase because the header styles them that way. German
// convention keeps umlaut diacritics on capitals (AE -> Ä, not A) and expands
// "ß" to "SS" - but none of the five chosen nav labels contain an umlaut or an
// eszett, so the question does not arise. "Dashboard" is kept as the loanword:
// it is the normal term in German SaaS products and "Übersicht" would be both
// vaguer and inconsistent with the product UI. "AI Receptionist Now" is never
// translated.
//
// Footer stays sentence case. The privacy link is "Datenschutz", the
// conventional German label, consistent with home.ts which already says
// "Datenschutzerklärung" for the full policy. Proper Unicode diacritics,
// straight ASCII apostrophes only.

import type { UiCopy } from "../_ui-copy";

export const deUi: UiCopy = {
  nav: {
    industries: "BRANCHEN",
    pricing: "PREISE",
    signIn: "ANMELDEN",
    startNow: "JETZT STARTEN",
    dashboard: "DASHBOARD",
    logout: "ABMELDEN",
  },
  footer: {
    resources: "Ressourcen",
    industries: "Branchen",
    compare: "Vergleiche",
    aiInformation: "KI-Informationen",
    dataProtection: "Datenschutz",
    language: "Sprache",
  },
};
