import type { Metadata } from "next";
import { siteName, siteUrl, ogCardImage } from "@/lib/site";
import TermsContent from "./TermsContent";

const description =
  "Terms of Service for AI Receptionist Now - subscription plans, acceptable use, call recording obligations, liability, and cancellation.";

export const metadata: Metadata = {
  title: "Terms of Service",
  description,
  alternates: { canonical: `${siteUrl}/terms-of-service` },
  // Both blocks are required. With neither set, this page would inherit the root
  // layout's openGraph.url (which points at the homepage, contradicting the
  // canonical above) and its homepage twitter title.
  openGraph: {
    title: "Terms of Service",
    description,
    url: `${siteUrl}/terms-of-service`,
    type: "website",
    siteName,
    images: [ogCardImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service",
    description,
    images: [ogCardImage],
  },
  robots: { index: true, follow: true },
};

// The web page. The native app's ?app=1 request is rewritten to
// in-app/page.tsx (next.config.ts), so this page never reads the query and
// stays static. Bump lib/legal.ts TERMS_VERSION together with the Last Updated
// line in TermsContent.tsx.
export default function TermsOfServicePage() {
  return <TermsContent app={false} />;
}
