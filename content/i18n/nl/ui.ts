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
  footer: {
    resources: "Bronnen",
    industries: "Branches",
    compare: "Vergelijken",
    aiInformation: "AI-informatie",
    dataProtection: "Privacy",
    language: "Taal",
  },
};
