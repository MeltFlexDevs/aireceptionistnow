/**
 * Header and footer nav hrefs.
 *
 * Client-safe on purpose: this module must not import the publish gate
 * (./manifest), because SiteHeader is a client component and importing it here
 * would drag the whole review manifest into the browser bundle. The builder
 * that reads the gate is navHrefs() in ./href.ts, which server pages call.
 */
export interface NavHrefs {
  home: string;
  industries: string;
  pricing: string;
  blog: string;
  /** The 24/7 article, localized when the locale has it. */
  receptionist247: string;
  privacyPolicy: string;
}

/** English nav, the default for pages that are not localized yet. */
export const EN_NAV_HREFS: NavHrefs = {
  home: "/",
  industries: "/industries",
  pricing: "/pricing",
  blog: "/blog",
  receptionist247: "/blog/24-7-ai-receptionist",
  privacyPolicy: "/privacy-policy",
};
