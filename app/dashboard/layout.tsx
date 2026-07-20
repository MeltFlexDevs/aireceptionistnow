import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { DashboardGuide } from "./components/DashboardGuide";
import { ShellProviders, type AiStatus, type ShellState } from "./components/ShellProviders";
import { authConfigured, devDashboardBypass } from "@/lib/supabase/config";
import { toAppUser, type AppUser } from "@/lib/auth-user";
import { getAuthClaims, currentUserId } from "@/lib/auth";
import { listAssistants, getOwnedNumbers } from "@/lib/dashboard/db";
import { getOverviewCached } from "@/lib/dashboard/analytics";
import { I18nProvider } from "@/lib/i18n/client";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Dashboard - AI Receptionist",
  description: "Manage phone numbers, AI behavior, integrations, and call analytics.",
  // Private app area: robots.txt already blocks crawling, but without noindex
  // a linked URL can still be indexed - and without this override every
  // dashboard route would inherit the root layout's homepage canonical.
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

const GUEST_USER: AppUser = { id: "", email: "", name: "Workspace", initials: "WS" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user: AppUser = GUEST_USER;
  if (authConfigured()) {
    const claims = (await getAuthClaims()) as Parameters<typeof toAppUser>[0] | null;
    // No session normally means login; with the dev bypass on, fall through
    // and render as the guest "Workspace" user instead.
    if (claims) {
      user = toAppUser(claims);
    } else if (!devDashboardBypass()) {
      redirect("/?auth=login");
    }
  }

  // cookies() is request-memoized, so these reads share one lookup. Both
  // listAssistants and getOwnedNumbers are cache()-wrapped, so a page calling
  // them again this request costs nothing.
  const ownerId = await currentUserId();
  const [locale, dict, assistants, numbers, overview] = await Promise.all([
    getLocale(),
    getDictionary(),
    ownerId ? listAssistants(ownerId).catch(() => []) : Promise.resolve([]),
    ownerId ? getOwnedNumbers(ownerId).catch(() => []) : Promise.resolve([]),
    ownerId ? getOverviewCached(ownerId).catch(() => null) : Promise.resolve(null),
  ]);

  // Avatar status: green if a receptionist is answering, amber if all paused,
  // red if there is nobody to answer or no number for callers to reach.
  const aiStatus: AiStatus =
    assistants.length === 0 || numbers.length === 0
      ? "offline"
      : assistants.some((a) => a.enabled)
        ? "online"
        : "paused";

  const first = assistants[0] ?? null;
  const shell: ShellState = {
    status: aiStatus,
    number: numbers[0]?.e164 ?? "",
    assistant: first ? { id: first.id, enabled: first.enabled } : null,
    hasCalls: (overview?.monthUsage.callsThisMonth ?? 0) > 0,
    hasBookings: (overview?.monthUsage.bookings ?? 0) > 0,
  };

  return (
    <I18nProvider value={{ locale, dict }}>
      <ShellProviders shell={shell}>
        <div className="dash-bg flex min-h-screen text-neutral-900">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar user={user} />
            <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
              <div className="mx-auto w-full max-w-7xl">{children}</div>
            </main>
          </div>
          <DashboardGuide />
        </div>
      </ShellProviders>
    </I18nProvider>
  );
}
