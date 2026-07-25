// Client-safe industry menu: the slug, its menu label, and a one-line tagline.
//
// Deliberately lean and import-free, like the old _industries/nav.ts it
// replaces: SiteHeader and SiteFooter render this list, and they are client
// components, so pulling in the per-industry marketing prose (industry-content.ts)
// here would drag it into the browser bundle just to render six links.
//
// industry-content.ts keys its copy map against this slug union, so a menu entry
// with no matching copy (or vice versa) is a compile error, not a broken link.
export const INDUSTRY_MENU = [
  { slug: "dentists", label: "Dentists", tagline: "Book new patients, triage after-hours" },
  { slug: "restaurants", label: "Restaurants", tagline: "Reservations and to-go orders" },
  { slug: "ecommerce", label: "E-commerce", tagline: "Order status and buyer support" },
  { slug: "law-firms", label: "Law firms", tagline: "Client intake around the clock" },
  { slug: "home-services", label: "Home services", tagline: "Every job call answered" },
  { slug: "property-management", label: "Property management", tagline: "Maintenance triage and leasing" },
  { slug: "medical", label: "Medical practices", tagline: "Patient scheduling, after-hours coverage" },
  { slug: "real-estate", label: "Real estate", tagline: "Every buyer and seller call captured" },
] as const;

export type IndustrySlug = (typeof INDUSTRY_MENU)[number]["slug"];

/** Old bespoke /industries/[slug] slugs that now 301 to the top-level pages. */
export const LEGACY_INDUSTRY_SLUGS = [
  "dentists",
  "restaurants",
  "law-firms",
  "home-services",
  "property-management",
] as const;
