import { Skeleton } from "../../components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <Skeleton className="h-4 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}

      <Skeleton className="h-10 w-32" />
    </div>
  );
}
