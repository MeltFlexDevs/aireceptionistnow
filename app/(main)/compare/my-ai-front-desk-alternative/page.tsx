import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteUrl, siteName, getAuthor } from "@/lib/site";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { CompareCta, CompareToc, type TocItem } from "../_compare/compare-client";
import { CompareByline } from "../_compare/byline";
import { RelatedComparisons } from "../_compare/related";
import "../_compare/compare.css";

const PATH = "/compare/my-ai-front-desk-alternative";
const url = `${siteUrl}${PATH}`;
const author = getAuthor("matus");
const PUBLISHED = "2026-07-07";
const MODIFIED = "2026-07-07";

const title = "My AI Front Desk Alternative: AI Receptionist Now vs Frontdesk (2026)";
// Kept under ~160 chars so it is not truncated in the SERP, and ASCII-only:
// the previous copy used an em dash and a multiplication sign.
const description =
  "A multilingual, GDPR-first alternative to My AI Front Desk (now Frontdesk). EU-hosted, answers calls 24/7 in 25+ languages, and free to start.";

export const metadata: Metadata = {
  // absolute: the root template would append the brand and push these past ~60 chars
  title: { absolute: title },
  description,
  keywords: [
    "My AI Front Desk alternative",
    "AI Receptionist Now vs My AI Front Desk",
    "My AI Front Desk competitor",
    "Frontdesk AI receptionist alternative",
    "cheaper than My AI Front Desk",
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
  { capability: "Generous voice minutes on the core plan", ours: "yes", them: "no" },
  { capability: "Low per-minute overage", ours: "yes", them: "no" },
  { capability: "25+ languages, switches mid-call", ours: "yes", them: "partial" },
  { capability: "GDPR, EU data residency", ours: "yes", them: "no" },
  { capability: "Books into your calendar on every plan", ours: "yes", them: "partial" },
  { capability: "Web chat, SMS & email in one bundle", ours: "partial", them: "yes" },
  { capability: "Deep vertical CRM integrations", ours: "partial", them: "yes" },
  { capability: "Low-cost chat-first entry tier", ours: "no", them: "yes" },
];

const TOC: TocItem[] = [
  { id: "who-wins-what", label: "Who wins what" },
  { id: "pricing", label: "Pricing models compared" },
  { id: "languages", label: "Languages & reach" },
  { id: "compliance", label: "Compliance & data" },
  { id: "when-frontdesk", label: "When Frontdesk is the better call" },
  { id: "alternatives", label: "Other alternatives" },
  { id: "verdict", label: "The verdict" },
  { id: "more-comparisons", label: "More comparisons" },
  { id: "faq", label: "FAQ" },
];

const STATS = [
  { v: "1,000", l: "voice minutes on Solo" },
  { v: "€0.09", l: "per extra minute" },
  { v: "Free", l: "to start, no card" },
  { v: "EU", l: "hosted, GDPR-first" },
];

const OUR_WINS = [
  "1,000 voice minutes on the core plan, not 200",
  "€0.09 per extra minute, versus $0.25 on their standard rate",
  "25+ languages, switching automatically per caller",
  "GDPR-first, built and hosted in the EU",
  "Free to start with no card, so you test on real calls",
  "Booking straight into your calendar on every plan",
];

const FRONTDESK_WINS = [
  "An AI workforce bundle: voice, web chat, SMS and email together",
  "A $20/mo chat-first entry tier for text-led businesses",
  "Deep vertical CRM links (Yardi, AppFolio, SimplePractice and more)",
  "Strong fit for US property management, retail and therapy niches",
  "Outbound calling and reminders built into the plan",
  "20+ languages with a mature, established product",
];

const SCENARIOS = [
  {
    title: "You take real call volume",
    body: "Our Solo plan includes 1,000 voice minutes and charges €0.09 for extras. Frontdesk's Business plan includes 200 voice minutes, then $0.25 per minute, so a busy phone quickly makes us the cheaper line.",
  },
  {
    title: "Your callers speak more than English",
    body: "One agent covers 25+ languages and switches mid-call. Frontdesk supports 20+ languages, so both reach far, but language switching is where our single-agent model stays simplest.",
  },
  {
    title: "You process EU data",
    body: "We're GDPR-first and EU-hosted. Frontdesk is a US product with no published EU data-residency option, which matters if your callers are European.",
  },
  {
    title: "You want text, chat and email too",
    body: "Frontdesk bundles voice with web chat, SMS and email as one AI workforce. If a multi-channel bundle is what you're buying, that breadth is a genuine reason to pick them.",
  },
];

const STORY = [
  { src: "/compare/photos/call-incoming.webp", cap: "A customer calls after hours" },
  { src: "/compare/photos/multilingual-calls.webp", cap: "Answered in their language" },
  { src: "/compare/photos/calendar-booked.webp", cap: "The appointment is booked" },
  { src: "/compare/photos/owner-booked.webp", cap: "You get the summary" },
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
    q: "Is AI Receptionist Now a real alternative to My AI Front Desk?",
    a: "Yes. Both are self-serve, pure-AI phone agents that answer 24/7, capture leads, book appointments, and send a summary. My AI Front Desk (rebranded Frontdesk in 2026) has since widened into an AI workforce bundle spanning voice, web chat, SMS and email. If what you need is a phone receptionist, we include far more voice minutes at a lower overage, handle 25+ languages, and are GDPR-first and EU-hosted, free to start.",
  },
  {
    q: "How does the pricing compare to My AI Front Desk?",
    a: "Their most popular Business-in-a-Box plan is $99/month ($79 annual) and includes 200 voice minutes, after which voice runs at 25 credits (about $0.25) per minute. Their Basic plan is $20/month but includes zero voice minutes — it's chat and SMS first. AI Receptionist Now is a flat €99/month (Solo) with 1,000 voice minutes and €0.09 per extra minute, or €299/month (Team) with 3,000 minutes. For a business whose phone actually rings, we include roughly 5× the voice minutes at about a third of the per-minute overage.",
  },
  {
    q: "Does My AI Front Desk have a free plan?",
    a: "No permanent free plan. Frontdesk offers a 7-day free trial on its Basic and Business plans and advertises a 5-minute setup. AI Receptionist Now is free to start with no card, so you can hear it handle real calls before you pay anything.",
  },
  {
    q: "Which supports more languages?",
    a: "It's close. AI Receptionist Now handles 25+ languages from one agent and switches based on the caller. Frontdesk advertises 20+ languages. Both cover multilingual markets well; our single-agent model keeps automatic mid-call switching simple, which is the practical edge.",
  },
  {
    q: "Is My AI Front Desk more secure or compliant?",
    a: "Neither publishes a long certification list, but the postures differ. AI Receptionist Now is GDPR-first, EU-hosted and HIPAA-ready, which is what European businesses and EU personal data require. Frontdesk is a US product and does not publish EU data-residency, SOC 2 or ISO 27001 details on its site. If EU hosting and GDPR matter to you, that's a clear point for us.",
  },
  {
    q: "When should I choose My AI Front Desk instead?",
    a: "Choose Frontdesk if you want an all-in-one AI workforce across voice, web chat, SMS and email rather than a focused phone receptionist, if a $20/month chat-first entry tier fits a text-led business, or if you need its deep vertical CRM integrations for US property management, retail or therapy. Choose AI Receptionist Now when the phone is the priority: more included minutes, lower overage, GDPR and EU hosting, and a free start.",
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
      { "@type": "ListItem", position: 3, name: "vs My AI Front Desk", item: url },
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

export default function MyAiFrontDeskComparePage() {
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
                <br />vs My AI Front Desk
              </h1>

              <div className="airn-vs">
                <span className="airn-vs-us">
                  <span className="airn-vs-mark"><PauseMark color="#fff" /></span>
                  AI Receptionist Now
                </span>
                <span className="airn-vs-sep">vs</span>
                <span className="airn-vs-us">
                  <img className="airn-vs-mark-img" src="/compare/logos/myaifrontdesk.svg" alt="My AI Front Desk" />
                  My AI Front Desk
                </span>
              </div>

              <p className="compare-hero-sub">
                My AI Front Desk (rebranded Frontdesk in 2026) is a US, pure-AI
                platform that now bundles voice, web chat, SMS and email as one
                AI workforce. AI Receptionist Now is the phone-first,
                multilingual, GDPR-first alternative: it answers in 25+ languages,
                is EU-hosted, includes far more voice minutes at a lower overage,
                and is free to start. Here is the honest, side-by-side breakdown.
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
                  <th>My AI Front Desk</th>
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
          <h2>Why look past My AI Front Desk?</h2>
          <p>
            My AI Front Desk is a capable, established product, and its move into
            an all-in-one AI workforce — voice, chat, SMS and email — is a real
            strength if that&apos;s what you&apos;re buying.{" "}
            <strong>
              The gap opens when the phone is your priority: it includes only 200
              voice minutes on its popular plan and charges $0.25 a minute after,
              has no EU hosting, and no free plan to test on real calls.
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
                  <Image src="/compare/photos/call-incoming.webp" alt="A customer calling a business after hours" width={1408} height={768} sizes="(max-width: 768px) 100vw, 280px" />
                </div>
                <div className="compare-ba-item">
                  <span className="compare-ba-label compare-ba-label--after">Booked, you&apos;re free</span>
                  <Image src="/compare/photos/owner-booked.webp" alt="A small business owner smiling after a booking" width={1408} height={768} sizes="(max-width: 768px) 100vw, 280px" />
                </div>
              </div>
            </div>

            <div className="compare-showcase-card">
              <span className="compare-showcase-tag">The reach</span>
              <h3>One agent, 25+ languages</h3>
              <p>
                It detects the caller&apos;s language and keeps up if they
                switch. My AI Front Desk advertises 20+ languages too, so both
                travel well — our single-agent model just keeps switching simple.
              </p>
              <Image
                className="fusion-shot"
                src="/compare/photos/multilingual-calls.webp"
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
                <strong>No copy-paste, nothing to chase.</strong> My AI Front Desk
                leans on Zapier and vertical CRMs; we connect to the big calendars
                and CRMs natively too.
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
                A fair scorecard between a phone-first AI receptionist and a
                broader AI workforce bundle.
              </p>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th className="compare-th-meltflex">AI Receptionist Now</th>
                    <th>My AI Front Desk</th>
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
                    <td><span className="compare-score compare-score-meltflex">Phone-first, multilingual, EU, free to start</span></td>
                    <td><span className="compare-score compare-score-competitor">All-in-one voice + chat + SMS bundle</span></td>
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
                    <div className="compare-output-title">My AI Front Desk</div>
                    {FRONTDESK_WINS.map((g) => (
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
              <h2>Pricing models compared</h2>
              <p>
                Both charge a flat monthly fee, so the thing to read is what the
                fee includes. Per{" "}
                <a href="https://www.myaifrontdesk.com/pricing" target="_blank" rel="nofollow noopener noreferrer">
                  My AI Front Desk&apos;s published rates
                </a>
                , the popular Business-in-a-Box plan is $99/month and includes{" "}
                <strong>200 voice minutes</strong>, then about{" "}
                <strong>$0.25 per minute</strong>. We charge a flat €99/month that
                includes <strong>1,000 voice minutes</strong> and{" "}
                <strong>€0.09 per extra minute</strong> — roughly 5× the minutes at
                about a third of the overage.
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
                      <li>1,000 voice minutes included, €0.09 per extra</li>
                      <li>25+ languages and EU hosting included</li>
                      <li>Booking on every plan, no upsell tier</li>
                      <li>Free to start, no card, no contract</li>
                    </ul>
                    <div className="compare-pv-note">1,000 minutes, then €0.09/min</div>
                  </div>
                  <div className="compare-pv-card">
                    <div className="compare-pv-name">My AI Front Desk · Business</div>
                    <div className="compare-pv-price">
                      <span className="compare-pv-amount">$99</span>
                      <span className="compare-pv-period">/ month</span>
                    </div>
                    <ul className="compare-pv-features">
                      <li>Voice, chat, SMS &amp; email in one bundle (a real strength)</li>
                      <li className="pv-con">Only 200 voice minutes included</li>
                      <li className="pv-con">About $0.25 per minute after that</li>
                      <li className="pv-con">No free plan; 7-day trial only</li>
                    </ul>
                    <div className="compare-pv-note">200 minutes, then ~$0.25/min</div>
                  </div>
                </div>
              </div>

              <div className="compare-callout">
                <strong>The honest read.</strong> If you&apos;re buying a
                multi-channel AI workforce — voice plus web chat, SMS and email —
                Frontdesk&apos;s bundle is doing more for the money, and its $20
                chat-first tier is genuinely cheap. If the phone is the point, our
                plan includes far more talk time at a much lower overage. Figures
                are each provider&apos;s published rates in their own currency, not
                currency-converted.
              </div>

              <div className="compare-verdict">
                <div className="compare-verdict-label">Verdict</div>
                <p>
                  Neither is universally cheaper.{" "}
                  <strong>
                    Frontdesk rewards a bundle of channels; we reward businesses
                    whose phone actually rings, with more minutes, lower overage,
                    and a free test first.
                  </strong>
                </p>
              </div>
            </section>

            <section className="compare-section" id="languages">
              <div className="compare-section-number">Section 02</div>
              <h2>Languages &amp; reach</h2>
              <p>
                This one is close. AI Receptionist Now handles{" "}
                <strong>25+ languages</strong> from one agent and detects the
                caller&apos;s language automatically. My AI Front Desk advertises{" "}
                <strong>20+ languages</strong>. Both cover multilingual markets
                well; the practical edge is that a single agent keeps automatic
                mid-call switching simple to reason about.
              </p>

              <div className="compare-cards">
                <div className="compare-card compare-card-winner">
                  <Image className="compare-card-img" src="/compare/photos/multilingual-calls.webp" alt="One AI voice answering callers in many languages" width={1408} height={768} sizes="(max-width: 768px) 100vw, 540px" />
                  <div className="compare-card-label compare-card-label-meltflex">AI Receptionist Now</div>
                  <ul>
                    <li>25+ languages from a single AI agent</li>
                    <li>Detects and switches language mid-call</li>
                    <li>20+ natural voices to match your brand</li>
                    <li>Every language included in the flat price</li>
                  </ul>
                </div>
                <div className="compare-card">
                  <Image className="compare-card-img" src="/compare/photos/reception-desk.webp" alt="A reception desk" width={1408} height={768} sizes="(max-width: 768px) 100vw, 540px" />
                  <div className="compare-card-label compare-card-label-competitor">My AI Front Desk</div>
                  <ul>
                    <li>20+ languages on a mature product</li>
                    <li>Voice, chat, SMS and email in one place</li>
                    <li>Strong fit for US service niches</li>
                    <li>Only 200 voice minutes on the core plan</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="compare-section" id="compliance">
              <div className="compare-section-number">Section 03</div>
              <h2>Compliance &amp; data</h2>
              <p>
                Here the honest answer is that neither publishes a long
                certification list, but the postures differ. AI Receptionist Now
                is <strong>GDPR-first, EU-hosted</strong>, and HIPAA-ready, which
                is what most European buyers and EU personal data actually
                require. My AI Front Desk is a <strong>US product</strong> and does
                not publish EU data-residency, SOC 2 or ISO 27001 details on its
                site.
              </p>

              <div className="compare-scorecard">
                <div className="compare-scorecard-label">Who leads where</div>
                <div className="compare-scorecard-grid">
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Included voice minutes</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Per-minute overage</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">GDPR / EU data residency</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Free to start</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">AI Receptionist Now</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Multi-channel bundle (chat/SMS/email)</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">My AI Front Desk</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Low-cost chat-first tier</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">My AI Front Desk</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">Deep vertical CRM integrations</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">My AI Front Desk</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat">24/7 answering &amp; 25+/20+ languages</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Both</span></div>
                </div>
              </div>
            </section>

            <section className="compare-section" id="when-frontdesk">
              <div className="compare-section-number">Section 04</div>
              <h2>When My AI Front Desk is the better call</h2>
              <p>
                A comparison that only flatters itself is not worth reading.
                Here is where My AI Front Desk is genuinely the right pick.
              </p>
              <div className="compare-highlight">
                <p>
                  <strong>Pick My AI Front Desk if</strong> you want one AI
                  workforce covering voice, web chat, SMS and email rather than a
                  focused phone receptionist, if its $20/month chat-first tier
                  suits a text-led business, or if you need its deep vertical CRM
                  integrations for US property management, retail or therapy. As a
                  mature, established product with outbound calling built in,
                  it&apos;s a real, honest fit for those cases.
                </p>
              </div>
            </section>

            <section className="compare-section" id="alternatives">
              <div className="compare-section-number">Shortlist</div>
              <h2>Other AI receptionist alternatives</h2>
              <p>
                My AI Front Desk is one of several names people weigh. If
                you&apos;re building a shortlist, here is the quick, honest lay of
                the land.
              </p>
              <div className="compare-scorecard">
                <div className="compare-scorecard-label">The main alternatives at a glance</div>
                <div className="compare-scorecard-grid">
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><strong>AI Receptionist Now</strong> · flat, multilingual, EU/GDPR, free to start</span><span className="compare-scorecard-winner compare-scorecard-winner--mf">Our pick</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><strong>My AI Front Desk</strong> · US AI workforce, voice + chat + SMS bundle</span><span className="compare-scorecard-winner compare-scorecard-winner--rh">This page</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><Link href="/compare/goodcall-alternative">Goodcall</Link> · US pure AI, unlimited minutes, per-agent pricing</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Compare</span></div>
                  <div className="compare-scorecard-row"><span className="compare-scorecard-cat"><Link href="/compare/rosie-alternative">Rosie</Link> · US pure AI, English/Spanish, low entry price</span><span className="compare-scorecard-winner compare-scorecard-winner--tie">Compare</span></div>
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
                  My AI Front Desk is a strong US AI workforce whose bundle spans
                  voice, chat, SMS and email.{" "}
                  <strong>
                    AI Receptionist Now is the phone-first, multilingual,
                    GDPR-first, EU-hosted alternative that includes far more voice
                    minutes at a lower overage and is free to start.
                  </strong>{" "}
                  If the phone is what you&apos;re buying, that&apos;s the calmer,
                  cheaper choice.
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
