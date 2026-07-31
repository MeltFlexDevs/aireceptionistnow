import { INDUSTRY_MENU, type IndustrySlug } from "@/lib/marketing/industries";
import { siteUrl } from "@/lib/site";
import HomeClient from "./HomeClient";
import { industryHomeCopy, INDUSTRY_CONTENT } from "./industry-content";
import { IndustryResources } from "./IndustryResources";
import { IndustryBrief } from "./IndustryBrief";

// An industry landing page IS the home page with its prose swapped: the same
// HomeClient, the same layout, fed an industry-specific copy object. Rendered
// from a server component so the copy is built on the server and passed down as
// plain data. localeOptions is empty because these pages are English-only for
// now (no localized variants to switch to).
//
// It adds two things HomeClient does not carry: a "Related resources" module
// (HomeClient's `relatedResources` slot) so the page links out to supporting
// blog posts and answers, and BreadcrumbList + Service JSON-LD placing the page
// under the /industries hub with an industry-specific service entity.
export function IndustryHome({ slug }: { slug: IndustrySlug }) {
  const content = INDUSTRY_CONTENT[slug];
  const label = INDUSTRY_MENU.find((i) => i.slug === slug)?.label ?? slug;
  const url = `${siteUrl}/${slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Industries", item: `${siteUrl}/industries` },
        { "@type": "ListItem", position: 3, name: label, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `AI Receptionist for ${label}`,
      serviceType: "AI phone receptionist",
      description: content.description,
      url,
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: "Worldwide",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient
        copy={industryHomeCopy(slug)}
        localeOptions={[]}
        industryBrief={<IndustryBrief slug={slug} />}
        relatedResources={<IndustryResources slug={slug} />}
      />
    </>
  );
}
