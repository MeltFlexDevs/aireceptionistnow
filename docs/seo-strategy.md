# SEO strategy: getting from ~34 to page 1

Written 2026-07-27. Based on a code audit of this repo plus live SERP checks for
the category's money terms.

---

## The short version

**Your technical SEO is done.** Metadata, canonicals, hreflang, sitemap,
robots, and JSON-LD (Organization, WebSite, BreadcrumbList, FAQPage,
SoftwareApplication, BlogPosting) are all correct and better than most
competitors'. There is nothing left to fix there, and no amount of further
technical work will move you.

**That is exactly why you are stuck at 34.** Position ~34 means Google has
crawled you, understood you, and decided you are not authoritative enough to
rank. The bottleneck is not on-page. It is three things, in this order:

1. **You do not look like a real company** to Google's quality systems. No
   about page, no contact page, no phone number, and an Organization entity
   with zero external links. This is a site-wide suppressor.
2. **You are absent from the SERPs that actually own this category.** More than
   half of the top-10 for every commercial term here is third-party listicles,
   and you are in none of them.
3. **Your content has no first-hand experience in it.** It is good, but a
   competitor could have written every word of it.

Fix 1 in code. Fix 2 with outreach. Fix 3 with data you already own and nobody
else has.

---

## What I verified

**Content inventory:** 28 blog posts (2,134-4,710 words each), 14 answer pages,
8 industry landing pages, 5 competitor comparison pages, 1 calculator tool,
plus 14 localized URLs across 7 locales. That is a healthy library.

**The SERP reality.** I searched the category's money terms. The top results
for `AI receptionist for small business` and `best AI receptionist 2026`:

| Rank pattern | Who holds it |
|---|---|
| Listicles | Vellum, NextPhone, Bookipi, CloudTalk, Allo, Marblism, ServiceAgent, AIRA, Technology.org |
| High-authority vendors | GoTo Connect, Smith.ai, CloudTalk |
| Review platforms | G2 |

Two findings that decide the whole strategy:

- **These SERPs are listicle-dominated.** Google has decided that people
  searching "best AI receptionist" want a comparison, not a vendor homepage.
  You will not outrank a listicle with a product page. You get *into* the
  listicle.
- **AI Receptionist Now appears in zero of them.** I searched specifically for
  the brand alongside those terms. Not one mention. Meanwhile Smith.ai, Rosie,
  Goodcall, Ruby, My AI Front Desk, NextPhone, AIRA, Nexa, Abby Connect,
  ServiceAgent, TTYL, DeepCura, and Slang all appear repeatedly.

---

## Priority 0: Stop the trust bleed (this week, all code)

This is the highest-leverage on-site work left, and it is unglamorous.

Google's Search Quality Rater Guidelines treat missing contact and "who is
responsible for this site" information on a **commercial** site as an explicit
low-quality indicator. It is not a per-page penalty; it dampens the whole
domain. Right now the site presents three unconnected identities:

| Where | Identity |
|---|---|
| Brand / domain | AI Receptionist Now, aireceptionistnow.com |
| Footer legal entity | MeltFlex s. r. o. |
| Support email (`lib/site.ts`) | info@meltflexai.com |

Nothing on the site or in the structured data ties these together. To Google
they are three different things.

**Actions:**

1. **Add `/about`.** Real company story, the two founders (you already have
   names, roles, photos, and LinkedIn URLs in `lib/site.ts:authors`), the
   MeltFlex s. r. o. legal entity, founding date, and where you operate from.
   Mark it up with `AboutPage` schema and link the Organization to it.
2. **Add `/contact` with a real phone number.** You sell phone answering and
   have no phone number on the site. That is the single worst trust signal
   here, and prospects notice it too. Include the registered address, the
   company registration number, and support hours. Use `ContactPage` schema and
   extend the existing `ContactPoint` in `app/_shared/root-shell.tsx`.
3. **Fill `sameAs` in `lib/site.ts`** (currently `[]`). This is how Google
   resolves your Organization to a real-world entity. Add LinkedIn company
   page, X, Crunchbase, GitHub, and any directory profiles as they go live.
   Empty `sameAs` on an Organization is a wasted, already-built slot.
4. **Align the email domain.** `info@meltflexai.com` on
   aireceptionistnow.com weakens the entity. Move to
   `support@aireceptionistnow.com`, or state the MeltFlex relationship plainly
   on `/about` so the connection is explicit rather than inferred.
5. **Link both pages from the footer sitewide.** The footer currently exposes
   only privacy policy and terms.

**Effort:** 1-2 days. **Expected effect:** no instant jump, but it removes a
ceiling that caps every other thing you do.

---

## Priority 1: Get into the listicles (weeks 1-6, not code)

This is the highest-impact work overall and none of it happens in this repo.
Because these SERPs are listicle-dominated, a mention inside a ranking listicle
puts you in front of the buyer *and* earns the referring link that lifts your
own pages.

**Do, in order:**

1. **Claim your directory profiles.** G2, Capterra, GetApp, Software Advice,
   Product Hunt, AlternativeTo, TrustRadius. These rank on their own, feed the
   listicle writers, and are the standard citation set for this category. Free
   and mostly same-day.
2. **Pitch the listicle authors.** I found the live set above. Every one of
   those posts gets refreshed for recency. A short, specific email - what makes
   you different, pricing, a free trial account - lands more often than people
   expect, because the writers need fresh entries each refresh cycle.
3. **Get real reviews from real customers.** This unblocks G2/Capterra rankings
   *and* is the precondition for ever adding review schema (see the compliance
   section - do not add it before then).
4. **Launch on Product Hunt.** One-day effort, durable link, and it usually
   seeds several roundup mentions.

**Effort:** ~2 hours/week sustained. **Expected effect:** this is what actually
moves head terms. Everything else is preparation for it.

---

## Priority 2: Publish what only you can publish (weeks 2-8, code + data)

Google's helpful-content guidance rewards original information, first-hand
experience, and unique analysis. Your 28 posts are competent and well
structured, but every one of them is explanatory - the kind of post any
competitor can and did write. That is why they plateau in the 20s and 30s.

You run a live AI receptionist platform. You have call transcripts, booking
rates, answer rates, and after-hours volumes. **No competitor's content team
can produce that.** It is your only durable content moat.

**Ideas, strongest first:**

- "We analyzed N real calls: here is what callers actually ask" - with the
  real distribution by industry.
- "What percentage of calls come after hours?" - by vertical. This makes the
  business case for the entire category, and it is inherently citable.
- "How long callers wait before hanging up" - real abandonment data.
- Real, named customer case studies with real numbers and permission.

Aggregate and anonymize before publishing anything derived from call data, and
check it against your privacy policy and GDPR commitments first. Publish
methodology alongside the numbers.

**Why it works:** original data attracts the links Priority 1 is chasing,
because listicle and industry writers cite statistics. It is the one content
type that compounds.

**Also:** expand the `/compare` cluster. You have 5 competitor pages
(Smith.ai, Rosie, Ruby, Goodcall, My AI Front Desk). I counted ~18 competitors
named across the live listicles. `"X alternative"` queries are the
highest-intent, lowest-competition terms in this entire niche - the searcher
has a credit card out and a specific grievance. Add: NextPhone, AIRA, Nexa,
Abby Connect, ServiceAgent, CloudTalk, Allo, Slang, AnswerConnect. Your page
template already exists, so each is mostly research plus copy.

---

## Priority 3: Pick your battles with Search Console (ongoing)

You said you were not sure which query sits at 34, and that matters, because
the two cases need opposite tactics.

Open Search Console > Performance > filter **Position 8-25**. Those are pages
Google already likes that are one nudge from page 1. Sort by impressions.

- **A long-tail page at 11-20** (e.g. `hvac answering service`,
  `answering service cost`): winnable in 4-8 weeks. Refresh the content, add
  internal links to it from related posts using the target phrase as anchor,
  expand it to fully cover the query, update the date.
- **A head term at 30+** (`AI receptionist`, the home page's target): a 3-6
  month campaign that Priority 1 drives. Do not burn effort on on-page tweaks
  here; the gap is authority, not relevance.

**Rule of thumb:** ship the Priority 0 trust layer once, then spend your weekly
time on whichever page is closest to page 1 that you have not yet pushed.

---

## Compliance: three things to fix or avoid

You asked specifically about staying inside Google's policies. Three flags:

### 1. The testimonials are a real risk (act on this)

`content/i18n/en/pages/home.ts` carries **18 testimonials** with first names,
business types, and matching headshot photos in `public/testimonials/`,
presented as genuine customer quotes with no disclaimer.

If these are not real customers, this is exposure on two fronts:

- **Google:** misleading content is a quality-system signal, and it undermines
  exactly the trustworthiness Priority 0 is trying to build.
- **FTC:** the 2024 Rule on Consumer Reviews and Testimonials makes fabricated
  testimonials directly actionable with per-violation civil penalties, and it
  reaches non-US companies marketing to US consumers.

Also, one of them ("Aisha, Nail Studio") references trying "the free plan" -
and `lib/plans.ts` has only Solo (EUR 99) and Team (EUR 299). That single line
is a concrete, checkable false claim on your highest-traffic page.

**Fix:** replace with real customer quotes, or clearly label the section as
illustrative and drop the photos and invented names. Real quotes are also worth
more, because they unlock review schema later.

### 2. Do not add review schema yet

This remains the right call. `AggregateRating`/`Review` markup for
unverifiable reviews risks a structured-data manual action against the whole
domain. Revisit only once Priority 1 has produced real, verifiable reviews.

### 3. Do not buy links or mass-generate content

Both are explicit Google spam-policy violations. The link building in Priority 1
is earned placement - directory profiles, roundup pitches, and citable original
data. That distinction is the whole game.

---

## What to expect, honestly

| Horizon | Realistic outcome |
|---|---|
| Weeks 1-4 | Trust layer live, directory profiles claimed. Little visible rank movement. |
| Weeks 4-8 | Long-tail pages at 11-20 start crossing into the top 10. First listicle mentions land. |
| Months 3-6 | Head terms begin moving, driven by accumulated links and entity signals. |

Anyone promising top-10 on a head commercial term faster than that in a
category this contested is selling something. The long-tail wins are genuinely
achievable in weeks, and they convert well because the intent is sharper.

---

## Recommended first move

Priority 0 in full - `/about`, `/contact` with a real phone number, populated
`sameAs`, footer links, and the testimonial fix. It is one to two days of work,
it is entirely inside this repo, it is keyword-independent, and it lifts the
ceiling on everything in Priorities 1-3.
