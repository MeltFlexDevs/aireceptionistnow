// Portuguese blog chrome.
//
// European Portuguese, matching ./home.ts and ./pricing.ts: "rececionista" and
// "receção" without the c, "telemóvel" over "celular", EUR pricing. Register:
// você/formal third person.

import type { BlogCopy } from "../../_blog-copy";

export const ptBlog: BlogCopy = {
  index: {
    metaTitle: "Blog rececionista IA: guias e análises",
    metaDescription:
      "Notas honestas sobre rececionistas telefónicos com IA, gestão de chamadas e marcação de consultas: o que a tecnologia faz mesmo por uma pequena empresa.",
    h1: "Da receção",
    intro:
      "Atendimento telefónico com IA, gestão de chamadas e marcação de consultas, mais um olhar honesto sobre o que a tecnologia consegue e não consegue fazer por uma pequena empresa.",
    breadcrumb: "Blog",
    home: "Início",
  },
  article: {
    allArticles: "Todos os artigos",
    onThisPage: "Nesta página",
    tableOfContents: "Índice",
    by: "Por",
    updated: "Atualizado a",
    keepReading: "Continue a ler",
  },
  prose: {
    keyTakeaways: "Pontos principais",
    faq: "Perguntas frequentes",
    sources: "Fontes",
  },
  cta: {
    headline: "Nunca mais perca uma chamada",
    body: "Um rececionista com IA que atende 24 horas por dia, marca consultas e envia-lhe o resumo por SMS. A funcionar em 10 minutos.",
    button: "Começar agora",
    busy: "A iniciar…",
  },
};
