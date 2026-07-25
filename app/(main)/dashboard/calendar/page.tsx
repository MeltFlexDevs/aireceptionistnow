import { Suspense, type ReactNode } from "react";
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
  type DayCell,
  type MonthCursor,
} from "@/lib/dashboard/calendar";
import {
  fetchCalendarConnections,
  fetchExternalEvents,
  groupEventsByDay,
  isEventPast,
  loadIntegrations,
  type ExternalEvent,
} from "@/lib/dashboard/calendar-events";
import { clockFmt, dayKeyFn, timeFmt } from "@/lib/dashboard/timezone";
import { displayTimezone } from "@/lib/dashboard/display-timezone";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { MAX_SYNC_ATTEMPTS } from "@/lib/dashboard/booking-retry";
import { CALENDAR_PROVIDERS, providerName } from "@/lib/calendar/providers";
import { ChevronLeft, ChevronRight } from "../icons";
import { PageHeader } from "../components/PageHeader";
import { StatusDot } from "../components/StatusBadge";
import { PILL_BASE, PILL_TONE } from "../components/pill";
import { Skeleton } from "../components/Skeleton";
import { CancelBooking } from "./CancelBooking";
import { RetrySyncButton } from "./RetrySyncButton";
import {
  CalendarConnections,
  type CalendarRow,
  type ConnectableProvider,
} from "./CalendarConnections";
import { TimezoneSync } from "./TimezoneSync";
import { AiAvatar } from "@/app/(main)/onboarding/AiAvatar";

export const dynamic = "force-dynamic";

const CAP = "md:h-[calc(100dvh-7rem)] md:overflow-hidden lg:h-[calc(100dvh-8rem)]";

// Dot colour per booking status in the mini grid.
const DOT: Record<BookingStatus, string> = {
  done: "bg-emerald-500",
  pending: "bg-amber-500",
  failed: "bg-rose-500",
  cancelled: "bg-neutral-300",
};
// External calendar events read back live get their own dot so they read
// distinctly from appointments the receptionist booked; past ones grey out.
const DOT_EVENT = "bg-sky-400";
const DOT_EVENT_PAST = "bg-neutral-300";

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

const DAY_MS = 86_400_000;

function callerLabel(b: Booking, unknown: string): string {
  return b.attendeeName || b.callerNumber || unknown;
}

function MonthNav({
  cursor,
  c,
  compact = false,
}: {
  cursor: MonthCursor;
  c: Dictionary["calendar"];
  compact?: boolean;
}) {
  const size = compact ? "h-7 w-7" : "h-9 w-9 md:h-8 md:w-8";
  const icon = compact ? "h-3.5 w-3.5" : "h-4 w-4";
  const link = `press flex ${size} items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900`;
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/dashboard/calendar?month=${monthParam(shiftMonth(cursor, -1))}`}
        aria-label={c.prevMonth}
        className={link}
      >
        <ChevronLeft className={icon} />
      </Link>
      <Link
        href={`/dashboard/calendar?month=${monthParam(shiftMonth(cursor, 1))}`}
        aria-label={c.nextMonth}
        className={link}
      >
        <ChevronRight className={icon} />
      </Link>
    </div>
  );
}

/**
 * The calendar-connections panel that sits under the mini month grid. A live
 * credential check per calendar (so "connected" means the token actually works,
 * not just that a row exists) plus every bookable provider not yet linked, as a
 * Connect button. Passed into CalendarBody as a slot but kept in its own
 * Suspense boundary so its provider round trips never block the grid.
 */
async function CalendarConnectionsPanel({ ownerId }: { ownerId: string | null }) {
  const integrations = await loadIntegrations(ownerId);
  const connections = await fetchCalendarConnections(integrations);

  const rows: CalendarRow[] = connections.map((cn) => ({
    id: cn.id,
    provider: cn.provider,
    name: cn.name,
    account: cn.account,
    isPrimary: cn.isPrimary,
    needsReconnect: !cn.ok,
  }));

  // Every bookable provider that has no connection yet gets a Connect button -
  // all three stay visible so the user always sees what they can link, even
  // when a provider's OAuth env is not set up (the connect route reports that).
  const connectedProviders = new Set(connections.map((cn) => cn.provider));
  const connectable: ConnectableProvider[] = CALENDAR_PROVIDERS.filter(
    (p) => p.oauth && !connectedProviders.has(p.id),
  ).map((p) => ({
    id: p.id,
    name: p.name,
    href: `/api/integrations/${p.id}/connect?next=/dashboard/calendar`,
  }));

  return <CalendarConnections rows={rows} connectable={connectable} />;
}

function CalendarBodySkeleton() {
  return (
    <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-3">
      <Skeleton className="h-72 md:col-span-1" />
      <Skeleton className="min-h-0 md:col-span-2" />
    </div>
  );
}

/**
 * The month grid + day agenda. Its data is a merge of two sources:
 *  - bookings the receptionist made (fast DB read), and
 *  - real events read live from the connected calendars (bounded network
 *    fan-out), so the dashboard shows what is actually on the calendar.
 * Kept behind Suspense so the slow live read never blocks the page shell.
 */
async function CalendarBody({
  ownerId,
  tz,
  locale,
  c,
  cursor,
  weeks,
  todayKey,
  nowMs,
  requestedDay,
  view,
  monthQ,
  connectionsSlot,
}: {
  ownerId: string | null;
  tz: string;
  locale: string;
  c: Dictionary["calendar"];
  cursor: MonthCursor;
  weeks: DayCell[][];
  todayKey: string;
  nowMs: number;
  requestedDay: string;
  view: string | undefined;
  monthQ: string;
  connectionsSlot: ReactNode;
}) {
  const toKey = dayKeyFn(tz);
  const atTime = clockFmt(tz);
  const atFull = timeFmt(tz);

  // A calendar event already over renders muted/grey, like an inactive row.
  // `nowMs` is captured once in the parent so this stays a pure render.
  const isPastEvent = (e: ExternalEvent): boolean => isEventPast(e, nowMs);

  // Window covering the whole visible grid, padded a day each side so an event
  // near a grid edge in the owner's timezone still lands on the right cell.
  const cells = weeks.flat();
  const firstKey = cells[0]?.key ?? todayKey;
  const lastKey = cells[cells.length - 1]?.key ?? todayKey;
  const timeMin = new Date(Date.parse(`${firstKey}T00:00:00Z`) - DAY_MS).toISOString();
  const timeMax = new Date(Date.parse(`${lastKey}T00:00:00Z`) + 2 * DAY_MS).toISOString();

  // Integrations, bookings and events all overlap: events await integrations,
  // which is request-memoized and runs alongside the bookings read.
  const integrationsP = loadIntegrations(ownerId);
  const [bookingsRes, events] = await Promise.all([
    listBookings(ownerId).then(
      (list) => ({ list, error: "" }),
      () => ({ list: [] as Booking[], error: "load" }),
    ),
    integrationsP.then((ints) => fetchExternalEvents(ints, timeMin, timeMax)),
  ]);
  const integrations = await integrationsP;

  const bookings = bookingsRes.list;
  const byDayBookings = groupByDay(bookings, toKey);
  const byDayEvents = groupEventsByDay(events, toKey);
  const undated = undatedBookings(bookings);
  const failed = bookings.filter((b) => b.status === "failed" && !b.cancellation);
  // Only enabled calendars count as "connected to book into" - matches what
  // fetchExternalEvents reads and what the booking path writes to.
  const connectedCount = integrations.filter((i) => i.type === "calendar" && i.enabled).length;

  const dayCount = (k: string) =>
    (byDayBookings.get(k)?.length ?? 0) + (byDayEvents.get(k)?.length ?? 0);

  // Selected day: the requested one, else today when viewing the current month,
  // else the month's first day that has anything on it.
  const monthKeys = cells.filter((d) => d.inMonth).map((d) => d.key);
  const firstWithItems = monthKeys.find((k) => dayCount(k) > 0) ?? "";
  const requested = requestedDay && monthKeys.includes(requestedDay) ? requestedDay : "";
  const activeDay = requested || (monthKeys.includes(todayKey) ? todayKey : firstWithItems);
  // A chip view takes over the agenda until a day is picked again.
  const activeView = !requested && (view === "requests" || view === "attention") ? view : "";

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
  const dayLabelFmt = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: tz,
  });
  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    weekdayFmt.format(new Date(Date.UTC(2024, 0, 1 + i))),
  );

  // Whole-page empty state: nothing booked, nothing on the calendar, and no
  // calendar connected to book into.
  const hasNothing = bookings.length === 0 && events.length === 0 && connectedCount === 0;

  // A day's agenda merges bookings and events, ordered by time; all-day events
  // sort to the top.
  type DayItem =
    | { kind: "booking"; b: Booking; sort: number }
    | { kind: "event"; e: ExternalEvent; sort: number };
  const dayItemsFor = (key: string): DayItem[] => {
    const items: DayItem[] = [
      ...(byDayBookings.get(key) ?? []).map(
        (b): DayItem => ({ kind: "booking", b, sort: Date.parse(b.startTime) || 0 }),
      ),
      ...(byDayEvents.get(key) ?? []).map(
        (e): DayItem => ({
          kind: "event",
          e,
          sort: e.allDay ? Number.NEGATIVE_INFINITY : Date.parse(e.start) || 0,
        }),
      ),
    ];
    return items.sort((a, b) => a.sort - b.sort);
  };

  const dotsFor = (key: string): string[] => {
    const dots = [
      ...(byDayBookings.get(key) ?? []).map((b) => DOT[b.status]),
      ...(byDayEvents.get(key) ?? []).map((e) => (isPastEvent(e) ? DOT_EVENT_PAST : DOT_EVENT)),
    ];
    return dots.slice(0, 3);
  };

  function BookingRow({ b }: { b: Booking }) {
    const cancelled = b.status === "cancelled" || !!b.cancellation;
    return (
      <li className={`flex flex-wrap items-start gap-x-3 gap-y-2 py-3.5 ${cancelled ? "opacity-75" : ""}`}>
        <div className="w-12 shrink-0 pt-px text-right">
          <p className="text-sm font-medium leading-5 tabular-nums text-neutral-900">
            {atTime(b.startTime)}
          </p>
          {b.endTime && (
            <p className="text-[11px] leading-4 tabular-nums text-neutral-400">{atTime(b.endTime)}</p>
          )}
        </div>

        <div className="min-w-0 flex-1 basis-56">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={`text-sm font-medium text-neutral-900 ${cancelled ? "line-through decoration-neutral-300" : ""}`}
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
            <span className="text-neutral-400">{c.bookedBy}</span> {b.assistant ?? c.unknownAssistant}
            {b.provider && (
              <>
                <span className="mx-1.5 text-neutral-300">·</span>
                {providerName(b.provider)}
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
              {/* The provider's raw message is deliberately not shown. */}
              <span className="min-w-0 flex-1 basis-48 font-medium leading-relaxed text-rose-700">
                {c.syncFailed}
              </span>
              {b.status === "failed" && (
                <span className="flex shrink-0 items-center gap-2">
                  {b.syncAttempts < MAX_SYNC_ATTEMPTS && (
                    <span className="text-rose-400">{c.retryAuto}</span>
                  )}
                  <RetrySyncButton actionId={b.id} />
                </span>
              )}
            </div>
          )}

          {b.cancellation && (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-neutral-50 px-2.5 py-1.5 text-xs ring-1 ring-inset ring-neutral-200">
              <span className="min-w-0 flex-1 basis-40 leading-relaxed text-neutral-600">
                <span className="font-medium">{c.statusCancelled}</span>
                {b.cancellation.reason && (
                  <span className="text-neutral-500"> - &quot;{b.cancellation.reason}&quot;</span>
                )}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-neutral-500">
                <StatusDot tone={NOTIFY_TONE[b.cancellation.notifyStatus] ?? "warn"} />
                {notifyLabel[b.cancellation.notifyStatus] ?? c.notifyPending}
              </span>
            </div>
          )}
        </div>

        <div className="ml-auto flex shrink-0 basis-full flex-wrap items-center justify-end gap-2 sm:basis-auto sm:flex-nowrap">
          <Link
            href={`/dashboard/calls/${b.callId}`}
            className="press shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            {c.viewCall}
          </Link>
          {b.status === "done" && !b.cancellation && <CancelBooking actionId={b.id} />}
        </div>
      </li>
    );
  }

  function EventRow({ e }: { e: ExternalEvent }) {
    const past = isPastEvent(e);
    const pillTone = past
      ? "bg-neutral-100 text-neutral-500 ring-neutral-200"
      : "bg-sky-50 text-sky-700 ring-sky-100";
    return (
      <li className={`flex flex-wrap items-start gap-x-3 gap-y-2 py-3.5 ${past ? "opacity-70" : ""}`}>
        <div className="w-12 shrink-0 pt-px text-right">
          {e.allDay ? (
            <p className="text-[11px] font-medium uppercase leading-5 tracking-wide text-neutral-400">
              {c.allDay}
            </p>
          ) : (
            <>
              <p
                className={`text-sm font-medium leading-5 tabular-nums ${past ? "text-neutral-400" : "text-neutral-900"}`}
              >
                {atTime(e.start)}
              </p>
              {e.end && (
                <p className="text-[11px] leading-4 tabular-nums text-neutral-400">{atTime(e.end)}</p>
              )}
            </>
          )}
        </div>

        <div className="min-w-0 flex-1 basis-56">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={`text-sm font-medium ${past ? "text-neutral-400" : "text-neutral-900"}`}
            >
              {e.title || c.untitledEvent}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${pillTone}`}
            >
              {c.fromCalendar.replace("{name}", e.providerLabel)}
            </span>
          </div>
          {e.location && (
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">{e.location}</p>
          )}
        </div>

        {e.url && (
          <div className="ml-auto flex shrink-0 items-center justify-end">
            <a
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="press shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              {c.openEvent}
            </a>
          </div>
        )}
      </li>
    );
  }

  const dayItems = activeView ? [] : dayItemsFor(activeDay);

  return (
    <>
      {/* Attention chips - the row collapses entirely when both are zero */}
      {(undated.length > 0 || failed.length > 0) && (
        <div className="flex shrink-0 flex-wrap gap-2">
          {undated.length > 0 && (
            <Link
              href={`/dashboard/calendar?${monthQ}view=requests`}
              className={`${PILL_BASE} border-amber-200 bg-amber-50 text-amber-800 press`}
            >
              {undated.length === 1
                ? c.chipRequestsOne
                : c.chipRequests.replace("{n}", String(undated.length))}
            </Link>
          )}
          {failed.length > 0 && (
            <Link
              href={`/dashboard/calendar?${monthQ}view=attention`}
              className={`${PILL_BASE} border-rose-200 bg-rose-50 text-rose-700 press`}
            >
              {c.chipFailed}
            </Link>
          )}
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-3">
        {/* Left column: the mini month grid, with the calendar-connections
            panel filling the free space beneath it. */}
        <div className="flex min-h-0 flex-col gap-3 md:col-span-1">
          {/* Dots-only mini grid - fixed height, never scrolls, no chips to clip */}
          <section className="shape-card glass shrink-0 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-neutral-900">{monthTitle}</p>
              <div className="flex items-center gap-1.5">
                <Link
                  href="/dashboard/calendar"
                  className="press flex h-7 items-center rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                >
                  {c.today}
                </Link>
                <MonthNav cursor={cursor} c={c} compact />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekdays.map((w) => (
                <div
                  key={w}
                  className="pb-1 text-center text-[10px] font-medium uppercase tracking-wide text-neutral-400"
                >
                  {w}
                </div>
              ))}
              {cells.map((cell) => {
                const dots = dotsFor(cell.key);
                const isActive = cell.key === activeDay && !activeView;
                return (
                  <Link
                    key={cell.key}
                    href={`/dashboard/calendar?${monthQ}day=${cell.key}`}
                    aria-current={isActive ? "date" : undefined}
                    className={`flex h-9 flex-col items-center justify-center rounded-lg text-[11px] transition-colors ${
                      cell.isToday
                        ? "bg-neutral-900 text-white"
                        : isActive
                          ? "ring-2 ring-inset ring-neutral-900 text-neutral-900"
                          : cell.inMonth
                            ? "text-neutral-600 hover:bg-neutral-100"
                            : "text-neutral-300"
                    }`}
                  >
                    <span className="font-medium tabular-nums leading-none">{cell.day}</span>
                    <span className="mt-0.5 flex h-1.5 items-center gap-0.5">
                      {dots.map((dot, i) => (
                        <span key={i} className={`h-1 w-1 rounded-full ${dot}`} />
                      ))}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Connect / Manage / set-primary per provider - fills the free
              space under the mini grid. */}
          {connectionsSlot}
        </div>

        {/* The page's only scroll region */}
        <section className="shape-card glass flex min-h-0 min-w-0 flex-col md:col-span-2">
            <div className="shrink-0 border-b border-neutral-200/70 px-5 py-3">
              <h2 className="text-sm font-medium text-neutral-900">
                {activeView === "requests"
                  ? c.requestsTitle
                  : activeView === "attention"
                    ? c.chipFailed
                    : activeDay
                      ? dayLabelFmt.format(new Date(`${activeDay}T12:00:00Z`))
                      : c.pickADay}
              </h2>
              {activeView === "requests" && (
                <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{c.requestsSub}</p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
              {hasNothing ? (
                <div className="flex min-h-[12rem] flex-col items-center justify-center py-8 text-center">
                  <AiAvatar mood="greeting" className="h-16 w-16" />
                  <h3 className="mt-4 text-base font-semibold text-neutral-900">{c.emptyTitle}</h3>
                  <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-neutral-500">
                    {c.emptyBody}
                  </p>
                </div>
              ) : activeView === "requests" ? (
                <ul className="divide-y divide-neutral-100">
                  {undated.map((b) => (
                    <li
                      key={b.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900">
                          {b.title || callerLabel(b, c.unknownCaller)}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {c.caller}:{" "}
                          <span className="tabular-nums">{callerLabel(b, c.unknownCaller)}</span>
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
              ) : activeView === "attention" ? (
                <ul className="divide-y divide-neutral-100">
                  {failed.map((b) => (
                    <BookingRow key={b.id} b={b} />
                  ))}
                </ul>
              ) : dayItems.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-500">{c.nothingThisDay}</p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {dayItems.map((item) =>
                    item.kind === "booking" ? (
                      <BookingRow key={`b:${item.b.id}`} b={item.b} />
                    ) : (
                      <EventRow key={`e:${item.e.id}`} e={item.e} />
                    ),
                  )}
                </ul>
              )}
            </div>
        </section>
      </div>
    </>
  );
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    day?: string;
    view?: string;
    connected?: string;
    error?: string;
  }>;
}) {
  const [{ month, day, view, connected, error }, t, locale, owner] = await Promise.all([
    searchParams,
    getDictionary(),
    getLocale(),
    currentUserId(),
  ]);
  const c = t.calendar;

  const ownerId = owner ?? null;
  const tz = await displayTimezone(ownerId);
  const nowDate = new Date();
  const nowMs = nowDate.getTime();
  const todayKey = dayKeyFn(tz)(nowDate);

  const cursor = parseMonth(month, todayKey);
  const weeks = buildMonthGrid(cursor, todayKey);
  const monthQ = month ? `month=${monthParam(cursor)}&` : "";

  return (
    <div className={`rise flex flex-col gap-3 ${CAP}`}>
      <TimezoneSync />
      {/* A: header */}
      <div className="shrink-0">
        <PageHeader title={c.title} />
      </div>

      {connected && (
        <span className={`${PILL_BASE} ${PILL_TONE.success} shrink-0 self-start`}>
          {c.calendarConnected}
        </span>
      )}
      {error && (
        <span className={`${PILL_BASE} ${PILL_TONE.error} shrink-0 self-start`}>{error}</span>
      )}

      {/* B: chips + (month grid + calendar connections) + day agenda.
          The connections panel is its own Suspense-streamed slot so its live
          credential checks never block the grid. */}
      <Suspense fallback={<CalendarBodySkeleton />}>
        <CalendarBody
          ownerId={ownerId}
          tz={tz}
          locale={locale}
          c={c}
          cursor={cursor}
          weeks={weeks}
          todayKey={todayKey}
          nowMs={nowMs}
          requestedDay={day ?? ""}
          view={view}
          monthQ={monthQ}
          connectionsSlot={
            <Suspense fallback={<Skeleton className="min-h-[8rem] shrink-0 md:min-h-0 md:flex-1" />}>
              <CalendarConnectionsPanel ownerId={ownerId} />
            </Suspense>
          }
        />
      </Suspense>
    </div>
  );
}
