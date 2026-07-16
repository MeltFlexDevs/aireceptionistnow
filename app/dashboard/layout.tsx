import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { authConfigured } from "@/lib/supabase/config";
import { toAppUser, type AppUser } from "@/lib/auth-user";
import { getAuthClaims } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n/client";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Dashboard - AI Receptionist",
  description: "Manage phone numbers, AI behavior, integrations, and call analytics.",
};

const GUEST_USER: AppUser = { id: "", email: "", name: "Workspace", initials: "WS" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user: AppUser = GUEST_USER;
  if (authConfigured()) {
    const claims = (await getAuthClaims()) as Parameters<typeof toAppUser>[0] | null;
    if (!claims) redirect("/?auth=login");
    user = toAppUser(claims);
  }

  // cookies() is request-memoized, so these two reads share one lookup.
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <I18nProvider value={{ locale, dict }}>
      <div className="dash-bg flex min-h-screen text-neutral-900">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </I18nProvider>
  );
}
