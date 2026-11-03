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
  notFound: {
    metaTitle: "Pagina non trovata",
    title: "La pagina chiamata è inesistente.",
    body: "Interno sbagliato, probabilmente. La nostra receptionist risponde a tutto. Questa la offriamo noi.",
    home: "Torni alla reception",
    didYouMean: "Forse cercava",
    or: "o",
    pricing: "Prezzi",
  },
  footer: {
    resources: "Risorse",
    industries: "Settori",
    compare: "Confronti",
    aiInformation: "Informazioni sull'IA",
    dataProtection: "Privacy",
    terms: "Termini",
    support: "Assistenza",
    blog: "Blog",
    answers: "Risposte",
    receptionist247: "Receptionist IA 24/7",
    askAi: "Chieda a un'IA di AI Receptionist Now",
    askAiProvider: "Chieda a {name} di AI Receptionist Now",
    voicePartner: "Partner vocale",
    gdprMark: "GDPR",
    gdprCompliant: "Conforme al GDPR",
    language: "Lingua",
  },
  auth: {
    close: "Chiudi",
    welcome: "Benvenuto",
    defaultDescription: "Acceda per gestire il suo receptionist con IA",
    signupDescription: "Crei il suo account per configurare il suo receptionist con IA",
    continueGoogle: "Continua con Google",
    continueApple: "Continua con Apple",
    redirecting: "Reindirizzamento…",
    or: "oppure",
    emailLabel: "E-mail",
    required: "Questo campo è obbligatorio.",
    emailInvalid: "Inserisca un indirizzo e-mail valido.",
    continueEmail: "Continua con l'e-mail",
    sendingCode: "Invio del codice…",
    privacy: "I suoi dati sono al sicuro, protetti e completamente privati.",
    codeTitle: "Inserisca il codice",
    codeSent: "Abbiamo inviato un codice di 6 cifre a {email}.",
    codePattern: "Inserisca il codice di 6 cifre.",
    verify: "Verifica e continua",
    verifying: "Verifica in corso…",
    differentEmail: "Usa un'altra e-mail",
    errors: {
      invalidCode: "Il codice non è corretto o è scaduto. Lo controlli o ne richieda uno nuovo.",
      rateLimited: "Troppi tentativi. Attenda qualche minuto e riprovi.",
      invalidEmail: "Inserisca un indirizzo e-mail valido.",
      notConfigured: "L'accesso non è ancora configurato.",
      generic: "Qualcosa è andato storto. Riprovi.",
    },
  },
};
