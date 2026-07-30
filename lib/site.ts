export const siteUrl = "https://aireceptionistnow.com";

export const siteName = "AI Receptionist Now";

export const siteDescription =
  "24/7 AI answering service for small business. Answers every call, books appointments, captures leads, and texts you a summary. No code, live in 10 minutes.";

export const siteKeywords = [
  "AI receptionist",
  "virtual receptionist",
  "AI phone answering service",
  "AI call answering",
  "automated receptionist",
  "AI appointment booking",
  "answering service for small business",
  "24/7 call answering",
];

// Official profiles for this brand, in Organization.sameAs. This is the entity
// signal Google uses to reconcile "AI Receptionist Now" against a single node in
// its Knowledge Graph - without it the brand stays an unlinked string. Every
// competitor that outranks us ships 3-4 of these (fin.ai: LinkedIn/X/Instagram/
// YouTube; getvocal.ai: LinkedIn/Instagram/YouTube).
//
// Only ever list profiles that genuinely exist and are controlled by us: a
// sameAs pointing at a dead or unowned URL is worse than an empty list.
export const sameAs: string[] = [];

// ISO 8601 year (or full date) of MeltFlex s. r. o.'s incorporation. Emitted as
// Organization.foundingDate only when set - a small age/legitimacy signal both
// ranking competitors carry (fin.ai "2011", getvocal.ai "2023"). Left blank
// deliberately: guessing a date here would put a false claim in structured data.
export const foundingDate = "";

// Real support inbox (also used verbatim in the privacy policy). Feeds the
// Organization contactPoint in JSON-LD - do not point this at a placeholder.
export const supportEmail = "info@meltflexai.com";

export const logoUrl = `${siteUrl}/logo.png`;

// The site's OG/Twitter card, served from public/. The [locale] tree must
// reference it via metadata instead of the opengraph-image.png file convention:
// a static metadata file inside a dynamic segment lands in the prerender
// manifest's dynamicRoutes but is skipped from adapter outputs, which crashes
// the Vercel build adapter in Next 16.2.9 ("Invariant: failed to find source
// route /[locale]/opengraph-image.png"). app/(main) keeps the file convention.
export const ogCardImage = {
  url: `${siteUrl}/og-card.png`,
  width: 1200,
  height: 630,
  alt: "AI Receptionist Now — an AI receptionist that answers every call 24/7, books appointments, and captures leads.",
};

export type Author = {
  name: string;
  role: string;
  initials: string;
  image: string;
  linkedin: string;
  /** URL segment for the author's own page at /authors/{slug}. */
  slug: string;
  /**
   * Shown on the author page and used as Person.description in JSON-LD. Keep it
   * first-hand and specific: this is the page Google reads to decide whether the
   * byline on 29 posts belongs to a real, qualified person, so vague filler here
   * is worse than nothing. Owner-edited copy - do not auto-generate.
   */
  bio: string;
  /** Person.knowsAbout - the topics this author actually writes about here. */
  knowsAbout: string[];
};

export const authors = {
  matus: {
    name: "Matúš Koleják",
    role: "Co-Founder, AI Receptionist Now",
    initials: "MK",
    image: "/blog/authors/matus-kolejak.webp",
    linkedin:
      "https://www.linkedin.com/in/mat%C3%BA%C5%A1-kolej%C3%A1k-949653265/",
    slug: "matus-kolejak",
    bio: "Co-founder of AI Receptionist Now, where he works on the call engine that answers, qualifies, and books for small businesses. He writes about what AI phone reception genuinely does on a live line, and where it still hands off to a human.",
    knowsAbout: [
      "AI receptionist",
      "AI phone answering",
      "call routing",
      "appointment booking",
      "small business phone systems",
    ],
  },
  brano: {
    name: "Branislav Hrivnák",
    role: "Co-Founder, AI Receptionist Now",
    initials: "BH",
    image: "/blog/authors/brano-hrivnak.webp",
    linkedin: "https://www.linkedin.com/in/branislavhrivnak/",
    slug: "branislav-hrivnak",
    bio: "Co-founder of AI Receptionist Now. He spends most of his time on pricing, onboarding, and the numbers behind missed calls, and writes the cost and buying guides on this blog.",
    knowsAbout: [
      "AI receptionist pricing",
      "answering service cost",
      "missed call cost",
      "virtual receptionist",
      "small business operations",
    ],
  },
} satisfies Record<string, Author>;

export type AuthorKey = keyof typeof authors;

export const defaultAuthorKey: AuthorKey = "matus";

export function getAuthor(key?: AuthorKey): Author {
  return authors[key ?? defaultAuthorKey];
}

export const authorKeys = Object.keys(authors) as AuthorKey[];

export function getAuthorBySlug(slug: string): Author | undefined {
  return authorKeys.map((k) => authors[k]).find((a) => a.slug === slug);
}

/** Stable JSON-LD node id so every byline points at one Person entity. */
export function authorId(a: Author): string {
  return `${siteUrl}/authors/${a.slug}#person`;
}
