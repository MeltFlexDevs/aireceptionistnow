import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteUrl, siteName, getAuthor } from "@/lib/site";
import { answers, getAnswer } from "../_answers";

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
        cssSelector: [".answer-quick", ".answer-content > p:first-child"],
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
    <div className="min-h-screen bg-white font-light text-[#1a1a1a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[760px] px-6 pt-16 pb-20 sm:px-10">
        <Link
          href="/answers"
          className="mb-10 inline-flex items-center gap-1.5 text-[14px] text-[#666] transition-colors hover:text-[#1a1a1a]"
        >
          <span aria-hidden="true">←</span> All answers
        </Link>

        <span className="mb-4 block text-[11px] font-medium tracking-[0.06em] text-[#1a1a1a] uppercase">
          {a.category}
        </span>
        <h1 className="text-[30px] leading-[1.2] font-light tracking-[-0.02em] text-[#1a1a1a] sm:text-[38px]">
          {a.question}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-[14px] text-[#666]">
          <a
            href={author.linkedin}
            target="_blank"
            rel="noopener noreferrer me"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <Image
              src={author.image}
              alt={author.name}
              width={36}
              height={36}
              className="size-9 rounded-full object-cover"
            />
            <span>
              By <span className="text-[#1a1a1a]">{author.name}</span>
              <span className="block text-[12px] text-[#999]">{author.role}</span>
            </span>
          </a>
        </div>

        {/* Quick Answer — the AEO/voice-result target */}
        <div className="answer-quick my-9 border-l-2 border-[#1a1a1a] bg-[#fafafa] px-6 py-5">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.08em] text-[#999] uppercase">
            Quick answer
          </p>
          <p className="text-[17px] leading-[1.6] text-[#1a1a1a]">
            {a.shortAnswer}
          </p>
        </div>

        <article className="answer-content">
          <Body />
        </article>

        {related.length > 0 && (
          <aside className="mt-14 border-t border-[#e5e5e5] pt-10">
            <p className="mb-5 text-[11px] font-medium tracking-[0.06em] text-[#1a1a1a] uppercase">
              More answers
            </p>
            <div className="flex flex-col gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/answers/${r.slug}`}
                  className="flex items-center justify-between gap-3 border border-[#e5e5e5] px-[18px] py-3.5 transition-colors hover:border-[#1a1a1a] hover:bg-[#fafafa]"
                >
                  <span className="text-[15px] text-[#1a1a1a]">{r.question}</span>
                  <span className="shrink-0 text-[11px] font-medium tracking-[0.06em] text-[#999] uppercase">
                    {r.category}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* CTA funnels to the homepage — the page that ranks for "AI receptionist" */}
        <aside className="mt-12 bg-[#111] px-7 py-8 text-white">
          <p className="text-[19px] font-medium">Hear it answer your calls</p>
          <p className="mt-2 max-w-[460px] text-[15px] leading-[1.6] text-white/70">
            Our AI receptionist answers 24/7, books appointments, and texts you a
            summary — live in about 10 minutes.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#111] transition-opacity hover:opacity-90"
          >
            Try our AI receptionist <span aria-hidden="true">→</span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
