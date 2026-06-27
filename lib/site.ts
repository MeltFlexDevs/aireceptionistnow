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
  /** Public LinkedIn profile, used for the byline link and schema.org sameAs. */
  linkedin: string;
};

export const authors = {
  team: {
    name: "The AI Receptionist Now Team",
    role: "AI Receptionist Now",
    initials: "AR",
    linkedin: "https://aireceptionistnow.com",
  },
} satisfies Record<string, Author>;

export type AuthorKey = keyof typeof authors;

export const defaultAuthorKey: AuthorKey = "team";

export function getAuthor(key?: AuthorKey): Author {
  return authors[key ?? defaultAuthorKey];
}
