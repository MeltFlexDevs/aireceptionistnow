// German blog chrome.
//
// Register: Sie, matching ./home.ts and ./pricing.ts. Terminology is inherited
// from those two files rather than invented here: the product is the
// "KI-Telefonassistent", the CTA is "Jetzt starten".
//
// metaTitle leads with the head term a German searcher types
// ("KI-Telefonassistent"), not with a translation of "From the front desk" -
// the h1 is a headline, the title tag has to earn the click.

import type { BlogCopy } from "../../_blog-copy";

export const deBlog: BlogCopy = {
  index: {
    metaTitle: "KI-Telefonassistent: Blog & Ratgeber",
    metaDescription:
      "Ehrliche Notizen zu KI-Telefonassistenten, Anrufannahme und Terminbuchung: was die Technik für kleine Unternehmen wirklich leistet.",
    h1: "Direkt vom Empfang",
    intro:
      "Telefonannahme per KI, Anrufbearbeitung und Terminbuchung, dazu ein ehrlicher Blick darauf, was die Technik für ein kleines Unternehmen kann und was nicht.",
    breadcrumb: "Blog",
    home: "Startseite",
  },
  article: {
    allArticles: "Alle Beiträge",
    onThisPage: "Auf dieser Seite",
    tableOfContents: "Inhaltsverzeichnis",
    by: "Von",
    updated: "Aktualisiert",
    keepReading: "Weiterlesen",
  },
  prose: {
    keyTakeaways: "Das Wichtigste in Kürze",
    faq: "Häufige Fragen",
    sources: "Quellen",
  },
  cta: {
    headline: "Nie wieder einen Anruf verpassen",
    body: "Ein KI-Telefonassistent, der rund um die Uhr abhebt, Termine bucht und Ihnen die Zusammenfassung per SMS schickt. In 10 Minuten startklar.",
    button: "Jetzt starten",
    busy: "Wird gestartet…",
  },
};
