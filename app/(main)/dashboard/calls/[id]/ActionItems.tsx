import type { CallActionItem } from "@/lib/dashboard/calls";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

const STATUS_TONE: Record<string, string> = {
  done: "bg-emerald-50 text-emerald-700",
  pending: "bg-neutral-100 text-neutral-700",
  failed: "bg-rose-50 text-rose-700",
};

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

function typeLabel(type: string, d: Dictionary["calls"]["detail"]): string {
  switch (type) {
    case "booking":
      return d.actionBooking;
    case "message":
      return d.actionMessage;
    case "transfer":
      return d.actionTransfer;
    default:
      // Never fall back to the raw DB type - that is internal vocabulary.
      return d.actions;
  }
}

function statusLabel(status: string, d: Dictionary["calls"]["detail"]): string {
  switch (status) {
    case "done":
      return d.actionDone;
    case "failed":
      return d.actionFailed;
    default:
      return d.actionPending;
  }
}

// Render the timestamp on the wall clock its offset encodes (the business's
// local time), not the server's timezone.
function wallClock(iso: string): Date | null {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  const m = iso.match(/([+-])(\d{2}):?(\d{2})$/);
  const offsetMin = m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
  return new Date(ms + offsetMin * 60_000);
}

function fmtWhen(startIso: string, endIso: string, locale: string): string {
  const start = wallClock(startIso);
  if (!start) return "";
  // timeZone stays UTC: wallClock already shifted the instant so that reading
  // it in UTC yields the business's local time.
  const day = start.toLocaleDateString(locale, {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = (d: Date) =>
    d.toLocaleTimeString(locale, { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });
  const end = wallClock(endIso);
  return `${day} · ${time(start)}${end ? ` - ${time(end)}` : ""}`;
}

function BookingDetail({ payload, locale }: { payload: Record<string, unknown>; locale: string }) {
  const title = str(payload.title);
  const when = fmtWhen(str(payload.start_time), str(payload.end_time), locale);
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

function MessageDetail({
  payload,
  urgentLabel,
}: {
  payload: Record<string, unknown>;
  urgentLabel: string;
}) {
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
              {urgentLabel}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

export async function ActionItems({ actions }: { actions: CallActionItem[] }) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const d = t.calls.detail;
  if (actions.length === 0) {
    return <p className="text-sm text-neutral-500">{t.data.noActions}</p>;
  }
  return (
    <ul className="divide-y divide-neutral-100">
      {actions.map((a) => (
        <li key={a.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-neutral-900">{typeLabel(a.type, d)}</span>
            <span
              className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-medium ${STATUS_TONE[a.status] ?? "bg-neutral-100 text-neutral-500"}`}
            >
              {statusLabel(a.status, d)}
            </span>
          </div>
          {a.type === "booking" && <BookingDetail payload={a.payload} locale={locale} />}
          {a.type === "message" && <MessageDetail payload={a.payload} urgentLabel={d.urgent} />}
          {/* Deliberately no generic payload dump for other types: raw DB keys
              are not something a business owner can act on. A failure still
              shows, but as plain language rather than the upstream error. */}
          {a.error && <p className="mt-1 text-xs text-rose-600">{d.actionFailed}</p>}
        </li>
      ))}
    </ul>
  );
}
