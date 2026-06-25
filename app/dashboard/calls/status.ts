export function statusTone(status: string): string {
  const s = status.toLowerCase();
  if (["completed", "resolved", "booked", "answered"].includes(s)) {
    return "bg-emerald-50 text-emerald-700";
  }
  if (["busy", "no-answer", "failed", "canceled", "cancelled", "abandoned"].includes(s)) {
    return "bg-rose-50 text-rose-700";
  }
  if (["in-progress", "in_progress", "ringing", "queued", "initiated"].includes(s)) {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-neutral-100 text-neutral-500";
}
