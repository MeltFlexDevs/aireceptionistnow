// Slovak site chrome. Status is "draft" in ./manifest.ts until a native speaker
// approves it - see content/i18n/sk/manifest.ts.
//
// Register: vykanie, same brand voice as ./pages/home.ts and ./pages/pricing.ts.
// "ZAČNITE HNEĎ" is lifted verbatim from the CTA those pages already use
// (skHome.useCases.cta, skPricing.cta) so the header button and the in-page
// buttons cannot drift. "CENNÍK" matches skPricing.h1 ("Jednoduchý a prehľadný
// cenník").
//
// Uppercase: Slovak keeps diacritics on capital letters (CENNÍK, ZAČNITE HNEĎ,
// PRIHLÁSENIE, ODVETVIA) - dropping them would be a spelling error, not a style
// choice, so they are kept.
//
// "Dashboard" stays untranslated: it is the ordinary loanword in Slovak SaaS
// products, and it keeps the nav item the same width as the English original.
//
// "PRIHLÁSENIE" (noun) is used instead of the verb phrase "PRIHLÁSIŤ SA" - both
// are idiomatic in Slovak nav, and the noun is a character shorter next to an
// already-long CTA.

import type { UiCopy } from "../_ui-copy";

export const skUi: UiCopy = {
  nav: {
    industries: "ODVETVIA",
    pricing: "CENNÍK",
    signIn: "PRIHLÁSENIE",
    startNow: "ZAČNITE HNEĎ",
    dashboard: "DASHBOARD",
    logout: "ODHLÁSIŤ SA",
  },
  notFound: {
    metaTitle: "Stránka sa nenašla",
    title: "Volaná stránka neexistuje.",
    body: "Asi zlá klapka. Naša recepčná zdvihne každý hovor. Tento ide na nás.",
    home: "Späť na recepciu",
    didYouMean: "Mysleli ste",
    or: "alebo",
    pricing: "Cenník",
  },
  footer: {
    resources: "Zdroje",
    industries: "Odvetvia",
    compare: "Porovnanie",
    aiInformation: "Informácie o AI",
    dataProtection: "Ochrana osobných údajov",
    terms: "Podmienky",
    support: "Podpora",
    blog: "Blog",
    answers: "Odpovede",
    receptionist247: "AI recepčná 24/7",
    askAi: "Opýtajte sa AI na AI Receptionist Now",
    askAiProvider: "Opýtajte sa {name} na AI Receptionist Now",
    voicePartner: "Hlasový partner",
    gdprMark: "GDPR",
    gdprCompliant: "V súlade s GDPR",
    language: "Jazyk",
  },
  auth: {
    close: "Zavrieť",
    welcome: "Vitajte",
    defaultDescription: "Prihláste sa a spravujte svoju virtuálnu asistentku s AI",
    signupDescription: "Vytvorte si účet a nastavte svoju virtuálnu asistentku s AI",
    continueGoogle: "Pokračovať cez Google",
    continueApple: "Pokračovať cez Apple",
    redirecting: "Presmerovanie…",
    or: "alebo",
    emailLabel: "E-mail",
    required: "Toto pole je povinné.",
    emailInvalid: "Zadajte platnú e-mailovú adresu.",
    continueEmail: "Pokračovať e-mailom",
    sendingCode: "Odosielam kód…",
    privacy: "Vaše údaje sú v bezpečí, chránené a úplne súkromné.",
    codeTitle: "Zadajte kód",
    codeSent: "Poslali sme 6-miestny kód na {email}.",
    codePattern: "Zadajte 6-miestny kód.",
    verify: "Overiť a pokračovať",
    verifying: "Overujem…",
    differentEmail: "Použiť iný e-mail",
    errors: {
      invalidCode: "Kód je nesprávny alebo vypršal. Skontrolujte ho alebo si vyžiadajte nový.",
      rateLimited: "Príliš veľa pokusov. Chvíľu počkajte a skúste to znova.",
      invalidEmail: "Zadajte platnú e-mailovú adresu.",
      notConfigured: "Prihlásenie zatiaľ nie je nastavené.",
      generic: "Niečo sa pokazilo. Skúste to znova.",
    },
  },
};
