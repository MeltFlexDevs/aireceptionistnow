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
  notFound: {
    metaTitle: "Seite nicht gefunden",
    title: "Kein Anschluss unter dieser Seite.",
    body: "Wahrscheinlich die falsche Durchwahl. Unsere Rezeption nimmt jeden Anruf an. Dieser geht auf uns.",
    home: "Zurück zur Rezeption",
    didYouMean: "Meinten Sie",
    or: "oder",
    pricing: "Preise",
  },
  footer: {
    resources: "Ressourcen",
    industries: "Branchen",
    compare: "Vergleiche",
    aiInformation: "KI-Informationen",
    dataProtection: "Datenschutz",
    terms: "AGB",
    support: "Support",
    blog: "Blog",
    answers: "Antworten",
    receptionist247: "24/7 KI-Telefonassistent",
    askAi: "Fragen Sie eine KI nach AI Receptionist Now",
    askAiProvider: "Fragen Sie {name} nach AI Receptionist Now",
    voicePartner: "Sprachpartner",
    gdprMark: "DSGVO",
    gdprCompliant: "DSGVO-konform",
    language: "Sprache",
  },
  auth: {
    close: "Schließen",
    welcome: "Willkommen",
    defaultDescription: "Melden Sie sich an, um Ihren KI-Telefonassistenten zu verwalten",
    signupDescription: "Erstellen Sie Ihr Konto, um Ihren KI-Telefonassistenten einzurichten",
    continueGoogle: "Weiter mit Google",
    continueApple: "Weiter mit Apple",
    redirecting: "Weiterleitung…",
    or: "oder",
    emailLabel: "E-Mail",
    required: "Dieses Feld ist erforderlich.",
    emailInvalid: "Geben Sie eine gültige E-Mail-Adresse ein.",
    continueEmail: "Weiter mit E-Mail",
    sendingCode: "Code wird gesendet…",
    privacy: "Ihre Daten sind sicher, geschützt und vollständig privat.",
    codeTitle: "Code eingeben",
    codeSent: "Wir haben einen 6-stelligen Code an {email} gesendet.",
    codePattern: "Geben Sie den 6-stelligen Code ein.",
    verify: "Bestätigen und fortfahren",
    verifying: "Wird geprüft…",
    differentEmail: "Andere E-Mail-Adresse verwenden",
    errors: {
      invalidCode: "Der Code ist falsch oder abgelaufen. Prüfen Sie ihn oder fordern Sie einen neuen an.",
      rateLimited: "Zu viele Versuche. Warten Sie einige Minuten und versuchen Sie es erneut.",
      invalidEmail: "Geben Sie eine gültige E-Mail-Adresse ein.",
      notConfigured: "Die Anmeldung ist noch nicht eingerichtet.",
      generic: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
    },
  },
};
