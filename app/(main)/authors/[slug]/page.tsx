import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  siteUrl,
  siteName,
  authors,
  authorKeys,
  getAuthorBySlug,
  authorId,
} from "@/lib/site";
import { posts, formatDate } from "../../blog/_posts";

// Only the two real authors exist - anything else 404s statically.
export const dynamicParams = false;

export function generateStaticParams() {
  return authorKeys.map((key) => ({ slug: authors[key].slug }));
}

function postsBy(slug: string) {
  return posts.filter((p) => authors[p.author].slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getAuthorBySlug(slug);
  if (!a) return {};

  const url = `${siteUrl}/authors/${a.slug}`;
  const description = `${a.name} is ${a.role.replace(/^Co-Founder, /, "co-founder of ")}. Articles and guides on AI phone reception, call handling, and appointment booking.`;

  return {
    title: { absolute: `${a.name} - ${a.role} | ${siteName}` },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${a.name} · ${siteName}`,
      description,
      type: "profile",
      url,
      siteName,
    },
    twitter: { card: "summary", title: `${a.name} · ${siteName}`, description },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getAuthorBySlug(slug);
  if (!a) notFound();

  const written = postsBy(a.slug);
  const url = `${siteUrl}/authors/${a.slug}`;

  // ProfilePage wrapping a Person is the shape Google documents for author
  // pages. The Person carries a stable @id so the BlogPosting bylines, the
  // Organization founder list, and this page all resolve to one entity instead
  // of three look-alike Person nodes.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": url,
      url,
      name: `${a.name} - ${a.role}`,
      mainEntity: {
        "@type": "Person",
        "@id": authorId(a),
        name: a.name,
        jobTitle: a.role,
        description: a.bio,
        image: `${siteUrl}${a.image}`,
        url,
        sameAs: [a.linkedin],
        knowsAbout: a.knowsAbout,
        worksFor: { "@id": `${siteUrl}/#organization` },
      },
      hasPart: written.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: `${siteUrl}/blog/${p.slug}`,
        datePublished: p.date,
        dateModified: p.updated,
        author: { "@id": authorId(a) },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${siteUrl}/blog`,
        },
        { "@type": "ListItem", position: 3, name: a.name, item: url },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white font-light text-[#1D1D1D]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[1040px] px-6 pt-16 pb-20 sm:px-10">
        <Link
          href="/blog"
          className="mb-12 inline-flex items-center gap-1.5 text-[14px] text-[#6f6f6f] transition-colors hover:text-[#1D1D1D]"
        >
          <span aria-hidden="true">←</span> All articles
        </Link>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          <Image
            src={a.image}
            alt={a.name}
            width={96}
            height={96}
            className="size-24 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <h1 className="text-[32px] leading-[1.2] font-light tracking-[-0.02em] text-[#1D1D1D] sm:text-[38px]">
              {a.name}
            </h1>
            <p className="mt-2 text-[15px] text-[#6f6f6f]">{a.role}</p>
            <p className="mt-5 max-w-[640px] text-[15px] leading-[1.7] text-[#4a4a4a]">
              {a.bio}
            </p>
            <a
              href={a.linkedin}
              target="_blank"
              rel="noopener noreferrer me"
              className="mt-5 inline-flex items-center gap-1.5 text-[14px] text-[#4a4a4a] underline decoration-[#ddd] underline-offset-4 transition-colors hover:text-[#1D1D1D]"
            >
              LinkedIn
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <section className="mt-16 border-t border-[#e5e5e5] pt-10">
          <h2 className="mb-6 text-[11px] font-medium tracking-[0.06em] text-[#1D1D1D] uppercase">
            {written.length} article{written.length === 1 ? "" : "s"} by{" "}
            {a.name.split(" ")[0]}
          </h2>
          <div className="flex flex-col gap-3">
            {written.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="flex flex-col gap-1.5 border border-[#e5e5e5] px-[18px] py-4 transition-colors hover:border-[#1D1D1D] hover:bg-[#fafafa] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <span className="text-[15px] text-[#1D1D1D]">{p.title}</span>
                <span className="flex shrink-0 items-center gap-2.5 text-[13px] text-[#6f6f6f]">
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                  <span
                    aria-hidden="true"
                    className="size-[3px] rounded-full bg-[#ccc]"
                  />
                  <span className="text-[11px] font-medium tracking-[0.06em] uppercase">
                    {p.tag}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
