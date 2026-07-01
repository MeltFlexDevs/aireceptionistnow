import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { createClient } from "@/lib/supabase/server";
import { authConfigured } from "@/lib/supabase/config";
import { toAppUser, type AppUser } from "@/lib/auth-user";

export const metadata: Metadata = {
  title: "Dashboard - AI Receptionist",
  description: "Manage phone numbers, AI behavior, integrations, and call analytics.",
};

const GUEST_USER: AppUser = { id: "", email: "", name: "Workspace", initials: "WS" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Gate the workspace only when auth is configured. getClaims() validates the
  // JWT signature, so it's safe to trust (the proxy guards too - defense in depth).
  let user: AppUser = GUEST_USER;
  if (authConfigured()) {
    let claims: Parameters<typeof toAppUser>[0] | null = null;
    try {
      const supabase = await createClient();
      claims = ((await supabase.auth.getClaims()).data?.claims ?? null) as typeof claims;
    } catch {
      claims = null;
    }
    if (!claims) redirect("/?auth=login");
    user = toAppUser(claims);
  }

  return (
    <div className="dash-bg flex min-h-screen text-neutral-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
