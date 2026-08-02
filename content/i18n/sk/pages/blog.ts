// Slovak blog chrome. This is the owner's own language and the home market of
// MeltFlex s.r.o., so it is the one locale where the wording here was read by a
// native speaker rather than published on trust.
//
// Register: vy/vykanie, matching ./home.ts and ./pricing.ts. The product is
// "AI recepčná"; "telefonická odkazová služba" is the answering-service term
// used in the article slugs.

import type { BlogCopy } from "../../_blog-copy";

export const skBlog: BlogCopy = {
  index: {
    metaTitle: "Blog o AI recepčnej: návody a analýzy",
    metaDescription:
      "Úprimné poznámky o AI recepčnej, preberaní hovorov a objednávaní termínov: čo táto technológia malej firme naozaj prinesie.",
    h1: "Priamo z recepcie",
    intro:
      "Preberanie hovorov pomocou AI, práca s hovormi a objednávanie termínov, k tomu úprimný pohľad na to, čo technológia malej firme dokáže a čo nie.",
    breadcrumb: "Blog",
    home: "Domov",
  },
  article: {
    allArticles: "Všetky články",
    onThisPage: "Na tejto stránke",
    tableOfContents: "Obsah",
    by: "Autor:",
    updated: "Aktualizované",
    keepReading: "Čítajte ďalej",
  },
  prose: {
    keyTakeaways: "Kľúčové body",
    faq: "Časté otázky",
    sources: "Zdroje",
  },
  cta: {
    headline: "Už nikdy nezmeškáte hovor",
    body: "AI recepčná, ktorá dvíha nonstop, objednáva termíny a zhrnutie vám pošle SMS-kou. Spustíte ju za 10 minút.",
    button: "Začať teraz",
    busy: "Spúšťam…",
  },
};
