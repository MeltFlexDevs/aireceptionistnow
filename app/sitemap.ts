import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { alternatesFor } from "@/lib/i18n/marketing/alternates";
import { localesFor } from "@/lib/i18n/marketing/manifest";
import type { ContentLocale } from "@/lib/i18n/marketing/locales";
import { posts } from "./(main)/blog/_posts";
import { answers } from "./(main)/answers/_answers";
import { COMPETITORS } from "./(main)/compare/_compare/competitors";
import { INDUSTRY_MENU } from "@/lib/marketing/industries";

// Home and pricing are the only localized routes. While every translation is
// draft, localesFor returns [] and each of these emits exactly the English URL
// with no hreflang - byte-identical to the old hardcoded rows. The moment a
// locale is reviewed, its localized URL plus the full hreflang cluster (shared
// by every member, x-default included) appear automatically. Reusing
// alternatesFor keeps the sitemap from ever disagreeing with the per-page
// canonical/hreflang tags built from the same gate.
function localizedRoutes(
  pageId: "home" | "pricing",
  priority: number,
): MetadataRoute.Sitemap {
  const cluster = alternatesFor(pageId, "en");
  const languages = "languages" in cluster ? cluster.languages : undefined;
  const members: ContentLocale[] = ["en", ...localesFor(pageId)];
  return members.map((locale) => ({
    url: alternatesFor(pageId, locale).canonical,
    changeFrequency: "weekly" as const,
    priority,
    ...(languages ? { alternates: { languages } } : {}),
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  // No lastModified on pages without a real content date: stamping build time
  // on unchanged pages teaches crawlers to distrust the field, which then
  // devalues the genuine dates on posts and answers.
  const staticPages: MetadataRoute.Sitemap = [
    ...localizedRoutes("home", 1),
    ...localizedRoutes("pricing", 0.9),
    { url: `${siteUrl}/industries`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/compare`, changeFrequency: "weekly", priority: 0.8 },
    // Interactive tool rather than an article, hence a real lastModified: the
    // date means something here because the model and plan prices behind it can
    // change independently of any prose on the page.
    {
      url: `${siteUrl}/missed-call-calculator`,
      lastModified: new Date("2026-07-27T00:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/answers`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms-of-service`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const comparePages: MetadataRoute.Sitemap = COMPETITORS.map((c) => ({
    url: `${siteUrl}/compare/${c.slug}`,
    lastModified: new Date(`${c.updated}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // The industry landing pages moved to top-level /slug (from /industries/slug).
  const industryPages: MetadataRoute.Sitemap = INDUSTRY_MENU.map((i) => ({
    url: `${siteUrl}/${i.slug}`,
    lastModified: new Date("2026-07-22T00:00:00Z"),
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(`${post.updated}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const answerPages: MetadataRoute.Sitemap = answers.map((a) => ({
    url: `${siteUrl}/answers/${a.slug}`,
    lastModified: new Date(`${a.updated}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...industryPages, ...comparePages, ...blogPosts, ...answerPages];
}
