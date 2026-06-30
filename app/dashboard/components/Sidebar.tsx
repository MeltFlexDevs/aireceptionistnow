"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, Grid, Phone, Bot, Building, Plug, ChartBar, Gear, Sparkle } from "../icons";

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

// Grouped navigation with a short hint under each label, so a first-time user
// can tell what every screen is for without clicking around.
const groups: NavGroup[] = [
  {
    title: "Monitor",
    items: [
      { href: "/dashboard", label: "Overview", hint: "Your results at a glance", Icon: Grid },
      { href: "/dashboard/calls", label: "Calls", hint: "Every call, with transcripts", Icon: Phone },
      { href: "/dashboard/analytics", label: "Analytics", hint: "Trends by organization", Icon: ChartBar },
    ],
  },
  {
    title: "Set up",
    items: [
      { href: "/dashboard/organizations", label: "Organizations", hint: "Your company & shared knowledge", Icon: Building },
      { href: "/dashboard/assistant", label: "Assistants", hint: "The AI that answers calls", Icon: Bot },
      { href: "/dashboard/integrations", label: "Integrations", hint: "Calendars, CRM & more", Icon: Plug },
    ],
  },
];

const footer: NavItem[] = [
  { href: "/dashboard/settings", label: "Settings", hint: "Account & billing", Icon: Gear },
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
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-5 md:flex">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 text-neutral-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
          <Logo className="h-3.5 w-3.5" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">AI Receptionist</span>
      </Link>

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

      <div className="mt-4 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 text-white shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkle className="h-4 w-4" />
          Need a hand?
        </div>
        <p className="mt-1 text-xs text-neutral-200">
          Set up your organization first, then add assistants to answer calls.
        </p>
      </div>
    </aside>
  );
}
