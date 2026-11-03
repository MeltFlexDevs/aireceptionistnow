import type { SuggestionLink } from "./NotFoundSuggestions";
import { posts } from "@/app/(main)/blog/_posts";
import { answers } from "@/app/(main)/answers/_answers";
import { COMPETITORS } from "@/app/(main)/compare/_compare/competitors";
import { INDUSTRY_MENU } from "@/lib/marketing/industries";

// Every real page a mistyped URL could have meant - built server-side, only
// these {href, label} strings ever reach the client.
export const EN_NOT_FOUND_LINKS: SuggestionLink[] = [
  { href: "/pricing", label: "Pricing" },
  { href: "/industries", label: "Industries" },
  { href: "/blog", label: "Blog" },
  { href: "/answers", label: "Answers" },
  ...INDUSTRY_MENU.map((i) => ({
    href: `/${i.slug}`,
    label: `AI Receptionist for ${i.label}`,
  })),
  ...COMPETITORS.map((c) => ({
    href: `/compare/${c.slug}`,
    label: `${c.competitor} alternative`,
  })),
  ...posts.map((p) => ({ href: `/blog/${p.slug}`, label: p.title })),
  ...answers.map((a) => ({ href: `/answers/${a.slug}`, label: a.question })),
];
