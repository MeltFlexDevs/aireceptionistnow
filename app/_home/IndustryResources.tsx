import Link from "next/link";

import { INDUSTRY_MENU, type IndustrySlug } from "@/lib/marketing/industries";

// The "Related resources" module rendered above the footer on each industry
// landing page. Industry pages are otherwise HomeClient with swapped prose and
// carry no editorial links in or out, so this is their outbound cross-link into
// the supporting blog posts and answers (and the money pages). Hrefs are the
// real published slugs; kept as curated data here so the anchor text is written
// for the industry rather than reusing generic post titles.

type ResourceLink = {
  href: string;
  label: string;
  kind: "Guide" | "Answer" | "Tool";
};

// Appended to every industry's list below. /missed-call-calculator is the site's
// only interactive asset and the most linkable thing on it, but it had just
// three inbound internal links and sat one hop from nothing - these eight put it
// on the highest-priority pages we publish, with anchor text per industry.
const CALCULATOR: Record<IndustrySlug, string> = {
  dentists: "Work out what missed patient calls cost you",
  restaurants: "Work out what a missed booking costs you",
  ecommerce: "Work out what missed support calls cost you",
  "law-firms": "Work out what one missed enquiry costs you",
  "home-services": "Work out what a missed job call costs you",
  "property-management": "Work out what missed tenant calls cost you",
  medical: "Work out what missed patient calls cost you",
  "real-estate": "Work out what a missed buyer call costs you",
};

const RESOURCES: Record<IndustrySlug, ResourceLink[]> = {
  dentists: [
    { href: "/blog/dental-answering-service", label: "Dental answering service: stop missing new patients", kind: "Guide" },
    { href: "/blog/medical-answering-service", label: "Medical answering service for clinics that never close", kind: "Guide" },
    { href: "/answers/can-an-ai-receptionist-book-appointments", label: "Can it book appointments into my calendar?", kind: "Answer" },
    { href: "/answers/can-an-ai-receptionist-handle-emergency-calls", label: "Can it handle emergency calls?", kind: "Answer" },
  ],
  restaurants: [
    { href: "/blog/24-7-ai-receptionist", label: "What 24/7 call coverage actually means", kind: "Guide" },
    { href: "/blog/after-hours-answering-service", label: "After-hours answering service: who answers at 2 a.m.?", kind: "Guide" },
    { href: "/answers/can-an-ai-receptionist-handle-multiple-calls-at-once", label: "Can it answer several calls at once during the rush?", kind: "Answer" },
    { href: "/answers/what-languages-can-an-ai-receptionist-speak", label: "What languages can it speak?", kind: "Answer" },
  ],
  ecommerce: [
    { href: "/blog/ai-receptionist-vs-virtual-receptionist-vs-answering-service", label: "AI receptionist vs virtual receptionist vs answering service", kind: "Guide" },
    { href: "/blog/cost-of-a-missed-call", label: "How much does a missed call cost your business?", kind: "Guide" },
    { href: "/answers/what-happens-if-an-ai-receptionist-cant-answer", label: "What happens when it can't answer a question?", kind: "Answer" },
    { href: "/answers/what-languages-can-an-ai-receptionist-speak", label: "What languages can it speak?", kind: "Answer" },
  ],
  "law-firms": [
    { href: "/blog/law-firm-answering-service", label: "Law firm answering service: never miss a case", kind: "Guide" },
    { href: "/answers/can-an-ai-receptionist-transfer-calls-to-a-human", label: "Can it transfer calls to a human?", kind: "Answer" },
    { href: "/answers/can-an-ai-receptionist-handle-emergency-calls", label: "How does it handle urgent matters after hours?", kind: "Answer" },
    { href: "/answers/can-an-ai-receptionist-book-appointments", label: "Can it book consultations into my calendar?", kind: "Answer" },
  ],
  "home-services": [
    { href: "/blog/plumbing-answering-service", label: "Plumbing answering service: never miss an emergency call", kind: "Guide" },
    { href: "/blog/hvac-answering-service", label: "HVAC answering service: never miss a service call", kind: "Guide" },
    { href: "/blog/roofing-answering-service", label: "Roofing answering service: catch every storm call", kind: "Guide" },
    { href: "/blog/electrician-answering-service", label: "Electrician answering service: never lose a job call", kind: "Guide" },
    { href: "/blog/contractor-answering-service", label: "Contractor answering service: never miss a bid call", kind: "Guide" },
    { href: "/blog/ai-receptionist-for-home-services", label: "AI receptionist for home services and trades", kind: "Guide" },
    { href: "/answers/can-an-ai-receptionist-handle-emergency-calls", label: "Can it handle emergency calls like a burst pipe?", kind: "Answer" },
    { href: "/answers/can-an-ai-receptionist-handle-multiple-calls-at-once", label: "Can it answer several calls at once?", kind: "Answer" },
  ],
  "property-management": [
    { href: "/blog/property-management-answering-service", label: "Property management answering service: 24/7 tenant calls", kind: "Guide" },
    { href: "/blog/real-estate-answering-service", label: "Real estate answering service: AI that books showings", kind: "Guide" },
    { href: "/answers/can-an-ai-receptionist-handle-emergency-calls", label: "Can it triage maintenance emergencies?", kind: "Answer" },
    { href: "/answers/can-an-ai-receptionist-handle-multiple-locations", label: "Can it handle multiple locations?", kind: "Answer" },
  ],
  medical: [
    { href: "/blog/medical-answering-service", label: "Medical answering service: 24/7 AI for clinics", kind: "Guide" },
    { href: "/blog/after-hours-answering-service", label: "After-hours answering service: who answers at 2 a.m.?", kind: "Guide" },
    { href: "/answers/can-an-ai-receptionist-handle-emergency-calls", label: "How does it handle urgent calls?", kind: "Answer" },
    { href: "/answers/can-an-ai-receptionist-book-appointments", label: "Can it schedule patients into my calendar?", kind: "Answer" },
  ],
  "real-estate": [
    { href: "/blog/real-estate-answering-service", label: "Real estate answering service: AI that books showings", kind: "Guide" },
    { href: "/blog/cost-of-a-missed-call", label: "How much does a missed call cost your business?", kind: "Guide" },
    { href: "/answers/can-an-ai-receptionist-book-appointments", label: "Can it book showings into my calendar?", kind: "Answer" },
    { href: "/answers/use-existing-phone-number-with-ai-receptionist", label: "Can I keep my existing phone number?", kind: "Answer" },
  ],
};

export function IndustryResources({ slug }: { slug: IndustrySlug }) {
  const links: ResourceLink[] = [
    ...RESOURCES[slug],
    { href: "/missed-call-calculator", label: CALCULATOR[slug], kind: "Tool" },
  ];
  const label = INDUSTRY_MENU.find((i) => i.slug === slug)?.label ?? "your industry";

  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-24 sm:px-10">
      <div className="border-t border-[#e5e5e5] pt-12">
        <p className="mb-2 text-[11px] font-medium tracking-[0.06em] text-[#1D1D1D] uppercase">
          Related resources
        </p>
        <h2 className="mb-6 text-[22px] leading-[1.25] font-light tracking-[-0.01em] text-[#1D1D1D] sm:text-[26px]">
          Go deeper on AI reception for {label.toLowerCase()}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center justify-between gap-3 border border-[#e5e5e5] px-[18px] py-3.5 transition-colors hover:border-[#1D1D1D] hover:bg-[#fafafa]"
            >
              <span className="text-[15px] text-[#1D1D1D]">{l.label}</span>
              {/* #999 on white is 2.84:1 and this is 11px, so it failed WCAG AA
                  on all eight industry pages (4 badges each). #6f6f6f is 5.03:1. */}
              <span className="shrink-0 text-[11px] font-medium tracking-[0.06em] text-[#6f6f6f] uppercase">
                {l.kind}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
          <Link
            href="/compare"
            className="text-[#666] underline decoration-[#ddd] underline-offset-4 transition-colors hover:text-[#1D1D1D]"
          >
            Compare AI receptionists
          </Link>
          <Link
            href="/pricing"
            className="text-[#666] underline decoration-[#ddd] underline-offset-4 transition-colors hover:text-[#1D1D1D]"
          >
            See pricing
          </Link>
          <Link
            href="/answers"
            className="text-[#666] underline decoration-[#ddd] underline-offset-4 transition-colors hover:text-[#1D1D1D]"
          >
            All answers
          </Link>
        </div>
      </div>
    </section>
  );
}
