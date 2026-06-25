// Shimmer placeholder block. Compose these in route-level loading.tsx files to
// mirror a page's layout while its server data loads.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200/70 ${className}`} />;
}
