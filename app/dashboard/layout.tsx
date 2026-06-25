import type { Metadata } from "next";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";

export const metadata: Metadata = {
  title: "Dashboard — AI Receptionist",
  description: "Manage phone numbers, AI behavior, integrations, and call analytics.",
};

// NOTE: This route is intentionally public for now. Once auth lands, gate it
// here (redirect unauthenticated users) or in middleware so it is not exposed.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
