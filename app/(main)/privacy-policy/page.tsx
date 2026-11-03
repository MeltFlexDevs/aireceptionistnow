import type { Metadata } from "next";
import { siteName, siteUrl, ogCardImage } from "@/lib/site";
import PrivacyContent from "./PrivacyContent";

const description =
  "How AI Receptionist Now collects, uses, and protects your personal data. GDPR-compliant privacy policy for our AI phone answering service.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: { canonical: `${siteUrl}/privacy-policy` },
  // Both blocks are required. With neither set, this page inherited the root
  // layout's openGraph.url (which points at the homepage, contradicting the
  // canonical above) and its homepage twitter title.
  openGraph: {
    title: "Privacy Policy",
    description,
    url: `${siteUrl}/privacy-policy`,
    type: "website",
    siteName,
    images: [ogCardImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy",
    description,
    images: [ogCardImage],
  },
  robots: { index: true, follow: true },
};

// The web page. The native app's ?app=1 request is rewritten to
// in-app/page.tsx (next.config.ts), so this page never reads the query and
// stays static.
export default function PrivacyPolicyPage() {
  return <PrivacyContent app={false} />;
}
