import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "./surfaces.css";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { ShellProviders, type AiStatus, type ShellState } from "./components/ShellProviders";
import { authConfigured, devDashboardBypass } from "@/lib/supabase/config";
import { toAppUser, type AppUser } from "@/lib/auth-user";
import { getAuthClaims, currentUserId } from "@/lib/auth";
import { listAssistants, getOwnedNumbers } from "@/lib/dashboard/db";
import { getOverviewCached } from "@/lib/dashboard/analytics";
import { getAccountSettings } from "@/lib/dashboard/account";
import { displayTimezone } from "@/lib/dashboard/display-timezone";
import { TimezoneSync } from "./calendar/TimezoneSync";
import { I18nProvider } from "@/lib/i18n/client";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { loginHomePath } from "@/lib/i18n/marketing/login-redirect";
import { SkipLink } from "@/app/components/SkipLink";

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
  let claims: Parameters<typeof toAppUser>[0] | null = null;
  if (authConfigured()) {
    claims = (await getAuthClaims()) as Parameters<typeof toAppUser>[0] | null;
    // No session normally means login; with the dev bypass on, fall through
    // and render as the guest "Workspace" user instead.
    if (claims) {
      user = toAppUser(claims);
    } else if (!devDashboardBypass()) {
      redirect(`${loginHomePath({ cookieLocale: await getLocale() })}?auth=login`);
    }
  }

  // cookies() is request-memoized, so these reads share one lookup. Both
  // listAssistants and getOwnedNumbers are cache()-wrapped, so a page calling
  // them again this request costs nothing.
  const ownerId = await currentUserId();
  // The zone Home passes too, so both reads share one overview cache entry.
  const tz = ownerId ? await displayTimezone(ownerId).catch(() => "UTC") : "UTC";
  const [locale, dict, assistants, numbers, overview, settings] = await Promise.all([
    getLocale(),
    getDictionary(),
    ownerId ? listAssistants(ownerId).catch(() => []) : Promise.resolve([]),
    ownerId ? getOwnedNumbers(ownerId).catch(() => []) : Promise.resolve([]),
    ownerId ? getOverviewCached(ownerId, tz).catch(() => null) : Promise.resolve(null),
    ownerId ? getAccountSettings(ownerId).catch(() => null) : Promise.resolve(null),
  ]);
  // Settings saves the name to account_settings, not the JWT, so prefer it.
  if (claims && settings?.full_name.trim()) user = toAppUser(claims, settings.full_name);

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
    assistantCount: assistants.length,
    hasCalls: (overview?.monthUsage.callsThisMonth ?? 0) > 0,
    hasBookings: (overview?.monthUsage.bookings ?? 0) > 0,
  };

  return (
    <I18nProvider value={{ locale, dict }}>
      <SkipLink label={dict.common.skipToContent} />
      <ShellProviders shell={shell}>
        {/* Stores the browser zone in the `tz` cookie for displayTimezone. */}
        <TimezoneSync />
        <div className="dash-bg flex min-h-screen text-neutral-900">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar user={user} />
            <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 lg:px-8 lg:py-8 focus:outline-none">
              <div className="mx-auto w-full max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </ShellProviders>
    </I18nProvider>
  );
}
