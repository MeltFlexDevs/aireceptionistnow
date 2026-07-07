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
];
