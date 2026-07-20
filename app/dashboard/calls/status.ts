// Deep import, not the "@/lib/dashboard/calls" barrel: this module is used by
// the client CallTable, and the barrel re-exports getCallLog/getCallDetail,
// which would drag the Twilio SDK into the browser bundle.
import { statusBucket, type StatusBucket } from "@/lib/dashboard/calls/format";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * Everything the UI shows about a call's status goes through the bucket, never
 * the raw carrier value: "busy", "no-answer", "queued" and friends are the
 * phone network's vocabulary, not a business owner's.
 */
export function bucketOf(status: string, dateIso?: string): StatusBucket {
  return statusBucket(status, dateIso);
}

export function bucketLabel(t: Dictionary, status: string, dateIso?: string): string {
  switch (bucketOf(status, dateIso)) {
    case "completed":
      return t.calls.statusCompleted;
    case "unanswered":
      return t.calls.statusUnanswered;
    default:
      return t.calls.statusActive;
  }
}

export function statusTone(status: string, dateIso?: string): string {
  switch (bucketOf(status, dateIso)) {
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "unanswered":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}
