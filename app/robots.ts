import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Private areas: no crawl value, and /dashboard + /onboarding sit behind auth.
const disallow = ["/dashboard", "/api", "/auth", "/onboarding"];

// Answer engines are a real referral surface for "ai receptionist" queries, and
// a wildcard Allow does not always read as consent to the crawlers' operators -
// fin.ai, which ranks first for the head term, names each one explicitly. These
// are the retrieval and training-data agents, listed separately so any one of
// them can be revoked later without touching the rest.
const aiAgents = [
  "GPTBot", // OpenAI training crawler
  "OAI-SearchBot", // ChatGPT search index
  "ChatGPT-User", // ChatGPT live browsing on a user's behalf
  "ClaudeBot", // Anthropic crawler
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended", // Gemini / AI Overviews grounding
  "Applebot-Extended",
  "CCBot", // Common Crawl, upstream of many models
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...aiAgents.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
