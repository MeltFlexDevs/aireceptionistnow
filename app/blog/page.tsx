import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteUrl, siteName, getAuthor } from "@/lib/site";
import { posts, formatDate } from "./_posts";

const description =
  "Honest notes on AI phone receptionists, call handling, and appointment booking: what the technology genuinely does for a small business, and where it still falls short.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: `${siteUrl}/blog` },
  openGraph: {
    title: `Blog · ${siteName}`,
    description,
    type: "website",
    url: `${siteUrl}/blog`,
    siteName,
  },
};

export default function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteName} Blog`,
    url: `${siteUrl}/blog`,
    description,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.date,
      dateModified: post.updated,
      image: `${siteUrl}${post.hero}`,
      author: { "@type": "Person", name: getAuthor(post.author).name },
    })),
  };

  return (
    <div className="min-h-screen bg-white font-light text-[#1a1a1a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[1200px] px-6 pt-20 sm:px-10">
        <h1 className="text-[26px] font-light tracking-[0.05em] text-[#1a1a1a] uppercase sm:text-[32px]">
          From the front desk
        </h1>
        <p className="mt-3 max-w-[640px] text-[15px] leading-[1.6] text-[#666]">
          AI phone reception, call handling, and appointment booking, plus an
          honest look at what the technology can and can&apos;t do for a small
          business.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-[1200px] grid-cols-1 gap-8 px-6 pb-20 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col"
          >
            <div className="aspect-[16/9] overflow-hidden bg-[#f5f5f5]">
              <Image
                src={post.hero}
                alt={post.heroAlt}
                width={post.heroWidth}
                height={post.heroHeight}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="flex flex-1 flex-col pt-5 pb-6">
              <span className="mb-2.5 text-[11px] font-medium tracking-[0.06em] text-[#1a1a1a] uppercase">
                {post.tag}
              </span>
              <h2 className="mb-2.5 text-[19px] leading-[1.35] font-medium tracking-[-0.01em] text-[#1a1a1a]">
                {post.title}
              </h2>
              <p className="mb-4 line-clamp-3 flex-1 text-[14px] leading-[1.6] text-[#666]">
                {post.description}
              </p>
              <div className="flex items-center gap-3 text-[13px] text-[#999]">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span className="size-[3px] rounded-full bg-[#ccc]" />
                <span>{post.readingTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-6 px-6 pb-20 sm:px-10">
        <a
          href="https://turbo0.com/item/ai-receptionist-now"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://img.turbo0.com/badge-listed-light.svg"
            alt="Listed on Turbo0"
            style={{ height: "54px", width: "auto" }}
          />
        </a>
        <a
          href="https://www.toolpilot.ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/toolpilot-featured.png"
            alt="Featured on ToolPilot"
            width={690}
            height={151}
            className="h-[54px] w-auto"
          />
        </a>
      </div>
    </div>
  );
}
