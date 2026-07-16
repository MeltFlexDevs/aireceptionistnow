"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, Grid, Phone, Bot, Building, Plug, ChartBar, Gear, Sparkle, Hash, Calendar } from "../icons";
import { useT } from "@/lib/i18n/client";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type NavKey = keyof Dictionary["nav"];

interface NavItem {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV: { titleKey: NavKey; items: { href: string; label: NavKey; Icon: NavItem["Icon"] }[] }[] = [
  {
    titleKey: "monitor",
    items: [
      { href: "/dashboard", label: "overview", Icon: Grid },
      { href: "/dashboard/calls", label: "calls", Icon: Phone },
      { href: "/dashboard/calendar", label: "calendar", Icon: Calendar },
      { href: "/dashboard/analytics", label: "analytics", Icon: ChartBar },
    ],
  },
  {
    titleKey: "setup",
    items: [
      { href: "/dashboard/organizations", label: "organizations", Icon: Building },
      { href: "/dashboard/assistant", label: "assistants", Icon: Bot },
      { href: "/dashboard/numbers", label: "numbers", Icon: Hash },
      { href: "/dashboard/integrations", label: "integrations", Icon: Plug },
    ],
  },
];

const FOOTER: { href: string; label: NavKey; Icon: NavItem["Icon"] }[] = [
  { href: "/dashboard/settings", label: "settings", Icon: Gear },
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
      <span className="min-w-0 truncate text-sm font-medium leading-tight">{item.label}</span>
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

export function DashboardNav() {
  const pathname = usePathname();
  const nav = useT().nav;

  const groups: NavGroup[] = NAV.map((g) => ({
    title: nav[g.titleKey],
    items: g.items.map((i) => ({ href: i.href, label: nav[i.label], Icon: i.Icon })),
  }));
  const footer: NavItem[] = FOOTER.map((i) => ({
    href: i.href,
    label: nav[i.label],
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

function AiKnowsCard() {
  const pathname = usePathname();
  const t = useT();
  const active = pathname.startsWith("/dashboard/knowledge");

  return (
    <Link
      href="/dashboard/knowledge"
      aria-current={active ? "page" : undefined}
      className={`press mt-4 block rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 text-white shadow-sm transition-shadow hover:shadow-card ${
        active ? "ring-2 ring-neutral-900 ring-offset-2" : ""
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/10">
          <Sparkle className="h-3.5 w-3.5" />
        </span>
        {t.nav.aiKnows}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-neutral-200">{t.nav.aiKnowsHint}</p>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-5 md:flex">
      <Brand />

      <DashboardNav />

      <AiKnowsCard />
    </aside>
  );
}
