import type { IndustrySlug } from "@/lib/marketing/industries";
import HomeClient from "./HomeClient";
import { industryHomeCopy } from "./industry-content";

// An industry landing page IS the home page with its prose swapped: the same
// HomeClient, the same layout, fed an industry-specific copy object. Rendered
// from a server component so the copy is built on the server and passed down as
// plain data. localeOptions is empty because these pages are English-only for
// now (no localized variants to switch to).
export function IndustryHome({ slug }: { slug: IndustrySlug }) {
  return <HomeClient copy={industryHomeCopy(slug)} localeOptions={[]} />;
}
