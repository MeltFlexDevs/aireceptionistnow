import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { createClient } from "@/lib/supabase/server";
import { toAppUser } from "@/lib/auth-user";

export const metadata: Metadata = {
  title: "Dashboard — AI Receptionist",
  description: "Manage phone numbers, AI behavior, integrations, and call analytics.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // getClaims() validates the JWT signature, so it's safe to trust for access
  // control (unlike getSession()). The proxy also guards this route; this is
  // defense in depth.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/?auth=login");
  }

  const user = toAppUser(data.claims);

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
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
