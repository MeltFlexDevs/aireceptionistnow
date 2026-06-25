"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown, Menu } from "../icons";

const RANGES = ["Today", "7 days", "30 days", "90 days"] as const;
type Range = (typeof RANGES)[number];

export function Topbar() {
  const [range, setRange] = useState<Range>("Today");
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
          className="h-10 w-full max-w-md rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-violet-400 focus:bg-white"
        />
      </label>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 sm:flex">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                range === r ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <button type="button" className="relative rounded-lg p-2 text-neutral-600 hover:bg-neutral-100" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-600 ring-2 ring-white" />
        </button>

        <button type="button" className="flex items-center gap-2 rounded-lg p-1 pr-2 text-left hover:bg-neutral-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">MS</span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-medium text-neutral-900">Milan Stupko</span>
            <span className="block text-xs text-neutral-400">Pro workspace</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-neutral-400 sm:block" />
        </button>
      </div>
    </header>
  );
}
