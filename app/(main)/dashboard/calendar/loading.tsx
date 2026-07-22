import { Skeleton } from "../components/Skeleton";

// Mirrors the A-E zones so hydration does not jump: header, slim panel bar,
// compact dots grid, agenda rows.
export default function Loading() {
  return (
    <div className="flex flex-col gap-3 md:h-[calc(100dvh-7rem)] md:overflow-hidden lg:h-[calc(100dvh-8rem)]">
      <div className="shrink-0 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-full max-w-80" />
      </div>

      <Skeleton className="h-12 w-full shrink-0" />

      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-3">
        <div className="shape-card glass shrink-0 space-y-3 p-4 md:col-span-1">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }).map((_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        </div>

        <div className="shape-card glass min-h-0 space-y-4 overflow-hidden p-5 md:col-span-2">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full max-w-96" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
