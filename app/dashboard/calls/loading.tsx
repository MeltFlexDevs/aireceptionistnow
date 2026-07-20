import { Skeleton } from "../components/Skeleton";

// Mirrors the split layout's root and zone classes so hydration does not jump.
// Inner regions use overflow-hidden, never overflow-y-auto: a skeleton must not
// present a scrollbar.
export default function Loading() {
  return (
    <div className="flex flex-col gap-3 md:h-[calc(100dvh-7rem)] md:overflow-hidden lg:h-[calc(100dvh-8rem)]">
      <div className="shrink-0 space-y-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[minmax(300px,2fr)_3fr]">
        <div className="shape-card glass min-h-0 space-y-2 overflow-hidden p-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
        <div className="shape-card glass hidden min-h-0 space-y-4 overflow-hidden p-5 md:block">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
