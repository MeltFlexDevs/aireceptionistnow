"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ChevronDown } from "../icons";
import { createClient } from "@/lib/supabase/client";
import type { AppUser } from "@/lib/auth-user";

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function UserMenu({ user }: { user: AppUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    // Full refresh so the server drops the session and the proxy bounces any
    // further /dashboard access back to the sign-in dialog.
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 text-left hover:bg-neutral-100"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">
          {user.initials}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block max-w-[160px] truncate text-sm font-medium text-neutral-900">{user.name}</span>
          <span className="block max-w-[160px] truncate text-xs text-neutral-400">{user.email}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-neutral-400 sm:block" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
        >
          <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">
              {user.initials}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-medium text-neutral-900">{user.name}</span>
              <span className="block truncate text-xs text-neutral-500">{user.email}</span>
            </span>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            <LogoutIcon className="h-[18px] w-[18px] text-neutral-500" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
