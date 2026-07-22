"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { Logo, Grid, Phone, Bot, Gear, Sparkle, Calendar } from "../icons";
import { LiveAvatar, type Activity } from "@/app/(main)/onboarding/LiveAvatar";
import type { Mood } from "@/app/(main)/onboarding/personality";
import { useT } from "@/lib/i18n/client";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { useShell } from "./ShellProviders";
import { claimOnce } from "./once";

type NavKey = keyof Dictionary["nav"];
type IconFn = (props: { className?: string }) => React.ReactElement;

export type { AiStatus } from "./ShellProviders";

// Five items, flat, no group title. Company, Analytics, Numbers, Integrations
// and Tutorial are gone - their URLs survive only as redirect shims.
const NAV: { href: string; label: NavKey; Icon: IconFn }[] = [
  { href: "/dashboard", label: "overview", Icon: Grid },
  { href: "/dashboard/calls", label: "calls", Icon: Phone },
  { href: "/dashboard/calendar", label: "appointments", Icon: Calendar },
  { href: "/dashboard/knowledge", label: "knowledge", Icon: Sparkle },
  { href: "/dashboard/assistant", label: "assistants", Icon: Bot },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemClass(active: boolean): string {
  return `group press relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 ${
    active ? "brand-grad text-white shadow-card" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
  }`;
}

function navIconClass(active: boolean): string {
  return `h-[18px] w-[18px] shrink-0 transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`;
}

function NavLink({
  href,
  label,
  Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  Icon: IconFn;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={navItemClass(active)}
    >
      <Icon className={navIconClass(active)} />
      <span className="min-w-0 truncate text-sm font-medium leading-tight">{label}</span>
    </Link>
  );
}

// What the receptionist acts out per section: answering calls on Calls,
// ticking the calendar on Appointments, and so on. Longest prefix wins.
const BRAND_ACTIVITIES: [string, Activity][] = [
  ["/dashboard/calls", "phone"],
  ["/dashboard/calendar", "calendar"],
  ["/dashboard/knowledge", "study"],
  ["/dashboard/settings", "gear"],
];

const BRAND_MOODS: [string, Mood][] = [
  ["/dashboard/knowledge", "studying"],
  ["/dashboard/assistant", "greeting"],
  ["/dashboard/settings", "calm"],
];

function forPath<T>(pairs: [string, T][], pathname: string): T | null {
  return pairs.find(([p]) => pathname === p || pathname.startsWith(`${p}/`))?.[1] ?? null;
}

export function Brand() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const t = useT();
  const { status, hasCalls, hasBookings } = useShell();

  // Live-call indicator: while the receptionist is answering, poll for an active
  // call so the status dot can turn yellow for the duration of a call.
  const [inCall, setInCall] = useState(false);
  useEffect(() => {
    if (status !== "online") {
      setInCall(false);
      return;
    }
    let alive = true;
    const check = async () => {
      try {
        const res = await fetch("/api/dashboard/active-call", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { active?: boolean };
        if (alive) setInCall(Boolean(data?.active));
      } catch {
        // Transient - keep the last known value until the next tick.
      }
    };
    void check();
    const iv = setInterval(check, 6000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [status]);

  // Analytics is gone, but the chart scene it used to own still has a home:
  // Home's This-month view, which is where those charts moved.
  const monthView = pathname === "/dashboard" && searchParams.get("range") === "month";
  const routeActivity = monthView ? "chart" : forPath(BRAND_ACTIVITIES, pathname);
  const mood = forPath(BRAND_MOODS, pathname) ?? "friendly";

  // A little fanfare the first time a call comes in, and the first time
  // something gets booked. `celebrate` is a boolean the avatar sparkles while
  // it is true, so pulse it briefly; claimOnce keeps it to once per browser.
  // The claim and the pulse both run from a timer callback, never synchronously
  // in the effect body - and letting the page settle first reads better anyway.
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (!hasCalls && !hasBookings) return;
    let stop: ReturnType<typeof setTimeout>;
    const start = setTimeout(() => {
      const first =
        (hasCalls && claimOnce("ar-celebrated-call")) ||
        (hasBookings && claimOnce("ar-celebrated-booking"));
      if (!first) return;
      setCelebrate(true);
      stop = setTimeout(() => setCelebrate(false), 1500);
    }, 400);
    return () => {
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, [hasCalls, hasBookings]);

  // Nod when the user changes pages (derived while rendering, no effect).
  const [prevPath, setPrevPath] = useState(pathname);
  const [nudge, setNudge] = useState(0);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setNudge(nudge + 1);
  }

  // On sections without a prop of their own, the receptionist still works the
  // desk now and then: a call comes in, or a booking gets ticked off. A route
  // prop taking over clears any scene in progress (derived while rendering).
  const [idle, setIdle] = useState<Activity | null>(null);
  const [prevRoute, setPrevRoute] = useState(routeActivity);
  if (prevRoute !== routeActivity) {
    setPrevRoute(routeActivity);
    if (idle) setIdle(null);
  }
  useEffect(() => {
    if (routeActivity || reduce) return;
    let done: ReturnType<typeof setTimeout>;
    const iv = setInterval(() => {
      setIdle(Math.random() < 0.6 ? "phone" : "calendar");
      done = setTimeout(() => setIdle(null), 5600);
    }, 12000 + Math.random() * 6000);
    return () => {
      clearInterval(iv);
      clearTimeout(done);
    };
  }, [routeActivity, reduce]);

  const statusTitle = status === "online" ? t.home.online : status === "paused" ? t.home.paused : t.home.offline;

  return (
    <div className="flex flex-col items-center gap-3 text-neutral-900">
      {/* Only the wordmark navigates - the avatar below opens the status
          popover instead, so a click on the receptionist is never a surprise
          page change. */}
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
          <Logo className="h-3.5 w-3.5" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">AI Receptionist</span>
      </Link>
      {/* The receptionist at the front desk: centered under the wordmark, eyes on the cursor.
          The status dot sits on a wrapper OUTSIDE .ava-ring - a direct span child would
          otherwise be caught by `.ava-ring > span` and painted as a full white disc. */}
      <div className="relative flex flex-col items-center">
        {/* Decorative only - clicking the receptionist no longer opens a menu. */}
        <div
          className="ava-ring ava-breathe"
          style={{ "--ava-size": "108px" } as CSSProperties}
        >
          <span>
            <LiveAvatar
              mood={mood}
              activity={inCall ? "phone" : (routeActivity ?? idle)}
              nudge={nudge}
              celebrate={celebrate}
              className="h-[82%] w-[82%]"
            />
          </span>
        </div>
        {/* Status dot: yellow while on a call, else green answering, amber
            paused, red not set up. */}
        <span
          role="status"
          title={statusTitle}
          aria-label={statusTitle}
          className={`pointer-events-none absolute bottom-2.5 right-2.5 z-10 h-4 w-4 rounded-full border-2 border-white ${
            inCall
              ? "bg-amber-400"
              : status === "online"
                ? "bg-emerald-500"
                : status === "paused"
                  ? "bg-amber-500"
                  : "bg-rose-500"
          }`}
        />
      </div>
    </div>
  );
}

/**
 * `onNavigate` lets the mobile drawer close itself. Help matters most here:
 * it changes no route, so without this the drawer would stay open and cover
 * the guide overlay it just opened.
 */
export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const nav = useT().nav;

  return (
    <nav className="mt-7 flex flex-1 flex-col gap-6">
      <ul className="space-y-1">
        {NAV.map((item) => (
          <li key={item.href}>
            <NavLink
              href={item.href}
              label={nav[item.label]}
              Icon={item.Icon}
              active={isActive(pathname, item.href)}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>

      <ul className="mt-auto space-y-1">
        <li>
          <NavLink
            href="/dashboard/settings"
            label={nav.settings}
            Icon={Gear}
            active={isActive(pathname, "/dashboard/settings")}
            onNavigate={onNavigate}
          />
        </li>
      </ul>
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-5 md:flex">
      <Brand />
      <DashboardNav />
    </aside>
  );
}
