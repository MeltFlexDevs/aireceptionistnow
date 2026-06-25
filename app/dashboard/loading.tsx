import { Skeleton } from "./components/Skeleton";

// Fallback skeleton for the dashboard overview and any segment without its own.
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-7 w-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-44 w-full" />
        </div>
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
