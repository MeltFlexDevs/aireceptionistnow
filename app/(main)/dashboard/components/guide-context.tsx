"use client";

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export type SectionKey = keyof Dictionary["tutorial"]["sections"];

/**
 * Just the open/close state for the guide overlay.
 *
 * Deliberately its own module rather than living beside <DashboardGuide />:
 * ShellProviders wraps every dashboard route and needs only this provider, but
 * the overlay's module statically imports motion/react and LiveAvatar. Sharing
 * a module meant that ~140kB of animation code was pulled into the client
 * bundle of every dashboard page in order to get a useState container.
 */
interface GuideCtx {
  open: boolean;
  /** Open the overlay; pass a section to pin one instead of following the route. */
  openGuide: (section?: SectionKey) => void;
  close: () => void;
  toggle: () => void;
  forced: SectionKey | null;
}

const Ctx = createContext<GuideCtx | null>(null);

/** Lets the sidebar Help button (and the mobile drawer) open the overlay. */
export function GuideProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [forced, setForced] = useState<SectionKey | null>(null);

  const openGuide = useCallback((section?: SectionKey) => {
    setForced(section ?? null);
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    setForced(null);
  }, []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  const value = useMemo(
    () => ({ open, openGuide, close, toggle, forced }),
    [open, openGuide, close, toggle, forced],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGuide(): GuideCtx {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useGuide must be used inside <GuideProvider>");
  return ctx;
}
