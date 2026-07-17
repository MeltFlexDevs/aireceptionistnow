import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { posts } from "./blog/_posts";
import { answers } from "./answers/_answers";
import { COMPETITORS } from "./compare/_compare/competitors";
import { INDUSTRIES } from "./industries/_industries/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  // No lastModified on pages without a real content date: stamping build time
  // on unchanged pages teaches crawlers to distrust the field, which then
  // devalues the genuine dates on posts and answers.
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/pricing`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/industries`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/answers`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const comparePages: MetadataRoute.Sitemap = COMPETITORS.map((c) => ({
    url: `${siteUrl}/compare/${c.slug}`,
    lastModified: new Date(`${c.updated}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const industryPages: MetadataRoute.Sitemap = INDUSTRIES.map((i) => ({
    url: `${siteUrl}/industries/${i.slug}`,
    lastModified: new Date(`${i.updated}T00:00:00Z`),
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
