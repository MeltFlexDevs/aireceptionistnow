import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthDialogProvider } from "./components/AuthDialog";
import {
  siteUrl,
  siteName,
  siteDescription,
  siteKeywords,
  logoUrl,
  sameAs,
  authors,
} from "@/lib/site";

// Variable font: covers the whole 100-900 axis in one file. Pinning the old
// ["300","400","500"] list meant `font-semibold` (600) - used throughout the
// dashboard and onboarding - had no real weight to use, so the browser
// synthesized a faux-bold from 500 and those screens looked like a different
// typeface to the marketing pages.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const defaultTitle = "AI Receptionist - 24/7 AI Phone Answering Service";

export const metadata: Metadata = {
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
  alternates: { canonical: "/" },
  category: "technology",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description: siteDescription,
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

export const viewport: Viewport = {
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
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
