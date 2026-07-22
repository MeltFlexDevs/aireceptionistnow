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

const PATH = "/compare/ruby-alternative";
const url = `${siteUrl}${PATH}`;
const author = getAuthor("matus");
const PUBLISHED = "2026-07-07";
const MODIFIED = "2026-07-07";

const title = "Ruby Alternative: AI Receptionist Now vs Ruby (2026)";
const description =
  "A flat-priced, 24/7 AI alternative to Ruby's live-human receptionists. Answer every call in 25+ languages, book appointments, and pay a fraction per minute. Free to start.";

export const metadata: Metadata = {
  // absolute: the root template would append the brand and push these past ~60 chars
  title: { absolute: title },
  description,
  keywords: [
    "Ruby alternative",
    "Ruby receptionists alternative",
    "AI Receptionist Now vs Ruby",
    "Ruby.com competitor",
    "AI vs human receptionist",
    "cheaper than Ruby receptionists",
    "virtual receptionist alternative",
    "24/7 AI answering service",
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
  { capability: "Real live human receptionists", ours: "no", them: "yes" },
  { capability: "Human warmth & judgment on nuanced calls", ours: "partial", them: "yes" },
  { capability: "Every call answered, no hold at peak", ours: "yes", them: "partial" },
  { capability: "Flat, low monthly price", ours: "yes", them: "no" },
  { capability: "Per-minute overage in cents, not dollars", ours: "yes", them: "no" },
  { capability: "Free to start (no card)", ours: "yes", them: "no" },
  { capability: "25+ languages, 24/7", ours: "yes", them: "no" },
  { capability: "GDPR, EU data residency", ours: "yes", them: "no" },
  { capability: "HIPAA compliant", ours: "yes", them: "yes" },
  { capability: "20+ year brand & track record", ours: "no", them: "yes" },
];

const TOC: TocItem[] = [
  { id: "who-wins-what", label: "Who wins what" },
  { id: "pricing", label: "Pricing: AI minutes vs human minutes" },
  { id: "ai-vs-human", label: "AI vs live humans" },
  { id: "languages", label: "Languages & hours" },
  { id: "when-ruby", label: "When Ruby is the better call" },
  { id: "alternatives", label: "Other alternatives" },
  { id: "verdict", label: "The verdict" },
  { id: "more-comparisons", label: "More comparisons" },
  { id: "faq", label: "FAQ" },
];

const STATS = [
  { v: "€99/mo", l: "flat, vs $250+ on Ruby" },
  { v: "€0.09/min", l: "overage, vs several $" },
  { v: "25+", l: "languages, always on" },
  { v: "24/7", l: "AI answers every call" },
];

const OUR_WINS = [
  "Flat €99 or €299 a month, not hundreds to thousands",
  "Every call answered instantly, day or night, no queue",
  "25+ languages around the clock, not two on a schedule",
  "Overage measured in cents per minute, not dollars",
  "Free to start, self-serve, live in about ten minutes",
  "GDPR-first, built and hosted in the EU",
];

const RUBY_WINS = [
  "Real, trained human receptionists on every call",
  "Human warmth and judgment on messy or emotional calls",
  "Bilingual live agents for genuine native Spanish",
  "20+ years of brand trust and a huge customer base",
  "A deep fit for US law firms and professional services",
  "HIPAA options, now with AI-assisted human agents",
];

const SCENARIOS = [
  {
    title: "You want a person on every call",
    body: "Some businesses need a trained human to handle nuance and emotion. That is exactly what Ruby is, and no AI fully replaces it. If that is non-negotiable, Ruby wins.",
  },
  {
    title: "You want predictable, low cost",
    body: "Ruby's entry plan is around $250 a month for 50 receptionist minutes. Our flat €99 covers 1,000 minutes. On price, it is not close.",
  },
  {
    title: "Your callers are multilingual, at any hour",
    body: "We answer in 25+ languages, 24/7. Ruby covers English and Spanish, and its Spanish receptionists work business hours, not around the clock.",
  },
  {
    title: "You're a US firm that values human intake",
    body: "For law firms and professional services that want a warm human first impression and decades of pedigree, Ruby's reputation is well earned.",
  },
];

const STORY = [
  { src: "/compare/photos/ruby-call-incoming.webp", cap: "A customer calls at 9pm" },
  { src: "/compare/photos/ruby-ai-afterhours.webp", cap: "Answered instantly, any language" },
  { src: "/compare/photos/ruby-calendar.webp", cap: "The appointment is booked" },
  { src: "/compare/photos/ruby-owner-booked.webp", cap: "You get the summary" },
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

const rubyPricing: CompetitorPricing = {
  name: "Ruby",
  currency: "$",
  planLabel: "receptionist plan",
  model: "perMinute",
  base: 250,
  includedMinutes: 50,
  overagePerMinute: 3.3,
  roundsUp: true,
};

const FAQS = [
  {
    q: "Is AI Receptionist Now a real alternative to Ruby?",
    a: "For the answering, booking, and message-taking that most businesses hire Ruby for, yes. AI Receptionist Now answers every call 24/7, qualifies callers, books into your calendar, and sends a summary, at a flat monthly price. The honest difference is that Ruby uses real human receptionists and we use AI. If a live person on every call is the whole point for you, Ruby is doing something we deliberately do not.",
  },
  {
    q: "How much cheaper is AI Receptionist Now than Ruby?",
    a: "A lot, on paper. Per Ruby's published plans, pricing starts around $250/month for 50 receptionist minutes and climbs to roughly $720 for 200 minutes and about $1,725 for 500 minutes, billed per receptionist-minute. AI Receptionist Now is a flat €99/month for 1,000 minutes (Solo) or €299 for 3,000 (Team), with €0.09 per extra minute. For most call volumes the difference is not a few percent, it is several times over.",
  },
  {
    q: "Does Ruby bill differently from AI Receptionist Now?",
    a: "Yes, and the details add up. Ruby bills by the receptionist-minute and, per third-party guides, rounds each call up to the nearest 30 seconds and counts after-call work such as CRM updates and notes against your minutes. AI Receptionist Now meters actual talk time by the minute, so a 40-second call costs a few cents rather than a rounded-up chunk of a premium plan.",
  },
  {
    q: "Can AI Receptionist Now handle languages Ruby can't?",
    a: "Yes. We answer in 25+ languages, 24/7, and switch based on the caller. Ruby's receptionists cover English and Spanish, and its Spanish-language coverage runs business hours rather than around the clock. For multilingual callers at any hour, that is a decisive difference.",
  },
  {
    q: "What does Ruby do better than AI?",
    a: "Real human connection. Trained receptionists read tone, handle upset or unusual callers, and improvise in ways current AI does not match, and Ruby has done this well for over 20 years with strong reviews. It now pairs that with AI-assisted tools for its agents. If your calls often need genuine human judgment, empathy, or a premium human first impression, Ruby's model is built for exactly that.",
  },
  {
    q: "When should I choose Ruby instead?",
    a: "Choose Ruby if you specifically want a live human answering every call, you're a US law firm or professional-services business that values a warm human intake and decades of pedigree, or you need native human Spanish and are comfortable with premium pricing. Choose AI Receptionist Now if you want every call answered 24/7 in many languages, booked and summarised, at a flat price a fraction of Ruby's.",
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
      { "@type": "ListItem", position: 3, name: "vs Ruby", item: url },
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

export default function RubyComparePage() {
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
                <br />vs Ruby
              </h1>

              <div className="airn-vs">
                <span className="airn-vs-us">
                  <span className="airn-vs-mark"><PauseMark color="#fff" /></span>
                  AI Receptionist Now
                </span>
                <span className="airn-vs-sep">vs</span>
                <img className="airn-vs-logo" src="/compare/logos/ruby.svg" alt="Ruby" />
              </div>

              <p className="compare-hero-sub">
                Ruby is the premium, 20-year live-human receptionist brand: real
                people answer, billed by the receptionist-minute at a premium. AI
                Receptionist Now is the flat-priced, pure-AI alternative that
                answers every call 24/7 in 25+ languages for a fraction of the
                cost. Here is the honest, side-by-side breakdown, including where
                humans still win.
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
                  <th>Ruby</th>
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
          <h2>Why consider AI over Ruby?</h2>
          <p>
            Ruby is genuinely good at what it does: warm, professional humans
            answering the phone for you, and it has done that for over two
            decades. The question is not whether Ruby is good.{" "}
            <strong>
              It is whether every call needs a premium human, when an AI can
              answer all of them, in any language, around the clock, for a small
              flat fee.
            </strong>
          </p>

          <div className="compare-showcase">
            <div className="compare-showcase-card">
              <span className="compare-showcase-tag">The trade-off</span>
              <h3>Warm humans, at a premium</h3>
              <p>
                Ruby&apos;s receptionists are the product, and they are good.
                They also cost from around $250 a month for 50 minutes, answer in
                English and Spanish, and bill by the receptionist-minute.
              </p>
              <Image
                className="fusion-shot"
                src="/compare/photos/ruby-human.webp"
                alt="A friendly human receptionist wearing a headset at a front desk"
                width={1408}
                height={768}
                sizes="(max-width: 900px) 100vw, 560px"
              />
              <div className="fusion-caption">Ruby, the human model</div>
            </div>

            <div className="compare-showcase-card">
              <span className="compare-showcase-tag">The alternative</span>
              <h3>Every call, any language, 24/7</h3>
              <p>
                Our AI picks up on the first ring, in the caller&apos;s language,
                and books the appointment. No hold music at peak, no
                business-hours limit, no per-minute premium.
              </p>
              <Image
                className="fusion-shot"
                src="/compare/photos/ruby-ai-afterhours.webp"
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
                <span className="fusion-chip">Instant</span>
                <span className="fusion-chip">Multilingual</span>
                <span className="fusion-chip">Flat price</span>
              </div>
            </div>

            <div className="compare-showcase-card compare-showcase-card--full">
              <span className="compare-showcase-tag compare-showcase-tag--exclusive">Plugs in</span>
              <h3>It drops straight into the tools you already use</h3>
              <p>
                Bookings land in your calendar, leads land in your CRM, and a
                summary lands in your inbox after every call.{" "}
                <strong>No copy-paste, nothing to chase.</strong>
              </p>
              <div className="compare-showcase-media">
                <Image
                  className="compare-showcase-video"
                  src="/compare/photos/ruby-reception.webp"
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
                A fair scorecard. One is a premium human service, the other a
                flat-priced AI. Each owns a real half of the decision.
              </p>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th className="compare-th-meltflex">AI Receptionist Now</th>
                    <th>Ruby</th>
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
                    <td><span className="compare-score compare-score-meltflex">Flat-price 24/7 AI, any language</span></td>
                    <td><span className="compare-score compare-score-competitor">Premium human receptionists</span></td>
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
                    <div className="compare-output-title">Ruby</div>
                    {RUBY_WINS.map((g) => (
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
                real conversation and judge it against a human for yourself.
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
              <h2>Pricing: AI minutes vs human minutes</h2>
              <p>
                Human receptionists are premium, and the pricing shows it. Per{" "}
                <a href="https://www.ruby.com/plans-and-pricing/" target="_blank" rel="nofollow noopener noreferrer">
                  Ruby&apos;s published plans
                </a>
                , pricing starts around <strong>$250/month for 50
                receptionist-minutes</strong>, rising to roughly{" "}
                <strong>$720 for 200 minutes</strong> and about{" "}
                <strong>$1,725 for 500 minutes</strong>. We&apos;re a flat{" "}
                <strong>€99 for 1,000 minutes</strong> or <strong>€299 for
                3,000</strong>, with €0.09 per extra minute. Slide your own volume
                in and see the gap.
              </p>

              <CompareCalculator competitor={rubyPricing} sourceUrl="https://www.ruby.com/plans-and-pricing/" />

              <div className="compare-callout">
                <strong>Two things that widen the gap.</strong> Per third-party
                pricing guides, Ruby rounds each call up to the nearest 30 seconds
                and counts after-call work, such as CRM updates and note-taking,
                against your minutes. We meter actual talk time, so a quick
                40-second call costs a few cents rather than a rounded-up slice of
                a premium plan. Ruby&apos;s exact overage rate is not on its own
                page; the per-minute figure above is a third-party estimate, so
                treat the calculator as indicative.
              </div>

              <div className="compare-verdict">
                <div className="compare-verdict-label">Verdict</div>
                <p>
                  On cost, this is not close.{" "}
                  <strong>
                    You are paying for real humans with Ruby, and that has value.
                  </strong>{" "}
                  But if the job is to answer, book, and summarise, AI does it for
                  a small fraction of the price.
                </p>
              </div>
            </section>

            <section className="compare-section" id="ai-vs-human">
              <div className="compare-section-number">Section 02</div>
              <h2>AI vs live humans</h2>
              <p>
                This is the real decision, so let us be straight about it. Ruby
                answers with a trained person who can read tone, handle an upset
                caller, and improvise. Our AI answers instantly, every time, in
                any language, and never puts a caller on hold at peak, but it is
                still AI. Ruby itself now leans on AI to assist its humans rather
                than replace them.
              </p>

              <div className="compare-cards">
                <div className="compare-card compare-card-winner">
                  <Image className="compare-card-img" src="/compare/photos/ruby-ai-afterhours.webp" alt="One AI voice answering callers 24/7 in many languages" width={1408} height={768} sizes="(max-width: 768px) 100vw, 540px" />
                  <div className="compare-card-label compare-card-label-meltflex">AI Receptionist Now</div>
                  <ul>
                    <li>Answers every call instantly, 24/7, no queue</li>
                    <li>25+ languages, switching per caller</li>
                    <li>Flat price, cents-per-minute overage</li>
                    <li>Books, captures leads, summarises automatically</li>
                  </ul>
                </div>
                <div className="compare-card">
                  <Image className="compare-card-img" src="/compare/photos/ruby-human.webp" alt="A human receptionist answering a call" width={1408} height={768} sizes="(max-width: 768px) 100vw, 540px" />
                  <div className="compare-card-label compare-card-label-competitor">Ruby</div>
                  <ul>
                    <li>Real humans, warmth and judgment on hard calls</li>
                    <li>English and Spanish, Spanish in business hours</li>
                    <li>Premium per-receptionist-minute pricing</li>
                    <li>Capacity and hours bounded by staffing</li>
                  </ul>
                </div>
              </div>

              <div className="compare-highlight">
                <p>
                  <strong>The honest line:</strong> for empathy-heavy or
                  high-stakes calls where a human first impression is worth paying
                  for, Ruby is the safer choice. For answering every call quickly,
                  in many languages, at a flat price, AI is hard to beat.
                </p>
              </div>
            </section>

            <section className="compare-section" id="languages">
              <div className="compare-section-number">Section 03</div>
              <h2>Languages &amp; hours</h2>
              <p>
                AI Receptionist Now answers in <strong>25+ languages, 24/7</strong>,
                switching automatically. Ruby&apos;s receptionists cover{" "}
                <strong>English and Spanish</strong>, and per third-party guides
                the Spanish line runs business hours rather than around the clock.
                If your callers are multilingual or call at night, an always-on AI
                simply reaches more of them.
              </p>

              <div className="compare-speed-visual">
                <div className="compare-speed-label">Language coverage, around the clock</div>
                <div className="compare-speed-row">
                  <span className="compare-speed-name">AI Receptionist Now</span>
                  <div className="compare-speed-track">
                    <div className="compare-speed-fill compare-speed-fill--competitor" style={{ width: "100%", background: "#1D1D1D", color: "#fff" }}>25+ languages, 24/7</div>
                  </div>
                </div>
                <div className="compare-speed-row">
                  <span className="compare-speed-name">Ruby</span>
                  <div className="compare-speed-track">
                    <div className="compare-speed-fill compare-speed-fill--meltflex" style={{ width: "22%" }}>2 languages</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="compare-section" id="when-ruby">
              <div className="compare-section-number">Section 04</div>
              <h2>When Ruby is the better call</h2>
              <p>
                A comparison that only flatters itself is not worth reading. Here
                is where Ruby is genuinely the right choice, and you should pick
                it without hesitation if this is you.
              </p>
              <div className="compare-highlight">
                <p>
                  <strong>Pick Ruby if</strong> you want a real human answering
                  every call, you&apos;re a US law firm or professional-services
                  business that values a warm human intake and a 20-year track
                  record, or you need native human Spanish and are comfortable
                  paying a premium for it. That is a real, defensible reason to
                  choose humans over AI.
                </p>
              </div>
            </section>

            <section className="compare-section" id="alternatives">
              <div className="compare-section-number">Shortlist</div>
              <h2>Other receptionist alternatives</h2>
              <p>
                Ruby is the human end of the market. If you&apos;re weighing AI
                options too, here is the quick, honest lay of the land.
              </p>
              <div className="compare-scorecard">
                <div className="compare-scorecard-label">The main alternatives at a glance</div>
                <div className="compare-scorecard-grid">
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><strong>AI Receptionist Now</strong> · flat, multilingual, EU/GDPR, 24/7 AI</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">Our pick</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><strong>Ruby</strong> · live human receptionists, premium price</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">This page</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><Link href="/compare/rosie-alternative">Rosie</Link> · US pure AI, English/Spanish, low entry price</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Compare</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><Link href="/compare/goodcall-alternative">Goodcall</Link> · US pure AI, unlimited minutes, per-agent pricing</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Compare</span></div>
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
                  Ruby is the premium, 20-year human receptionist brand, and for
                  calls that need a person it is worth it.{" "}
                  <strong>
                    AI Receptionist Now answers every call 24/7 in 25+ languages,
                    books and summarises, for a flat price a fraction of Ruby&apos;s
                    per-minute rate.
                  </strong>{" "}
                  For most businesses, that trade makes sense.
                </p>
              </div>
            </section>

            <RelatedComparisons currentSlug={PATH.slice("/compare/".length)} />

            <div className="compare-cta-section">
              <h2>Try the AI alternative free</h2>
              <p>
                Answer every call 24/7 in your callers&apos; language, book
                appointments, capture leads, without premium per-minute pricing.
                Free to start, live in minutes.
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
