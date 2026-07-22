// Italian site chrome. Status is "draft" in ./manifest.ts until a native
// speaker approves it - see content/i18n/it/manifest.ts.
//
// Register: Lei throughout, matching ./pages/home.ts and ./pages/pricing.ts.
// "INIZI ORA" is the uppercase form of the "Inizi ora" CTA those pages already
// use, so the header button and the in-page buttons read as one voice.
// "IA" is the technology term used across the Italian pages, never "AI",
// except inside the untranslated product name "AI Receptionist Now".
// "Dashboard" is kept as-is: it is the normal loanword in Italian product UI.
//
// Nav labels are uppercase because SiteHeader.tsx styles them that way. None of
// them carry a diacritic, but the Italian convention this file would follow is
// to KEEP accents in uppercase (E' is a typewriter workaround, not correct
// Italian) - relevant if a label is ever changed to an accented word.

import type { UiCopy } from "../_ui-copy";

export const itUi: UiCopy = {
  nav: {
    industries: "SETTORI",
    pricing: "PREZZI",
    signIn: "ACCEDI",
    startNow: "INIZI ORA",
    dashboard: "DASHBOARD",
    logout: "ESCI",
  },
  footer: {
    resources: "Risorse",
    industries: "Settori",
    compare: "Confronti",
    aiInformation: "Informazioni sull'IA",
    dataProtection: "Privacy",
    language: "Lingua",
  },
};
