"use client";

import { useRouter } from "next/navigation";
import { Search } from "../icons";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { NotificationsBell } from "./NotificationsBell";
import type { AppUser } from "@/lib/auth-user";

export function Topbar({ user }: { user: AppUser }) {
  const router = useRouter();

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    router.push(q ? `/dashboard/calls?q=${encodeURIComponent(q)}` : "/dashboard/calls");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-md lg:px-8">
      <MobileNav />

      <form onSubmit={onSearchSubmit} className="relative hidden flex-1 items-center sm:flex">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-400" />
        <input
          type="search"
          name="q"
          placeholder="Search calls, callers, numbers..."
          className="shape-pill h-10 w-full max-w-md border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <NotificationsBell />

        <UserMenu user={user} />
      </div>
    </header>
  );
}
