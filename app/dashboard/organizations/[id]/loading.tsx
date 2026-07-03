import { Skeleton } from "../../components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-72" />
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-24 w-full" />
          <div className="flex justify-end">
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
