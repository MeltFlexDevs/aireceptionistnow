"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X } from "../icons";
import { useT } from "@/lib/i18n/client";
import { Brand, DashboardNav } from "./Sidebar";

// Hydration-safe "are we on the client yet" flag: false on the server and
// during hydration, true thereafter - no setState-in-effect. The overlay +
// drawer portal to <body>, which only exists client-side.
const subscribe = () => () => {};
const useMounted = () => useSyncExternalStore(subscribe, () => true, () => false);

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
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

      {/* Portal to <body>. The Topbar has backdrop-blur, which makes it a
          containing block for fixed-position descendants - left inside the
          header the drawer collapses to the header's ~64px height instead of
          covering the viewport. Same reason Modal.tsx portals to <body>. */}
      {mounted &&
        createPortal(
          <div className="md:hidden">
            <div
              onClick={() => setOpen(false)}
              aria-hidden="true"
              className={`fixed inset-0 z-40 bg-neutral-900/40 transition-opacity ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-label={t.nav.navigation}
              inert={!open}
              className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,84vw)] flex-col overflow-y-auto bg-white pr-4 shadow-xl transition-transform pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pt-[max(1.25rem,env(safe-area-inset-top))] ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* Mount the drawer's contents only while open. Otherwise this
                  second <Brand/> runs a duplicate active-call poll and a second
                  animated avatar (window listeners + timers) on every route,
                  invisibly. */}
              {open && (
                <>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={t.nav.closeMenu}
                    className="absolute right-2 top-2 rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <Brand />
                  {/* onNavigate closes the drawer - Help opens an overlay without
                      changing the route, so the drawer has to close itself. */}
                  <DashboardNav onNavigate={() => setOpen(false)} />
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
