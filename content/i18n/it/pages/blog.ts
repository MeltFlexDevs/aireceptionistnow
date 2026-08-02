// Italian blog chrome.
//
// Register: lei, matching ./home.ts and ./pricing.ts. "Receptionist AI" is kept
// as the product term - it is what the Italian market searches for, and
// "centralinista" carries a switchboard-operator connotation the product is not.

import type { BlogCopy } from "../../_blog-copy";

export const itBlog: BlogCopy = {
  index: {
    metaTitle: "Blog receptionist AI: guide e analisi",
    metaDescription:
      "Note oneste su receptionist telefonici AI, gestione delle chiamate e prenotazione appuntamenti: cosa fa davvero questa tecnologia per una piccola impresa.",
    h1: "Dalla reception",
    intro:
      "Risposta telefonica con AI, gestione delle chiamate e prenotazione appuntamenti, più uno sguardo onesto su cosa la tecnologia può e non può fare per una piccola impresa.",
    breadcrumb: "Blog",
    home: "Home",
  },
  article: {
    allArticles: "Tutti gli articoli",
    onThisPage: "In questa pagina",
    tableOfContents: "Indice",
    by: "Di",
    updated: "Aggiornato il",
    keepReading: "Continua a leggere",
  },
  prose: {
    keyTakeaways: "Punti chiave",
    faq: "Domande frequenti",
    sources: "Fonti",
  },
  cta: {
    headline: "Non perda più una chiamata",
    body: "Un receptionist AI che risponde 24 ore su 24, prenota gli appuntamenti e le manda il riepilogo via SMS. Attivo in 10 minuti.",
    button: "Inizia ora",
    busy: "Avvio…",
  },
};
