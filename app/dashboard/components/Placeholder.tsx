import type { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
  bullets?: string[];
}

// Shared "section not built yet" view so sidebar links resolve to a real,
// intentional page instead of a 404 while these areas are implemented.
export function Placeholder({ title, description, icon, bullets }: Props) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">{title}</h1>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </header>

      <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">{icon}</div>
        <h2 className="mt-5 text-base font-medium text-neutral-900">Coming soon</h2>
        <p className="mt-1 max-w-md text-sm text-neutral-500">
          This area is part of the product spec and is being built out. The layout and navigation are wired up so it can be filled in next.
        </p>
        {bullets && bullets.length > 0 && (
          <ul className="mt-6 grid max-w-lg gap-2 text-left sm:grid-cols-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
