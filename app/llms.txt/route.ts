import { siteUrl, siteName, siteDescription } from "@/lib/site";
import { posts } from "../(main)/blog/_posts";
import { answers } from "../(main)/answers/_answers";
import { COMPETITORS } from "../(main)/compare/_compare/competitors";
import { INDUSTRY_MENU } from "@/lib/marketing/industries";

// llms.txt: a plain-text site map for AI answer engines (ChatGPT, Perplexity,
// Claude, Google AI Overviews). Built from the same registries as sitemap.ts so
// it can never drift from the real content. https://llmstxt.org/
export const dynamic = "force-static";

export function GET(): Response {
  const lines = [
    `# ${siteName}`,
    "",
    `> ${siteDescription}`,
    "",
    `${siteName} (${siteUrl}) is a 24/7 AI receptionist and AI answering service for small businesses. It answers calls in a natural voice, books appointments directly into the business calendar, captures and qualifies leads, transfers urgent calls to a human, and texts a summary after every call. Works with the business's existing phone number. Flat monthly pricing, no contract.`,
    "",
    "## Key pages",
    "",
    `- [Home](${siteUrl}/): what the AI receptionist does, live demo call`,
    `- [Pricing](${siteUrl}/pricing): plans and what's included`,
    `- [Compare](${siteUrl}/compare): how it stacks up against alternatives`,
    "",
    "## Industries",
    "",
    ...INDUSTRY_MENU.map(
      (i) => `- [AI receptionist for ${i.label}](${siteUrl}/${i.slug}): ${i.tagline}`,
    ),
    "",
    "## Guides",
    "",
    ...posts.map(
      (p) => `- [${p.title}](${siteUrl}/blog/${p.slug}): ${p.description}`,
    ),
    "",
    "## Common questions",
    "",
    ...answers.map(
      (a) => `- [${a.question}](${siteUrl}/answers/${a.slug})`,
    ),
    "",
    "## Comparisons",
    "",
    ...COMPETITORS.map(
      (c) => `- [${c.competitor} alternative](${siteUrl}/compare/${c.slug})`,
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
