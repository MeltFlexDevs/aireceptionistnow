export const siteUrl = "https://aireceptionistnow.com";

export const siteName = "AI Receptionist Now";

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
