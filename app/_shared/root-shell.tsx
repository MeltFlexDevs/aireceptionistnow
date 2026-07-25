import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { AuthDialogProvider } from "../components/AuthDialog";
import {
  siteUrl,
  siteName,
  siteDescription,
  siteKeywords,
  logoUrl,
  sameAs,
  supportEmail,
  authors,
} from "@/lib/site";

// THE single <html>/<body> shell, shared by every root layout.
//
// There are now two root layouts - app/(main)/layout.tsx (English, lang="en")
// and app/[locale]/layout.tsx (localized, lang={locale}) - because only a ROOT
// layout may render <html>, and the lang attribute has to vary per locale. A
// nested layout under a single app/layout.tsx could not do it: /de was served
// as <html lang="en">, mislabelling the page's language to crawlers and screen
// readers.
//
// Both callers render this and differ in exactly one prop, so the two trees
// cannot drift apart in markup, fonts, JSON-LD or providers.

// Variable font: covers the whole 100-900 axis in one file. Pinning the old
// ["300","400","500"] list meant `font-semibold` (600) - used throughout the
// dashboard and onboarding - had no real weight to use, so the browser
// synthesized a faux-bold from 500 and those screens looked like a different
// typeface to the marketing pages.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// "answering service for small business" is the highest-traffic-potential
// cluster (Ahrefs TP ~28k) at a difficulty this domain can win; the head term
// "ai receptionist" stays first for the brand match.
const defaultTitle = "AI Receptionist - 24/7 AI Answering Service for Small Business";

/**
 * Metadata every root layout re-exports.
 *
 * metadataBase must be present in BOTH root layouts: it does not cross from one
 * root layout into a sibling, and without it hreflang silently degrades to
 * relative hrefs that are worthless to Google.
 */
export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  // No `alternates` here on purpose. A canonical set on the root layout is
  // inherited by every page that does not set its own, which silently points
  // them at the home page. app/(main)/page.tsx owns the home canonical directly.
  category: "technology",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description: siteDescription,
    // Localized pages override this wholesale via OG_LOCALE; metadata merging
    // is shallow, so a partial openGraph there would inherit "en_US".
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
};

export const baseViewport: Viewport = {
  themeColor: "#1D1D1D",
};

// Site-wide structured data: who runs the site (Organization + WebSite graph).
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
  // Matches the footer's legal imprint so the entity is unambiguous.
  legalName: "MeltFlex s. r. o.",
  url: siteUrl,
  logo: { "@type": "ImageObject", url: logoUrl, width: 512, height: 512 },
  image: logoUrl,
  description: siteDescription,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: supportEmail,
    availableLanguage: [
      "English",
      "Spanish",
      "German",
      "French",
      "Dutch",
      "Portuguese",
      "Italian",
      "Slovak",
    ],
  },
  founder: Object.values(authors).map((a) => ({
    "@type": "Person",
    name: a.name,
    jobTitle: a.role,
    sameAs: [a.linkedin],
  })),
  ...(sameAs.length ? { sameAs } : {}),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: siteName,
  description: siteDescription,
  publisher: { "@id": `${siteUrl}/#organization` },
};

export default function RootShell({
  lang,
  children,
}: Readonly<{
  /** BCP-47 tag for <html lang>. "en" for the main tree, the locale otherwise. */
  lang: string;
  children: React.ReactNode;
}>) {
  return (
    <html lang={lang} data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white" style={{ fontFamily: "var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif", fontWeight: 300 }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [orgJsonLd, websiteJsonLd],
            }),
          }}
        />
        <AuthDialogProvider>{children}</AuthDialogProvider>
      </body>
    </html>
  );
}
