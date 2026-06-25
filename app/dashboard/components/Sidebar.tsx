"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, Grid, Phone, Bot, Plug, ChartBar, Gear, Sparkle } from "../icons";

interface NavItem {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
}

const main: NavItem[] = [
  { href: "/dashboard", label: "Overview", Icon: Grid },
  { href: "/dashboard/calls", label: "Calls", Icon: Phone },
  { href: "/dashboard/assistant", label: "AI assistant", Icon: Bot },
  { href: "/dashboard/integrations", label: "Integrations", Icon: Plug },
  { href: "/dashboard/analytics", label: "Analytics", Icon: ChartBar },
];

const footer: NavItem[] = [{ href: "/dashboard/settings", label: "Settings", Icon: Gear }];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
    >
      <item.Icon className="h-[18px] w-[18px]" />
      {item.label}
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
        <span className="text-[15px] font-medium tracking-tight">AI Receptionist</span>
      </Link>

      <nav className="mt-7 flex flex-1 flex-col">
        <span className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-400">Menu</span>
        <ul className="space-y-1">
          {main.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isActive(pathname, item.href)} />
            </li>
          ))}
        </ul>

        <ul className="mt-auto space-y-1">
          {footer.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isActive(pathname, item.href)} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4 rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 p-4 text-white">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkle className="h-4 w-4" />
          Pro plan
        </div>
        <p className="mt-1 text-xs text-violet-100">1,284 of 2,000 calls used this month.</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white" style={{ width: "64%" }} />
        </div>
      </div>
    </aside>
  );
}
