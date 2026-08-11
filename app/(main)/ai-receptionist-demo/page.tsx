import type { Metadata } from "next";
import Link from "next/link";

import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { siteName, siteUrl } from "@/lib/site";

const PATH = "/ai-receptionist-demo";
const url = `${siteUrl}${PATH}`;

/**
 * The public demo line.
 *
 * Unset means no number to print, and the page says so rather than rendering a
 * dead tel: link - a demo page whose demo does not work is worse than no demo
 * page. Set it to the E.164 number of a real assistant configured as a plausible
 * fake business, with the abuse caps in place (see the note in the page copy).
 */
const DEMO_NUMBER = process.env.NEXT_PUBLIC_DEMO_PHONE_NUMBER ?? "";

/** Digits only, for the tel: href. */
const DEMO_TEL = DEMO_NUMBER.replace(/[^\d+]/g, "");

// The query this page exists for, near-verbatim. "What does an AI receptionist
// sound like" is an evaluation-stage question that today returns vendor
// homepages and listicles - nobody answers it with something you can actually
// hear, because answering it honestly means letting a stranger try to break your
// product. That is exactly why it converts.
const title = "What Does an AI Receptionist Sound Like? Call One and Find Out";
const description =
  "Ring our AI receptionist yourself. Ask it anything, try to trip it up, then hang up - it texts you a link to what it understood, so you can check its work rather than take our word for it.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [
    "what does an ai receptionist sound like",
    "ai receptionist demo",
    "free ai receptionist demo",
    "ai receptionist demo video",
    "does ai receptionist work",
    "is ai receptionist worth it",
    "try ai receptionist",
    "ai answering service demo",
  ],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    type: "website",
    url,
    siteName,
    images: [{ url: `${siteUrl}/opengraph-image.png`, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteUrl}/opengraph-image.png`],
  },
};

/**
 * Three things to try, and the third one is the point.
 *
 * Every vendor demo script steers you towards the happy path. Telling a
 * prospect to deliberately ask for something the assistant cannot know is a
 * pre-commitment: it says we already know where it breaks and we would rather
 * you find out here than in month two. It also produces the more interesting
 * receipt, because a good assistant's answer to "I don't know that" is the
 * behaviour worth buying.
 */
const TRY = [
  {
    heading: "Book something",
    body: "Ask for an appointment. Change your mind halfway through, then change the day. See whether it keeps up, and whether the time on your receipt is the time you actually asked for.",
  },
  {
    heading: "Ask a real question",
    body: "Opening hours, what a job costs, whether they cover your area. This is the everyday traffic a receptionist handles, and it is where a script-driven bot stops sounding like a person.",
  },
  {
    heading: "Try to trip it up",
    body: "Ask for something it cannot possibly know - a price nobody configured, a service the business does not offer, medical or legal advice. What you want to hear is a straight \"I can't confirm that, let me take a message.\" If you get a confident invented answer instead, that is the failure mode worth knowing about before you buy anything.",
  },
];

const FAQS = [
  {
    q: "What does an AI receptionist actually sound like?",
    a: "There is no honest way to answer that in writing, which is why this page is a phone number rather than a description. It is a synthetic voice, it responds in well under a second, and it can be interrupted mid-sentence like a person. Whether it sounds good enough for your customers is a judgement only you can make, on your own phone, on a normal connection - a recording chosen by the vendor tells you nothing, because we would have picked the best one.",
  },
  {
    q: "What is the text message I get afterwards?",
    a: "A link to a receipt: a private page showing what the assistant understood you to be asking for, anything it committed to, the appointment if it booked one, and the recording of the call. There is a button on it to say we got something wrong. That receipt is the product working the way it works for a real customer - every caller a business takes on this system gets the same thing, which is how the owner finds out about a misheard address instead of finding out at the appointment.",
  },
  {
    q: "Will you call me or add me to a list?",
    a: "No. The number you call from is used to send you that one text and nothing else, and the demo receipt link expires after a week. There is no sales call. If you want to be contacted you can start a trial from the pricing page like anyone else.",
  },
  {
    q: "Is this the same thing your customers get?",
    a: "The same call engine, the same voices, the same booking and message tools, the same receipt. What is different is the business behind it: the demo line is configured for a made-up company with a small invented knowledge base, so it knows less than a real customer's assistant would. A configured assistant answers far more of what it is asked, because it has been given the business's actual prices, hours and policies to answer from.",
  },
  {
    q: "Does an AI receptionist work well enough to replace a person?",
    a: "For answering, booking, and taking messages around the clock, yes - that is the majority of inbound volume for most small businesses, and it does it at 2am. For anything that needs judgement, negotiation, or genuine empathy at a difficult moment, no, and the honest configuration hands those to a human quickly. Anyone selling you a phone line that never needs a person is selling you the version of this that generates complaints.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function DemoPage() {
  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-3xl px-5 pt-14 pb-24 sm:pt-20">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">
          Call it. Hang up. Read what it heard.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">
          Every AI receptionist website tells you it sounds natural. Ours gives you the number.
          Ring it, talk to it however you like, then hang up - it will text you a link to what it
          understood you to be asking for, so you can check its work instead of taking our word
          for anything on this page.
        </p>

        {DEMO_TEL ? (
          <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm sm:p-9">
            <p className="text-sm text-neutral-500">The demo line, live right now</p>
            <a
              href={`tel:${DEMO_TEL}`}
              className="mt-2 block text-3xl font-semibold tracking-tight underline-offset-4 hover:underline sm:text-4xl"
            >
              {DEMO_NUMBER}
            </a>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              We use the number you call from to send you one text with your receipt, and for
              nothing else. No sales call, no list. The receipt link expires after a week.
            </p>
          </div>
        ) : (
          // The number is configuration, and a dead tel: link on a page whose
          // entire promise is "call it" would be worse than admitting it.
          <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-7">
            <p className="text-lg font-medium">The demo line is being set up.</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              In the meantime you can have it call you instead - put your number into the form on
              the{" "}
              <Link href="/" className="underline underline-offset-4">
                home page
              </Link>{" "}
              and it will ring you within a few seconds.
            </p>
          </div>
        )}

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">Three things worth trying</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {TRY.map((item) => (
              <div key={item.heading} className="rounded-xl border border-neutral-200 p-5">
                <h3 className="font-medium">{item.heading}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">What happens after you hang up</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-neutral-600">
            Within a few seconds you get one text with a link. The page behind it shows the call
            back to you in your own words: what you asked for, what was agreed, the appointment if
            one was booked, and the recording. There is a button that says something is wrong.
          </p>
          <p className="mt-4 max-w-2xl leading-relaxed text-neutral-600">
            That is not a demo feature. Every caller to a business running on this system gets the
            same receipt, and when one of them presses that button the business hears about it
            immediately - which is the only way anyone ever finds out that an assistant confidently
            wrote down the wrong house number.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
          <dl className="mt-6 divide-y divide-neutral-200 border-t border-neutral-200">
            {FAQS.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="font-medium">{f.q}</dt>
                <dd className="mt-2 leading-relaxed text-neutral-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16 rounded-2xl bg-neutral-900 p-8 text-white sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            When you have heard enough, point your own number at it
          </h2>
          <p className="mt-3 max-w-xl leading-relaxed text-neutral-300">
            Bring the number you already advertise, or take a new one. It answers every call from
            the moment you switch it on.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-neutral-900"
            >
              See pricing
            </Link>
            <Link
              href="/compare"
              className="rounded-lg border border-neutral-700 px-5 py-3 text-sm font-medium text-white"
            >
              Compare with other services
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
