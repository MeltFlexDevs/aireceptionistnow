import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteUrl, siteName, getAuthor } from "@/lib/site";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import {
  CompareCta,
  CompareToc,
  CompareCalculator,
  type TocItem,
  type CompetitorPricing,
} from "../_compare/compare-client";
import { CompareByline } from "../_compare/byline";
import { RelatedComparisons } from "../_compare/related";
import "../_compare/compare.css";

const PATH = "/compare/rosie-alternative";
const url = `${siteUrl}${PATH}`;
const author = getAuthor("matus");
const PUBLISHED = "2026-07-07";
const MODIFIED = "2026-07-07";

const title = "Rosie Alternative: AI Receptionist Now vs Rosie (2026)";
const description =
  "A multilingual, GDPR-first Rosie alternative. AI Receptionist Now answers 24/7 in 25+ languages, with booking on every plan, EU-hosted. Free to start.";

export const metadata: Metadata = {
  // absolute: the root template would append the brand and push these past ~60 chars
  title: { absolute: title },
  description,
  keywords: [
    "Rosie alternative",
    "heyrosie alternative",
    "AI Receptionist Now vs Rosie",
    "Rosie AI receptionist competitor",
    "Rosie vs AI receptionist",
    "multilingual AI receptionist",
    "GDPR AI receptionist",
    "AI answering service alternative",
  ],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    type: "article",
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

type Owner = "yes" | "no" | "partial";
const ROLES: { capability: string; ours: Owner; them: Owner }[] = [
  { capability: "Answers calls 24/7", ours: "yes", them: "yes" },
  { capability: "Pure AI, self-serve, live in minutes", ours: "yes", them: "yes" },
  { capability: "Billed per minute, not per call", ours: "yes", them: "yes" },
  { capability: "In-call booking on every plan", ours: "yes", them: "partial" },
  { capability: "25+ languages, switches mid-call", ours: "yes", them: "no" },
  { capability: "GDPR, EU data residency", ours: "yes", them: "no" },
  { capability: "HIPAA compliant", ours: "yes", them: "no" },
  { capability: "Native CRM & calendar integrations", ours: "yes", them: "partial" },
  { capability: "Free to start (no card)", ours: "yes", them: "partial" },
  { capability: "Lowest entry price", ours: "partial", them: "yes" },
  { capability: "US local numbers & US-based support", ours: "partial", them: "yes" },
];

const TOC: TocItem[] = [
  { id: "who-wins-what", label: "Who wins what" },
  { id: "pricing", label: "Pricing, side by side" },
  { id: "languages", label: "Languages & reach" },
  { id: "compliance", label: "Compliance & data" },
  { id: "when-rosie", label: "When Rosie is the better call" },
  { id: "alternatives", label: "Other alternatives" },
  { id: "verdict", label: "The verdict" },
  { id: "more-comparisons", label: "More comparisons" },
  { id: "faq", label: "FAQ" },
];

const STATS = [
  { v: "25+", l: "languages, one agent" },
  { v: "2", l: "languages on Rosie" },
  { v: "€99/mo", l: "flat, booking included" },
  { v: "EU", l: "hosted, GDPR-first" },
];

const OUR_WINS = [
  "25+ languages, switching automatically per caller",
  "GDPR-first, built and hosted in the EU",
  "HIPAA-ready for healthcare intake",
  "In-call appointment booking on every plan, not just the mid tier",
  "Native Google Calendar, Outlook, HubSpot and Salesforce links",
  "Free to start, no card, live in about ten minutes",
];

const ROSIE_WINS = [
  "A lower $49 entry price for very low call volume",
  "US phone numbers and US-based support out of the box",
  "Trained straight from your Google Business Profile",
  "Sharp focus on US home services and trades",
  "Website chat widget included on every plan",
  "A familiar, US-market brand with real traction",
];

const SCENARIOS = [
  {
    title: "Your callers speak more than English",
    body: "One agent covers 25+ languages and switches mid-call. Rosie answers in English and Spanish, so multilingual markets are where we pull ahead.",
  },
  {
    title: "You're in the EU or handle EU data",
    body: "We're built and hosted in the EU and GDPR-first. Rosie is a US product with no EU data-residency option, which matters if your callers are European.",
  },
  {
    title: "You book appointments on the phone",
    body: "In-call booking is included on our Solo plan. On Rosie, real in-call booking starts on the $149 Scale tier; the entry plan sends a text link instead.",
  },
  {
    title: "You're a US solo running very low volume",
    body: "If you take a handful of calls a month and only need English or Spanish, Rosie's $49 entry plan is genuinely cheaper. Be honest with yourself about that.",
  },
];

const STORY = [
  { src: "/compare/photos/rosie-call-incoming.webp", cap: "A customer calls after hours" },
  { src: "/compare/photos/rosie-multilingual.webp", cap: "Answered in their language" },
  { src: "/compare/photos/rosie-calendar.webp", cap: "The appointment is booked" },
  { src: "/compare/photos/rosie-owner-booked.webp", cap: "You get the summary" },
];

const SCREENS = [
  { src: "/how-it-works/create.webp", cap: "Create your assistant: voice, language, greeting" },
  { src: "/how-it-works/call.webp", cap: "It answers live, 24/7" },
  { src: "/how-it-works/behavior.webp", cap: "Choose what it does on every call" },
];

const INTEGRATION_LOGOS = [
  { name: "Google Calendar", logo: "/compare/logos/googlecalendar.svg" },
  { name: "Outlook", logo: "/compare/logos/outlook.svg" },
  { name: "HubSpot", logo: "/compare/logos/hubspot.svg" },
  { name: "Salesforce", logo: "/compare/logos/salesforce.svg" },
  { name: "Calendly", logo: "/compare/logos/calendly.svg" },
  { name: "Zapier", logo: "/compare/logos/zapier.svg" },
];

const rosiePricing: CompetitorPricing = {
  name: "Rosie",
  currency: "$",
  planLabel: "Scale",
  model: "perMinute",
  base: 149,
  includedMinutes: 1000,
  overagePerMinute: 0.25,
};

const FAQS = [
  {
    q: "Is AI Receptionist Now a real alternative to Rosie?",
    a: "Yes. Both are pure-AI phone receptionists that answer 24/7, qualify callers, book appointments, and send you a summary, and both meter by the minute rather than per call. The differences are reach and posture: we handle 25+ languages and switch mid-call, we're GDPR-first and EU-hosted, we're HIPAA-ready, and in-call booking is included on our entry plan. Rosie is a tightly focused US product for English and Spanish callers.",
  },
  {
    q: "How does the pricing compare to Rosie?",
    a: "Per Rosie's published rates, its plans run $49/month for 250 minutes (Professional), $149/month for 1,000 minutes (Scale, the first tier with real in-call booking), and $299/month for 2,000 minutes (Growth). AI Receptionist Now is €99/month for 1,000 minutes (Solo) or €299/month for 3,000 minutes (Team), with €0.09 per extra minute and booking on both plans. So at the same 1,000 included minutes, our Solo plan lands below Rosie's Scale tier and includes booking, though Rosie's $49 entry plan is cheaper if you only need a couple of hundred minutes.",
  },
  {
    q: "Does AI Receptionist Now support more languages than Rosie?",
    a: "Considerably more. We handle 25+ languages from a single agent and detect the caller's language automatically, switching mid-conversation. Rosie's calls are bilingual English and Spanish. If any meaningful share of your callers speaks another language, that gap is the clearest reason to choose us.",
  },
  {
    q: "Is Rosie GDPR compliant and EU-hosted?",
    a: "Rosie is a US-based product and does not publish a GDPR or EU data-residency position at the time of writing, per its own site. AI Receptionist Now is built and hosted in the EU by MeltFlex s.r.o. and is GDPR-first, so if your callers are European or you process EU personal data, that difference is worth weighing carefully.",
  },
  {
    q: "Does Rosie book appointments during the call?",
    a: "On Rosie, real in-call calendar booking starts on the $149 Scale plan, per its published rates; the $49 Professional plan takes messages and can send a booking link by text instead. AI Receptionist Now books directly into your calendar during the call on both Solo and Team, so booking isn't gated behind a higher tier.",
  },
  {
    q: "When should I choose Rosie instead?",
    a: "If you're a US business running very low call volume, only need English and Spanish, and want the lowest possible entry price, Rosie's $49 plan and US-based setup are a fair, honest fit. Choose AI Receptionist Now when you want more languages, GDPR and EU hosting, HIPAA readiness, or booking included from the first plan.",
  },
];

function Check({ type }: { type: Owner }) {
  if (type === "yes") return <span className="compare-check compare-check-yes">&#10003;</span>;
  if (type === "no") return <span className="compare-check compare-check-no">&#10007;</span>;
  return <span className="compare-check compare-check-partial">~</span>;
}

function PauseMark({ color = "#fff" }: { color?: string }) {
  return (
    <svg width="9" height="18" viewBox="0 0 7 15" fill="none" aria-hidden="true">
      <rect x="0" y="0" width="2.5" height="15" rx="1" fill={color} />
      <rect x="4.5" y="0" width="2.5" height="15" rx="1" fill={color} />
    </svg>
  );
}

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
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${siteUrl}/compare` },
      { "@type": "ListItem", position: 3, name: "vs Rosie", item: url },
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

const avatars = [
  { src: "/testimonials/maria_sm.webp", alt: "Maria, AI Receptionist Now user" },
  { src: "/testimonials/mustafa_sm.webp", alt: "Mustafa, AI Receptionist Now user" },
  { src: "/testimonials/saheed_sm.webp", alt: "Saheed, AI Receptionist Now user" },
  { src: "/testimonials/delphine_sm.webp", alt: "Delphine, AI Receptionist Now user" },
];

export default function RosieComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <div className="compare-page">
        <section className="compare-hero">
          <div className="compare-hero-inner">
            <div className="compare-hero-left">
              <div className="compare-badge">Comparison &middot; 2026</div>
              <h1>
                <strong>AI Receptionist Now</strong>
                <br />vs Rosie
              </h1>

              <div className="airn-vs">
                <span className="airn-vs-us">
                  <span className="airn-vs-mark"><PauseMark color="#fff" /></span>
                  AI Receptionist Now
                </span>
                <span className="airn-vs-sep">vs</span>
                <span className="airn-vs-us">
                  <img className="airn-vs-mark-img" src="/compare/logos/rosie.png" alt="Rosie" />
                  Rosie
                </span>
              </div>

              <p className="compare-hero-sub">
                Rosie is a US, pure-AI answering service for English and Spanish
                callers, billed by the minute. AI Receptionist Now is the
                multilingual, GDPR-first alternative: it answers in 25+
                languages, is built and hosted in the EU, and includes
                appointment booking on every plan. Here is the honest,
                side-by-side breakdown.
              </p>
              <div className="compare-hero-cta">
                <CompareCta label="Start free" />
                <Link href="/pricing" className="compare-cta-btn compare-cta-btn-outline">
                  See pricing
                </Link>
              </div>

              <div className="hero-trust-bar">
                <div className="hero-trust-avatars">
                  {avatars.map((av) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={av.src}
                      className="hero-trust-avatar"
                      alt={av.alt}
                      width={32}
                      height={32}
                      src={av.src}
                    />
                  ))}
                </div>
                <div className="hero-trust-text">
                  <span className="hero-trust-number">9,500+ users worldwide</span>
                  <span className="hero-trust-label">Every call answered 24/7.</span>
                </div>
                <div className="hero-trust-reviews">
                  <div className="hero-trust-reviews-right">
                    <div className="hero-trust-stars">
                      <span className="hero-trust-star">&#9733;</span>
                      <span className="hero-trust-star">&#9733;</span>
                      <span className="hero-trust-star">&#9733;</span>
                      <span className="hero-trust-star">&#9733;</span>
                      <span className="hero-trust-star half">&#9733;</span>
                    </div>
                    <span className="hero-trust-rating">4.8 out of 5</span>
                  </div>
                </div>
              </div>

              <CompareByline author={author} published="July 2026" updated="July 2026" />

              <div className="compare-hero-meta">
                <span>Updated July 2026</span>
                <span>&middot;</span>
                <span>Figures from published rates</span>
              </div>
            </div>

            <table className="compare-hero-table">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th className="compare-th-meltflex">AI Receptionist Now</th>
                  <th>Rosie</th>
                </tr>
              </thead>
              <tbody>
                {ROLES.map((r) => (
                  <tr key={r.capability}>
                    <td>{r.capability}</td>
                    <td><Check type={r.ours} /></td>
                    <td><Check type={r.them} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="compare-why">
          <h2>Why look past Rosie?</h2>
          <p>
            Rosie does the core job well: it picks up, screens spam, takes
            messages, and can book calls. If your callers are all in the US and
            speak English or Spanish, it is a solid pick.{" "}
            <strong>
              The gap opens once your callers are multilingual, your data lives
              in the EU, or you want booking from day one without paying up a
              tier.
            </strong>
          </p>

          <div className="compare-showcase">
            <div className="compare-showcase-card">
              <span className="compare-showcase-tag">The outcome</span>
              <h3>A booked job, in any language</h3>
              <p>
                Every caller answered in their own language, day or night, and
                turned into an appointment on your calendar rather than a
                voicemail you return tomorrow.
              </p>
              <CompareCta label="Start free" />
              <div className="compare-before-after">
                <div className="compare-ba-item">
                  <span className="compare-ba-label">The call comes in</span>
                  <Image src="/compare/photos/rosie-call-incoming.webp" alt="A customer calling a business after hours" width={1408} height={768} sizes="(max-width: 768px) 100vw, 280px" />
                </div>
                <div className="compare-ba-item">
                  <span className="compare-ba-label compare-ba-label--after">Booked, you&apos;re free</span>
                  <Image src="/compare/photos/rosie-owner-booked.webp" alt="A small business owner smiling after a booking" width={1408} height={768} sizes="(max-width: 768px) 100vw, 280px" />
                </div>
              </div>
            </div>

            <div className="compare-showcase-card">
              <span className="compare-showcase-tag">The reach</span>
              <h3>One agent, 25+ languages</h3>
              <p>
                It hears the caller, picks the language, and keeps up if they
                switch. Rosie covers English and Spanish, so anyone outside that
                pair reaches a service that cannot fully help them.
              </p>
              <Image
                className="fusion-shot"
                src="/compare/photos/rosie-multilingual.webp"
                alt="One AI voice answering callers in many languages"
                width={1408}
                height={768}
                sizes="(max-width: 900px) 100vw, 560px"
              />
              <div className="fusion-caption">
                <span className="airn-vs-mark"><PauseMark color="#fff" /></span>
                AI Receptionist Now
              </div>
              <div className="fusion-chips">
                <span className="fusion-chip">Detect</span>
                <span className="fusion-chip">Switch</span>
                <span className="fusion-chip">Book</span>
              </div>
            </div>

            <div className="compare-showcase-card compare-showcase-card--full">
              <span className="compare-showcase-tag compare-showcase-tag--exclusive">Plugs in</span>
              <h3>It drops straight into the tools you already use</h3>
              <p>
                Bookings land in your calendar, leads land in your CRM, and a
                summary lands in your inbox after every call.{" "}
                <strong>No copy-paste, nothing to chase.</strong> Rosie leans on
                Zapier for most of this; we connect natively too.
              </p>
              <div className="compare-showcase-media">
                <Image
                  className="compare-showcase-video"
                  src="/compare/photos/rosie-reception.webp"
                  alt="A modern reception area"
                  width={1408}
                  height={768}
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="compare-output" style={{ margin: 0 }}>
                  <div className="compare-output-label">After every call</div>
                  <div className="compare-output-item"><span className="compare-output-dot compare-output-dot--yes" /> Appointment booked in your calendar</div>
                  <div className="compare-output-item"><span className="compare-output-dot compare-output-dot--yes" /> Lead pushed to your CRM</div>
                  <div className="compare-output-item"><span className="compare-output-dot compare-output-dot--yes" /> Transcript &amp; summary by text or email</div>
                  <div className="compare-output-item"><span className="compare-output-dot compare-output-dot--yes" /> Caller details captured, never lost</div>
                </div>
              </div>

              <div className="works-with">
                <span className="works-with-label">Works with</span>
                {INTEGRATION_LOGOS.map((it) => (
                  <span className="works-with-item" key={it.name}>
                    <img src={it.logo} alt={`${it.name} logo`} width={24} height={24} loading="lazy" />
                    {it.name}
                  </span>
                ))}
                <span className="works-with-item"><span className="muted">+ 1000s more via Zapier</span></span>
              </div>
            </div>
          </div>

          <div className="story-strip">
            {SCREENS.map((s) => (
              <figure className="story-fig" key={s.src}>
                <Image src={s.src} alt={s.cap} width={1000} height={1000} sizes="(max-width: 768px) 50vw, 360px" />
                <figcaption className="story-cap">{s.cap}</figcaption>
              </figure>
            ))}
          </div>

          <div className="story-strip">
            {STORY.map((s) => (
              <figure className="story-fig" key={s.src}>
                <Image src={s.src} alt={s.cap} width={1200} height={800} sizes="(max-width: 768px) 50vw, 270px" />
                <figcaption className="story-cap">{s.cap}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <div className="compare-main">
          <CompareToc items={TOC} />

          <article className="compare-article">
            <div className="compare-stats">
              {STATS.map((s) => (
                <div className="compare-stat" key={s.l}>
                  <div className="compare-stat-value">{s.v}</div>
                  <div className="compare-stat-label">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="compare-diagnostic">
              <div className="compare-diagnostic-label">What matters most to you?</div>
              <div className="compare-diagnostic-grid">
                {SCENARIOS.map((s) => (
                  <div className="compare-diagnostic-card" key={s.title}>
                    <span className="compare-diagnostic-title">{s.title}</span>
                    <p>{s.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <section className="compare-table-section" id="who-wins-what">
              <h2>Who wins what</h2>
              <p className="compare-table-sub">
                A fair scorecard between two pure-AI receptionists. Each owns the
                slice of the market it was built for.
              </p>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th className="compare-th-meltflex">AI Receptionist Now</th>
                    <th>Rosie</th>
                  </tr>
                </thead>
                <tbody>
                  {ROLES.map((r) => (
                    <tr key={r.capability}>
                      <td>{r.capability}</td>
                      <td><Check type={r.ours} /></td>
                      <td><Check type={r.them} /></td>
                    </tr>
                  ))}
                  <tr className="compare-score-row">
                    <td><strong>Best for</strong></td>
                    <td><span className="compare-score compare-score-meltflex">Multilingual, EU, booking-first</span></td>
                    <td><span className="compare-score compare-score-competitor">US, low-volume, English/Spanish</span></td>
                  </tr>
                </tbody>
              </table>

              <div className="compare-output">
                <div className="compare-output-label">What each is best at</div>
                <div className="compare-output-grid">
                  <div className="compare-output-card compare-output-card--winner">
                    <div className="compare-output-title">AI Receptionist Now</div>
                    {OUR_WINS.map((g) => (
                      <div className="compare-output-item" key={g}>
                        <span className="compare-output-dot compare-output-dot--yes" /> {g}
                      </div>
                    ))}
                  </div>
                  <div className="compare-output-card compare-output-card--winner">
                    <div className="compare-output-title">Rosie</div>
                    {ROSIE_WINS.map((g) => (
                      <div className="compare-output-item" key={g}>
                        <span className="compare-output-dot compare-output-dot--yes" /> {g}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="compare-cta-section">
              <h2>Hear it answer your business</h2>
              <p>
                The fastest way to compare is to listen. Have our AI handle a
                real conversation, in the language your callers actually use.
              </p>
              <div className="compare-cta-buttons">
                <CompareCta label="Start free" />
                <Link href="/#how-it-works" className="compare-cta-btn compare-cta-btn-outline">
                  See how it works
                </Link>
              </div>
            </div>

            <section className="compare-section" id="pricing">
              <div className="compare-section-number">Section 01</div>
              <h2>Pricing, side by side</h2>
              <p>
                Both services meter minutes rather than calls, so this comes
                down to what each plan includes. Per{" "}
                <a href="https://heyrosie.com/pricing" target="_blank" rel="nofollow noopener noreferrer">
                  Rosie&apos;s published rates
                </a>
                , its plans are <strong>$49 for 250 minutes</strong>,{" "}
                <strong>$149 for 1,000 minutes</strong> (the first tier with real
                in-call booking), and <strong>$299 for 2,000 minutes</strong>.
                We&apos;re <strong>€99 for 1,000 minutes</strong> or{" "}
                <strong>€299 for 3,000</strong>, €0.09 per extra minute, with
                booking on both plans.
              </p>

              <CompareCalculator competitor={rosiePricing} sourceUrl="https://heyrosie.com/pricing" />

              <div className="compare-callout">
                <strong>The honest read.</strong> At the same 1,000 included
                minutes, our Solo plan sits below Rosie&apos;s Scale tier and
                includes booking. But if you only need a couple of hundred
                minutes a month and speak English or Spanish, Rosie&apos;s $49
                entry plan is the cheaper start. Rosie&apos;s overage rate is not
                published on its site; the $0.25 per minute used above is a
                widely reported third-party figure, so treat the estimate as
                indicative.
              </div>

              <div className="compare-verdict">
                <div className="compare-verdict-label">Verdict</div>
                <p>
                  For the same minute bucket with booking included, we come in
                  cheaper.{" "}
                  <strong>
                    Rosie wins purely at the low-volume entry point.
                  </strong>{" "}
                  Above a few hundred minutes, the flat plans separate.
                </p>
              </div>
            </section>

            <section className="compare-section" id="languages">
              <div className="compare-section-number">Section 02</div>
              <h2>Languages &amp; reach</h2>
              <p>
                This is the widest gap between the two. AI Receptionist Now
                handles <strong>25+ languages</strong> from one agent and detects
                the caller&apos;s language automatically. Rosie answers in{" "}
                <strong>English and Spanish</strong>, which covers a lot of the
                US market but little beyond it.
              </p>

              <div className="compare-cards">
                <div className="compare-card compare-card-winner">
                  <Image className="compare-card-img" src="/compare/photos/rosie-multilingual.webp" alt="One AI voice answering callers in many languages" width={1408} height={768} sizes="(max-width: 768px) 100vw, 540px" />
                  <div className="compare-card-label compare-card-label-meltflex">AI Receptionist Now</div>
                  <ul>
                    <li>25+ languages from a single AI agent</li>
                    <li>Detects and switches language mid-call</li>
                    <li>20+ natural voices to match your brand</li>
                    <li>Every language included in the flat price</li>
                  </ul>
                </div>
                <div className="compare-card">
                  <Image className="compare-card-img" src="/compare/photos/rosie-reception.webp" alt="A reception desk" width={1408} height={768} sizes="(max-width: 768px) 100vw, 540px" />
                  <div className="compare-card-label compare-card-label-competitor">Rosie</div>
                  <ul>
                    <li>Bilingual English and Spanish on every plan</li>
                    <li>Strong fit for US callers</li>
                    <li>Mid-call switching not documented</li>
                    <li>Limited reach outside English/Spanish</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="compare-section" id="compliance">
              <div className="compare-section-number">Section 03</div>
              <h2>Compliance &amp; data</h2>
              <p>
                Where your call data lives is not a footnote if you operate in
                Europe or handle health information. AI Receptionist Now is built
                and hosted in the EU by MeltFlex s.r.o., is GDPR-first, and is
                HIPAA-ready. Rosie is a US product; at the time of writing it
                publishes no GDPR or EU data-residency position, and its terms
                restrict HIPAA-protected data unless separately agreed.
              </p>

              <div className="compare-scorecard">
                <div className="compare-scorecard-label">Who leads where</div>
                <div className="compare-scorecard-grid">
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Multilingual coverage</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">GDPR / EU data residency</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">HIPAA readiness</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Booking on the entry plan</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Lowest entry price</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">Rosie</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">US numbers &amp; support</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">Rosie</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Per-minute billing</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Both</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">24/7 answering</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Both</span></div>
                </div>
              </div>
            </section>

            <section className="compare-section" id="when-rosie">
              <div className="compare-section-number">Section 04</div>
              <h2>When Rosie is the better call</h2>
              <p>
                A comparison that only flatters itself is not worth reading.
                Here is where Rosie is genuinely the right pick, and you should
                choose it without second-guessing if this is you.
              </p>
              <div className="compare-highlight">
                <p>
                  <strong>Pick Rosie if</strong> you run a US business with low
                  monthly call volume, your callers speak English or Spanish, and
                  the $49 entry price matters more than languages, EU hosting, or
                  booking on the first tier. Its Google Business Profile setup and
                  US-based support are a clean, familiar fit for American trades.
                </p>
              </div>
            </section>

            <section className="compare-section" id="alternatives">
              <div className="compare-section-number">Shortlist</div>
              <h2>Other AI receptionist alternatives</h2>
              <p>
                Rosie is one of several names people weigh. If you&apos;re
                building a shortlist, here is the quick, honest lay of the land.
              </p>
              <div className="compare-scorecard">
                <div className="compare-scorecard-label">The main alternatives at a glance</div>
                <div className="compare-scorecard-grid">
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><strong>AI Receptionist Now</strong> · flat, multilingual, EU/GDPR, per-minute, booking on every plan</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">Our pick</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><strong>Rosie</strong> · US pure AI, English/Spanish, low entry price</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">This page</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><Link href="/compare/goodcall-alternative">Goodcall</Link> · US pure AI, unlimited minutes, per-agent pricing</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Compare</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><Link href="/compare/ruby-alternative">Ruby</Link> · live human receptionists, premium price</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Compare</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><Link href="/compare/smith-ai-alternative">Smith.ai</Link> · hybrid AI plus human agents, per-call</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Compare</span></div>
                </div>
              </div>
            </section>

            <section className="compare-section" id="verdict">
              <div className="compare-section-number">Verdict</div>
              <h2>The bottom line</h2>
              <div className="compare-verdict">
                <div className="compare-verdict-label">In one line</div>
                <p>
                  Rosie is a tidy, low-cost pure-AI receptionist for US, English
                  or Spanish callers.{" "}
                  <strong>
                    AI Receptionist Now is the multilingual, GDPR-first, EU-hosted
                    alternative that includes booking on every plan and answers in
                    25+ languages, 24/7.
                  </strong>{" "}
                  If your callers or your data reach past the US, that&apos;s the
                  better trade.
                </p>
              </div>
            </section>

            <RelatedComparisons currentSlug={PATH.slice("/compare/".length)} />

            <div className="compare-cta-section">
              <h2>Try the alternative free</h2>
              <p>
                Answer every call in your callers&apos; language, book
                appointments, capture leads. Free to start, live in minutes,
                EU-hosted.
              </p>
              <div className="compare-cta-buttons">
                <CompareCta label="Start free" />
                <Link href="/pricing" className="compare-cta-btn compare-cta-btn-outline">
                  Compare plans
                </Link>
              </div>
            </div>

            <section className="compare-faq" id="faq">
              <h2>Frequently asked questions</h2>
              {FAQS.map((item) => (
                <details key={item.q} className="compare-faq-item">
                  <summary>{item.q}</summary>
                  <p className="compare-faq-answer">{item.a}</p>
                </details>
              ))}
            </section>
          </article>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
