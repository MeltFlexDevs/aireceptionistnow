import Image from "next/image";
import Link from "next/link";

import { siteUrl, siteName, logoUrl, getAuthor } from "@/lib/site";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import {
  IndustryCta,
  IndustryToc,
  IndustryRoiCalculator,
  type TocItem,
} from "./industry-client";
import { INDUSTRIES, INTEGRATION_LOGOS, type Industry } from "./registry";
import "./industries.css";

const PUBLISHED = "2026-07-11";
const MODIFIED = "2026-07-11";

const heroAvatars = [
  { src: "/testimonials/maria_sm.webp", alt: "Maria, AI Receptionist Now user" },
  { src: "/testimonials/mustafa_sm.webp", alt: "Mustafa, AI Receptionist Now user" },
  { src: "/testimonials/saheed_sm.webp", alt: "Saheed, AI Receptionist Now user" },
  { src: "/testimonials/delphine_sm.webp", alt: "Delphine, AI Receptionist Now user" },
];

const TOC: TocItem[] = [
  { id: "why", label: "Why calls slip" },
  { id: "call", label: "A real call, handled" },
  { id: "what-it-does", label: "What it does" },
  { id: "results", label: "The results" },
  { id: "roi", label: "ROI estimate" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
];

/** Illustrative weekly call-mix bars for the results section (not live data). */
const ANALYTICS_BARS = [
  { label: "Calls answered", value: "100%", pct: 100, muted: false },
  { label: "Booked or captured", value: "~68%", pct: 68, muted: false },
  { label: "Handled after hours", value: "~35%", pct: 35, muted: false },
  { label: "Sent to voicemail", value: "0%", pct: 0, muted: true },
];

export function IndustryPage({ industry: ind }: { industry: Industry }) {
  const author = getAuthor(ind.author);
  const path = `/industries/${ind.slug}`;
  const url = `${siteUrl}${path}`;
  const others = INDUSTRIES.filter((i) => i.slug !== ind.slug);

  const cssVars = {
    ["--ind-accent" as string]: ind.accent,
    ["--ind-accent-soft" as string]: ind.accentSoft,
  } as React.CSSProperties;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `AI Receptionist for ${ind.industry}`,
      serviceType: "AI phone receptionist and answering service",
      description: ind.description,
      url,
      provider: {
        "@type": "Organization",
        name: siteName,
        url: siteUrl,
        logo: { "@type": "ImageObject", url: logoUrl },
      },
      areaServed: "Worldwide",
      audience: { "@type": "BusinessAudience", name: ind.industry },
      offers: {
        "@type": "Offer",
        price: "99",
        priceCurrency: "EUR",
        url: `${siteUrl}/pricing`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: ind.faqs.map((f) => ({
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
        { "@type": "ListItem", position: 2, name: "Industries", item: `${siteUrl}/industries` },
        { "@type": "ListItem", position: 3, name: ind.industry, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: ind.title,
      url,
      description: ind.description,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <div className="ind-page" style={cssVars}>
        {/* ── Hero ── */}
        <section className="ind-hero">
          <div className="ind-hero-inner">
            <div className="ind-hero-left">
              <span className="ind-eyebrow">{ind.eyebrow}</span>
              <h1>{ind.h1}</h1>
              <p className="ind-hero-sub">{ind.heroSub}</p>
              <div className="ind-hero-cta">
                <IndustryCta label="Start free" />
                <Link href="/#how-it-works" className="ind-cta-btn ind-cta-btn-outline">
                  See how it works
                </Link>
              </div>

              <div className="ind-trust">
                <div className="ind-trust-avatars">
                  {heroAvatars.map((av) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={av.src} className="ind-trust-avatar" src={av.src} alt={av.alt} width={32} height={32} />
                  ))}
                </div>
                <div className="ind-trust-text">
                  <span className="ind-trust-number">9,500+ users worldwide</span>
                  <span className="ind-trust-label">Every call answered 24/7.</span>
                </div>
                <div className="ind-trust-stars" aria-label="Rated 4.8 out of 5">
                  &#9733;&#9733;&#9733;&#9733;&#9733;
                </div>
              </div>
            </div>

            <div className="ind-hero-card">
              <div className="ind-hero-card-top">
                <div className="ind-hero-card-top-label">On every call</div>
                <h2>Your {ind.niche}, answered 24/7</h2>
              </div>
              <ul className="ind-cap-list">
                {ind.capabilities.map((c) => (
                  <li key={c}>
                    <span className="ind-check">&#10003;</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <div className="ind-stats">
          {ind.stats.map((s) => (
            <div className="ind-stat" key={s.label}>
              <div className="ind-stat-value">{s.value}</div>
              <div className="ind-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Main: sidebar + article ── */}
        <div className="ind-main">
          <IndustryToc items={TOC} />

          <article className="ind-article">
            {/* Pain points */}
            <section className="ind-section" id="why">
              <div className="ind-kicker">The problem</div>
              <h2>Why the calls slip through</h2>
              <p>
                Every unanswered call is a customer who dials the next number.
                Here is where a {ind.niche} loses them today, and where an
                always-on AI receptionist steps in.
              </p>
              <div className="ind-pains">
                {ind.painPoints.map((p) => (
                  <div className="ind-pain" key={p.title}>
                    <span className="ind-pain-mark">!</span>
                    <h3>{p.title}</h3>
                    <p>{p.body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Call example */}
            <section className="ind-section" id="call">
              <div className="ind-kicker">A real call, handled</div>
              <h2>{ind.callExample.scenario}</h2>
              <p>
                This is the kind of conversation the AI handles on its own, in a
                natural voice, ending in a concrete outcome you can act on.
              </p>
              <div className="ind-call">
                <div className="ind-call-head">
                  <div className="ind-call-scenario">
                    <span className="ind-call-dot" />
                    {ind.callExample.scenario}
                  </div>
                  <span className="ind-call-tag">AI Receptionist Now &middot; live call</span>
                </div>
                <div className="ind-turns">
                  {ind.callExample.turns.map((t, i) => (
                    <div
                      key={i}
                      className={`ind-turn ${t.speaker === "ai" ? "ind-turn-ai" : "ind-turn-caller"}`}
                    >
                      <span className="ind-turn-label">
                        {t.speaker === "ai" ? "AI receptionist" : "Caller"}
                      </span>
                      {t.text}
                    </div>
                  ))}
                </div>
                <div className="ind-call-outcome">
                  <span className="ind-outcome-check">&#10003;</span>
                  {ind.callExample.outcome}
                </div>
              </div>
            </section>

            {/* Use cases */}
            <section className="ind-section" id="what-it-does">
              <div className="ind-kicker">What it does</div>
              <h2>Built for {ind.industry.toLowerCase()}</h2>
              <p>
                One AI phone agent, configured to how your {ind.niche} actually
                works. You brief it once, and it handles these on every call.
              </p>
              <div className="ind-usecases">
                {ind.useCases.map((u, i) => (
                  <div className="ind-usecase" key={u.title}>
                    <div className="ind-usecase-num">{String(i + 1).padStart(2, "0")}</div>
                    <h3>{u.title}</h3>
                    <p>{u.body}</p>
                  </div>
                ))}
              </div>

              <div className="ind-works">
                <span className="ind-works-label">Works with</span>
                {ind.integrations.map((name) => (
                  <span className="ind-works-item" key={name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={INTEGRATION_LOGOS[name]} alt={name} loading="lazy" />
                    {name}
                  </span>
                ))}
                <span className="ind-works-item ind-works-muted">+ thousands more via Zapier</span>
              </div>
            </section>

            {/* Results */}
            <section className="ind-section" id="results">
              <div className="ind-kicker">The results</div>
              <h2>What changes when every call is answered</h2>
              <p>{ind.resultsIntro}</p>
              <div className="ind-results-grid">
                <div className="ind-ba">
                  <div className="ind-panel-label">Before &amp; after</div>
                  {ind.beforeAfter.map((b) => (
                    <div className="ind-ba-row" key={b.metric}>
                      <span className="ind-ba-metric">{b.metric}</span>
                      <span className="ind-ba-before">{b.before}</span>
                      <span className="ind-ba-arrow">&rarr;</span>
                      <span className="ind-ba-after">{b.after}</span>
                    </div>
                  ))}
                </div>
                <div className="ind-analytics">
                  <div className="ind-panel-label">A week of calls, once it is on</div>
                  <div className="ind-analytics-bars">
                    {ANALYTICS_BARS.map((a) => (
                      <div className="ind-abar-row" key={a.label}>
                        <div className="ind-abar-top">
                          <span>{a.label}</span>
                          <span className="ind-abar-val">{a.value}</span>
                        </div>
                        <div className="ind-abar-track">
                          <div
                            className={`ind-abar-fill${a.muted ? " ind-abar-fill--muted" : ""}`}
                            style={{ width: `${a.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="ind-analytics-note">
                    Illustrative view of a typical week once the AI answers every
                    call. Actual figures depend on your call volume and mix.
                  </p>
                </div>
              </div>
            </section>

            {/* ROI */}
            <section className="ind-section" id="roi">
              <div className="ind-kicker">ROI estimate</div>
              <h2>What answered calls are worth</h2>
              <p>
                A quick, honest estimate. Set your own numbers and see the monthly
                revenue those recovered calls could represent against the flat
                &euro;99 plan.
              </p>
              <IndustryRoiCalculator
                jobValueLabel={ind.roi.jobValueLabel}
                defaultJobValue={ind.roi.defaultJobValue}
                defaultMissedCalls={ind.roi.defaultMissedCalls}
                note={ind.roi.note}
              />
            </section>

            {/* CTA mid-page */}
            <div className="ind-cta">
              <h2>Hear it answer a {ind.niche} call</h2>
              <p>
                The fastest way to judge it is to listen. Have the AI handle a
                real conversation for your {ind.niche}, in the language your
                callers use. Free to start, live in about 10 minutes.
              </p>
              <div className="ind-cta-buttons">
                <IndustryCta label="Start free" />
                <Link href="/pricing" className="ind-cta-btn ind-cta-btn-outline">
                  See pricing
                </Link>
              </div>
            </div>

            {/* Testimonials */}
            <section className="ind-section" id="reviews">
              <div className="ind-kicker">Reviews</div>
              <h2>Loved by busy businesses</h2>
              <div className="ind-quotes">
                {ind.testimonials.map((t) => (
                  <div className="ind-quote" key={t.name}>
                    <div className="ind-quote-stars" role="img" aria-label="Rated 5 out of 5">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                    <p>&ldquo;{t.quote}&rdquo;</p>
                    <div className="ind-quote-person">
                      <Image
                        className="ind-quote-photo"
                        src={t.photo}
                        alt={t.name}
                        width={38}
                        height={38}
                        sizes="38px"
                        loading="lazy"
                      />
                      <div>
                        <div className="ind-quote-name">{t.name}</div>
                        <div className="ind-quote-role">{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="ind-section" id="faq">
              <div className="ind-kicker">FAQ</div>
              <h2>Questions {ind.niche} owners ask</h2>
              {ind.faqs.map((f) => (
                <details key={f.q} className="ind-faq-item">
                  <summary>{f.q}</summary>
                  <p className="ind-faq-answer">{f.a}</p>
                </details>
              ))}
            </section>

            {/* Related */}
            <section className="ind-section" id="more">
              <div className="ind-kicker">Explore</div>
              <h2>Other industries &amp; guides</h2>
              <div className="ind-related-grid">
                {others.map((o) => (
                  <Link key={o.slug} className="ind-related-card" href={`/industries/${o.slug}`}>
                    <span className="ind-related-title">AI Receptionist for {o.industry}</span>
                    <span className="ind-related-sub">{o.eyebrow}</span>
                  </Link>
                ))}
                {ind.relatedBlog.map((b) => (
                  <Link key={b.href} className="ind-related-card" href={b.href}>
                    <span className="ind-related-title">{b.label}</span>
                    <span className="ind-related-sub">Read the guide &rarr;</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Verdict */}
            <div className="ind-verdict">
              <div className="ind-verdict-label">The bottom line</div>
              <p>{ind.verdict}</p>
            </div>

            {/* Final CTA */}
            <div className="ind-cta">
              <h2>Never miss another {ind.niche} call</h2>
              <p>
                Answer every call 24/7, book appointments, and capture every lead
                in 25+ languages. Free to start, EU-hosted, live in about 10
                minutes.
              </p>
              <div className="ind-cta-buttons">
                <IndustryCta label="Start free" />
                <Link href="/pricing" className="ind-cta-btn ind-cta-btn-outline">
                  Compare plans
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
