// English blog chrome. Rendered by the live English blog and the reference for
// every translation, so the two cannot drift. Copied verbatim from the strings
// that were hardcoded in app/(main)/blog/page.tsx, [slug]/page.tsx, and the
// _components prose/toc/cta modules.

import type { BlogCopy } from "../../_blog-copy";

export const enBlog: BlogCopy = {
  index: {
    metaTitle: "AI Receptionist Blog & Guides | AI Receptionist Now",
    metaDescription:
      "Honest notes on AI phone receptionists, call handling, and appointment booking: what the technology genuinely does for a small business.",
    h1: "From the front desk",
    intro:
      "AI phone reception, call handling, and appointment booking, plus an honest look at what the technology can and can't do for a small business.",
    breadcrumb: "Blog",
    home: "Home",
  },
  article: {
    allArticles: "All articles",
    onThisPage: "On this page",
    tableOfContents: "Table of contents",
    by: "By",
    updated: "Updated",
    keepReading: "Keep reading",
  },
  prose: {
    keyTakeaways: "Key takeaways",
    faq: "Frequently asked questions",
    sources: "Sources",
  },
  cta: {
    headline: "Never miss a call again",
    body: "An AI receptionist that answers 24/7, books appointments, and texts you the summary. Live in 10 minutes.",
    button: "Start now",
    busy: "Starting…",
  },
};
