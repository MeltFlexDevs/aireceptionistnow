import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "./onboarding.css";
import { authConfigured, devDashboardBypass } from "@/lib/supabase/config";
import { getAuthClaims } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n/client";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Get started - AI Receptionist",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // Auth check and i18n reads are independent - start them together and only
  // then decide on the redirect, instead of paying for them back-to-back.
  const [claims, locale, dict] = await Promise.all([
    authConfigured() ? getAuthClaims() : Promise.resolve(null),
    getLocale(),
    getDictionary(),
  ]);
  // No session normally means login; with the dev bypass on
  // (`DEV_DASHBOARD=1 npm run dev`) fall through and render the funnel as a
  // guest, so /onboarding can be eyeballed without a real session.
  if (authConfigured() && !claims && !devDashboardBypass()) {
    redirect(`/?auth=login&next=${encodeURIComponent("/onboarding")}`);
  }
  return (
    <I18nProvider value={{ locale, dict }}>
      <div className="onb dash-bg min-h-screen text-neutral-900">{children}</div>
    </I18nProvider>
  );
}
