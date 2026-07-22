import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { NotFoundSuggestions, type SuggestionLink } from "../components/NotFoundSuggestions";
import { posts } from "./blog/_posts";
import { answers } from "./answers/_answers";
import { COMPETITORS } from "./compare/_compare/competitors";
import { INDUSTRY_MENU } from "@/lib/marketing/industries";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
  alternates: { canonical: null },
};

// Every real page a mistyped URL could have meant - built server-side, only
// these {href, label} strings ever reach the client.
const SUGGESTION_LINKS: SuggestionLink[] = [
  { href: "/pricing", label: "Pricing" },
  { href: "/industries", label: "Industries" },
  { href: "/blog", label: "Blog" },
  { href: "/answers", label: "Answers" },
  ...INDUSTRY_MENU.map((i) => ({
    href: `/${i.slug}`,
    label: `AI Receptionist for ${i.label}`,
  })),
  ...COMPETITORS.map((c) => ({
    href: `/compare/${c.slug}`,
    label: `${c.competitor} alternative`,
  })),
  ...posts.map((p) => ({ href: `/blog/${p.slug}`, label: p.title })),
  ...answers.map((a) => ({ href: `/answers/${a.slug}`, label: a.question })),
];

// One joke, one exit - the site chrome around it carries the navigation, and
// the did-you-mean matcher rescues mistyped URLs.
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        color: "#1D1D1D",
        fontFamily: "var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <SiteHeader />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "140px 24px 96px",
          textAlign: "center",
        }}
      >
        <p
          aria-hidden
          style={{
            fontSize: "clamp(88px, 18vw, 160px)",
            fontWeight: 200,
            letterSpacing: "-0.06em",
            lineHeight: 1,
            margin: 0,
            color: "#1D1D1D",
          }}
        >
          +404
        </p>
        <h1
          style={{
            fontSize: "clamp(18px, 3vw, 24px)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            margin: "8px 0 0",
          }}
        >
          The page you dialed is not in service.
        </h1>
        <p
          style={{
            fontSize: "15px",
            fontWeight: 300,
            color: "#888",
            maxWidth: "380px",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Wrong extension, probably. Our receptionist answers everything. This one&apos;s on us.
        </p>
        <NotFoundSuggestions links={SUGGESTION_LINKS} />
        <Link
          href="/"
          className="press"
          style={{
            marginTop: "24px",
            display: "inline-flex",
            alignItems: "center",
            height: "42px",
            padding: "0 22px",
            borderRadius: "12px",
            background: "#1D1D1D",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Back to the front desk
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
