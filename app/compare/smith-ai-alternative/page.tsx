import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteUrl, siteName, logoUrl } from "@/lib/site";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { CompareCta, CompareToc, type TocItem } from "../_compare/compare-client";
import { RelatedComparisons } from "../_compare/related";
import "../_compare/compare.css";

const PATH = "/compare/smith-ai-alternative";
const url = `${siteUrl}${PATH}`;

const title = "Smith.ai Alternative: AI Receptionist Now vs Smith.ai (2026)";
const description =
  "A flat-priced Smith.ai alternative. AI Receptionist Now bills per minute — not per call — answers 24/7 in 25+ languages, and goes live in 10 minutes. Free to start.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Smith.ai alternative",
    "AI Receptionist Now vs Smith.ai",
    "Smith.ai competitor",
    "cheaper than Smith.ai",
    "AI receptionist comparison",
    "AI answering service alternative",
    "per-call vs per-minute AI receptionist",
    "virtual receptionist alternative",
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
const ROLES: { capability: string; ours: Owner; smith: Owner }[] = [
  { capability: "Answers calls 24/7", ours: "yes", smith: "yes" },
  { capability: "Live in ~10 minutes, self-serve", ours: "yes", smith: "no" },
  { capability: "Flat monthly price", ours: "yes", smith: "no" },
  { capability: "Billed per minute, not per call", ours: "yes", smith: "no" },
  { capability: "Free to start", ours: "yes", smith: "no" },
  { capability: "25+ languages, switches mid-call", ours: "yes", smith: "partial" },
  { capability: "Books into your calendar & CRM", ours: "yes", smith: "yes" },
  { capability: "Live human-agent fallback", ours: "no", smith: "yes" },
  { capability: "GDPR, EU-based data", ours: "yes", smith: "partial" },
  { capability: "Deep US legal (TCPA) compliance", ours: "partial", smith: "yes" },
];

const TOC: TocItem[] = [
  { id: "who-wins-what", label: "Who wins what" },
  { id: "pricing", label: "Pricing: per-call vs per-minute" },
  { id: "setup", label: "Setup & control" },
  { id: "languages", label: "Languages & voice" },
  { id: "when-smith", label: "When Smith.ai is the better call" },
  { id: "verdict", label: "The verdict" },
  { id: "more-comparisons", label: "Other comparisons" },
  { id: "faq", label: "FAQ" },
];

const STATS = [
  { v: "€99/mo", l: "flat, not per call" },
  { v: "~10 min", l: "to go live yourself" },
  { v: "25+", l: "languages, one agent" },
  { v: "€0.09/min", l: "overage — not per call" },
];

const OUR_WINS = [
  "Flat €99/€299 a month, no per-call surprises",
  "Billed per minute — a 40-second call costs pennies",
  "Live in ~10 minutes, no sales call or onboarding wait",
  "Free plan to test on real calls before you pay",
  "25+ languages, switches automatically per caller",
  "GDPR-first, built and hosted by an EU company",
];

const SMITH_WINS = [
  "Live human receptionists as a fallback for tricky calls",
  "Deep US legal workflow: TCPA-aware, attorney-client intake",
  "Industry-trained human agents for regulated verticals",
  "7,000+ native integrations built up over years",
  "An established US brand with a long track record",
];

const SCENARIOS = [
  {
    title: "You want a predictable bill",
    body: "If a busy month shouldn't cost triple, flat per-minute pricing beats paying per call. We win.",
  },
  {
    title: "You need a human safety net",
    body: "Some calls must reach a trained person, not just AI. Smith.ai's live agents are the point of the product.",
  },
  {
    title: "Your callers aren't all English",
    body: "One agent that handles 25+ languages and switches mid-call. Smith.ai covers English and Spanish.",
  },
  {
    title: "You're a US law firm",
    body: "For TCPA-sensitive intake and privilege handling, Smith.ai's compliance posture is more mature. Be honest about that.",
  },
];

// Journey strip — the actual sequence a call goes through, so the order carries meaning.
const STORY = [
  { src: "/compare/photos/call-incoming.webp", cap: "A customer calls at 9pm" },
  { src: "/compare/photos/owner-working.webp", cap: "Your AI picks up, sounds human" },
  { src: "/compare/photos/calendar-booked.webp", cap: "It books the appointment" },
  { src: "/compare/photos/owner-booked.webp", cap: "You get the summary, close the job" },
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
    q: "Is AI Receptionist Now a real alternative to Smith.ai?",
    a: "Yes, for the AI-answering half of the job. AI Receptionist Now answers every call 24/7, qualifies leads, books appointments into your calendar, and texts or emails you a summary — the same core outcomes people hire Smith.ai's AI Receptionist for. The difference is how you buy it: a flat monthly plan billed per minute instead of per-call packages, self-serve setup in minutes, and 25+ languages. What we don't offer is Smith.ai's live human agents, so if a human safety net is non-negotiable, that's a genuine reason to stay with them.",
  },
  {
    q: "How is the pricing different from Smith.ai?",
    a: "Smith.ai bills per call: its AI Receptionist starts around $97.50/month for 30 calls with per-call overage after that, and the human-backed tier is $292.50/month for 30 calls (roughly $9.75 a call), per their published rates. AI Receptionist Now is a flat €99/month (Solo) or €299/month (Team) that includes 1,000 or 3,000 talk minutes, with any extra minutes at €0.09. Because we meter minutes rather than calls, short calls — a hang-up, a quick 'are you open?' — cost a few cents instead of a full call charge.",
  },
  {
    q: "Which is cheaper for a busy month?",
    a: "It depends on call length, but per-minute billing usually wins when volume spikes. Take 90 calls in a month: on Smith.ai's AI tier at ~$2.40 per extra call that's roughly $97.50 + 60 × $2.40 ≈ $240; on the human tier it's far more. On AI Receptionist Now, 90 calls averaging four minutes is 360 minutes — comfortably inside the €99 Solo plan, so you still pay €99 flat. The more calls you take, the wider that gap opens.",
  },
  {
    q: "How long does setup take compared to Smith.ai?",
    a: "AI Receptionist Now is self-serve: describe your business, pick a voice and language, set how calls should be handled, and you're taking calls the same day — usually within about 10 minutes, no sales call required. Smith.ai typically runs a managed onboarding that takes a day or two, which is part of what you're paying for with the human-backed service.",
  },
  {
    q: "Does AI Receptionist Now support more languages than Smith.ai?",
    a: "Yes. AI Receptionist Now handles 25+ languages and can switch language mid-conversation based on the caller. Smith.ai's receptionists cover English and Spanish. If you serve multilingual customers, that's one of the clearest reasons to choose us.",
  },
  {
    q: "When should I choose Smith.ai instead?",
    a: "Be honest with yourself: if you specifically need live human agents to take over calls, if you're a US law firm that needs TCPA-aware intake and attorney-client handling, or if you depend on one of their thousands of niche integrations, Smith.ai's hybrid model is built for exactly that. AI Receptionist Now is the better fit when you want a pure-AI receptionist that's affordable, multilingual, GDPR-first, and live in minutes.",
  },
];

function Check({ type }: { type: Owner }) {
  if (type === "yes") return <span className="compare-check compare-check-yes">&#10003;</span>;
  if (type === "no") return <span className="compare-check compare-check-no">&#10007;</span>;
  return <span className="compare-check compare-check-partial">~</span>;
}

// White "pause" brand mark for dark surfaces (matches the site logo + footer mark).
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
      { "@type": "ListItem", position: 2, name: "vs Smith.ai", item: url },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url,
    description,
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

export default function SmithAiComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <div className="compare-page">
        {/* ── Hero: title left, "who wins what" table right ── */}
        <section className="compare-hero">
          <div className="compare-hero-inner">
            <div className="compare-hero-left">
              <div className="compare-badge">Comparison &middot; 2026</div>
              <h1>
                <strong>AI Receptionist Now</strong>
                <br />vs Smith.ai
              </h1>

              {/* Brand lockup: our mark vs Smith.ai wordmark */}
              <div className="airn-vs">
                <span className="airn-vs-us">
                  <span className="airn-vs-mark"><PauseMark color="#fff" /></span>
                  AI Receptionist Now
                </span>
                <span className="airn-vs-sep">vs</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="airn-vs-smith" src="/compare/logos/smith-ai.svg" alt="Smith.ai" />
              </div>

              <p className="compare-hero-sub">
                Smith.ai is the incumbent — a hybrid of AI and live human
                receptionists, billed per call. AI Receptionist Now is the
                flat-priced, pure-AI alternative: it answers every call 24/7 in
                25+ languages, bills by the minute instead of by the call, and
                goes live in about ten minutes. Here&apos;s the honest,
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

              <div className="compare-hero-meta">
                <span>Updated July 2026</span>
                <span>&middot;</span>
                <span>Figures from published rates</span>
              </div>
            </div>

            {/* Who-wins-what mini table */}
            <table className="compare-hero-table">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th className="compare-th-meltflex">AI Receptionist Now</th>
                  <th>Smith.ai</th>
                </tr>
              </thead>
              <tbody>
                {ROLES.map((r) => (
                  <tr key={r.capability}>
                    <td>{r.capability}</td>
                    <td><Check type={r.ours} /></td>
                    <td><Check type={r.smith} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Why choose the alternative + showcase ── */}
        <section className="compare-why">
          <h2>Why look past Smith.ai?</h2>
          <p>
            Smith.ai is a good product — the human backup and legal-grade intake
            are real strengths. But most small businesses don&apos;t need a live
            agent on every call; they need every call answered, booked, and
            summarised, at a price that doesn&apos;t balloon in a busy month.{" "}
            <strong>
              That&apos;s the exact gap AI Receptionist Now fills: pure AI, flat
              price, live in minutes.
            </strong>
          </p>

          <div className="compare-showcase">
            {/* Card 1: the human story, before/after */}
            <div className="compare-showcase-card">
              <span className="compare-showcase-tag">The outcome</span>
              <h3>From a missed call to a booked job</h3>
              <p>
                Every call answered on the first ring, day or night — so the
                customer who&apos;d have hit voicemail becomes an appointment on
                your calendar instead.
              </p>
              <CompareCta label="Start free" />
              <div className="compare-before-after">
                <div className="compare-ba-item">
                  <span className="compare-ba-label">The call comes in</span>
                  <Image src="/compare/photos/call-incoming.webp" alt="A customer calling a business after hours" width={1408} height={768} sizes="(max-width: 768px) 100vw, 280px" />
                </div>
                <div className="compare-ba-item">
                  <span className="compare-ba-label compare-ba-label--after">Booked, you&apos;re free</span>
                  <Image src="/compare/photos/owner-booked.webp" alt="A small business owner smiling after a booking" width={1408} height={768} sizes="(max-width: 768px) 100vw, 280px" />
                </div>
              </div>
            </div>

            {/* Card 2: dark — live in minutes */}
            <div className="compare-showcase-card">
              <span className="compare-showcase-tag">The setup</span>
              <h3>Live in minutes, not a managed onboarding</h3>
              <p>
                Describe your business, pick a voice and language, set how calls
                should be handled, and start taking calls the same day. No sales
                call, no one- to two-day onboarding, no contract.
              </p>
              <Image
                className="fusion-shot"
                src="/compare/photos/owner-working.webp"
                alt="A business owner taking a call while working"
                width={1408}
                height={768}
                sizes="(max-width: 900px) 100vw, 560px"
              />
              <div className="fusion-caption">
                <span className="airn-vs-mark"><PauseMark color="#fff" /></span>
                AI Receptionist Now
              </div>
              <div className="fusion-chips">
                <span className="fusion-chip">Describe</span>
                <span className="fusion-chip">Pick a voice</span>
                <span className="fusion-chip">Take calls</span>
              </div>
            </div>

            {/* Card 3: full — plugs into your tools (logos) */}
            <div className="compare-showcase-card compare-showcase-card--full">
              <span className="compare-showcase-tag compare-showcase-tag--exclusive">Plugs in</span>
              <h3>It drops straight into the tools you already use</h3>
              <p>
                Bookings land in your calendar, leads land in your CRM, and a
                summary lands in your inbox — automatically, after every call.{" "}
                <strong>No copy-paste, nothing to chase.</strong>
              </p>
              <div className="compare-showcase-media">
                <Image
                  className="compare-showcase-video"
                  src="/compare/photos/reception-desk.webp"
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

          {/* Story strip: the journey of one call */}
          <div className="story-strip">
            {STORY.map((s) => (
              <figure className="story-fig" key={s.src}>
                <Image src={s.src} alt={s.cap} width={1200} height={800} sizes="(max-width: 768px) 50vw, 270px" />
                <figcaption className="story-cap">{s.cap}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── Main: sidebar TOC + article ── */}
        <div className="compare-main">
          <CompareToc items={TOC} />

          <article className="compare-article">
            {/* stats */}
            <div className="compare-stats">
              {STATS.map((s) => (
                <div className="compare-stat" key={s.v}>
                  <div className="compare-stat-value">{s.v}</div>
                  <div className="compare-stat-label">{s.l}</div>
                </div>
              ))}
            </div>

            {/* scenario grid */}
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

            {/* who wins what table */}
            <section className="compare-table-section" id="who-wins-what">
              <h2>Who wins what</h2>
              <p className="compare-table-sub">
                A fair scorecard. Each tool owns the half of the market it&apos;s
                actually built for.
              </p>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th className="compare-th-meltflex">AI Receptionist Now</th>
                    <th>Smith.ai</th>
                  </tr>
                </thead>
                <tbody>
                  {ROLES.map((r) => (
                    <tr key={r.capability}>
                      <td>{r.capability}</td>
                      <td><Check type={r.ours} /></td>
                      <td><Check type={r.smith} /></td>
                    </tr>
                  ))}
                  <tr className="compare-score-row">
                    <td><strong>Best for</strong></td>
                    <td><span className="compare-score compare-score-meltflex">Affordable pure AI</span></td>
                    <td><span className="compare-score compare-score-competitor">Human-backed intake</span></td>
                  </tr>
                </tbody>
              </table>

              {/* output cards: what each is best at */}
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
                    <div className="compare-output-title">Smith.ai</div>
                    {SMITH_WINS.map((g) => (
                      <div className="compare-output-item" key={g}>
                        <span className="compare-output-dot compare-output-dot--yes" /> {g}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* mid CTA */}
            <div className="compare-cta-section">
              <h2>Hear it answer your business</h2>
              <p>
                The fastest way to compare is to listen. Have our AI call you and
                handle a real conversation — no account needed to start.
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
              <h2>Pricing: per-call vs per-minute</h2>
              <p>
                This is the difference that shows up on your card. Smith.ai bills
                per call; AI Receptionist Now bills per minute inside a flat
                plan. Per published rates, Smith.ai&apos;s AI Receptionist starts
                around <strong>$97.50/month for 30 calls</strong> with per-call
                overage, and the human-backed tier is{" "}
                <strong>$292.50/month for 30 calls</strong> — roughly $9.75 a
                call. We&apos;re <strong>€99 or €299 a month, flat</strong>, with
                1,000 or 3,000 minutes and €0.09 per extra minute.
              </p>

              <div className="compare-pricing-visual">
                <div className="compare-pricing-visual-label">
                  A month with 90 calls, ~4 minutes each
                </div>
                <div className="compare-pricing-visual-grid">
                  <div className="compare-pv-card compare-pv-card--best">
                    <div className="compare-pv-badge">Flat</div>
                    <div className="compare-pv-name">AI Receptionist Now — Solo</div>
                    <div className="compare-pv-price">
                      <span className="compare-pv-amount">€99</span>
                      <span className="compare-pv-period">/ month</span>
                    </div>
                    <ul className="compare-pv-features">
                      <li>360 minutes used of 1,000 included</li>
                      <li>Short calls cost cents, not a call charge</li>
                      <li>Same €99 whether it&apos;s a quiet or busy month</li>
                      <li>Free to start, no contract</li>
                    </ul>
                    <div className="compare-pv-note">You pay €99</div>
                  </div>
                  <div className="compare-pv-card">
                    <div className="compare-pv-name">Smith.ai — AI Receptionist</div>
                    <div className="compare-pv-price">
                      <span className="compare-pv-amount">~$240</span>
                      <span className="compare-pv-period">/ month</span>
                    </div>
                    <ul className="compare-pv-features">
                      <li>$97.50 base for the first 30 calls</li>
                      <li className="pv-con">60 extra calls × ~$2.40 = ~$144</li>
                      <li className="pv-con">Every call bills, even a 20-second one</li>
                      <li className="pv-con">Human tier costs several times more</li>
                    </ul>
                    <div className="compare-pv-note">You pay ~$240</div>
                  </div>
                </div>
              </div>

              <div className="compare-callout">
                <strong>Why per-minute wins on volume.</strong> Per-call pricing
                punishes exactly the calls an AI is great at closing fast — the
                quick question, the hang-up, the after-hours check. Metering
                minutes means a 40-second call costs about six cents, and a busy
                month can&apos;t quietly triple your bill.
              </div>

              <div className="compare-verdict">
                <div className="compare-verdict-label">Verdict</div>
                <p>
                  If you value a <strong>predictable, flat bill</strong> and take
                  more than a handful of calls a week, per-minute pricing is the
                  cheaper and calmer choice. Smith.ai&apos;s pricing makes sense
                  when a share of those calls genuinely needs a human.
                </p>
              </div>
            </section>

            {/* Section 02: setup */}
            <section className="compare-section" id="setup">
              <div className="compare-section-number">Section 02</div>
              <h2>Setup &amp; control</h2>
              <p>
                Smith.ai&apos;s strength — a managed, human-backed service — is
                also why getting started takes longer. Onboarding is typically a
                day or two. AI Receptionist Now is self-serve, so you configure
                and launch it yourself.
              </p>

              <div className="compare-pipeline">
                <div className="compare-pipeline-label">Going live with AI Receptionist Now</div>
                <div className="compare-pipeline-steps">
                  {[
                    { t: "Describe", d: "Tell it about your business" },
                    { t: "Configure", d: "Voice, language, call handling" },
                    { t: "Connect", d: "A new number or your own line" },
                    { t: "Go live", d: "Taking calls the same day" },
                  ].map((s, i, arr) => (
                    <div key={s.t} style={{ display: "contents" }}>
                      <div className="compare-pipeline-step">
                        <div className="compare-pipeline-num">{i + 1}</div>
                        <span className="compare-pipeline-title">{s.t}</span>
                        <span className="compare-pipeline-desc">{s.d}</span>
                      </div>
                      {i < arr.length - 1 && <div className="compare-pipeline-arrow">&rarr;</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="compare-speed-visual">
                <div className="compare-speed-label">Time to first answered call</div>
                <div className="compare-speed-row">
                  <span className="compare-speed-name">AI Receptionist Now</span>
                  <div className="compare-speed-track">
                    <div className="compare-speed-fill compare-speed-fill--meltflex">~10 min</div>
                  </div>
                </div>
                <div className="compare-speed-row">
                  <span className="compare-speed-name">Smith.ai</span>
                  <div className="compare-speed-track">
                    <div className="compare-speed-fill compare-speed-fill--competitor">1–2 days</div>
                  </div>
                </div>
              </div>

              <div className="compare-highlight">
                <p>
                  <strong>The trade-off, stated plainly:</strong> self-serve
                  means you own the configuration — which is fast and free, but
                  there&apos;s no account manager doing it for you. If you&apos;d
                  rather hand that off, Smith.ai&apos;s managed onboarding is part
                  of what the higher price buys.
                </p>
              </div>
            </section>

            {/* Section 03: languages */}
            <section className="compare-section" id="languages">
              <div className="compare-section-number">Section 03</div>
              <h2>Languages &amp; voice</h2>
              <p>
                If your callers aren&apos;t all English speakers, this is
                decisive. AI Receptionist Now handles{" "}
                <strong>25+ languages</strong> and switches automatically based on
                the caller. Smith.ai covers English and Spanish.
              </p>

              <div className="compare-cards">
                <div className="compare-card compare-card-winner">
                  <Image className="compare-card-img" src="/compare/photos/multilingual-calls.webp" alt="One AI voice answering callers in many languages" width={1408} height={768} sizes="(max-width: 768px) 100vw, 540px" />
                  <div className="compare-card-label compare-card-label-meltflex">AI Receptionist Now</div>
                  <ul>
                    <li>25+ languages from a single AI agent</li>
                    <li>Detects and switches language mid-call</li>
                    <li>20+ natural voices to match your brand</li>
                    <li>Same flat price, every language included</li>
                  </ul>
                </div>
                <div className="compare-card">
                  <Image className="compare-card-img" src="/compare/photos/reception-desk.webp" alt="A traditional reception desk" width={1408} height={768} sizes="(max-width: 768px) 100vw, 540px" />
                  <div className="compare-card-label compare-card-label-competitor">Smith.ai</div>
                  <ul>
                    <li>English and Spanish</li>
                    <li>Human agents for supported hours</li>
                    <li>Strong on US-English legal intake</li>
                    <li>Limited fit for multilingual markets</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 04: when Smith.ai wins */}
            <section className="compare-section" id="when-smith">
              <div className="compare-section-number">Section 04</div>
              <h2>When Smith.ai is the better call</h2>
              <p>
                A comparison page that only flatters itself isn&apos;t worth
                reading. Here&apos;s where Smith.ai is genuinely the right choice
                — and you should pick it without hesitation if these describe you.
              </p>

              <div className="compare-scorecard">
                <div className="compare-scorecard-label">Who leads where</div>
                <div className="compare-scorecard-grid">
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Flat, predictable pricing</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Setup speed &amp; self-serve</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Multilingual coverage</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">GDPR / EU data residency</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Live human-agent fallback</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">Smith.ai</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">US legal (TCPA) compliance</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">Smith.ai</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Breadth of integrations</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">Smith.ai</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">24/7 call answering</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Both</span></div>
                </div>
              </div>

              <div className="compare-callout">
                <strong>Pick Smith.ai if</strong> you need humans on the line for
                a meaningful share of calls, you&apos;re a US law firm with
                TCPA/privilege requirements, or a specific niche integration is a
                dealbreaker. <strong>Pick AI Receptionist Now if</strong> you want
                every call answered by a capable AI, in your callers&apos;
                language, at a flat price, live today.
              </div>
            </section>

            {/* Verdict */}
            <section className="compare-section" id="verdict">
              <div className="compare-section-number">Verdict</div>
              <h2>The bottom line</h2>
              <div className="compare-verdict">
                <div className="compare-verdict-label">In one line</div>
                <p>
                  Smith.ai is the premium, human-backed incumbent for
                  compliance-heavy US firms.{" "}
                  <strong>
                    AI Receptionist Now is the flat-priced, multilingual, pure-AI
                    alternative that answers every call 24/7 and goes live in
                    minutes — for a fraction of the per-call cost.
                  </strong>{" "}
                  For most small businesses, that&apos;s the better trade.
                </p>
              </div>
            </section>

            {/* Other comparisons + internal links */}
            <RelatedComparisons currentSlug={PATH.slice("/compare/".length)} />

            {/* final CTA */}
            <div className="compare-cta-section">
              <h2>Try the alternative free</h2>
              <p>
                Answer every call, book appointments, capture leads — without
                per-call pricing or a setup wait. Free to start, live in minutes.
              </p>
              <div className="compare-cta-buttons">
                <CompareCta label="Start free" />
                <Link href="/pricing" className="compare-cta-btn compare-cta-btn-outline">
                  Compare plans
                </Link>
              </div>
            </div>

            {/* FAQ */}
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
