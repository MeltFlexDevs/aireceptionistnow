import type { Metadata } from "next";

import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing — AI Receptionist",
  description:
    "Solo and Team plans for your AI receptionist. Billed monthly or annually (save 15%). 30-day money-back guarantee.",
};

export default function PricingPage() {
  return <PricingClient />;
}
