"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "../icons";
import { useT } from "@/lib/i18n/client";
import { Brand, DashboardNav } from "./Sidebar";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useT();

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  // Escape closes; body scroll is locked while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.nav.openMenu}
        aria-expanded={open}
        className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-neutral-900/40 transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.navigation}
        inert={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto bg-white px-4 py-5 shadow-lg transition-transform md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Brand />
        {/* The drawer sits above the guide overlay, so it has to get out of
            the way when Help opens it. */}
        <DashboardNav onNavigate={() => setOpen(false)} />
      </div>
    </>
  );
}
