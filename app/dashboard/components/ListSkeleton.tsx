import { Skeleton } from "./Skeleton";

// Streaming fallback for a list section (organizations, assistants, …). Mirrors
// the real list card so the layout does not shift when rows stream in. Rendered
// inside a <Suspense> boundary while the server component fetches its rows.
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>

      <div className="shape-card glass divide-y divide-neutral-200/60 overflow-hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 sm:px-5">
            <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="hidden h-3 w-28 sm:block" />
            <Skeleton className="h-4 w-4 shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
