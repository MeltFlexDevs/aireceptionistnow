// Dutch blog chrome.
//
// Register: u, matching ./home.ts and ./pricing.ts. "Telefoonservice" is the
// answering-service term the Dutch market searches for; "AI-receptionist" keeps
// the hyphen, which is the Dutch convention for an initialism compound.

import type { BlogCopy } from "../../_blog-copy";

export const nlBlog: BlogCopy = {
  index: {
    metaTitle: "Blog AI-receptionist: gidsen en analyses",
    metaDescription:
      "Eerlijke notities over AI-receptionisten, gespreksafhandeling en het inplannen van afspraken: wat de techniek echt doet voor een klein bedrijf.",
    h1: "Vanaf de balie",
    intro:
      "Telefoonaanname met AI, gespreksafhandeling en het inplannen van afspraken, plus een eerlijke blik op wat de techniek wel en niet kan voor een klein bedrijf.",
    breadcrumb: "Blog",
    home: "Home",
  },
  article: {
    allArticles: "Alle artikelen",
    onThisPage: "Op deze pagina",
    tableOfContents: "Inhoudsopgave",
    by: "Door",
    updated: "Bijgewerkt op",
    keepReading: "Verder lezen",
  },
  prose: {
    keyTakeaways: "Kernpunten",
    faq: "Veelgestelde vragen",
    sources: "Bronnen",
  },
  cta: {
    headline: "Mis nooit meer een oproep",
    body: "Een AI-receptionist die 24/7 opneemt, afspraken inplant en u de samenvatting per sms stuurt. Binnen 10 minuten live.",
    button: "Nu starten",
    busy: "Bezig met starten…",
  },
};
