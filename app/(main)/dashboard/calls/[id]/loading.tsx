import { Skeleton } from "../../components/Skeleton";
import { CARD as SHARED_CARD } from "../../components/card";

const CARD = `overflow-hidden ${SHARED_CARD}`;

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-20" />
      <div className={CARD}>
        <div className="border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="mt-2 h-3 w-40" />
        </div>
        <div className="space-y-6 px-6 py-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-2 border-t border-neutral-100 pt-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-3/4" />
          </div>
          <div className="space-y-3 border-t border-neutral-100 pt-6">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-3/4" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
