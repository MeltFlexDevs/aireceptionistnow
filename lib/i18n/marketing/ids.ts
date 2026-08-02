import type { PageId } from "@/content/i18n/_types";
import { localizedBlogSlug } from "./blog-slugs";
import type { ContentLocale } from "./locales";

// PageId <-> path. Kept in one place so the router, sitemap, hreflang builder
// and switcher can never disagree about what URL a page id means.

export function pageIdToPath(pageId: PageId): string {
  return pageId === "home" ? "/" : `/${pageId}`;
}

export function pathToPageId(path: string): PageId {
  const clean = path.replace(/\/+$/, "");
  return (clean === "" ? "home" : clean.slice(1)) as PageId;
}

/**
 * Full path for a page id in a locale, locale prefix included.
 *
 * Not merely `/${locale}${pageIdToPath(pageId)}`: the path segments themselves
 * are translated (see blog-slugs.ts), so /blog/dental-answering-service is
 * /de/blog/telefonservice-zahnarztpraxis and not a German article sitting on an
 * English URL. Every URL producer - href builder, hreflang cluster, switcher,
 * sitemap - goes through this one function, which is what keeps the localized
 * slug from being right in the sitemap and wrong in the canonical tag.
 *
 * A blog post with no entry in BLOG_SLUGS has no localized URL at all, so this
 * returns the English path for it. That case is unreachable in practice because
 * the manifest gate never publishes such a post in a locale; it is here so a
 * mistake produces a live English URL rather than a 404.
 */
export function localizedPageIdToPath(
  locale: ContentLocale,
  pageId: PageId,
): string {
  if (locale === "en") return pageIdToPath(pageId);

  let path = pageIdToPath(pageId);
  if (pageId.startsWith("blog/")) {
    const slug = localizedBlogSlug(locale, pageId.slice("blog/".length));
    if (!slug) return path;
    path = `/blog/${slug}`;
  }
  return `/${locale}${path === "/" ? "" : path}`;
}
