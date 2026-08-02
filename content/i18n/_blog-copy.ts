// Blog chrome: the strings the blog index and the article template render
// around the translated article itself.
//
// Separate from _ui-copy.ts (header/footer, the "ui" gate) because this copy is
// specific to one section and would otherwise force every locale's reviewed ui
// entry back into review whenever the blog template changes a label.
//
// SCOPE: labels and the index page's own copy. Article titles, bodies, FAQs and
// section headings live in the per-post translations under
// content/i18n/{locale}/blog/. Hrefs are never in here - they come from
// localizedHref().
//
// `prose` is read by BOTH the article template and scripts/translate-blog.ts,
// which injects the three headings as props into every generated post file. One
// table, so a German article cannot say "Quellen" in one place and "Sources" in
// another.

export interface BlogCopy {
  index: {
    /** SERP title. Written to be clicked, not to mirror h1. Keep under 60 chars. */
    metaTitle: string;
    /** Keep under 158 chars or Google truncates it mid-sentence. */
    metaDescription: string;
    h1: string;
    intro: string;
    /** Breadcrumb + JSON-LD label for the blog index. */
    breadcrumb: string;
    /** Breadcrumb label for the site root. */
    home: string;
  };
  article: {
    /** Back link above the title. */
    allArticles: string;
    /** Mobile in-page nav heading. */
    onThisPage: string;
    /** Sidebar table-of-contents heading. */
    tableOfContents: string;
    /** Byline prefix: "By Matus Policek". */
    by: string;
    /** Prefixes the modified date: "Updated 21 July 2026". */
    updated: string;
    /** Related-posts heading. */
    keepReading: string;
  };
  prose: {
    keyTakeaways: string;
    faq: string;
    sources: string;
  };
  cta: {
    headline: string;
    body: string;
    button: string;
    /** Button label while checkout is opening. */
    busy: string;
  };
}
