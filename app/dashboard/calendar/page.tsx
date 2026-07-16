import Link from "next/link";
import { currentUserId } from "@/lib/auth";
import {
  buildMonthGrid,
  groupByDay,
  listBookings,
  monthParam,
  parseMonth,
  shiftMonth,
  undatedBookings,
  type Booking,
  type BookingStatus,
  type MonthCursor,
} from "@/lib/dashboard/calendar";
import { clockFmt, dayKeyFn, ownerTimezone, timeFmt } from "@/lib/dashboard/timezone";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { Calendar, ChevronLeft, ChevronRight } from "../icons";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatusDot } from "../components/StatusBadge";
import { CancelBooking } from "./CancelBooking";

export const dynamic = "force-dynamic";

const TONE: Record<BookingStatus, { dot: "ok" | "warn" | "error"; chip: string }> = {
  done: { dot: "ok", chip: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  pending: { dot: "warn", chip: "bg-amber-50 text-amber-700 ring-amber-100" },
  failed: { dot: "error", chip: "bg-rose-50 text-rose-700 ring-rose-100" },
  cancelled: { dot: "error", chip: "bg-neutral-100 text-neutral-500 ring-neutral-200 line-through" },
};

const PROVIDER_NAMES: Record<string, string> = {
  google: "Google Calendar",
  outlook: "Outlook",
  calendly: "Calendly",
  calcom: "Cal.com",
  webhook: "Webhook",
};

function callerLabel(b: Booking, unknown: string): string {
  return b.attendeeName || b.callerNumber || unknown;
}

function MonthNav({ cursor, label }: { cursor: MonthCursor; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/dashboard/calendar?month=${monthParam(shiftMonth(cursor, -1))}`}
        aria-label={`${label} -1`}
        className="press flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <Link
        href={`/dashboard/calendar?month=${monthParam(shiftMonth(cursor, 1))}`}
        aria-label={`${label} +1`}
        className="press flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; saved?: string; error?: string }>;
}) {
  const [{ month, saved, error }, t, locale] = await Promise.all([
    searchParams,
    getDictionary(),
    getLocale(),
  ]);
  const c = t.calendar;

  const ownerId = (await currentUserId()) ?? null;
  // Timezone + bookings are independent lookups - fetch together.
  const [tz, bookingsRes] = await Promise.all([
    ownerTimezone(ownerId),
    listBookings(ownerId).then(
      (list) => ({ list, error: "" }),
      (err: Error) => ({ list: [] as Booking[], error: err.message }),
    ),
  ]);
  const bookings = bookingsRes.list;
  const loadError = bookingsRes.error;
  const toKey = dayKeyFn(tz);
  const atTime = clockFmt(tz);
  const atFull = timeFmt(tz);
  const todayKey = toKey(new Date());

  const cursor = parseMonth(month, todayKey);
  const weeks = buildMonthGrid(cursor, todayKey);
  const byDay = groupByDay(bookings, toKey);
  const monthKeys = new Set(weeks.flat().filter((d) => d.inMonth).map((d) => d.key));
  // The month's bookings, chronological - the detail list under the grid.
  const inMonth = [...monthKeys]
    .sort()
    .flatMap((k) => byDay.get(k) ?? []);
  const undated = undatedBookings(bookings);

  const monthTitle = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(cursor.year, cursor.month - 1, 1)));

  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    weekdayFmt.format(new Date(Date.UTC(2024, 0, 1 + i))),
  );

  return (
    <div className="space-y-6 rise">
      <PageHeader
        title={c.title}
        description={c.description}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/calendar"
              className="press inline-flex h-8 items-center rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              {c.today}
            </Link>
            <MonthNav cursor={cursor} label={c.month} />
          </div>
        }
      />

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {saved}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
      )}

      <SectionCard
        title={monthTitle}
        subtitle={`${c.timezone}: ${tz}`}
        action={
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
            {inMonth.length === 1 ? c.oneBooking : c.nBookings.replace("{n}", String(inMonth.length))}
          </span>
        }
        bodyClassName="overflow-x-auto"
      >
        <div className="min-w-[560px]">
          <div className="grid grid-cols-7 gap-px">
            {weekdays.map((w) => (
              <div key={w} className="pb-2 text-center text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-neutral-200">
            {weeks.flat().map((cell) => {
              const day = byDay.get(cell.key) ?? [];
              return (
                <div
                  key={cell.key}
                  className={`min-h-24 bg-white p-1.5 ${cell.inMonth ? "" : "bg-neutral-50/60"}`}
                >
                  <div className="mb-1 flex justify-end">
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-medium ${
                        cell.isToday
                          ? "bg-neutral-900 text-white"
                          : cell.inMonth
                            ? "text-neutral-500"
                            : "text-neutral-300"
                      }`}
                    >
                      {cell.day}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {day.slice(0, 3).map((b) => (
                      <Link
                        key={b.id}
                        href={`/dashboard/calls/${b.callId}`}
                        title={`${atTime(b.startTime)} ${b.title || callerLabel(b, c.unknownCaller)}`}
                        className={`block truncate rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset transition-opacity hover:opacity-80 ${TONE[b.status].chip}`}
                      >
                        <span className="tabular-nums">{atTime(b.startTime)}</span>{" "}
                        {b.title || callerLabel(b, c.unknownCaller)}
                      </Link>
                    ))}
                    {day.length > 3 && (
                      <p className="px-1.5 text-[11px] text-neutral-400">
                        {c.more.replace("{n}", String(day.length - 3))}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      <SectionCard title={c.detailsTitle} subtitle={c.detailsSub}>
        {inMonth.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Calendar className="h-6 w-6 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-900">{c.empty}</p>
            <p className="max-w-sm text-sm text-neutral-500">{c.emptyHint}</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {inMonth.map((b) => (
              <li key={b.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusDot tone={TONE[b.status].dot} />
                    <span className="text-sm font-medium text-neutral-900">
                      {b.title || callerLabel(b, c.unknownCaller)}
                    </span>
                    <span className="text-xs text-neutral-400 tabular-nums">
                      {atFull(b.startTime)}
                      {b.endTime ? ` - ${atTime(b.endTime)}` : ""}
                    </span>
                  </div>
                  <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-neutral-500">
                    <div className="flex gap-1">
                      <dt className="text-neutral-400">{c.caller}:</dt>
                      <dd className="tabular-nums">{callerLabel(b, c.unknownCaller)}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="text-neutral-400">{c.bookedBy}:</dt>
                      <dd>{b.assistant ?? c.unknownAssistant}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="text-neutral-400">{c.addedOn}:</dt>
                      <dd className="tabular-nums">{atFull(b.bookedAt)}</dd>
                    </div>
                    {b.provider && (
                      <div className="flex gap-1">
                        <dt className="text-neutral-400">{c.calendar}:</dt>
                        <dd>{PROVIDER_NAMES[b.provider] ?? b.provider}</dd>
                      </div>
                    )}
                  </dl>
                  {b.notes && <p className="mt-1 text-xs text-neutral-500">{b.notes}</p>}
                  {b.error && <p className="mt-1 text-xs text-rose-600">{b.error}</p>}
                  {b.cancellation?.reason && (
                    <p className="mt-1 text-xs text-neutral-400">
                      Cancelled: {b.cancellation.reason}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-start gap-2">
                  <Link
                    href={`/dashboard/calls/${b.callId}`}
                    className="press shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    {c.viewCall}
                  </Link>
                  {(b.status === "done" || b.cancellation) && (
                    <CancelBooking actionId={b.id} cancellation={b.cancellation} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {undated.length > 0 && (
        <SectionCard title={c.requestsTitle} subtitle={c.requestsSub}>
          <ul className="divide-y divide-neutral-100">
            {undated.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900">
                    {b.title || callerLabel(b, c.unknownCaller)}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {c.caller}: <span className="tabular-nums">{callerLabel(b, c.unknownCaller)}</span>
                    {" · "}
                    {c.addedOn}: <span className="tabular-nums">{atFull(b.bookedAt)}</span>
                  </p>
                </div>
                <Link
                  href={`/dashboard/calls/${b.callId}`}
                  className="press shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  {c.viewCall}
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
