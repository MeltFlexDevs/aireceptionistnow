import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "./onboarding.css";
import { authConfigured } from "@/lib/supabase/config";
import { getAuthClaims } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n/client";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Get started - AI Receptionist",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  if (authConfigured()) {
    const claims = await getAuthClaims();
    if (!claims) redirect(`/?auth=login&next=${encodeURIComponent("/onboarding")}`);
  }
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <I18nProvider value={{ locale, dict }}>
      <div className="onb dash-bg min-h-screen text-neutral-900">{children}</div>
    </I18nProvider>
  );
}
