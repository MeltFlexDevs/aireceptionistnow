/**
 * Canonical registry of the "AI Receptionist Now vs [competitor]" comparison
 * landing pages. One entry per page. The hub (/compare) and each page's
 * "Other comparisons" cross-links both read from this list, so adding a new
 * comparison means adding one entry here (plus the page itself + sitemap).
 */
export type CompetitorEntry = {
  /** Route path under /compare, without a leading slash. */
  slug: string;
  /** The competitor brand this page compares us against. */
  competitor: string;
  /** Card heading, e.g. "AI Receptionist Now vs Smith.ai". */
  title: string;
  /** One-line description of the specific comparison / angle. */
  blurb: string;
};

export const COMPETITORS: CompetitorEntry[] = [
  {
    slug: "smith-ai-alternative",
    competitor: "Smith.ai",
    title: "AI Receptionist Now vs Smith.ai",
    blurb:
      "Flat monthly pricing and per-minute billing vs Smith.ai's per-call plans, plus 25+ languages and setup in minutes.",
  },
  {
    slug: "ruby-alternative",
    competitor: "Ruby",
    title: "AI Receptionist Now vs Ruby",
    blurb:
      "A flat-priced, 24/7 AI alternative to Ruby's premium live-human receptionists, in 25+ languages for a fraction of the per-minute cost.",
  },
  {
    slug: "rosie-alternative",
    competitor: "Rosie",
    title: "AI Receptionist Now vs Rosie",
    blurb:
      "A multilingual, GDPR-first, EU-hosted alternative to Rosie, with in-call booking on every plan instead of just the mid tier.",
  },
  {
    slug: "goodcall-alternative",
    competitor: "Goodcall",
    title: "AI Receptionist Now vs Goodcall",
    blurb:
      "Flat pricing with no per-agent or per-caller caps vs Goodcall's per-agent plans, plus 25+ languages, EU hosting and a free start.",
  },
];
