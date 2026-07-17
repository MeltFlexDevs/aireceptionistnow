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
import { MAX_SYNC_ATTEMPTS } from "@/lib/dashboard/booking-retry";
import { Calendar, ChevronLeft, ChevronRight } from "../icons";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatusDot } from "../components/StatusBadge";
import { retryBookingSyncAction } from "./actions";
import { CancelBooking } from "./CancelBooking";
import { RetrySyncButton } from "./RetrySyncButton";

export const dynamic = "force-dynamic";

const TONE: Record<BookingStatus, { dot: "ok" | "warn" | "error"; chip: string }> = {
  done: { dot: "ok", chip: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  pending: { dot: "warn", chip: "bg-amber-50 text-amber-700 ring-amber-100" },
  failed: { dot: "error", chip: "bg-rose-50 text-rose-700 ring-rose-100" },
  cancelled: { dot: "error", chip: "bg-neutral-100 text-neutral-500 ring-neutral-200 line-through" },
};

// Status chip on the detail rows: spelled out (a bare dot made cancelled and
// confirmed rows nearly identical at a glance).
const STATUS_CHIP: Record<BookingStatus, string> = {
  done: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  failed: "bg-rose-50 text-rose-700 ring-rose-100",
  cancelled: "bg-neutral-100 text-neutral-500 ring-neutral-200",
};

const NOTIFY_TONE: Record<string, "ok" | "warn" | "error"> = {
  pending: "warn",
  calling: "warn",
  answered: "ok",
  sms_sent: "ok",
  failed: "error",
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
  // The month's bookings as a day-grouped agenda - the detail list under the grid.
  const dayGroups = [...monthKeys]
    .sort()
    .flatMap((k) => {
      const items = byDay.get(k) ?? [];
      return items.length > 0 ? [{ key: k, items }] : [];
    });
  const inMonthCount = dayGroups.reduce((n, g) => n + g.items.length, 0);
  const undated = undatedBookings(bookings);

  const dayLabelFmt = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: tz,
  });
  const statusLabel: Record<BookingStatus, string> = {
    done: c.statusDone,
    pending: c.statusPending,
    failed: c.statusFailed,
    cancelled: c.statusCancelled,
  };
  const notifyLabel: Record<string, string> = {
    pending: c.notifyPending,
    calling: c.notifyCalling,
    answered: c.notifyAnswered,
    sms_sent: c.notifySmsSent,
    failed: c.notifyFailed,
  };

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
            {inMonthCount === 1 ? c.oneBooking : c.nBookings.replace("{n}", String(inMonthCount))}
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
        {inMonthCount === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Calendar className="h-6 w-6 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-900">{c.empty}</p>
            <p className="max-w-sm text-sm text-neutral-500">{c.emptyHint}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {dayGroups.map(({ key, items }) => (
              <section key={key}>
                {/* Day rail: the agenda's spine - one label per day, today inverted. */}
                <div className="mb-1 flex items-center gap-3">
                  <h3
                    className={`shrink-0 text-[11px] font-semibold uppercase tracking-wider ${
                      key === todayKey
                        ? "rounded-full bg-neutral-900 px-2 py-0.5 text-white"
                        : "text-neutral-400"
                    }`}
                  >
                    {dayLabelFmt.format(new Date(items[0].startTime))}
                    {key === todayKey ? ` · ${c.today}` : ""}
                  </h3>
                  <span className="h-px flex-1 bg-neutral-100" aria-hidden />
                </div>

                <ul className="divide-y divide-neutral-100">
                  {items.map((b) => {
                    const cancelled = b.status === "cancelled" || !!b.cancellation;
                    return (
                      <li
                        key={b.id}
                        className={`flex flex-wrap items-start gap-x-3 gap-y-2 py-3.5 ${
                          cancelled ? "opacity-75" : ""
                        }`}
                      >
                        {/* Time spine: start over end, fixed column, scannable. */}
                        <div className="w-12 shrink-0 pt-px text-right">
                          <p className="text-sm font-medium tabular-nums leading-5 text-neutral-900">
                            {atTime(b.startTime)}
                          </p>
                          {b.endTime && (
                            <p className="text-[11px] tabular-nums leading-4 text-neutral-400">
                              {atTime(b.endTime)}
                            </p>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 basis-56">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span
                              className={`text-sm font-medium text-neutral-900 ${
                                cancelled ? "line-through decoration-neutral-300" : ""
                              }`}
                            >
                              {b.title || callerLabel(b, c.unknownCaller)}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_CHIP[b.status]}`}
                            >
                              {statusLabel[b.status]}
                            </span>
                          </div>

                          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                            <span className="tabular-nums">{callerLabel(b, c.unknownCaller)}</span>
                            <span className="mx-1.5 text-neutral-300">·</span>
                            <span className="text-neutral-400">{c.bookedBy}</span>{" "}
                            {b.assistant ?? c.unknownAssistant}
                            {b.provider && (
                              <>
                                <span className="mx-1.5 text-neutral-300">·</span>
                                {PROVIDER_NAMES[b.provider] ?? b.provider}
                              </>
                            )}
                            <span className="mx-1.5 text-neutral-300">·</span>
                            <span className="text-neutral-400">{c.addedOn}</span>{" "}
                            <span className="tabular-nums">{atFull(b.bookedAt)}</span>
                          </p>

                          {b.notes && (
                            <p className="mt-2 border-l-2 border-neutral-200 pl-2.5 text-xs leading-relaxed text-neutral-600">
                              {b.notes}
                            </p>
                          )}

                          {b.error && !b.cancellation && (
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs ring-1 ring-inset ring-rose-100">
                              <span className="min-w-0 flex-1 basis-48 leading-relaxed">
                                <span className="font-medium text-rose-700">{c.syncFailed}</span>{" "}
                                <span className="text-rose-600/80">{b.error}</span>
                              </span>
                              {b.status === "failed" && (
                                <span className="flex shrink-0 items-center gap-2">
                                  {b.syncAttempts < MAX_SYNC_ATTEMPTS && (
                                    <span className="text-rose-400">{c.retryAuto}</span>
                                  )}
                                  <form action={retryBookingSyncAction}>
                                    <input type="hidden" name="action_id" value={b.id} />
                                    <RetrySyncButton label={c.retrySync} pendingLabel={c.retrying} />
                                  </form>
                                </span>
                              )}
                            </div>
                          )}

                          {b.cancellation && (
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-neutral-50 px-2.5 py-1.5 text-xs ring-1 ring-inset ring-neutral-200">
                              <span className="min-w-0 flex-1 basis-40 leading-relaxed text-neutral-600">
                                <span className="font-medium">{c.statusCancelled}</span>
                                {b.cancellation.reason && (
                                  <span className="text-neutral-500"> — “{b.cancellation.reason}”</span>
                                )}
                              </span>
                              <span className="inline-flex shrink-0 items-center gap-1.5 text-neutral-500">
                                <StatusDot tone={NOTIFY_TONE[b.cancellation.notifyStatus] ?? "warn"} />
                                {notifyLabel[b.cancellation.notifyStatus] ?? b.cancellation.notifyStatus}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="ml-auto flex shrink-0 items-center gap-2">
                          <Link
                            href={`/dashboard/calls/${b.callId}`}
                            className="press shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                          >
                            {c.viewCall}
                          </Link>
                          {b.status === "done" && !b.cancellation && (
                            <CancelBooking actionId={b.id} />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
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
