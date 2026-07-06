import type { Metadata } from "next";
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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const defaultTitle = "AI Receptionist — Answer Every Call 24/7";

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

// Site-wide structured data: who we are + a sitelinks search box hint.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
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
            // @graph form (not a bare array) so the top-level object always has
            // an "@context". Consumers that read `data["@context"]` directly —
            // e.g. some browser SEO/schema extensions — throw on an array
            // (data["@context"] is undefined), and that thrown inline script can
            // abort the page's client bootstrap. @graph keeps them happy.
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
