import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteUrl, siteName, getAuthor } from "@/lib/site";
import { answers } from "./_answers";

const description =
  "Short, straight answers to the questions people actually ask about AI receptionists: call transfer, your existing number, booking, languages, and more. No fluff.";

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

  return (
    <div className="answers-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="answers-hero">
        <h1>AI receptionist questions, answered</h1>
        <p>{description}</p>
      </div>

      <div className="answers-list">
        {answers.map((a) => {
          const author = getAuthor(a.author);
          return (
            <Link key={a.slug} href={`/answers/${a.slug}`} className="answers-card">
              <div className="answers-card__top">
                <span className="answers-card__category">{a.category}</span>
              </div>
              <h2 className="answers-card__question">{a.question}</h2>
              <p className="answers-card__excerpt">{a.shortAnswer}</p>
              <div className="answers-card__author">
                <Image
                  src={author.image}
                  alt={author.name}
                  width={28}
                  height={28}
                  className="answers-card__author-img"
                />
                <span className="answers-card__author-name">{author.name}</span>
                <span className="answers-card__author-role">{author.role}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
