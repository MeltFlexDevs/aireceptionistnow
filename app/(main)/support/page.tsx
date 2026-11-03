import type { Metadata } from "next";
import { siteName, siteUrl, ogCardImage } from "@/lib/site";
import SupportContent from "./SupportContent";

const description =
  "Get help with AI Receptionist Now: contact support, manage or cancel an App Store or Google Play subscription, and delete your account.";

export const metadata: Metadata = {
  title: "Support",
  description,
  alternates: { canonical: `${siteUrl}/support` },
  openGraph: {
    title: "Support",
    description,
    url: `${siteUrl}/support`,
    type: "website",
    siteName,
    images: [ogCardImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Support",
    description,
    images: [ogCardImage],
  },
  robots: { index: true, follow: true },
};

// The web page. The native app's ?app=1 request is rewritten to
// in-app/page.tsx (next.config.ts), so this page never reads the query and
// stays static.
export default function SupportPage() {
  return <SupportContent app={false} />;
}
