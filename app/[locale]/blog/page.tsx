import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { getAuthor, ogCardImage, siteName, siteUrl } from "@/lib/site";
import { alternatesFor } from "@/lib/i18n/marketing/alternates";
import { publishedLocalizedPosts } from "@/lib/i18n/marketing/blog-nav";
import { navHrefs } from "@/lib/i18n/marketing/href";
import { localizedPageIdToPath } from "@/lib/i18n/marketing/ids";
import {
  INTL_LOCALE,
  MARKETING_LOCALES,
  OG_LOCALE,
  isMarketingLocale,
  type MarketingLocale,
} from "@/lib/i18n/marketing/locales";
import { isPublished } from "@/lib/i18n/marketing/manifest";
import { localeOptions } from "@/lib/i18n/marketing/switcher";
import { BLOG_COPY } from "@/content/i18n/blog-registry";
import { UI_COPY } from "@/content/i18n/ui-registry";

// Chrome (header/footer) is rendered here rather than in a layout, matching
// app/[locale]/page.tsx and app/[locale]/pricing/page.tsx: the header's language
// menu is per-PAGE (it lists only the locales this page exists in), and a layout
// does not know which page it is wrapping.

export function generateStaticParams(): { locale: MarketingLocale }[] {
  return MARKETING_LOCALES.filter((locale) => isPublished(locale, "blog")).map(
    (locale) => ({ locale }),
  );
}

export const dynamicParams = false;

function formatDate(date: string, locale: MarketingLocale): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(INTL_LOCALE[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isMarketingLocale(locale)) return {};
  const copy = BLOG_COPY[locale].index;

  // Complete openGraph block: metadata merging is shallow, so a partial one
  // would replace the root layout's wholesale and inherit locale "en_US".
  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: alternatesFor("blog", locale),
    openGraph: {
      title: copy.h1,
      description: copy.metaDescription,
      type: "website",
      url: `${siteUrl}/${locale}/blog`,
      siteName,
      locale: OG_LOCALE[locale],
      images: [ogCardImage],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.h1,
      description: copy.metaDescription,
      images: [ogCardImage],
    },
  };
}

export default async function LocalizedBlogIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isMarketingLocale(locale) || !isPublished(locale, "blog")) notFound();

  const copy = BLOG_COPY[locale];
  const posts = publishedLocalizedPosts(locale);
  // Routable but empty would be a thin page inviting a soft-404. The gate
  // should prevent it; this makes it impossible.
  if (posts.length === 0) notFound();

  const url = `${siteUrl}/${locale}/blog`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `${siteName} Blog`,
      url,
      inLanguage: locale,
      description: copy.index.metaDescription,
      blogPost: posts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        url: `${siteUrl}${localizedPageIdToPath(locale, `blog/${post.source}`)}`,
        datePublished: post.date,
        dateModified: post.updated,
        image: `${siteUrl}${post.hero}`,
        inLanguage: locale,
        author: { "@type": "Person", name: getAuthor(post.author).name },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: copy.index.home,
          item: `${siteUrl}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: copy.index.breadcrumb,
          item: url,
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        localeOptions={localeOptions("blog", locale)}
        ui={UI_COPY[locale]}
        nav={navHrefs(locale)}
      />
      <main className="flex-1 pt-14">
        <div className="min-h-screen bg-white font-light text-[#1D1D1D]">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <div className="mx-auto max-w-[1200px] px-6 pt-20 sm:px-10">
            <h1 className="text-[26px] font-light tracking-[0.05em] text-[#1D1D1D] uppercase sm:text-[32px]">
              {copy.index.h1}
            </h1>
            <p className="mt-3 max-w-[640px] text-[15px] leading-[1.6] text-[#666]">
              {copy.index.intro}
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-[1200px] grid-cols-1 gap-8 px-6 pb-20 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={localizedPageIdToPath(locale, `blog/${post.source}`)}
                className="group flex flex-col"
              >
                <div className="aspect-[16/9] overflow-hidden bg-[#f5f5f5]">
                  <Image
                    src={post.hero}
                    alt={post.heroAlt}
                    width={post.heroWidth}
                    height={post.heroHeight}
                    fetchPriority={i === 0 ? "high" : undefined}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="flex flex-1 flex-col pt-5 pb-6">
                  <span className="mb-2.5 text-[11px] font-medium tracking-[0.06em] text-[#1D1D1D] uppercase">
                    {post.tag}
                  </span>
                  <h2 className="mb-2.5 text-[19px] leading-[1.35] font-medium tracking-[-0.01em] text-[#1D1D1D]">
                    {post.title}
                  </h2>
                  <p className="mb-4 line-clamp-3 flex-1 text-[14px] leading-[1.6] text-[#666]">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-3 text-[13px] text-[#999]">
                    <time dateTime={post.date}>
                      {formatDate(post.date, locale)}
                    </time>
                    <span className="size-[3px] rounded-full bg-[#ccc]" />
                    <span>{post.readingTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
