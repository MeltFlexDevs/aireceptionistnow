// Spanish blog chrome.
//
// Register: usted, matching ./home.ts and ./pricing.ts. "Recepcionista con IA"
// is the product term used across those files; the shorter "recepcionista IA"
// is used only where a title tag needs the characters.

import type { BlogCopy } from "../../_blog-copy";

export const esBlog: BlogCopy = {
  index: {
    metaTitle: "Blog de recepcionistas con IA: guías y análisis",
    metaDescription:
      "Notas honestas sobre recepcionistas telefónicos con IA, gestión de llamadas y reserva de citas: qué hace de verdad esta tecnología por una pyme.",
    h1: "Desde la recepción",
    intro:
      "Atención telefónica con IA, gestión de llamadas y reserva de citas, además de una mirada honesta a lo que la tecnología puede y no puede hacer por una pequeña empresa.",
    breadcrumb: "Blog",
    home: "Inicio",
  },
  article: {
    allArticles: "Todos los artículos",
    onThisPage: "En esta página",
    tableOfContents: "Índice",
    by: "Por",
    updated: "Actualizado",
    keepReading: "Sigue leyendo",
  },
  prose: {
    keyTakeaways: "Ideas clave",
    faq: "Preguntas frecuentes",
    sources: "Fuentes",
  },
  cta: {
    headline: "No vuelva a perder una llamada",
    body: "Un recepcionista con IA que contesta 24/7, reserva citas y le envía el resumen por SMS. Operativo en 10 minutos.",
    button: "Empezar ahora",
    busy: "Iniciando…",
  },
};
