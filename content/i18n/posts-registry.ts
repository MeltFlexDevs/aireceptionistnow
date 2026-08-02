import type { ComponentType } from "react";

import { getPost, posts, relatedPosts } from "@/app/(main)/blog/_posts";
import type { PostMeta } from "@/app/(main)/blog/_posts";
import type { AuthorKey } from "@/lib/site";
import type { IndustrySlug } from "@/lib/marketing/industries";
import { localizedBlogSlug } from "@/lib/i18n/marketing/blog-slugs";
import type { MarketingLocale } from "@/lib/i18n/marketing/locales";

import type { PostModule } from "./_post-copy";
import { dePosts } from "./de/blog";
import { esPosts } from "./es/blog";
import { frPosts } from "./fr/blog";
import { itPosts } from "./it/blog";
import { nlPosts } from "./nl/blog";
import { ptPosts } from "./pt/blog";
import { skPosts } from "./sk/blog";

// Assembles a locale's articles from two halves that live apart on purpose:
// the translated strings (content/i18n/{locale}/blog/*.tsx, generated) and the
// English post's factual meta (dates, hero, author, industry). See _post-copy.ts.
//
// Every disagreement between the two halves throws at module load, which means
// at BUILD time: a translation whose `source` names a post that no longer
// exists, or whose `slug` has drifted from BLOG_SLUGS, fails the build instead
// of shipping an article on a URL nothing links to.

const MODULES: Record<MarketingLocale, PostModule[]> = {
  de: dePosts,
  es: esPosts,
  fr: frPosts,
  it: itPosts,
  nl: nlPosts,
  pt: ptPosts,
  sk: skPosts,
};

/** A translated article, shaped like the English Post so the template is shared. */
export type LocalizedPost = PostMeta & {
  /** English slug - the post's identity across locales. */
  source: string;
  Body: ComponentType;
  author: AuthorKey;
  industry?: IndustrySlug;
};

function assemble(locale: MarketingLocale, mod: PostModule): LocalizedPost {
  const { meta } = mod;
  const en = getPost(meta.source);
  if (!en) {
    throw new Error(
      `[i18n] ${locale}/blog: translation "${meta.slug}" points at unknown English post "${meta.source}"`,
    );
  }
  const expected = localizedBlogSlug(locale, meta.source);
  if (meta.slug !== expected) {
    throw new Error(
      `[i18n] ${locale}/blog: "${meta.source}" is translated at slug "${meta.slug}" but BLOG_SLUGS says "${expected}"`,
    );
  }
  return {
    // Factual half: one edit to the English post moves all seven locales.
    date: en.date,
    updated: en.updated,
    hero: en.hero,
    heroWidth: en.heroWidth,
    heroHeight: en.heroHeight,
    heroCredit: en.heroCredit,
    heroCreditUrl: en.heroCreditUrl,
    ogImage: en.ogImage,
    author: en.author,
    industry: en.industry,
    // Translated half.
    source: meta.source,
    slug: meta.slug,
    title: meta.title,
    description: meta.description,
    readingTime: meta.readingTime,
    tag: meta.tag,
    heroAlt: meta.heroAlt,
    keywords: meta.keywords,
    sections: meta.sections,
    faqs: meta.faqs,
    Body: mod.default,
  };
}

// Newest first, matching the English index. Sorting here rather than trusting
// the generated import order keeps the two indexes in the same order.
const BY_LOCALE: Record<MarketingLocale, LocalizedPost[]> = Object.fromEntries(
  Object.entries(MODULES).map(([locale, mods]) => [
    locale,
    mods
      .map((m) => assemble(locale as MarketingLocale, m))
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
  ]),
) as Record<MarketingLocale, LocalizedPost[]>;

export function localizedPosts(locale: MarketingLocale): LocalizedPost[] {
  return BY_LOCALE[locale] ?? [];
}

/** Lookup by LOCALIZED slug - what the router receives from the URL. */
export function getLocalizedPost(
  locale: MarketingLocale,
  slug: string,
): LocalizedPost | undefined {
  return localizedPosts(locale).find((p) => p.slug === slug);
}

/** Lookup by ENGLISH slug - what cross-locale code (hreflang, related) holds. */
export function getLocalizedPostBySource(
  locale: MarketingLocale,
  source: string,
): LocalizedPost | undefined {
  return localizedPosts(locale).find((p) => p.source === source);
}

/**
 * Related articles for a localized post.
 *
 * Computed from the ENGLISH relatedness graph and then mapped into the locale,
 * so every language recommends the same three articles. Scoring the translated
 * keywords instead would give each locale a different internal-link graph for
 * no editorial reason, and the stopword list that scoring depends on is English.
 *
 * A related post that is not translated in this locale is dropped rather than
 * linked in English: `n` is a ceiling, not a quota.
 */
export function relatedLocalizedPosts(
  locale: MarketingLocale,
  source: string,
  n = 3,
): LocalizedPost[] {
  return relatedPosts(source, n)
    .map((p) => getLocalizedPostBySource(locale, p.slug))
    .filter((p): p is LocalizedPost => p !== undefined);
}

/** English posts that still have no translation in this locale. Used by the generator. */
export function untranslatedSources(locale: MarketingLocale): string[] {
  const done = new Set(localizedPosts(locale).map((p) => p.source));
  return posts.map((p) => p.slug).filter((slug) => !done.has(slug));
}
