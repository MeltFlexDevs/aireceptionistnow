"use client";

import type { CSSProperties, ReactNode } from "react";
import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useT } from "@/lib/i18n/client";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { LiveAvatar } from "@/app/(main)/onboarding/LiveAvatar";
import { Check } from "../icons";
import { claimOnce } from "./once";

export type SectionKey = keyof Dictionary["tutorial"]["sections"];

// Longest prefix first, so /dashboard/assistant/[id] resolves to "assistant"
// and the bare /dashboard falls through to "overview". Cut routes are absent
// on purpose: their shims redirect before this ever runs.
const SECTIONS: [string, SectionKey][] = [
  ["/dashboard/calls", "calls"],
  ["/dashboard/calendar", "calendar"],
  ["/dashboard/assistant", "assistant"],
  ["/dashboard/knowledge", "knowledge"],
  ["/dashboard/settings", "settings"],
  ["/dashboard", "overview"],
];

// Typed against the dictionary on both sides, so dropping or renaming a
// tutorial section fails the build here rather than at runtime.
const NAV_LABEL: Record<SectionKey, keyof Dictionary["nav"]> = {
  overview: "overview",
  calls: "calls",
  calendar: "appointments",
  assistant: "assistants",
  knowledge: "knowledge",
  settings: "settings",
};

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

// The receptionist, moonlighting as the dashboard's guide: a floating avatar
// that tracks the cursor, nods when you change pages, and - when asked -
// explains the screen you're on from the localized tutorial content.
export function DashboardGuide() {
  const t = useT();
  const pathname = usePathname();
  const { open, openGuide, close, toggle, forced } = useGuide();

  // Nod on navigation: derive the counter while rendering (no effect needed).
  const [prevPath, setPrevPath] = useState(pathname);
  const [nudge, setNudge] = useState(0);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setNudge(nudge + 1);
  }

  const routeKey: SectionKey =
    SECTIONS.find(([p]) => pathname === p || pathname.startsWith(`${p}/`))?.[1] ?? "overview";
  const key = forced ?? routeKey;
  const section = t.tutorial.sections[key];

  // First visit to a page pops its card once, then never again. The flag is
  // written when the tip fires rather than when it is closed: writing on close
  // would re-trigger forever for anyone who navigates away instead, and would
  // double-fire under StrictMode. localStorage is only read after mount, so
  // the overlay renders closed on both server and first client paint.
  useEffect(() => {
    if (!claimOnce(`ar-guide-tip:${routeKey}`)) return;
    const id = setTimeout(() => openGuide(routeKey), 600);
    return () => clearTimeout(id);
  }, [routeKey, openGuide]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        <AnimatePresence>
          {open && (
            <motion.section
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{ transformOrigin: "bottom right" }}
              role="region"
              aria-label={t.tutorial.title}
              className="glass shape-card-alt w-[min(21rem,calc(100vw-2.5rem))] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  {t.nav[NAV_LABEL[key]]}
                </span>
                <button
                  type="button"
                  onClick={close}
                  aria-label={t.common.close}
                  className="press -mr-1 -mt-1 rounded-lg p-1 text-neutral-400 hover:text-neutral-900"
                >
                  <CloseIcon />
                </button>
              </div>

              <p className="mt-1 text-sm leading-relaxed text-neutral-700">{section.purpose}</p>

              <ul className="mt-3 space-y-1.5">
                {section.can.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[13px] leading-snug text-neutral-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    {line}
                  </li>
                ))}
              </ul>

              {section.gotcha && (
                <p className="mt-3 rounded-xl border border-amber-200/70 bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-amber-800">
                  {section.gotcha}
                </p>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={toggle}
          aria-expanded={open}
          aria-label={t.tutorial.title}
          className="ava-ring ava-breathe"
          style={{ "--ava-size": "56px" } as CSSProperties}
        >
          <span>
            <LiveAvatar
              mood={open ? "bright" : "friendly"}
              nudge={nudge}
              className="h-[82%] w-[82%]"
              label={t.tutorial.title}
            />
          </span>
        </motion.button>
      </div>
    </MotionConfig>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
