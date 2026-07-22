import type { PageId } from "@/content/i18n/_types";

// PageId <-> path. Kept in one place so the router, sitemap, hreflang builder
// and switcher can never disagree about what URL a page id means.

export function pageIdToPath(pageId: PageId): string {
  return pageId === "home" ? "/" : `/${pageId}`;
}

export function pathToPageId(path: string): PageId {
  const clean = path.replace(/\/+$/, "");
  return (clean === "" ? "home" : clean.slice(1)) as PageId;
}
