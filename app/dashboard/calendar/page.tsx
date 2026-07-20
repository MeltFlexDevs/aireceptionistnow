import { Suspense } from "react";
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
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { MAX_SYNC_ATTEMPTS } from "@/lib/dashboard/booking-retry";
import { listIntegrations, type Integration } from "@/lib/dashboard/db";
import { isOAuthConfigured } from "@/lib/dashboard/oauth";
import { CALENDAR_PROVIDERS, providerName } from "@/lib/calendar/providers";
import { resolveCalendarById } from "@/lib/call-engine/integrations/registry";
import type { IntegrationConfig } from "@/lib/call-engine/types";
import { ChevronLeft, ChevronRight } from "../icons";
import { PageHeader } from "../components/PageHeader";
import { StatusDot } from "../components/StatusBadge";
import { ProviderIcon } from "../components/ProviderIcon";
import { PILL_BASE, PILL_TONE } from "../components/pill";
import { Skeleton } from "../components/Skeleton";
import { CancelBooking } from "./CancelBooking";
import { RetrySyncButton } from "./RetrySyncButton";
import { ManageCalendars, type CalendarRow, type ConnectableProvider } from "./ManageCalendars";
import { AiAvatar } from "@/app/onboarding/AiAvatar";

export const dynamic = "force-dynamic";

const CAP = "md:h-[calc(100dvh-7rem)] md:overflow-hidden lg:h-[calc(100dvh-8rem)]";

// Dot colour per booking status in the mini grid.
const DOT: Record<BookingStatus, string> = {
  done: "bg-emerald-500",
  pending: "bg-amber-500",
  failed: "bg-rose-500",
  cancelled: "bg-neutral-300",
};

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

function callerLabel(b: Booking, unknown: string): string {
  return b.attendeeName || b.callerNumber || unknown;
}

function MonthNav({ cursor, c }: { cursor: MonthCursor; c: Dictionary["calendar"] }) {
  const link = "press flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900";
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/dashboard/calendar?month=${monthParam(shiftMonth(cursor, -1))}`}
        aria-label={c.prevMonth}
        className={link}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <Link
        href={`/dashboard/calendar?month=${monthParam(shiftMonth(cursor, 1))}`}
        aria-label={c.nextMonth}
        className={link}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/**
 * Live credential check, using the same code path calls use. Its result is
 * reduced to a yes/no: the provider's own error text is operator diagnostics,
 * not something a business owner can act on.
 */
async function calendarHealth(integrations: Integration[]): Promise<Set<string>> {
  const calendars = integrations.filter((i) => i.type === "calendar" && i.enabled);
  const results = await Promise.all(
    calendars.map(async (integration) => {
      const resolved = resolveCalendarById([integration as IntegrationConfig], integration.id);
      const probe = resolved?.provider.getBusy;
      if (!probe) return null;
      const now = Date.now();
      const res = await probe({
        timeMin: new Date(now).toISOString(),
        timeMax: new Date(now + 60 * 60 * 1000).toISOString(),
      }).catch(() => ({ ok: false as const, busy: [] }));
      return res.ok ? null : integration.id;
    }),
  );
  return new Set(results.filter((id): id is string => Boolean(id)));
}

async function ConnectedCalendarPanel({ ownerId }: { ownerId: string | null }) {
  const [t, integrations] = await Promise.all([
    getDictionary(),
    listIntegrations(ownerId ?? undefined).catch(() => [] as Integration[]),
  ]);
  const c = t.calendar;
  const calendars = integrations.filter((i) => i.type === "calendar");
  const unhealthy = await calendarHealth(integrations);

  // Explicitly chosen primary wins; otherwise the first enabled calendar.
  const primaryId =
    calendars.find((i) => i.enabled && (i.config as { primary?: boolean })?.primary)?.id ??
    calendars.find((i) => i.enabled)?.id;

  const rows: CalendarRow[] = calendars.map((i) => ({
    id: i.id,
    provider: i.provider,
    name: providerName(i.provider),
    isPrimary: i.id === primaryId,
    needsReconnect: unhealthy.has(i.id),
  }));

  const connected = new Set(calendars.map((i) => i.provider));
  // A provider whose OAuth env is not configured simply does not appear - the
  // user cannot fix an environment variable, so offering the button is noise.
  const connectable: ConnectableProvider[] = CALENDAR_PROVIDERS.filter(
    (p) => p.oauth && isOAuthConfigured(p.id) && !connected.has(p.id),
  ).map((p) => ({
    id: p.id,
    name: p.name,
    href: `/api/integrations/${p.id}/connect?next=/dashboard/calendar`,
  }));

  const primary = rows.find((r) => r.isPrimary) ?? rows[0];

  return (
    <div className="shape-card glass flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3">
      {primary ? (
        <>
          <span className="text-xs font-medium text-neutral-500">{c.connectedCalendar}:</span>
          <span className="flex items-center gap-2 text-sm font-medium text-neutral-900">
            <ProviderIcon id={primary.provider} />
            {primary.name}
          </span>
          {rows.length > 1 && (
            <span className="shape-pill border border-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
              {t.common.primary}
            </span>
          )}
          {primary.needsReconnect && (
            <span className="shape-pill border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              {c.reconnectNeeded}
            </span>
          )}
        </>
      ) : (
        <>
          <span className="text-sm font-medium text-neutral-900">{c.noCalendar}</span>
          <span className="text-xs text-neutral-500">{c.noCalendarHint}</span>
        </>
      )}
      <div className="ml-auto">
        <ManageCalendars rows={rows} connectable={connectable} />
      </div>
    </div>
  );
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; day?: string; view?: string; connected?: string }>;
}) {
  const [{ month, day, view, connected }, t, locale] = await Promise.all([
    searchParams,
    getDictionary(),
    getLocale(),
  ]);
  const c = t.calendar;

  const ownerId = (await currentUserId()) ?? null;
  const [tz, bookingsRes] = await Promise.all([
    ownerTimezone(ownerId),
    listBookings(ownerId).then(
      (list) => ({ list, error: "" }),
      () => ({ list: [] as Booking[], error: "load" }),
    ),
  ]);
  const bookings = bookingsRes.list;
  const toKey = dayKeyFn(tz);
  const atTime = clockFmt(tz);
  const atFull = timeFmt(tz);
  const todayKey = toKey(new Date());

  const cursor = parseMonth(month, todayKey);
  const weeks = buildMonthGrid(cursor, todayKey);
  const byDay = groupByDay(bookings, toKey);
  const undated = undatedBookings(bookings);
  const failed = bookings.filter((b) => b.status === "failed" && !b.cancellation);

  // Selected day: the requested one, else today when viewing the current month,
  // else the month's first day that has anything on it.
  const monthDays = weeks.flat().filter((d) => d.inMonth);
  const monthKeys = monthDays.map((d) => d.key);
  const firstWithBookings = monthKeys.find((k) => (byDay.get(k) ?? []).length > 0) ?? "";
  const requested = day && monthKeys.includes(day) ? day : "";
  const activeDay =
    requested || (monthKeys.includes(todayKey) ? todayKey : firstWithBookings);
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

  const monthQ = month ? `month=${monthParam(cursor)}&` : "";
  const dayItems = activeView ? [] : (byDay.get(activeDay) ?? []);

  // Whole-page empty state: nothing booked, ever, and no calendar to book into.
  const hasNothing = bookings.length === 0;

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

        <div className="ml-auto flex shrink-0 items-center gap-2">
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

  return (
    <div className={`rise flex flex-col gap-3 ${CAP}`}>
      {/* A: header + month nav */}
      <div className="shrink-0">
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
              <MonthNav cursor={cursor} c={c} />
            </div>
          }
        />
      </div>

      {/* B: connected calendar */}
      <Suspense fallback={<Skeleton className="h-12 w-full shrink-0" />}>
        <ConnectedCalendarPanel ownerId={ownerId} />
      </Suspense>

      {connected && (
        <span className={`${PILL_BASE} ${PILL_TONE.success} shrink-0 self-start`}>
          {c.calendarConnected}
        </span>
      )}

      {/* C: attention chips - the row collapses entirely when both are zero */}
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

      {hasNothing ? (
        <div className="shape-card glass flex min-h-0 flex-1 flex-col items-center justify-center p-10 text-center">
          <AiAvatar mood="greeting" className="h-20 w-20" />
          <h2 className="mt-4 text-base font-semibold text-neutral-900">{c.emptyTitle}</h2>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-neutral-500">{c.emptyBody}</p>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-3">
          {/* D: dots-only mini grid - fixed height, never scrolls, no chips to clip */}
          <section className="shape-card glass shrink-0 p-4 md:col-span-1">
            <p className="mb-3 text-sm font-medium text-neutral-900">{monthTitle}</p>
            <div className="grid grid-cols-7 gap-1">
              {weekdays.map((w) => (
                <div
                  key={w}
                  className="pb-1 text-center text-[10px] font-medium uppercase tracking-wide text-neutral-400"
                >
                  {w}
                </div>
              ))}
              {weeks.flat().map((cell) => {
                const items = byDay.get(cell.key) ?? [];
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
                      {items.slice(0, 3).map((b) => (
                        <span key={b.id} className={`h-1 w-1 rounded-full ${DOT[b.status]}`} />
                      ))}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* E: the page's only scroll region */}
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
              {activeView === "requests" ? (
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
                  {dayItems.map((b) => (
                    <BookingRow key={b.id} b={b} />
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
