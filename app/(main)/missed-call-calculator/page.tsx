import type { Metadata } from "next";
import Link from "next/link";

import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { getAuthor, siteName, siteUrl } from "@/lib/site";
import CalculatorClient from "./CalculatorClient";
import "./calculator.css";

const PATH = "/missed-call-calculator";
const url = `${siteUrl}${PATH}`;
const author = getAuthor("matus");
const PUBLISHED = "2026-07-27";
const MODIFIED = "2026-07-27";

// Title leads with the tool, not the brand: the query behind this page is a
// problem ("how much are missed calls costing me"), not a product name.
const title = "Missed Call Calculator: What Unanswered Calls Cost You";
const description =
  "Work out what missed calls actually cost your business. Enter your call volume, customer value and booking rate for a monthly and annual figure - with every assumption shown.";

export const metadata: Metadata = {
  // absolute: the root template would append the brand and push this past ~60 chars
  title: { absolute: title },
  description,
  keywords: [
    "missed call calculator",
    "cost of a missed call",
    "how much does a missed call cost",
    "missed call revenue calculator",
    "lost revenue calculator",
    "missed calls cost small business",
    "missed call statistics",
    "answering service roi calculator",
  ],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    type: "website",
    url,
    siteName,
    images: [
      { url: `${siteUrl}/opengraph-image.png`, width: 1200, height: 630, alt: title },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteUrl}/opengraph-image.png`],
  },
};

const FAQS = [
  {
    q: "How much does one missed call cost?",
    a: "There is no single number, and anyone quoting one is guessing. It depends entirely on what a new customer is worth to you and how many missed callers ring back. The honest calculation is: missed calls, times the share that are prospective new customers, times the share who never call back, times your booking rate, times customer value. For a dental practice where a patient is worth EUR 600 that can be several hundred euros per missed call. For a business with low customer value and loyal repeat callers who always ring back, it can be close to nothing.",
  },
  {
    q: "Why does this calculator show a smaller number than others?",
    a: "Because it applies three discounts most of them skip. It does not treat every inbound call as a new customer, since most inbound volume is existing customers, suppliers and spam. It does not assume every missed caller is gone forever, since many do ring back. And it does not assume every answered call becomes a sale. Each of those is a visible input you can change. A calculator that tells a hair salon it loses EUR 300,000 a year is not a useful tool, it is an advert.",
  },
  {
    q: "What share of missed callers never call back?",
    a: "The commonly cited figure for business calls is around two thirds, and the calculator defaults to 65%. It varies hugely by urgency and choice: someone with a burst pipe calls the next plumber immediately, while a patient booking a routine check-up may well try you again tomorrow. If your service is urgent or easily substituted, push that number up. If you are the only specialist in town, push it down.",
  },
  {
    q: "Should I use the first sale or lifetime value?",
    a: "Lifetime value, if your customers come back. A dental patient worth EUR 200 on the first visit may be worth EUR 2,000 over five years, and a missed call loses all of it, not just the first appointment. Use the first sale only for genuinely one-off purchases. This single input changes the result more than any other, which is why it is a field you type rather than a slider with our number in it.",
  },
  {
    q: "Does an AI receptionist recover all of these calls?",
    a: "No, and the calculator does not assume it. It answers every call, which fixes the missing half of the problem, but answering is not the same as closing. The recovery rate under Assumptions defaults to 70%, not 100%, so the payback figure is deliberately conservative. The number worth checking is the break-even line: how many recovered customers a month it takes to cover the plan. That one depends only on the plan price and your customer value, not on any of our assumptions.",
  },
  {
    q: "How is the plan cost worked out?",
    a: "From your total call volume, not just the missed ones, because once an AI receptionist is live it answers everything. The calculator assumes a 4-minute average call, converts your monthly calls into minutes and picks the plan whose included allowance covers that, adding EUR 0.09 per minute beyond the largest plan. Real bills vary with call length and mix, so treat it as indicative and check the pricing page for the exact terms.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Missed Call Revenue Calculator",
    url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    // The tool itself is free to use; this says nothing about product pricing.
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    publisher: { "@id": `${siteUrl}/#organization` },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: "Missed call calculator", item: url },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url,
    description,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: {
      "@type": "Person",
      name: author.name,
      url: author.linkedin,
      jobTitle: author.role,
    },
    publisher: { "@id": `${siteUrl}/#organization` },
  },
];

export default function MissedCallCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="mcc-page">
        <div className="mcc-eyebrow">Free tool &middot; Updated July 2026</div>
        <h1>What are missed calls actually costing you?</h1>
        <p className="mcc-lede">
          Most calculators like this one exist to produce a frightening number.
          This one applies three discounts they skip, shows every step of the
          arithmetic, and lets you change any assumption you disagree with. Put
          your own figures in and see what you get.
        </p>

        <CalculatorClient />

        <article className="mcc-prose">
          <h2 id="the-formula">The formula</h2>
          <p>
            The whole calculation is five multiplications, and it is worth
            understanding rather than trusting:
          </p>
          <div className="mcc-formula">
            missed calls &times; share that are new customers &times; share who
            never ring back &times; your booking rate &times; customer value
          </div>
          <p>
            The three middle terms are the ones that matter, and they are exactly
            what gets left out elsewhere. Drop them and you are asserting that
            every unanswered call was a new customer who would have bought and
            who never tried you again. That is not a business, that is a
            spreadsheet.
          </p>

          <h3>Not every call is a new customer</h3>
          <p>
            For most local businesses the majority of inbound volume is existing
            customers, suppliers, deliveries and spam. Missing those is annoying;
            it is not lost revenue. The default here is 40%, which is already
            generous for many businesses.
          </p>

          <h3>Not every missed caller is gone</h3>
          <p>
            Some people ring back. Whether they do depends on how urgent the need
            is and how easily they can find someone else. A burst pipe at 11pm
            gets exactly one call. A routine check-up might get three attempts
            over a week.
          </p>

          <h3>Not every answered call is a sale</h3>
          <p>
            Your booking rate on answered calls is your booking rate on recovered
            calls too. If you close a third of the enquiries you actually speak
            to, recovering ten missed calls is worth about three customers, not
            ten.
          </p>

          <h2 id="the-number-that-matters">The number that survives scepticism</h2>
          <p>
            Every figure above rests on an assumption you can argue with. The
            break-even line does not. It is the plan price divided by what one
            customer is worth to you, and it answers a much simpler question:
            how many recovered customers a month would it take to pay for
            itself? If a customer is worth EUR 400 to you, one recovered
            customer a month covers the entry plan with change left over. You do
            not need to accept any of our percentages to check that.
          </p>

          <h2 id="what-to-do">What to do with the number</h2>
          <ul>
            <li>
              <strong>Find out your real miss rate first.</strong> Most owners
              guess low. Your phone system or mobile call log will tell you
              exactly, and it is usually worse after hours than during them.
            </li>
            <li>
              <strong>Check when the misses happen.</strong> If they cluster
              outside opening hours, the fix is coverage, not more staff. See{" "}
              <Link href="/blog/after-hours-answering-service">
                after-hours answering
              </Link>
              .
            </li>
            <li>
              <strong>Compare against the actual alternatives.</strong> A second
              receptionist, an answering service, or an AI. We wrote up{" "}
              <Link href="/blog/answering-service-cost">
                what answering services cost
              </Link>{" "}
              and{" "}
              <Link href="/compare/ruby-alternative">
                how the human services compare
              </Link>
              .
            </li>
          </ul>

          <p>
            For the longer written version of this, with worked examples and
            where missed calls tend to hide, read{" "}
            <Link href="/blog/cost-of-a-missed-call">
              how much a missed call costs your business
            </Link>
            . If you want to see what answering every call looks like in
            practice, the <Link href="/pricing">pricing page</Link> has the plans
            and the <Link href="/">homepage</Link> lets you have our AI call you.
          </p>

          <h2 id="faq">Frequently asked questions</h2>
          {FAQS.map((item) => (
            <details key={item.q} className="mcc-faq-item">
              <summary>{item.q}</summary>
              <p className="mcc-faq-answer">{item.a}</p>
            </details>
          ))}
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
