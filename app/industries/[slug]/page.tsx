import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siteUrl, siteName, getAuthor } from "@/lib/site";
import { INDUSTRIES, getIndustry } from "../_industries/registry";
import { IndustryPage } from "../_industries/IndustryPage";

// Only the listed slugs exist - unknown ones 404 statically, no function invocation.
export const dynamicParams = false;

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ind = getIndustry(slug);
  if (!ind) return {};

  const url = `${siteUrl}/industries/${ind.slug}`;
  return {
    // absolute: keep the brand suffix off so the title fits Google's ~60 char limit
    title: { absolute: ind.title },
    description: ind.description,
    keywords: ind.keywords,
    authors: [{ name: getAuthor(ind.author).name }],
    alternates: { canonical: url },
    openGraph: {
      title: ind.title,
      description: ind.description,
      type: "article",
      url,
      siteName,
      images: [{ url: `${siteUrl}/opengraph-image.png`, width: 1200, height: 630, alt: ind.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: ind.title,
      description: ind.description,
      images: [`${siteUrl}/opengraph-image.png`],
    },
  };
}

export default async function IndustryRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ind = getIndustry(slug);
  if (!ind) notFound();

  return <IndustryPage industry={ind} />;
}
