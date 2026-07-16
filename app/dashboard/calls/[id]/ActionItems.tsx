import type { CallActionItem } from "@/lib/dashboard/calls";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { getDictionary } from "@/lib/i18n/server";

const TYPE_LABEL: Record<string, string> = {
  booking: "Appointment booked",
  message: "Message taken",
  transfer: "Call transferred",
};

const STATUS_TONE: Record<string, string> = {
  done: "bg-emerald-50 text-emerald-700",
  pending: "bg-neutral-100 text-neutral-700",
  failed: "bg-rose-50 text-rose-700",
};

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

// Render the timestamp on the wall clock its offset encodes (the business's
// local time), not the server's timezone.
function wallClock(iso: string): Date | null {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  const m = iso.match(/([+-])(\d{2}):?(\d{2})$/);
  const offsetMin = m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
  return new Date(ms + offsetMin * 60_000);
}

function fmtWhen(startIso: string, endIso: string): string {
  const start = wallClock(startIso);
  if (!start) return "";
  const day = start.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = (d: Date) =>
    d.toLocaleTimeString("en-US", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false });
  const end = wallClock(endIso);
  return `${day} · ${time(start)}${end ? ` – ${time(end)}` : ""}`;
}

function summarize(payload: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(payload)) {
    if (v == null || typeof v === "object") continue;
    parts.push(`${k}: ${String(v)}`);
    if (parts.length >= 3) break;
  }
  return parts.join(" · ");
}

function BookingDetail({ payload }: { payload: Record<string, unknown> }) {
  const title = str(payload.title);
  const when = fmtWhen(str(payload.start_time), str(payload.end_time));
  const notes = str(payload.notes);
  const who = str(payload.attendee_name);
  const phone = str(payload.attendee_phone);
  if (!title && !when && !notes) return null;
  return (
    <div className="mt-1.5 space-y-0.5">
      {title && <p className="text-sm text-neutral-800">{title}</p>}
      {when && <p className="text-xs tabular-nums text-neutral-500">{when}</p>}
      {(who || phone) && (
        <p className="text-xs text-neutral-500">
          {who}
          {who && phone ? " · " : ""}
          {phone ? formatPhone(phone) : ""}
        </p>
      )}
      {notes && <p className="text-xs text-neutral-400">{notes}</p>}
    </div>
  );
}

function MessageDetail({ payload }: { payload: Record<string, unknown> }) {
  const message = str(payload.message);
  const who = str(payload.caller_name);
  const callback = str(payload.callback_number);
  const urgent = str(payload.urgency).toLowerCase() === "urgent";
  if (!message && !who && !callback) return null;
  return (
    <div className="mt-1.5 space-y-0.5">
      {message && <p className="text-sm text-neutral-800">&ldquo;{message}&rdquo;</p>}
      {(who || callback || urgent) && (
        <p className="text-xs text-neutral-500">
          {[who, callback ? formatPhone(callback) : ""].filter(Boolean).join(" · ")}
          {urgent && (
            <span className="ml-1.5 rounded-full bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-600">
              urgent
            </span>
          )}
        </p>
      )}
    </div>
  );
}

export async function ActionItems({ actions }: { actions: CallActionItem[] }) {
  const t = await getDictionary();
  if (actions.length === 0) {
    return <p className="text-sm text-neutral-500">{t.data.noActions}</p>;
  }
  return (
    <ul className="space-y-3">
      {actions.map((a) => {
        const fallback =
          a.type === "booking" || a.type === "message" ? "" : summarize(a.payload);
        return (
          <li key={a.id} className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-neutral-900">
                {TYPE_LABEL[a.type] ?? a.type}
              </span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_TONE[a.status] ?? "bg-neutral-100 text-neutral-500"}`}
              >
                {a.status}
              </span>
            </div>
            {a.type === "booking" && <BookingDetail payload={a.payload} />}
            {a.type === "message" && <MessageDetail payload={a.payload} />}
            {fallback && <p className="mt-1 text-xs text-neutral-500">{fallback}</p>}
            {a.error && <p className="mt-1 text-xs text-rose-600">{a.error}</p>}
          </li>
        );
      })}
    </ul>
  );
}
