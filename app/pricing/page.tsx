import type { Metadata } from "next";

import { siteUrl } from "@/lib/site";
import PricingClient from "./PricingClient";

const description =
  "Simple AI receptionist pricing — Solo and Team plans, billed monthly or annually (save 15%). 30-day money-back guarantee. Live in 10 minutes.";

export const metadata: Metadata = {
  title: "Pricing",
  description,
  alternates: { canonical: `${siteUrl}/pricing` },
  openGraph: {
    title: "Pricing — AI Receptionist Now",
    description,
    url: `${siteUrl}/pricing`,
    type: "website",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
