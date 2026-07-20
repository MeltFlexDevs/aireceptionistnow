import type { ReactNode } from "react";

interface Props {
  title?: string;
  subtitle?: string;
  /** Small leading glyph rendered in a soft tile before the title. */
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({ title, subtitle, icon, action, children, className = "", bodyClassName = "" }: Props) {
  const hasHeader = Boolean(title || action);
  return (
    <section className={`shape-card glass ${className}`}>
      {hasHeader && (
        <header className="flex shrink-0 items-start justify-between gap-4 px-5 pt-5">
          <div className={icon ? "flex items-start gap-2.5" : undefined}>
            {icon && (
              <span className="mt-px flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                {icon}
              </span>
            )}
            <div>
              {title && <h2 className="text-sm font-medium text-neutral-900">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className={`px-5 pb-5 pt-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
