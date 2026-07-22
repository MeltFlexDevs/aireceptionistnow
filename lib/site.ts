export const siteUrl = "https://aireceptionistnow.com";

export const siteName = "AI Receptionist Now";

export const siteDescription =
  "AI Receptionist Now answers your business calls 24/7, books appointments, captures leads, and texts you a summary. No code, live in 10 minutes.";

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

export const sameAs: string[] = [];

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
