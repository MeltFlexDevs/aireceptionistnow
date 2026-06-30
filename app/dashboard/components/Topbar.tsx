"use client";

import { useState } from "react";
import { Search, Menu } from "../icons";
import { UserMenu } from "./UserMenu";
import { NotificationsBell } from "./NotificationsBell";
import type { AppUser } from "@/lib/auth-user";

export function Topbar({ user }: { user: AppUser }) {
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-md lg:px-8">
      <button type="button" className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 md:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <label className="relative hidden flex-1 items-center sm:flex">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search calls, callers, numbers..."
          className="h-10 w-full max-w-md rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white"
        />
      </label>

      <div className="ml-auto flex items-center gap-2">
        <NotificationsBell />

        <UserMenu user={user} />
      </div>
    </header>
  );
}
