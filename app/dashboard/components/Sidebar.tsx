"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo, Grid, Phone, Bot, Building, Plug, ChartBar, Gear, Sparkle, Hash } from "../icons";
import { useT } from "@/lib/i18n/client";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type NavKey = keyof Dictionary["nav"];

interface NavItem {
  href: string;
  label: string;
  hint: string;
  Icon: (props: { className?: string }) => React.ReactElement;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// Nav structure: icons + routes live here; the labels/hints/group titles are
// dictionary keys, resolved to the active language in DashboardNav. A short hint
// under each label tells a first-time user what every screen is for.
const NAV: { titleKey: NavKey; items: { href: string; label: NavKey; hint: NavKey; Icon: NavItem["Icon"] }[] }[] = [
  {
    titleKey: "monitor",
    items: [
      { href: "/dashboard", label: "overview", hint: "overviewHint", Icon: Grid },
      { href: "/dashboard/calls", label: "calls", hint: "callsHint", Icon: Phone },
      { href: "/dashboard/analytics", label: "analytics", hint: "analyticsHint", Icon: ChartBar },
    ],
  },
  {
    titleKey: "setup",
    items: [
      { href: "/dashboard/organizations", label: "organizations", hint: "organizationsHint", Icon: Building },
      { href: "/dashboard/assistant", label: "assistants", hint: "assistantsHint", Icon: Bot },
      { href: "/dashboard/numbers", label: "numbers", hint: "numbersHint", Icon: Hash },
      { href: "/dashboard/integrations", label: "integrations", hint: "integrationsHint", Icon: Plug },
    ],
  },
];

const FOOTER: { href: string; label: NavKey; hint: NavKey; Icon: NavItem["Icon"] }[] = [
  { href: "/dashboard/settings", label: "settings", hint: "settingsHint", Icon: Gear },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`group press relative flex items-center gap-3 rounded-xl px-3 py-2 ${
        active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
    >
      {active && (
        <span className="absolute -left-4 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-neutral-800" />
      )}
      <item.Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-tight">{item.label}</span>
        <span
          className={`block truncate text-[11px] leading-tight ${
            active ? "text-neutral-300" : "text-neutral-400"
          }`}
        >
          {item.hint}
        </span>
      </span>
    </Link>
  );
}

export function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-2 text-neutral-900">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
        <Logo className="h-3.5 w-3.5" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">AI Receptionist</span>
    </Link>
  );
}

// Single source of truth for the nav - rendered by both the desktop sidebar
// and the mobile drawer.
export function DashboardNav() {
  const pathname = usePathname();
  const nav = useT().nav;

  const groups: NavGroup[] = NAV.map((g) => ({
    title: nav[g.titleKey],
    items: g.items.map((i) => ({ href: i.href, label: nav[i.label], hint: nav[i.hint], Icon: i.Icon })),
  }));
  const footer: NavItem[] = FOOTER.map((i) => ({
    href: i.href,
    label: nav[i.label],
    hint: nav[i.hint],
    Icon: i.Icon,
  }));

  return (
    <nav className="mt-7 flex flex-1 flex-col gap-6">
      {groups.map((group) => (
        <div key={group.title}>
          <span className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            {group.title}
          </span>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.href}>
                <NavLink item={item} active={isActive(pathname, item.href)} />
              </li>
            ))}
          </ul>
        </div>
      ))}

      <ul className="mt-auto space-y-1">
        {footer.map((item) => (
          <li key={item.href}>
            <NavLink item={item} active={isActive(pathname, item.href)} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Tips shown in the "Need a hand?" card, keyed by the section you're viewing so
// the guidance always matches the screen. Longest matching prefix wins; the
// empty key is the fallback (overview, settings, anything unmapped).
const TIPS: { prefix: string; tips: string[] }[] = [
  {
    prefix: "/dashboard/organizations",
    tips: [
      "Group assistants under one organization so they share the same knowledge.",
      "Add your hours, services, and FAQs once - every assistant answers from them.",
    ],
  },
  {
    prefix: "/dashboard/assistant",
    tips: [
      "Name each assistant for its job - like “Front desk” or “After hours”.",
      "An assistant needs a phone number before it can take calls.",
      "Voice, language, and behavior all live on the assistant, not the number.",
    ],
  },
  {
    prefix: "/dashboard/numbers",
    tips: [
      "Open an available number and assign it to an assistant to go live.",
      "Each number shows its country flag - pick one local to your callers.",
    ],
  },
  {
    prefix: "/dashboard/integrations",
    tips: [
      "Connect a calendar so the AI can book appointments during a call.",
      "The assistant checks every connected calendar for availability.",
    ],
  },
  {
    prefix: "/dashboard/calls",
    tips: [
      "Open any call for its transcript, recording, and AI summary.",
      "Spot a mistake? Report an issue on the call to help tune your assistant.",
    ],
  },
  {
    prefix: "/dashboard/analytics",
    tips: [
      "Watch answer rate and caller sentiment trend by organization.",
      "A dip in answer rate usually means an assistant is missing a number.",
    ],
  },
  {
    prefix: "",
    tips: [
      "Set up your organization first, then add assistants to answer calls.",
      "Give an assistant a number and it answers your phone 24/7.",
      "Connect a calendar so callers can book time with you on the call.",
    ],
  },
];

function tipsFor(pathname: string): string[] {
  let best = TIPS[TIPS.length - 1];
  for (const entry of TIPS) {
    if (entry.prefix && pathname.startsWith(entry.prefix) && entry.prefix.length > best.prefix.length) {
      best = entry;
    }
  }
  return best.tips;
}

const TIP_INTERVAL_MS = 7000;

function NeedAHand() {
  const pathname = usePathname();
  const t = useT();
  const tips = tipsFor(pathname);
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  // New section → new tip set: reset to the first tip. Adjusted during render
  // (not in an effect) per the React docs pattern - same as MobileNav.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setIndex(0);
  }

  // Auto-advance, but hold while the pointer is over the card.
  useEffect(() => {
    if (tips.length <= 1) return;
    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % tips.length);
    }, TIP_INTERVAL_MS);
    return () => clearInterval(id);
  }, [tips.length]);

  const tip = tips[index] ?? tips[0];

  return (
    <div
      className="mt-4 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 text-white shadow-sm"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10">
            <Sparkle className="h-3.5 w-3.5" />
          </span>
          {t.nav.needAHand}
        </div>
        {tips.length > 1 && (
          <div className="flex items-center gap-1.5">
            {tips.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Tip ${i + 1} of ${tips.length}`}
                aria-current={i === index ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      {/* Fixed height so rotating tips of different lengths never resize the card. */}
      <div className="mt-2 h-16 overflow-hidden">
        {/* key re-triggers the fade/rise each time the tip changes */}
        <p key={`${pathname}-${index}`} className="rise text-xs leading-relaxed text-neutral-200">
          {tip}
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-5 md:flex">
      <Brand />

      <DashboardNav />

      <NeedAHand />
    </aside>
  );
}
