import Link from "next/link";

import { INDUSTRY_MENU } from "@/lib/marketing/industries";
import { COMPETITORS } from "@/app/(main)/compare/_compare/competitors";

// The cross-link module rendered just above the footer on the English home
// page, via HomeClient's `relatedResources` slot (the same slot the industry
// pages fill with IndustryResources). Before this, the home page linked to the
// industry landing pages and money guides only through the nav menus, which
// left its body with no editorial links out - the industry pages and new
// answering-service guides inherited none of its relevance. Curated data, not
// derived from the posts registry: importing that here would be harmless (this
// is a server component) but the anchor text is deliberately written for the
// home page audience rather than reusing post titles.
//
// The comparison block below is the exception: it reads COMPETITORS directly, so
// a new /compare page cannot be published and then sit with no editorial inbound
// link. Before it existed the home page body linked to 8 industries and 6 guides
// and never once to /compare, which left every alternative page on a single
// contextual inbound link from /blog/best-ai-receptionist.

const GUIDES: { href: string; label: string }[] = [
  { href: "/blog/answering-service-for-small-business", label: "Answering service for small business: the full guide" },
  { href: "/blog/answering-service-cost", label: "How much does an answering service cost?" },
  { href: "/blog/virtual-receptionist-pricing", label: "Virtual receptionist pricing, without the surprises" },
  { href: "/blog/24-hour-answering-service", label: "24 hour answering service: live vs AI" },
  { href: "/blog/ai-receptionist-vs-virtual-receptionist-vs-answering-service", label: "AI receptionist vs virtual receptionist vs answering service" },
  { href: "/blog/best-ai-receptionist", label: "The best AI receptionist services, and how to choose one" },
];

export function HomeExplore() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-24 sm:px-10">
      <div className="border-t border-[#e5e5e5] pt-12">
        <p className="mb-2 text-[11px] font-medium tracking-[0.06em] text-[#1D1D1D] uppercase">
          Built for your industry
        </p>
        <h2 className="mb-6 text-[22px] leading-[1.25] font-light tracking-[-0.01em] text-[#1D1D1D] sm:text-[26px]">
          An AI receptionist tuned to how your phones ring
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRY_MENU.map((i) => (
            <Link
              key={i.slug}
              href={`/${i.slug}`}
              className="border border-[#e5e5e5] px-[18px] py-3.5 transition-colors hover:border-[#1D1D1D] hover:bg-[#fafafa]"
            >
              <span className="block text-[15px] text-[#1D1D1D]">{i.label}</span>
              {/* #999 on white is 2.84:1; #6f6f6f is 5.03:1 (WCAG AA). */}
              <span className="mt-0.5 block text-[13px] text-[#6f6f6f]">
                {i.tagline}
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-12 mb-2 text-[11px] font-medium tracking-[0.06em] text-[#1D1D1D] uppercase">
          Popular guides
        </p>
        <h2 className="mb-6 text-[22px] leading-[1.25] font-light tracking-[-0.01em] text-[#1D1D1D] sm:text-[26px]">
          Know what you&apos;re buying before you buy it
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="flex items-center justify-between gap-3 border border-[#e5e5e5] px-[18px] py-3.5 transition-colors hover:border-[#1D1D1D] hover:bg-[#fafafa]"
            >
              <span className="text-[15px] text-[#1D1D1D]">{g.label}</span>
              <span className="shrink-0 text-[11px] font-medium tracking-[0.06em] text-[#6f6f6f] uppercase">
                Guide
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-12 mb-2 text-[11px] font-medium tracking-[0.06em] text-[#1D1D1D] uppercase">
          Weighing up alternatives
        </p>
        <h2 className="mb-6 text-[22px] leading-[1.25] font-light tracking-[-0.01em] text-[#1D1D1D] sm:text-[26px]">
          How we compare to the services you&apos;re probably also looking at
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {COMPETITORS.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="border border-[#e5e5e5] px-[18px] py-3.5 transition-colors hover:border-[#1D1D1D] hover:bg-[#fafafa]"
            >
              <span className="block text-[15px] text-[#1D1D1D]">
                AI Receptionist Now vs {c.competitor}
              </span>
              <span className="mt-0.5 block text-[13px] text-[#6f6f6f]">{c.blurb}</span>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
          <Link
            href="/industries"
            className="text-[#666] underline decoration-[#ddd] underline-offset-4 transition-colors hover:text-[#1D1D1D]"
          >
            All industries
          </Link>
          <Link
            href="/blog"
            className="text-[#666] underline decoration-[#ddd] underline-offset-4 transition-colors hover:text-[#1D1D1D]"
          >
            All guides
          </Link>
          <Link
            href="/answers"
            className="text-[#666] underline decoration-[#ddd] underline-offset-4 transition-colors hover:text-[#1D1D1D]"
          >
            Common questions
          </Link>
          <Link
            href="/compare"
            className="text-[#666] underline decoration-[#ddd] underline-offset-4 transition-colors hover:text-[#1D1D1D]"
          >
            All comparisons
          </Link>
          <Link
            href="/pricing"
            className="text-[#666] underline decoration-[#ddd] underline-offset-4 transition-colors hover:text-[#1D1D1D]"
          >
            See pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
