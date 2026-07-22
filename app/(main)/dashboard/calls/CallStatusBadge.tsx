import type { StatusBucket } from "@/lib/dashboard/calls/format";
import { Check } from "../icons";

// Flat, Stripe-style status badge: a light tint, coloured text, a small leading
// glyph, and no border. Shared by the call list and the detail header so a
// call's status looks identical wherever it appears.
const TONE: Record<StatusBucket, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  unanswered: "bg-rose-50 text-rose-600",
  active: "bg-amber-50 text-amber-700",
};

export function CallStatusBadge({
  bucket,
  label,
}: {
  bucket: StatusBucket;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${TONE[bucket]}`}
    >
      {bucket === "completed" ? (
        <Check className="h-3 w-3" />
      ) : (
        <span
          className={`h-1.5 w-1.5 rounded-full bg-current ${bucket === "active" ? "animate-pulse" : ""}`}
        />
      )}
      {label}
    </span>
  );
}
