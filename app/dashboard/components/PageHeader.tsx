import type { ReactNode } from "react";
import { BackLink } from "./BackLink";

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  back?: { href: string; label: string };
}

export function PageHeader({ title, description, action, back }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && <BackLink href={back.href} label={back.label} className="mb-1.5" />}
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-neutral-500">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </header>
  );
}
