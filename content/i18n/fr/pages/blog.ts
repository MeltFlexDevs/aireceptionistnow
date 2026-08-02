// French blog chrome.
//
// Register: vous, matching ./home.ts and ./pricing.ts. "Standardiste IA" is the
// product term: it is what a French business searches for, where a literal
// "réceptionniste" reads as a hotel front desk.
//
// Typography note: the site's writing rule bans the em dash and smart quotes,
// so French guillemets and thin spaces are avoided too. Straight apostrophes
// only - they are escaped at the JSX call site, not here.

import type { BlogCopy } from "../../_blog-copy";

export const frBlog: BlogCopy = {
  index: {
    metaTitle: "Blog standardiste IA : guides et analyses",
    metaDescription:
      "Des notes honnêtes sur les standardistes IA, la gestion des appels et la prise de rendez-vous : ce que la technologie apporte vraiment à une TPE.",
    h1: "Depuis l'accueil",
    intro:
      "Accueil téléphonique par IA, gestion des appels et prise de rendez-vous, avec un regard honnête sur ce que la technologie peut, et ne peut pas, faire pour une petite entreprise.",
    breadcrumb: "Blog",
    home: "Accueil",
  },
  article: {
    allArticles: "Tous les articles",
    onThisPage: "Sur cette page",
    tableOfContents: "Sommaire",
    by: "Par",
    updated: "Mis à jour le",
    keepReading: "À lire ensuite",
  },
  prose: {
    keyTakeaways: "À retenir",
    faq: "Questions fréquentes",
    sources: "Sources",
  },
  cta: {
    headline: "Ne manquez plus jamais un appel",
    body: "Une standardiste IA qui répond 24h/24, prend les rendez-vous et vous envoie le résumé par SMS. Opérationnelle en 10 minutes.",
    button: "Commencer",
    busy: "Lancement…",
  },
};
