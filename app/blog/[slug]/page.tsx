import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteUrl, siteName, logoUrl, getAuthor } from "@/lib/site";
import { posts, getPost, formatDate } from "../_posts";
import { PostToc } from "../_components/post-toc";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = `${siteUrl}/blog/${post.slug}`;
  return {
    // absolute: keep the brand suffix off so the title fits Google's ~60 char limit
    title: { absolute: post.title },
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: getAuthor(post.author).name }],
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      siteName,
      publishedTime: post.date,
      modifiedTime: post.updated,
      images: [
        {
          url: post.hero,
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
      images: [post.hero],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { Body } = post;
  const a = getAuthor(post.author);
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const url = `${siteUrl}/blog/${post.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: `${siteUrl}${post.hero}`,
      datePublished: post.date,
      dateModified: post.updated,
      keywords: post.keywords.join(", "),
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: {
        "@type": "Organization",
        name: a.name,
        url: a.linkedin,
      },
      publisher: {
        "@type": "Organization",
        name: siteName,
        url: siteUrl,
        logo: { "@type": "ImageObject", url: logoUrl },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
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
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white font-light text-[#1a1a1a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[1040px] px-6 pt-16 pb-20 sm:px-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">
          {/* main column */}
          <div className="min-w-0 lg:max-w-[720px]">
            <Link
              href="/blog"
              className="mb-12 inline-flex items-center gap-1.5 text-[14px] text-[#666] transition-colors hover:text-[#1a1a1a]"
            >
              <span aria-hidden="true">←</span> All articles
            </Link>

            <span className="mb-4 block text-[11px] font-medium tracking-[0.06em] text-[#1a1a1a] uppercase">
              {post.tag}
            </span>
            <h1 className="text-[32px] leading-[1.2] font-light tracking-[-0.02em] text-[#1a1a1a] sm:text-[42px]">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-[14px] text-[#666]">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-[#111] text-[12px] font-medium tracking-[0.04em] text-white"
              >
                {a.initials}
              </span>
              <span>
                By <span className="text-[#1a1a1a]">{a.name}</span>
              </span>
              <span aria-hidden="true" className="size-[3px] rounded-full bg-[#ccc]" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden="true" className="size-[3px] rounded-full bg-[#ccc]" />
              <span>{post.readingTime}</span>
            </div>

            <figure className="mt-8 mb-10">
              <div className="aspect-[16/9] w-full overflow-hidden bg-[#f5f5f5]">
                <Image
                  src={post.hero}
                  alt={post.heroAlt}
                  width={post.heroWidth}
                  height={post.heroHeight}
                  priority
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
                      className="underline decoration-[#ddd] underline-offset-2 hover:text-[#1a1a1a]"
                    >
                      {post.heroCredit}
                    </a>
                  ) : (
                    post.heroCredit
                  )}
                </figcaption>
              )}
            </figure>

            {/* inline TOC for mobile only */}
            {post.sections.length > 0 && (
              <nav
                aria-label="Table of contents"
                className="mb-10 border-y border-[#e5e5e5] py-5 lg:hidden"
              >
                <p className="mb-3 text-[10px] font-semibold tracking-[0.08em] text-[#999] uppercase">
                  On this page
                </p>
                <ol className="space-y-1.5 text-[13px]">
                  {post.sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-[#666] transition-colors hover:text-[#1a1a1a]"
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
                <p className="mb-5 text-[11px] font-medium tracking-[0.06em] text-[#1a1a1a] uppercase">
                  Keep reading
                </p>
                <div className="flex flex-col gap-3">
                  {others.map((other) => (
                    <Link
                      key={other.slug}
                      href={`/blog/${other.slug}`}
                      className="flex items-center justify-between gap-3 border border-[#e5e5e5] px-[18px] py-3.5 transition-colors hover:border-[#1a1a1a] hover:bg-[#fafafa]"
                    >
                      <span className="text-[15px] text-[#1a1a1a]">
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

          {/* sticky sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <PostToc sections={post.sections} />

              <div className="mt-8 overflow-hidden rounded-2xl bg-[#111] px-6 py-8 text-center">
                <p className="text-[15px] leading-[1.35] font-semibold tracking-[0.04em] text-white uppercase">
                  Never miss a call again
                </p>
                <p className="mt-3 text-[13px] leading-[1.6] font-light text-white/55">
                  An AI receptionist that answers 24/7, books appointments, and
                  texts you the summary. Live in 10 minutes.
                </p>
                <Link
                  href="/pricing"
                  className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-[12px] font-medium tracking-[0.08em] text-[#1a1a1a] uppercase transition-colors hover:bg-white/90"
                >
                  Start now <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
