import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
  alternates: { canonical: null },
};

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/industries", label: "Industries" },
  { href: "/compare/smith-ai-alternative", label: "Compare" },
  { href: "/blog", label: "Blog" },
  { href: "/answers", label: "Answers" },
];

// A dead end costs the visitor and the crawler alike - route both back to the
// hubs instead of serving the framework's bare 404.
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "24px",
        background: "#fff",
        color: "#1D1D1D",
        fontFamily: "var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "13px", letterSpacing: "0.08em", color: "#888", margin: 0 }}>404</p>
      <h1 style={{ fontSize: "28px", fontWeight: 400, letterSpacing: "-0.02em", margin: 0 }}>
        This page doesn&apos;t exist
      </h1>
      <p style={{ fontSize: "15px", color: "#555", maxWidth: "420px", margin: 0 }}>
        The link may be outdated. Here&apos;s where everything lives:
      </p>
      <nav style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "1px solid #e5e5e5",
              color: "#1D1D1D",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
