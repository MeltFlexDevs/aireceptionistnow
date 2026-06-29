import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteUrl, siteName, getAuthor } from "@/lib/site";
import { answers, getAnswer } from "../_answers";

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function generateStaticParams() {
  return answers.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getAnswer(slug);
  if (!a) return {};
  const url = `${siteUrl}/answers/${a.slug}`;
  return {
    title: { absolute: a.question },
    description: a.description,
    keywords: a.keywords,
    authors: [{ name: getAuthor(a.author).name }],
    alternates: { canonical: url },
    openGraph: {
      title: a.question,
      description: a.description,
      type: "article",
      url,
      siteName,
      publishedTime: a.date,
      modifiedTime: a.updated,
    },
    twitter: {
      card: "summary",
      title: a.question,
      description: a.description,
    },
  };
}

export default async function AnswerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getAnswer(slug);
  if (!a) notFound();

  const { Body } = a;
  const author = getAuthor(a.author);
  const url = `${siteUrl}/answers/${a.slug}`;
  const related = a.related
    .map((rs) => answers.find((x) => x.slug === rs))
    .filter((x): x is (typeof answers)[number] => Boolean(x));

  const authorPerson = {
    "@type": "Person",
    name: author.name,
    jobTitle: author.role,
    url: author.linkedin,
    image: `${siteUrl}${author.image}`,
    sameAs: [author.linkedin],
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "QAPage",
      mainEntity: {
        "@type": "Question",
        name: a.question,
        text: a.question,
        author: authorPerson,
        dateCreated: `${a.date}T00:00:00+00:00`,
        dateModified: `${a.updated}T00:00:00+00:00`,
        answerCount: 1,
        acceptedAnswer: {
          "@type": "Answer",
          text: a.shortAnswer,
          url,
          dateCreated: `${a.date}T00:00:00+00:00`,
          dateModified: `${a.updated}T00:00:00+00:00`,
          author: authorPerson,
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: a.question,
      url,
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [
          ".answer-page__short-answer",
          ".answer-page__content > p:first-child",
        ],
      },
      about: { "@type": "Thing", name: "AI receptionist" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Answers", item: `${siteUrl}/answers` },
        { "@type": "ListItem", position: 3, name: a.question, item: url },
      ],
    },
    ...(a.faqs.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: a.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];

  return (
    <div className="answer-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="answer-page__inner">
        <Link href="/answers" className="answer-page__back">
          <span aria-hidden="true">&larr;</span> All answers
        </Link>

        <span className="answer-page__category">{a.category}</span>
        <h1 className="answer-page__question">{a.question}</h1>

        <div className="answer-page__author">
          <Image
            src={author.image}
            alt={author.name}
            width={40}
            height={40}
            className="answer-page__author-img"
          />
          <div className="answer-page__author-info">
            <a
              href={author.linkedin}
              target="_blank"
              rel="noopener noreferrer me"
              className="answer-page__author-name"
            >
              {author.name}
            </a>
            <span className="answer-page__author-role">{author.role}</span>
            <a
              href={author.linkedin}
              target="_blank"
              rel="noopener noreferrer me"
              className="answer-page__author-link"
            >
              Verified on LinkedIn
            </a>
          </div>
          <time className="answer-page__date" dateTime={a.date}>
            {formatDate(a.date)}
          </time>
        </div>

        <div className="answer-page__short-answer">
          <span className="answer-page__short-answer-label">Quick answer</span>
          <p>{a.shortAnswer}</p>
        </div>

        <article className="answer-page__content">
          <Body />
        </article>

        {related.length > 0 && (
          <aside className="answer-page__related">
            <p className="answer-page__related-title">More answers</p>
            <div className="answer-page__related-list">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/answers/${r.slug}`}
                  className="answer-page__related-link"
                >
                  <span className="answer-page__related-question">
                    {r.question}
                  </span>
                  <span className="answer-page__related-category">
                    {r.category}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* CTA funnels to the homepage — the page that ranks for "AI receptionist" */}
        <div className="answer-page__cta">
          <div className="answer-page__cta-box">
            <p className="answer-page__cta-title">Hear it answer your calls</p>
            <p className="answer-page__cta-text">
              Our AI receptionist answers 24/7, books appointments, and texts you
              a summary. Live in about 10 minutes.
            </p>
            <Link href="/" className="answer-page__cta-button">
              Try our AI receptionist <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
