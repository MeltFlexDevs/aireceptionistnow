export const siteUrl = "https://aireceptionistnow.com";

export const siteName = "AI Receptionist Now";

/** Default meta description — keyword-rich, ~155 chars, used site-wide. */
export const siteDescription =
  "AI Receptionist Now answers your business calls 24/7, books appointments, captures leads, and texts you a summary. No code, live in 10 minutes.";

/** Primary keywords this site targets. */
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

/** Public profiles for schema.org sameAs. Add real ones as they go live. */
export const sameAs: string[] = [];

/**
 * Absolute URL of the square brand logo used in structured data
 * (Google requires ≥112×112px and a crawlable absolute URL).
 */
export const logoUrl = `${siteUrl}/logo.png`;

export type Author = {
  name: string;
  role: string;
  initials: string;
  /** Square avatar in /public, used in the byline and schema.org image. */
  image: string;
  /** Public LinkedIn profile, used for the byline link and schema.org sameAs. */
  linkedin: string;
};

export const authors = {
  matus: {
    name: "Matúš Koleják",
    role: "Co-Founder, AI Receptionist Now",
    initials: "MK",
    image: "/blog/authors/matus-kolejak.webp",
    linkedin:
      "https://www.linkedin.com/in/mat%C3%BA%C5%A1-kolej%C3%A1k-949653265/",
  },
  brano: {
    name: "Branislav Hrivnák",
    role: "Co-Founder, AI Receptionist Now",
    initials: "BH",
    image: "/blog/authors/brano-hrivnak.webp",
    linkedin: "https://www.linkedin.com/in/branislavhrivnak/",
  },
} satisfies Record<string, Author>;

export type AuthorKey = keyof typeof authors;

export const defaultAuthorKey: AuthorKey = "matus";

export function getAuthor(key?: AuthorKey): Author {
  return authors[key ?? defaultAuthorKey];
}
