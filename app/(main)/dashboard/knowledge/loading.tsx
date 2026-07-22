import { Skeleton } from "../components/Skeleton";

const CAP = "md:h-[calc(100dvh-7rem)] md:overflow-hidden lg:h-[calc(100dvh-8rem)]";

// Mirrors the knowledge page's A-D zones so the swap to real content doesn't
// jump: heading, the "what it can answer" digest card, the teach bar, and the
// scrollable source list. Without this, the route fell back to the KPI-tile
// dashboard skeleton, whose shape is unrelated to this stacked layout.
export default function Loading() {
  return (
    <div className={`flex flex-col gap-3 ${CAP}`}>
      {/* A: heading */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <Skeleton className="h-7 w-40" />
      </div>

      {/* B: digest card */}
      <div className="shape-card glass shrink-0 p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
        </div>
      </div>

      {/* C: teach bar */}
      <Skeleton className="h-12 w-full shrink-0" />

      {/* D: source list (the only scroll region) */}
      <div className="shape-card glass min-h-0 flex-1 space-y-3 overflow-hidden p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
