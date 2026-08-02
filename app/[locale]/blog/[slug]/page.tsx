import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { PostToc } from "@/app/(main)/blog/_components/post-toc";
import { BlogCtaCard } from "@/app/(main)/blog/_components/blog-cta";
import { authorId, getAuthor, siteName, siteUrl } from "@/lib/site";
import {
  blogAlternatesFor,
  blogLocaleOptions,
  publishedLocalizedPosts,
} from "@/lib/i18n/marketing/blog-nav";
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
import {
  getLocalizedPost,
  relatedLocalizedPosts,
} from "@/content/i18n/posts-registry";
import { BLOG_COPY } from "@/content/i18n/blog-registry";
import { UI_COPY } from "@/content/i18n/ui-registry";

// The localized twin of app/(main)/blog/[slug]/page.tsx. Same markup, three
// differences: the slug in the URL is the localized one, every chrome string
// comes from BLOG_COPY, and the hreflang cluster is built from the registry
// (see lib/i18n/marketing/blog-nav.ts).
//
// The English template's "Built for {industry}?" aside is deliberately absent:
// the industry landing pages exist only in English, so a German article would
// promise a tuned page in German and deliver an English one - exactly the
// half-translated leak the publish gate exists to prevent. It comes back the
// day those pages are localized.

export const dynamicParams = false;

// Returns BOTH params for the segment tree beneath [locale]. Building the pairs
// here means a locale can never produce a URL for an article it lacks: the list
// is derived from the assembled registry, not from a cross product.
export function generateStaticParams(): { locale: string; slug: string }[] {
  return MARKETING_LOCALES.filter((locale) => isPublished(locale, "blog")).flatMap(
    (locale) =>
      publishedLocalizedPosts(locale).map((post) => ({
        locale,
        slug: post.slug,
      })),
  );
}

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
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isMarketingLocale(locale)) return {};
  const post = getLocalizedPost(locale, slug);
  if (!post) return {};

  const url = `${siteUrl}${localizedPageIdToPath(locale, `blog/${post.source}`)}`;
  // Social crawlers don't render SVG - prefer the raster ogImage when the hero is vector.
  const shareImage = post.ogImage ?? post.hero;
  return {
    // absolute: keep the brand suffix off so the title fits Google's ~60 char limit
    title: { absolute: post.title },
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: getAuthor(post.author).name }],
    alternates: blogAlternatesFor(post.source, locale),
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      siteName,
      locale: OG_LOCALE[locale],
      publishedTime: post.date,
      modifiedTime: post.updated,
      images: [
        {
          url: shareImage,
          width: post.heroWidth,
          height: post.heroHeight,
          alt: post.heroAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [shareImage],
    },
  };
}

export default async function LocalizedBlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isMarketingLocale(locale) || !isPublished(locale, "blog")) notFound();

  const post = getLocalizedPost(locale, slug);
  if (!post) notFound();

  const copy = BLOG_COPY[locale];
  const { Body } = post;
  const a = getAuthor(post.author);
  const others = relatedLocalizedPosts(locale, post.source, 3);
  const url = `${siteUrl}${localizedPageIdToPath(locale, `blog/${post.source}`)}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: `${siteUrl}${post.ogImage ?? post.hero}`,
      datePublished: post.date,
      dateModified: post.updated,
      keywords: post.keywords.join(", "),
      // The translated article is a different WebPage in a different language;
      // the Person and Organization behind it are the same entities as on the
      // English original, referenced by the same @id so the bylines reconcile.
      inLanguage: locale,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: {
        "@type": "Person",
        "@id": authorId(a),
        name: a.name,
        jobTitle: a.role,
        url: `${siteUrl}/authors/${a.slug}`,
        image: `${siteUrl}${a.image}`,
        sameAs: [a.linkedin],
      },
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: post.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
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
          item: `${siteUrl}/${locale}/blog`,
        },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        localeOptions={blogLocaleOptions(post.source, locale)}
        ui={UI_COPY[locale]}
        nav={navHrefs(locale)}
      />
      <main className="flex-1 pt-14">
        <div className="min-h-screen bg-white font-light text-[#1D1D1D]">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <div className="mx-auto max-w-[1040px] px-6 pt-16 pb-20 sm:px-10">
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">
              <div className="min-w-0 lg:max-w-[720px]">
                <Link
                  href={`/${locale}/blog`}
                  className="mb-12 inline-flex items-center gap-1.5 text-[14px] text-[#666] transition-colors hover:text-[#1D1D1D]"
                >
                  <span aria-hidden="true">←</span> {copy.article.allArticles}
                </Link>

                <span className="mb-4 block text-[11px] font-medium tracking-[0.06em] text-[#1D1D1D] uppercase">
                  {post.tag}
                </span>
                <h1 className="text-[32px] leading-[1.2] font-light tracking-[-0.02em] text-[#1D1D1D] sm:text-[42px]">
                  {post.title}
                </h1>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-[14px] text-[#666]">
                  {/* Byline points at the English author page: the Person entity
                      is the same in every locale and there is no localized
                      author page to send a reader to. */}
                  <Link
                    href={`/authors/${a.slug}`}
                    className="flex items-center gap-3 transition-opacity hover:opacity-80"
                  >
                    <Image
                      src={a.image}
                      alt={a.name}
                      width={36}
                      height={36}
                      className="size-9 rounded-full object-cover"
                    />
                    <span>
                      {copy.article.by}{" "}
                      <span className="text-[#1D1D1D]">{a.name}</span>
                      <span className="block text-[12px] text-[#6f6f6f]">
                        {a.role}
                      </span>
                    </span>
                  </Link>
                  <span
                    aria-hidden="true"
                    className="size-[3px] rounded-full bg-[#ccc]"
                  />
                  <time dateTime={post.date}>
                    {formatDate(post.date, locale)}
                  </time>
                  {post.updated !== post.date && (
                    <>
                      <span
                        aria-hidden="true"
                        className="size-[3px] rounded-full bg-[#ccc]"
                      />
                      <span>
                        {copy.article.updated}{" "}
                        <time dateTime={post.updated}>
                          {formatDate(post.updated, locale)}
                        </time>
                      </span>
                    </>
                  )}
                  <span
                    aria-hidden="true"
                    className="size-[3px] rounded-full bg-[#ccc]"
                  />
                  <span>{post.readingTime}</span>
                </div>

                <figure className="mt-8 mb-10">
                  <div className="aspect-[16/9] w-full overflow-hidden bg-[#f5f5f5]">
                    <Image
                      src={post.hero}
                      alt={post.heroAlt}
                      width={post.heroWidth}
                      height={post.heroHeight}
                      preload
                      className="h-full w-full object-cover"
                      sizes="(min-width: 768px) 720px, 100vw"
                    />
                  </div>
                  {post.heroCredit && (
                    <figcaption className="mt-3 text-[13px] leading-6 text-[#999]">
                      {post.heroCreditUrl ? (
                        <a
                          href={post.heroCreditUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-[#ddd] underline-offset-2 hover:text-[#1D1D1D]"
                        >
                          {post.heroCredit}
                        </a>
                      ) : (
                        post.heroCredit
                      )}
                    </figcaption>
                  )}
                </figure>

                {post.sections.length > 0 && (
                  <nav
                    aria-label={copy.article.tableOfContents}
                    className="mb-10 border-y border-[#e5e5e5] py-5 lg:hidden"
                  >
                    <p className="mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#999] uppercase">
                      {copy.article.onThisPage}
                    </p>
                    <ol className="space-y-1.5 text-[13px]">
                      {post.sections.map((s) => (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            className="block py-2 text-[#666] transition-colors hover:text-[#1D1D1D]"
                          >
                            {s.title}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}

                <article>
                  <Body />
                </article>

                {others.length > 0 && (
                  <aside className="mt-16 border-t border-[#e5e5e5] pt-10">
                    <p className="mb-5 text-[11px] font-medium tracking-[0.06em] text-[#1D1D1D] uppercase">
                      {copy.article.keepReading}
                    </p>
                    <div className="flex flex-col gap-3">
                      {others.map((other) => (
                        <Link
                          key={other.slug}
                          href={localizedPageIdToPath(
                            locale,
                            `blog/${other.source}`,
                          )}
                          className="flex items-center justify-between gap-3 border border-[#e5e5e5] px-[18px] py-3.5 transition-colors hover:border-[#1D1D1D] hover:bg-[#fafafa]"
                        >
                          <span className="text-[15px] text-[#1D1D1D]">
                            {other.title}
                          </span>
                          <span className="shrink-0 text-[11px] font-medium tracking-[0.06em] text-[#999] uppercase">
                            {other.tag}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </aside>
                )}
              </div>

              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <PostToc
                    sections={post.sections}
                    heading={copy.article.tableOfContents}
                    label={copy.article.tableOfContents}
                  />

                  <BlogCtaCard copy={copy.cta} />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
