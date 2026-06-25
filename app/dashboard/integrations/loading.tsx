import { Skeleton } from "../components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
