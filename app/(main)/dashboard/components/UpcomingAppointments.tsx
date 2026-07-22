import Link from "next/link";
import { undatedBookings, type Booking } from "@/lib/dashboard/calendar";
import { clockFmt, dayKeyFn } from "@/lib/dashboard/timezone";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { StatusDot } from "./StatusBadge";

// Server-rendered once per request, so "now" is stable for the render.
function nextBookings(bookings: Booking[]): Booking[] {
  const now = Date.now();
  return bookings
    .filter(
      (b) =>
        b.status !== "cancelled" &&
        Number.isFinite(Date.parse(b.startTime)) &&
        Date.parse(b.startTime) >= now,
    )
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))
    .slice(0, 3);
}

// The receptionist's output, front and center: the next few appointments it
// booked, plus a nudge for undated requests that need a human to confirm.
// bookings + tz are fetched by the parent (in its data batch) and passed in, so
// this render adds no DB round trip of its own - only the deduped i18n reads.
export async function UpcomingAppointments({ bookings, tz }: { bookings: Booking[]; tz: string }) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const c = t.calendar;
  const upcoming = nextBookings(bookings);
  const toConfirm = undatedBookings(bookings).length;
  const clock = clockFmt(tz);
  // Deep-link straight to the day an appointment sits on, not the bare month.
  const dayKey = dayKeyFn(tz);
  const dayFmt = new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: tz });
  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: tz });

  const statusOf = (b: Booking) =>
    b.status === "done"
      ? { tone: "ok" as const, text: "text-emerald-600", label: c.statusDone }
      : b.status === "failed"
        ? { tone: "error" as const, text: "text-rose-600", label: c.statusFailed }
        : { tone: "warn" as const, text: "text-amber-600", label: c.statusPending };

  return (
    <>
      {upcoming.length === 0 ? (
        <p className="text-sm leading-relaxed text-neutral-500">{t.overview.noUpcoming}</p>
      ) : (
        <ul className="space-y-2.5">
          {upcoming.map((b) => {
            const s = statusOf(b);
            return (
              <li key={b.id}>
                <Link
                  href={`/dashboard/calendar?day=${dayKey(new Date(b.startTime))}`}
                  className="press flex items-center gap-3 rounded-xl border border-neutral-200/70 bg-white/60 p-2.5 transition-colors hover:border-neutral-300"
                >
                  <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-neutral-900 text-white">
                    <span className="text-sm font-semibold leading-none tabular-nums">
                      {dayFmt.format(new Date(b.startTime))}
                    </span>
                    <span className="mt-0.5 text-[9px] font-medium uppercase leading-none opacity-70">
                      {weekdayFmt.format(new Date(b.startTime))}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-neutral-900">
                      {b.attendeeName || b.title || c.unknownCaller}
                    </span>
                    <span className="block truncate text-xs text-neutral-500">
                      {clock(b.startTime)}
                      {b.assistant ? ` · ${b.assistant}` : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium">
                    <StatusDot tone={s.tone} />
                    <span className={s.text}>{s.label}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {toConfirm > 0 && (
        <Link
          href="/dashboard/calendar"
          className="press mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-200/70 bg-amber-50/70 px-3 py-2 text-xs font-medium text-amber-800 transition-colors hover:border-amber-300"
        >
          <span>{c.requestsTitle}</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 tabular-nums">{toConfirm}</span>
        </Link>
      )}
    </>
  );
}
