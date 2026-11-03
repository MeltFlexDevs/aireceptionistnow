import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import TermsContent from "../TermsContent";

// What /terms-of-service?app=1 serves (beforeFiles rewrite in next.config.ts): the page
// for the native app's in-app browser, without site chrome (see lib/legal.ts).
// Search engines get the public copy at /terms-of-service instead.
export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: `${siteUrl}/terms-of-service` },
  robots: { index: false, follow: false },
};

export default function TermsOfServicePageInApp() {
  return <TermsContent app />;
}
