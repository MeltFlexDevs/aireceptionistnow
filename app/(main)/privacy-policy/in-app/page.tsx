import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import PrivacyContent from "../PrivacyContent";

// What /privacy-policy?app=1 serves (beforeFiles rewrite in next.config.ts): the page
// for the native app's in-app browser, without site chrome (see lib/legal.ts).
// Search engines get the public copy at /privacy-policy instead.
export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: `${siteUrl}/privacy-policy` },
  robots: { index: false, follow: false },
};

export default function PrivacyPolicyPageInApp() {
  return <PrivacyContent app />;
}
