import type { Metadata } from "next";
import Link from "next/link";

import { siteUrl, siteName, getAuthor } from "@/lib/site";
import { answers, answerCategories } from "./_answers";

const description =
  "Short, straight answers to the questions people actually ask about AI receptionists — call transfer, your existing number, booking, languages, and more. No fluff.";

export const metadata: Metadata = {
  title: "AI Receptionist Answers",
  description,
  alternates: { canonical: `${siteUrl}/answers` },
  openGraph: {
    title: `Answers · ${siteName}`,
    description,
    type: "website",
    url: `${siteUrl}/answers`,
    siteName,
  },
};

export default function AnswersPage() {
  const url = `${siteUrl}/answers`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "AI Receptionist Answers",
      description,
      url,
      publisher: {
        "@type": "Organization",
        name: siteName,
        url: siteUrl,
      },
      about: {
        "@type": "Thing",
        name: "AI receptionist",
        description:
          "How an AI phone receptionist answers calls, books appointments, transfers to a human, and handles multilingual and high-volume calls.",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "AI Receptionist Questions",
      numberOfItems: answers.length,
      itemListElement: answers.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: a.question,
        url: `${siteUrl}/answers/${a.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Answers", item: url },
      ],
    },
  ];

  const categories = answerCategories();

  return (
    <div className="min-h-screen bg-white font-light text-[#1a1a1a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[900px] px-6 pt-16 pb-20 sm:px-10">
        <span className="mb-4 block text-[11px] font-medium tracking-[0.06em] text-[#1a1a1a] uppercase">
          Answers
        </span>
        <h1 className="text-[32px] leading-[1.15] font-light tracking-[-0.02em] text-[#1a1a1a] sm:text-[42px]">
          AI receptionist questions, answered
        </h1>
        <p className="mt-5 max-w-[640px] text-[17px] leading-[1.7] text-[#444]">
          {description}
        </p>

        <div className="mt-12 flex flex-col gap-3">
          {categories.map((cat) => (
            <section key={cat}>
              <h2 className="mt-6 mb-3 text-[11px] font-medium tracking-[0.08em] text-[#999] uppercase">
                {cat}
              </h2>
              <div className="flex flex-col gap-3">
                {answers
                  .filter((a) => a.category === cat)
                  .map((a) => {
                    const author = getAuthor(a.author);
                    return (
                      <Link
                        key={a.slug}
                        href={`/answers/${a.slug}`}
                        className="group block border border-[#e5e5e5] px-5 py-4 transition-colors hover:border-[#1a1a1a] hover:bg-[#fafafa]"
                      >
                        <h3 className="text-[17px] font-medium text-[#1a1a1a]">
                          {a.question}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-[14px] leading-[1.6] text-[#666]">
                          {a.shortAnswer}
                        </p>
                        <p className="mt-2.5 text-[12px] text-[#999]">
                          {author.name}
                        </p>
                      </Link>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
