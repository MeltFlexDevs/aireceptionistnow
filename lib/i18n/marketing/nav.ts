/**
 * Header nav hrefs.
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
}

/** English nav, the default for pages that are not localized yet. */
export const EN_NAV_HREFS: NavHrefs = {
  home: "/",
  industries: "/industries",
  pricing: "/pricing",
};
