// Link-only view of the competitor registry. See nav.ts in _industries for why
// this exists: the footer renders inside client components and must not pull
// content registries into the client bundle.
export const COMPETITOR_NAV = [
  { slug: "smith-ai-alternative", competitor: "Smith.ai" },
  { slug: "ruby-alternative", competitor: "Ruby" },
  { slug: "rosie-alternative", competitor: "Rosie" },
  { slug: "goodcall-alternative", competitor: "Goodcall" },
  { slug: "my-ai-front-desk-alternative", competitor: "My AI Front Desk" },
] as const;

export type CompetitorSlug = (typeof COMPETITOR_NAV)[number]["slug"];
