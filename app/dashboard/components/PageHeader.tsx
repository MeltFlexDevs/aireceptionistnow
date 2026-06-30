import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "../icons";

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Optional back link, e.g. { href: "/dashboard/organizations", label: "Organizations" }. */
  back?: { href: string; label: string };
}

// One consistent page header across the dashboard: a clear title, a plain-
// language description, an optional back link, and a primary action on the
// right. Keeping every page on the same shape makes the product easy to learn.
export function PageHeader({ title, description, action, back }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-neutral-900 transition-colors hover:text-neutral-900"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
            {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-neutral-500">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </header>
  );
}
