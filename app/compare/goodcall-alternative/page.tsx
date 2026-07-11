import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteUrl, siteName, logoUrl, getAuthor } from "@/lib/site";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { CompareCta, CompareToc, type TocItem } from "../_compare/compare-client";
import { CompareByline } from "../_compare/byline";
import { RelatedComparisons } from "../_compare/related";
import "../_compare/compare.css";

const PATH = "/compare/goodcall-alternative";
const url = `${siteUrl}${PATH}`;
const author = getAuthor("brano");
const PUBLISHED = "2026-07-07";
const MODIFIED = "2026-07-07";

const title = "Goodcall Alternative: AI Receptionist Now vs Goodcall (2026)";
const description =
  "A multilingual, GDPR-first Goodcall alternative. AI Receptionist Now answers 24/7 in 25+ languages, is EU-hosted, flat-priced with no per-seat caps, and free to start.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Goodcall alternative",
    "AI Receptionist Now vs Goodcall",
    "Goodcall competitor",
    "Goodcall AI receptionist alternative",
    "cheaper than Goodcall",
    "multilingual AI receptionist",
    "GDPR AI phone agent",
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
  { capability: "Free to start (no card)", ours: "yes", them: "no" },
  { capability: "Flat price, no per-agent or per-caller caps", ours: "yes", them: "partial" },
  { capability: "Unlimited call minutes included", ours: "partial", them: "yes" },
  { capability: "25+ languages, switches mid-call", ours: "yes", them: "partial" },
  { capability: "GDPR, EU data residency", ours: "yes", them: "no" },
  { capability: "HIPAA compliant", ours: "yes", them: "yes" },
  { capability: "SOC 2 / ISO 27001 certified", ours: "no", them: "yes" },
  { capability: "Native CRM & calendar integrations", ours: "yes", them: "partial" },
  { capability: "US local numbers & Google Business sync", ours: "partial", them: "yes" },
];

const TOC: TocItem[] = [
  { id: "who-wins-what", label: "Who wins what" },
  { id: "pricing", label: "Pricing models compared" },
  { id: "languages", label: "Languages & reach" },
  { id: "compliance", label: "Compliance & data" },
  { id: "when-goodcall", label: "When Goodcall is the better call" },
  { id: "alternatives", label: "Other alternatives" },
  { id: "verdict", label: "The verdict" },
  { id: "more-comparisons", label: "More comparisons" },
  { id: "faq", label: "FAQ" },
];

const STATS = [
  { v: "25+", l: "languages, one agent" },
  { v: "Free", l: "to start, no card" },
  { v: "€99/mo", l: "flat, no seat caps" },
  { v: "EU", l: "hosted, GDPR-first" },
];

const OUR_WINS = [
  "25+ languages, switching automatically per caller",
  "GDPR-first, built and hosted in the EU",
  "Free to start with no card, so you test on real calls",
  "One flat plan, no per-agent seats or per-caller caps",
  "Booking straight into your calendar on every plan",
  "Native Google Calendar, Outlook, HubSpot and Salesforce links",
];

const GOODCALL_WINS = [
  "Unlimited call minutes, so heavy volume never inflates the bill",
  "SOC 2 Type II and ISO 27001 certifications alongside HIPAA",
  "Instant US local numbers, with Google Business and Voice sync",
  "Founder pedigree from Google's speech-AI team",
  "Human transfer workflows when a call needs a person",
  "Sharp fit for US local service businesses",
];

const SCENARIOS = [
  {
    title: "Your callers speak more than English",
    body: "One agent covers 25+ languages and switches mid-call. Goodcall supports a handful of languages with weaker mid-call switching, so multilingual markets favour us.",
  },
  {
    title: "You want to try before you pay",
    body: "We're free to start with no card. Goodcall retired its old free plan and now offers a time-limited trial, so testing on real calls costs you nothing here.",
  },
  {
    title: "You process EU data",
    body: "We're GDPR-first and EU-hosted. Goodcall is a US product carrying SOC 2 and ISO 27001, but with no published EU data-residency option.",
  },
  {
    title: "You run very high volume on one line",
    body: "Goodcall's unlimited minutes shine when a single number takes thousands of minutes. If that's you, be honest that their model may cost less at the extreme.",
  },
];

const STORY = [
  { src: "/compare/photos/goodcall-call-incoming.webp", cap: "A customer calls after hours" },
  { src: "/compare/photos/goodcall-answered.webp", cap: "Answered in their language" },
  { src: "/compare/photos/goodcall-calendar.webp", cap: "The appointment is booked" },
  { src: "/compare/photos/goodcall-owner-booked.webp", cap: "You get the summary" },
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

const FAQS = [
  {
    q: "Is AI Receptionist Now a real alternative to Goodcall?",
    a: "Yes. Both are self-serve, pure-AI phone agents that answer 24/7, capture leads, book appointments, and send a summary. The differences are language reach, data posture, and how you buy it. We handle 25+ languages, are GDPR-first and EU-hosted, are free to start, and price a flat plan with no per-agent seats or per-caller caps. Goodcall is a US product with unlimited minutes and its own security certifications.",
  },
  {
    q: "How does the pricing compare to Goodcall?",
    a: "The models are structured differently. Per Goodcall's published rates, its plans are $79, $129 and $249 per agent per month (Starter, Growth, Scale), each with unlimited minutes but a cap on unique customers (100, 250 and 500) and $0.50 for each extra unique caller. AI Receptionist Now is a flat €99/month (Solo, 1,000 minutes) or €299/month (Team, 3,000 minutes) with €0.09 per extra minute, no seat count and no per-caller cap. Goodcall can be cheaper if one line takes very high minutes; we're simpler and more predictable when caller counts or lines grow.",
  },
  {
    q: "Does Goodcall have a free plan?",
    a: "Not any longer. Goodcall launched with a free tier but has since discontinued it, and now offers a time-limited free trial (reported as 14 days by third parties, not stated on its pricing page). AI Receptionist Now is free to start with no card, so you can hear it handle real calls before you pay anything.",
  },
  {
    q: "Which supports more languages, AI Receptionist Now or Goodcall?",
    a: "We do. AI Receptionist Now handles 25+ languages from one agent and switches based on the caller. Goodcall supports roughly seven languages by third-party accounts, and reviewers note its automatic mid-call switching is limited. For multilingual call flows, that's a clear reason to choose us.",
  },
  {
    q: "Is Goodcall more secure or compliant?",
    a: "It depends on which box you need ticked. Goodcall publishes SOC 2 Type II and ISO 27001 certifications and is HIPAA-compliant, which is strong for US healthcare and enterprise procurement. AI Receptionist Now is GDPR-first, EU-hosted, and HIPAA-ready, which is what matters most for European businesses and EU personal data. If SOC 2 or ISO 27001 is a hard requirement, that's a genuine point for Goodcall today.",
  },
  {
    q: "When should I choose Goodcall instead?",
    a: "Choose Goodcall if you're a US business that wants unlimited minutes on a single high-volume line, needs SOC 2 or ISO 27001 on paper, or wants instant US local numbers with Google Business and Voice sync. Choose AI Receptionist Now when you want more languages, GDPR and EU hosting, a free start, and flat pricing without per-agent or per-caller caps.",
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
      { "@type": "ListItem", position: 2, name: "vs Goodcall", item: url },
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
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: { "@type": "ImageObject", url: logoUrl },
    },
  },
];

const avatars = [
  { src: "/testimonials/maria_sm.webp", alt: "Maria, AI Receptionist Now user" },
  { src: "/testimonials/mustafa_sm.webp", alt: "Mustafa, AI Receptionist Now user" },
  { src: "/testimonials/saheed_sm.webp", alt: "Saheed, AI Receptionist Now user" },
  { src: "/testimonials/delphine_sm.webp", alt: "Delphine, AI Receptionist Now user" },
];

export default function GoodcallComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <div className="compare-page">
        {/* ── Hero ── */}
        <section className="compare-hero">
          <div className="compare-hero-inner">
            <div className="compare-hero-left">
              <div className="compare-badge">Comparison &middot; 2026</div>
              <h1>
                <strong>AI Receptionist Now</strong>
                <br />vs Goodcall
              </h1>

              <div className="airn-vs">
                <span className="airn-vs-us">
                  <span className="airn-vs-mark"><PauseMark color="#fff" /></span>
                  AI Receptionist Now
                </span>
                <span className="airn-vs-sep">vs</span>
                <span className="airn-vs-us">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="airn-vs-mark-img" src="/compare/logos/goodcall.png" alt="Goodcall" />
                  Goodcall
                </span>
              </div>

              <p className="compare-hero-sub">
                Goodcall is a US, pure-AI phone agent with unlimited minutes,
                priced per agent with a cap on unique callers. AI Receptionist
                Now is the multilingual, GDPR-first alternative: it answers in
                25+ languages, is EU-hosted, free to start, and flat-priced with
                no seat or caller caps. Here is the honest, side-by-side
                breakdown.
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
                  <th>Goodcall</th>
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

        {/* ── Why ── */}
        <section className="compare-why">
          <h2>Why look past Goodcall?</h2>
          <p>
            Goodcall is a capable pure-AI agent with a genuinely nice idea:
            unlimited minutes. If you run one busy US line and speak English, it
            holds up well.{" "}
            <strong>
              The gap opens when your callers are multilingual, your data lives
              in the EU, or you want to start free without a per-agent, per-caller
              plan to reason about.
            </strong>
          </p>

          <div className="compare-showcase">
            <div className="compare-showcase-card">
              <span className="compare-showcase-tag">The outcome</span>
              <h3>A booked job, in any language</h3>
              <p>
                Every caller answered in their own language, day or night, and
                turned into an appointment on your calendar instead of a missed
                call you notice hours later.
              </p>
              <CompareCta label="Start free" />
              <div className="compare-before-after">
                <div className="compare-ba-item">
                  <span className="compare-ba-label">The call comes in</span>
                  <Image src="/compare/photos/goodcall-call-incoming.webp" alt="A customer calling a business after hours" width={1408} height={768} sizes="(max-width: 768px) 100vw, 280px" />
                </div>
                <div className="compare-ba-item">
                  <span className="compare-ba-label compare-ba-label--after">Booked, you&apos;re free</span>
                  <Image src="/compare/photos/goodcall-owner-booked.webp" alt="A small business owner smiling after a booking" width={1408} height={768} sizes="(max-width: 768px) 100vw, 280px" />
                </div>
              </div>
            </div>

            <div className="compare-showcase-card">
              <span className="compare-showcase-tag">The reach</span>
              <h3>One agent, 25+ languages</h3>
              <p>
                It detects the caller&apos;s language and keeps up if they
                switch. Goodcall supports a shorter list of languages, with
                mid-call switching reviewers describe as limited.
              </p>
              <Image
                className="fusion-shot"
                src="/compare/photos/goodcall-answered.webp"
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
                <strong>No copy-paste, nothing to chase.</strong> Goodcall reaches
                most CRMs through Zapier; we connect natively too.
              </p>
              <div className="compare-showcase-media">
                <Image
                  className="compare-showcase-video"
                  src="/compare/photos/goodcall-reception.webp"
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.logo} alt={it.name} loading="lazy" />
                    {it.name}
                  </span>
                ))}
                <span className="works-with-item"><span className="muted">+ 1000s more via Zapier</span></span>
              </div>
            </div>
          </div>

          {/* Product screenshots */}
          <div className="story-strip">
            {SCREENS.map((s) => (
              <figure className="story-fig" key={s.src}>
                <Image src={s.src} alt={s.cap} width={1000} height={1000} sizes="(max-width: 768px) 50vw, 360px" />
                <figcaption className="story-cap">{s.cap}</figcaption>
              </figure>
            ))}
          </div>

          {/* Story strip */}
          <div className="story-strip">
            {STORY.map((s) => (
              <figure className="story-fig" key={s.src}>
                <Image src={s.src} alt={s.cap} width={1200} height={800} sizes="(max-width: 768px) 50vw, 270px" />
                <figcaption className="story-cap">{s.cap}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── Main ── */}
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
                A fair scorecard between two pure-AI receptionists built for
                different markets.
              </p>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th className="compare-th-meltflex">AI Receptionist Now</th>
                    <th>Goodcall</th>
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
                    <td><span className="compare-score compare-score-meltflex">Multilingual, EU, flat &amp; free to start</span></td>
                    <td><span className="compare-score compare-score-competitor">US, high-volume, unlimited minutes</span></td>
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
                    <div className="compare-output-title">Goodcall</div>
                    {GOODCALL_WINS.map((g) => (
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

            {/* Section 01: pricing */}
            <section className="compare-section" id="pricing">
              <div className="compare-section-number">Section 01</div>
              <h2>Pricing models compared</h2>
              <p>
                These two price differently, so read the shape, not just the
                headline number. Per{" "}
                <a href="https://www.goodcall.com/pricing" target="_blank" rel="nofollow noopener noreferrer">
                  Goodcall&apos;s published rates
                </a>
                , you pay <strong>per agent</strong> with{" "}
                <strong>unlimited minutes</strong> but a cap on unique callers,
                then $0.50 for each extra one. We charge a{" "}
                <strong>flat plan per business</strong>, metered by the minute,
                with no seat count and no caller cap.
              </p>

              <div className="compare-pricing-visual">
                <div className="compare-pricing-visual-label">How the plans are built</div>
                <div className="compare-pricing-visual-grid">
                  <div className="compare-pv-card compare-pv-card--best">
                    <div className="compare-pv-badge">Flat</div>
                    <div className="compare-pv-name">AI Receptionist Now · Solo</div>
                    <div className="compare-pv-price">
                      <span className="compare-pv-amount">€99</span>
                      <span className="compare-pv-period">/ month</span>
                    </div>
                    <ul className="compare-pv-features">
                      <li>1,000 minutes included, €0.09 per extra</li>
                      <li>No per-agent seats, no unique-caller cap</li>
                      <li>Booking, 25+ languages, EU hosting included</li>
                      <li>Free to start, no card, no contract</li>
                    </ul>
                    <div className="compare-pv-note">Flat €99, however many callers</div>
                  </div>
                  <div className="compare-pv-card">
                    <div className="compare-pv-name">Goodcall · Growth</div>
                    <div className="compare-pv-price">
                      <span className="compare-pv-amount">$129</span>
                      <span className="compare-pv-period">/ agent / mo</span>
                    </div>
                    <ul className="compare-pv-features">
                      <li>Unlimited minutes (a real strength)</li>
                      <li className="pv-con">Capped at 250 unique callers, then $0.50 each</li>
                      <li className="pv-con">Priced per agent, so lines add up</li>
                      <li className="pv-con">No free plan; trial only</li>
                    </ul>
                    <div className="compare-pv-note">$129 per agent, per month</div>
                  </div>
                </div>
              </div>

              <div className="compare-callout">
                <strong>The honest read.</strong> Goodcall&apos;s unlimited
                minutes genuinely win when one line takes very high minutes with a
                modest number of repeat callers. Our flat, per-minute plan wins on
                predictability when caller counts climb, when you&apos;d otherwise
                pay for several agents, or when you want to start free. Figures are
                each provider&apos;s published rates in their own currency, not
                currency-converted.
              </div>

              <div className="compare-verdict">
                <div className="compare-verdict-label">Verdict</div>
                <p>
                  Neither is universally cheaper.{" "}
                  <strong>
                    Goodcall rewards raw minutes on one line; we reward simplicity
                    as callers, lines and languages grow, and we let you test for
                    free first.
                  </strong>
                </p>
              </div>
            </section>

            {/* Section 02: languages */}
            <section className="compare-section" id="languages">
              <div className="compare-section-number">Section 02</div>
              <h2>Languages &amp; reach</h2>
              <p>
                AI Receptionist Now handles <strong>25+ languages</strong> from
                one agent and detects the caller&apos;s language automatically.
                Goodcall supports roughly seven languages by third-party
                accounts, and reviewers note mid-call switching is limited. If any
                real share of your callers speaks another language, we pull ahead.
              </p>

              <div className="compare-cards">
                <div className="compare-card compare-card-winner">
                  <Image className="compare-card-img" src="/compare/photos/goodcall-answered.webp" alt="One AI voice answering callers in many languages" width={1408} height={768} sizes="(max-width: 768px) 100vw, 540px" />
                  <div className="compare-card-label compare-card-label-meltflex">AI Receptionist Now</div>
                  <ul>
                    <li>25+ languages from a single AI agent</li>
                    <li>Detects and switches language mid-call</li>
                    <li>20+ natural voices to match your brand</li>
                    <li>Every language included in the flat price</li>
                  </ul>
                </div>
                <div className="compare-card">
                  <Image className="compare-card-img" src="/compare/photos/goodcall-reception.webp" alt="A reception desk" width={1408} height={768} sizes="(max-width: 768px) 100vw, 540px" />
                  <div className="compare-card-label compare-card-label-competitor">Goodcall</div>
                  <ul>
                    <li>Around seven languages, per third-party reviews</li>
                    <li>Strong fit for US English callers</li>
                    <li>Mid-call switching reported as limited</li>
                    <li>Unlimited minutes on every plan</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 03: compliance */}
            <section className="compare-section" id="compliance">
              <div className="compare-section-number">Section 03</div>
              <h2>Compliance &amp; data</h2>
              <p>
                Here the honest answer is that each leads on a different axis.
                Goodcall publishes <strong>SOC 2 Type II</strong> and{" "}
                <strong>ISO 27001</strong> and is HIPAA-compliant, which reads
                well for US procurement. AI Receptionist Now is{" "}
                <strong>GDPR-first, EU-hosted</strong>, and HIPAA-ready, which is
                what most European buyers and EU personal data actually require.
              </p>

              <div className="compare-scorecard">
                <div className="compare-scorecard-label">Who leads where</div>
                <div className="compare-scorecard-grid">
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Multilingual coverage</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">GDPR / EU data residency</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Free to start</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Flat pricing, no seat caps</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">SOC 2 / ISO 27001</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">Goodcall</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Unlimited minutes</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">Goodcall</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">US numbers &amp; Google sync</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">Goodcall</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">HIPAA &amp; 24/7 answering</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Both</span></div>
                </div>
              </div>
            </section>

            {/* Section 04: when Goodcall wins */}
            <section className="compare-section" id="when-goodcall">
              <div className="compare-section-number">Section 04</div>
              <h2>When Goodcall is the better call</h2>
              <p>
                A comparison that only flatters itself is not worth reading.
                Here is where Goodcall is genuinely the right pick.
              </p>
              <div className="compare-highlight">
                <p>
                  <strong>Pick Goodcall if</strong> you run a US business with one
                  very high-volume line where unlimited minutes save real money,
                  you need SOC 2 Type II or ISO 27001 on paper, or you want instant
                  US local numbers with Google Business and Voice sync. Its
                  ex-Google speech-AI pedigree and vertical focus on US local
                  services are a real, honest fit.
                </p>
              </div>
            </section>

            {/* Other alternatives listicle */}
            <section className="compare-section" id="alternatives">
              <div className="compare-section-number">Shortlist</div>
              <h2>Other AI receptionist alternatives</h2>
              <p>
                Goodcall is one of several names people weigh. If you&apos;re
                building a shortlist, here is the quick, honest lay of the land.
              </p>
              <div className="compare-scorecard">
                <div className="compare-scorecard-label">The main alternatives at a glance</div>
                <div className="compare-scorecard-grid">
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><strong>AI Receptionist Now</strong> · flat, multilingual, EU/GDPR, free to start</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">Our pick</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><strong>Goodcall</strong> · US pure AI, unlimited minutes, per-agent pricing</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">This page</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><Link href="/compare/rosie-alternative">Rosie</Link> · US pure AI, English/Spanish, low entry price</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Compare</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><Link href="/compare/ruby-alternative">Ruby</Link> · live human receptionists, premium price</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Compare</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><Link href="/compare/smith-ai-alternative">Smith.ai</Link> · hybrid AI plus human agents, per-call</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Compare</span></div>
                </div>
              </div>
            </section>

            {/* Verdict */}
            <section className="compare-section" id="verdict">
              <div className="compare-section-number">Verdict</div>
              <h2>The bottom line</h2>
              <div className="compare-verdict">
                <div className="compare-verdict-label">In one line</div>
                <p>
                  Goodcall is a strong US pure-AI agent whose unlimited minutes
                  reward one busy line.{" "}
                  <strong>
                    AI Receptionist Now is the multilingual, GDPR-first, EU-hosted
                    alternative that is free to start and flat-priced with no seat
                    or caller caps.
                  </strong>{" "}
                  For most businesses outside a single high-volume US line,
                  that&apos;s the calmer choice.
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
