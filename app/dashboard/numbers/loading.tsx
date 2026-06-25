import { Skeleton } from "../components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 sm:w-44" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
