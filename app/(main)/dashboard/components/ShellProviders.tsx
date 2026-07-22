"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import { GuideProvider } from "./DashboardGuide";

/**
 * Operational state of the receptionist, shown as a coloured dot on the avatar:
 * green = answering, amber = paused, red = not set up / no number yet.
 */
export type AiStatus = "online" | "paused" | "offline";

export interface ShellState {
  status: AiStatus;
  /** Primary line in E.164; "" when there is none yet. */
  number: string;
  /** The singleton receptionist, for the avatar popover's Pause/Resume. */
  assistant: { id: string; enabled: boolean } | null;
  /** Drives the one-off celebrate pulse on the first call / first booking. */
  hasCalls: boolean;
  hasBookings: boolean;
}

const Ctx = createContext<ShellState | null>(null);

/**
 * Shell-wide state for the two places <Brand /> renders (sidebar and mobile
 * drawer), plus the guide overlay. Context rather than prop-drilling because
 * Topbar - which renders MobileNav - has no use for any of this and would only
 * forward it.
 *
 * Wrapping the tree in a client component does not make the pages client
 * components: `children` arrives as an already-rendered server slot.
 */
export function ShellProviders({ shell, children }: { shell: ShellState; children: ReactNode }) {
  // `shell` is a fresh object on every server render, so memoize on the
  // primitives to keep navigation from re-rendering every consumer.
  const value = useMemo(
    () => shell,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shell.status, shell.number, shell.assistant?.id, shell.assistant?.enabled, shell.hasCalls, shell.hasBookings],
  );
  return (
    <Ctx.Provider value={value}>
      <GuideProvider>{children}</GuideProvider>
    </Ctx.Provider>
  );
}

export function useShell(): ShellState {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useShell must be used inside <ShellProviders>");
  return ctx;
}
