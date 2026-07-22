import { Skeleton } from "../components/Skeleton";

// Header + tab bar + one card, matching the new shape (it used to fake three
// stacked cards, which is now a visible jump on every navigation).
export default function Loading() {
  return (
    <div className="flex flex-col gap-3 md:h-[calc(100dvh-7rem)] md:overflow-hidden lg:h-[calc(100dvh-8rem)]">
      <div className="shrink-0 space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="shape-card glass flex min-h-0 flex-1 flex-col px-5 pb-5 pt-1">
        <div className="flex shrink-0 gap-4 border-b border-neutral-200 pb-2 pt-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-hidden pt-5">
          <Skeleton className="h-4 w-64" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="flex justify-end">
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
