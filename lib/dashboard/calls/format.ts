export function fmtDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

export function fmtDateTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function statusLabel(raw: string): string {
  if (!raw) return "—";
  return raw.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function normalizeDirection(dir: string | null | undefined): string {
  return (dir ?? "").startsWith("outbound") ? "outbound" : "inbound";
}

export type StatusBucket = "completed" | "unanswered" | "active";

export function statusBucket(raw: string): StatusBucket {
  const s = raw.toLowerCase();
  if (["busy", "no-answer", "failed", "canceled", "cancelled", "abandoned"].includes(s)) {
    return "unanswered";
  }
  if (["completed", "resolved", "booked", "answered"].includes(s)) return "completed";
  return "active";
}

const LIVE = ["in-progress", "in_progress", "ringing", "queued", "initiated"];
export function isLiveStatus(raw: string): boolean {
  return LIVE.includes(raw.toLowerCase());
}
