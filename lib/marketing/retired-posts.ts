// English blog posts that were merged into a stronger page, 2026-10-04.
//
// Why: six months of GSC data showed these pages with 0-50 impressions each,
// several of them near-identical templates competing with a sibling for the same
// queries (e.g. "ai receptionist pricing" collected 413 impressions while the
// post written for it collected 38). Their useful content now lives on the
// destination, and the old URL 301s there.
//
// STRUCTURAL RULE: flat data only, no content imports. next.config.ts reads
// this to build the redirects, so it must stay importable without JSX.
//
// A retired post whose module still exists is kept ONLY as the factual source
// for its translations (content/i18n/{locale}/blog). Those localized pages rank
// in their own markets and stay live; they just lose the English member of
// their hreflang cluster. A retired post with no translation has no module.
//
// Destinations may carry a #section anchor: browsers keep it through a 301,
// so someone following an old link lands on the section that replaced it.
export const RETIRED_BLOG_POSTS: Record<string, string> = {
  // Eight near-identical trade templates -> one home-services page.
  "hvac-answering-service": "/blog/home-services-answering-service#hvac",
  "plumbing-answering-service": "/blog/home-services-answering-service#plumbing",
  "roofing-answering-service": "/blog/home-services-answering-service#roofing",
  "electrician-answering-service": "/blog/home-services-answering-service#electrical",
  "pest-control-answering-service": "/blog/home-services-answering-service#pest-control",
  "cleaning-company-answering-service": "/blog/home-services-answering-service#cleaning",
  "water-damage-restoration-answering-service":
    "/blog/home-services-answering-service#water-damage",
  "locksmith-answering-service": "/blog/home-services-answering-service#locksmith",
  // Same intent as a stronger sibling.
  "ai-receptionist-for-home-services": "/blog/best-ai-receptionist-for-home-services",
  "dental-answering-service": "/blog/best-ai-receptionist-for-dental-practices",
  "restaurant-answering-service": "/blog/best-ai-phone-answering-for-restaurants",
  "bilingual-ai-receptionist": "/blog/bilingual-answering-service",
  "ai-receptionist-for-property-management":
    "/blog/property-management-answering-service",
  "after-hours-answering-service": "/blog/24-hour-answering-service#after-hours",
  "how-to-set-up-emergency-call-escalation":
    "/blog/24-hour-answering-service#emergency-escalation",
  "telephone-answering-service":
    "/blog/ai-receptionist-vs-virtual-receptionist-vs-answering-service",
  "can-an-ai-receptionist-replace-a-human-receptionist":
    "/blog/how-to-replace-front-desk-receptionist-with-ai",
  "how-to-choose-an-ai-receptionist": "/blog/best-ai-receptionist#how-to-choose",
  "ai-receptionist-pricing":
    "/blog/virtual-receptionist-pricing#ai-receptionist-pricing",
  "answering-service-for-therapists": "/blog/medical-answering-service",
  // Removed outright: off-market or doorway-shaped, no traffic to keep.
  "ai-receptionist-orange-county": "/",
  "ai-receptionist-for-it-companies": "/blog/answering-service-for-small-business",
  "auto-repair-answering-service": "/blog/answering-service-for-small-business",
  "self-storage-answering-service": "/blog/answering-service-for-small-business",
};

/** /answers pages folded into a blog post. */
export const RETIRED_ANSWERS: Record<string, string> = {
  "virtual-receptionist-vs-answering-service":
    "/blog/ai-receptionist-vs-virtual-receptionist-vs-answering-service",
};

export function isRetiredBlogPost(slug: string): boolean {
  return slug in RETIRED_BLOG_POSTS;
}
