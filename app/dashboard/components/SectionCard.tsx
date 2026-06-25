import type { ReactNode } from "react";

interface Props {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({ title, subtitle, action, children, className = "", bodyClassName = "" }: Props) {
  const hasHeader = Boolean(title || action);
  return (
    <section className={`rounded-2xl border border-neutral-200 bg-white ${className}`}>
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 px-5 pt-5">
          <div>
            {title && <h2 className="text-sm font-medium text-neutral-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={`px-5 pb-5 ${hasHeader ? "pt-4" : "pt-5"} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
