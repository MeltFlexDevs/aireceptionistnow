// Nederlandse site chrome. Status blijft "draft" in ./manifest.ts tot een
// moedertaalspreker de gerenderde pagina heeft goedgekeurd - zie
// content/i18n/nl/manifest.ts.
//
// Register: consequent u, dezelfde merkstem als ./pages/home.ts en
// ./pages/pricing.ts. De prijzenpagina heet "Eenvoudige, transparante prijzen",
// dus de navigatie zegt PRIJZEN (niet het smallere "Tarieven", dat in het
// Nederlands eerder naar de losse pakketten verwijst). "Branches" is het
// gangbare Nederlandse label voor het industries-begrip en is kort genoeg voor
// de header; "Sectoren" en "Bedrijfstakken" zijn langer en formeler.
//
// De CTA in de navigatie is "NU BEGINNEN" en hergebruikt exact de bewoording
// die pricing.ts ("cta") en home.ts useCases ("Nu beginnen") vandaag al tonen.
// Elf tekens tegenover negen in het Engels; het kortere "STARTEN" is afgewezen
// omdat het de terminologie zou breken met de twee pagina's die de knop nu al
// uitleveren.
//
// Navigatielabels staan in hoofdletters omdat de header ze zo opmaakt. Geen van
// de gekozen labels bevat een diakritisch teken, dus de Nederlandse conventie
// (accenten blijven staan op hoofdletters: EEN vs EEN met accent) speelt hier
// niet. Wel relevant: het digrafische ij wordt in hoofdletters volledig
// gekapitaliseerd (IJ, niet Ij) - "PRIJZEN" staat al voluit in kapitalen, dus
// dat is automatisch goed. "Dashboard" blijft het leenwoord: dat is de normale
// term in Nederlandse SaaS-producten en "Overzicht" zou vager zijn en afwijken
// van de product-UI. "AI Receptionist Now" wordt nooit vertaald.
//
// De footer blijft zinsnotatie. De privacylink heet "Privacy", het gangbare
// Nederlandse footerlabel, in lijn met home.ts dat de volledige tekst
// "privacyverklaring" noemt. Correcte Unicode-diakriet, alleen rechte
// ASCII-apostrofs.

import type { UiCopy } from "../_ui-copy";

export const nlUi: UiCopy = {
  nav: {
    industries: "BRANCHES",
    pricing: "PRIJZEN",
    signIn: "INLOGGEN",
    startNow: "NU BEGINNEN",
    dashboard: "DASHBOARD",
    logout: "UITLOGGEN",
  },
  notFound: {
    metaTitle: "Pagina niet gevonden",
    title: "De pagina die u heeft gekozen is niet in gebruik.",
    body: "Verkeerd toestel, waarschijnlijk. Onze receptionist beantwoordt alles. Deze is voor onze rekening.",
    home: "Terug naar de receptie",
    didYouMean: "Bedoelde u",
    or: "of",
    pricing: "Prijzen",
  },
  footer: {
    resources: "Bronnen",
    industries: "Branches",
    compare: "Vergelijken",
    aiInformation: "AI-informatie",
    dataProtection: "Privacy",
    terms: "Voorwaarden",
    support: "Support",
    blog: "Blog",
    answers: "Antwoorden",
    receptionist247: "AI-receptionist 24/7",
    askAi: "Vraag een AI naar AI Receptionist Now",
    askAiProvider: "Vraag {name} naar AI Receptionist Now",
    voicePartner: "Spraakpartner",
    gdprMark: "AVG",
    gdprCompliant: "AVG-conform",
    language: "Taal",
  },
  auth: {
    close: "Sluiten",
    welcome: "Welkom",
    defaultDescription: "Log in om uw AI-receptioniste te beheren",
    signupDescription: "Maak uw account aan om uw AI-receptioniste in te stellen",
    continueGoogle: "Doorgaan met Google",
    continueApple: "Doorgaan met Apple",
    redirecting: "Doorverwijzen…",
    or: "of",
    emailLabel: "E-mail",
    required: "Dit veld is verplicht.",
    emailInvalid: "Voer een geldig e-mailadres in.",
    continueEmail: "Doorgaan met e-mail",
    sendingCode: "Code verzenden…",
    privacy: "Uw gegevens zijn veilig, beschermd en volledig privé.",
    codeTitle: "Voer uw code in",
    codeSent: "We hebben een code van 6 cijfers gestuurd naar {email}.",
    codePattern: "Voer de code van 6 cijfers in.",
    verify: "Verifiëren en doorgaan",
    verifying: "Verifiëren…",
    differentEmail: "Ander e-mailadres gebruiken",
    errors: {
      invalidCode: "De code is onjuist of verlopen. Controleer de code of vraag een nieuwe aan.",
      rateLimited: "Te veel pogingen. Wacht enkele minuten en probeer het opnieuw.",
      invalidEmail: "Voer een geldig e-mailadres in.",
      notConfigured: "Inloggen is nog niet ingesteld.",
      generic: "Er is iets misgegaan. Probeer het opnieuw.",
    },
  },
};
