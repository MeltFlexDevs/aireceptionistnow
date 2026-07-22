import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOverviewCached, getAnalyticsCached, type Segment } from "@/lib/dashboard/analytics";
import { currentUserId } from "@/lib/auth";
import { authConfigured, devDashboardBypass } from "@/lib/supabase/config";
import { listAssistants, getOwnedNumbers, listIntegrations, type Assistant } from "@/lib/dashboard/db";
import { listBookings, type Booking } from "@/lib/dashboard/calendar";
import { ownerTimezone } from "@/lib/dashboard/timezone";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { getOnboardingProfile } from "@/lib/dashboard/onboarding-profile";
import { getPlanContextCached } from "@/lib/dashboard/plan";
import { relTimeFrom } from "@/lib/dashboard/rel-time";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { SectionCard } from "./components/SectionCard";
import { ActivityFeed, type ActivityRow } from "./components/ActivityFeed";
import { UpcomingAppointments } from "./components/UpcomingAppointments";
import { AssistantPowerToggle } from "./components/AssistantPowerToggle";
import { BarChart } from "./components/BarChart";
import { DonutChart } from "./components/DonutChart";
import { Skeleton } from "./components/Skeleton";
import { Phone } from "./icons";
import { AiAvatar } from "@/app/(main)/onboarding/AiAvatar";

export const dynamic = "force-dynamic";

// The one-screen cap. 7rem below lg (h-16 topbar + py-6), 8rem at lg where the
// main padding grows to py-8. Mirrored by OverviewSkeleton so hydration does
// not jump.
const CAP = "md:h-[calc(100dvh-7rem)] md:overflow-hidden lg:h-[calc(100dvh-8rem)]";

function OverviewSkeleton() {
  return (
    <div className={`flex flex-col gap-3 ${CAP}`}>
      <div className="shape-card glass shrink-0 space-y-3 p-6">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-8 w-full max-w-md" />
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shape-card glass space-y-2 p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-10" />
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-3">
        <div className="shape-card glass space-y-4 p-5 lg:col-span-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-44 w-full" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="shape-card glass space-y-3 p-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="shape-card glass flex-1 space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// One plan-usage row: "label ..... used / limit" plus a fill bar. An Infinity
// limit (unlimited tiers) drops the "/ limit" and the bar and just shows the
// count. The bar turns amber near the cap so a user notices before they hit it.
function PlanMeter({
  label,
  used,
  limit,
  unit,
}: {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}) {
  const capped = Number.isFinite(limit) && limit > 0;
  const pct = capped ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <dt className="text-neutral-500">{label}</dt>
        <dd className="font-medium tabular-nums text-neutral-900">
          {used}
          {capped ? ` / ${limit}` : ""}
          {unit ? ` ${unit}` : ""}
        </dd>
      </div>
      {capped && (
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
          <div
            className={`h-full rounded-full ${pct >= 90 ? "bg-amber-500" : "bg-neutral-900"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// A compact metric tile: a label over a big number (or a formatted string, for
// the month view's average call time). `alert` turns the number amber when it's
// a count you'd rather were zero.
function Tile({ label, value, alert }: { label: string; value: number | string; alert?: boolean }) {
  const warn = alert && typeof value === "number" && value > 0;
  return (
    <div className="shape-card glass p-4">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${warn ? "text-amber-600" : "text-neutral-900"}`}>
        {value}
      </p>
    </div>
  );
}

// Raw DB outcome -> localized headline. analytics.ts deliberately leaves the
// value alone (its cache has no locale in the key), so the mapping lives here.
function outcomeLabel(outcome: string | null, d: Dictionary["data"]): string {
  switch (outcome) {
    case "booked":
      return d.outcomeBooked;
    case "message":
      return d.outcomeMessage;
    case "transferred":
      return d.outcomeTransferred;
    case "resolved":
      return d.outcomeResolved;
    case "abandoned":
      return d.outcomeAbandoned;
    default:
      return d.outcomeUnknown;
  }
}

function sentimentLabel(seg: Segment, d: Dictionary["data"]): string {
  switch (seg.key) {
    case "positive":
      return d.sentimentPositive;
    case "neutral":
      return d.sentimentNeutral;
    case "negative":
      return d.sentimentNegative;
    case "frustrated":
      return d.sentimentFrustrated;
    case "angry":
      return d.sentimentAngry;
    default:
      return seg.label;
  }
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  // First-time users go through the /onboarding funnel instead of piecing the
  // setup together manually across dashboard pages. The dev-dashboard bypass
  // (DEV_DASHBOARD=1 in development) opts out of this gate so the onboarding
  // "Dev: continue to dashboard" shortcut lands here instead of bouncing back -
  // works for both the guest Workspace user and a real signed-in dev account.
  const ownerId = await currentUserId();
  if (authConfigured() && ownerId && !devDashboardBypass()) {
    const [assistants, profile] = await Promise.all([
      listAssistants(ownerId).catch(() => []),
      getOnboardingProfile(ownerId),
    ]);
    if (assistants.length === 0 && profile?.status !== "done") redirect("/onboarding");
  }

  const [t, sp] = await Promise.all([getDictionary(), searchParams]);
  const month = sp.range === "month";
  return (
    <Suspense key={month ? "month" : "today"} fallback={<OverviewSkeleton />}>
      <OverviewBody t={t} month={month} />
    </Suspense>
  );
}

async function OverviewBody({ t, month }: { t: Dictionary; month: boolean }) {
  const o = t.overview;
  const h = t.home;
  const ownerId = await currentUserId();
  const [data, analytics, assistants, numbers, integrations, plan, locale, tz, bookings] =
    await Promise.all([
      getOverviewCached(ownerId).catch((err: Error) => {
        console.error("[overview] load failed", err);
        return null;
      }),
      // Only the month view needs the 30-day rollup; today's view skips the query.
      month ? getAnalyticsCached(ownerId).catch(() => null) : Promise.resolve(null),
      listAssistants(ownerId ?? undefined).catch(() => [] as Assistant[]),
      ownerId ? getOwnedNumbers(ownerId).catch(() => []) : Promise.resolve([]),
      ownerId ? listIntegrations(ownerId).catch(() => []) : Promise.resolve([]),
      getPlanContextCached(ownerId).catch(() => null),
      getLocale(),
      // Upcoming appointments used to fetch these inside its own render, which
      // serialized a DB round trip behind this batch; run them here in parallel.
      ownerTimezone(ownerId),
      listBookings(ownerId ?? undefined).catch(() => [] as Booking[]),
    ]);

  const assistant = assistants[0] ?? null;
  const online = assistants.some((a) => a.enabled);
  // The line the receptionist answers on (owned numbers are already scoped to
  // this owner's assistants).
  const assistantNumber = numbers[0]?.e164 ?? "";
  const calendarConnected = integrations.some((i) => i.type === "calendar" && i.enabled);

  if (!data) {
    return (
      <div className="rise space-y-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {o.loadError}.
        </div>
      </div>
    );
  }

  // Status band. Same extended rule as the shell: no receptionist or no number
  // means nobody is answering, whatever the enabled flag says.
  const offline = !assistant || !assistantNumber;
  const statusText = offline
    ? h.statusNoNumber
    : online
      ? h.statusAnsweringAt.replace("{number}", formatPhone(assistantNumber))
      : h.statusPaused;

  const statusBand = (
    <div className="shape-card glass flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2.5 px-5 py-3.5">
      <p className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-neutral-900">
        <span
          aria-hidden
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            offline ? "bg-rose-500" : online ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        <span className="truncate">{statusText}</span>
      </p>
      <div className="ml-auto flex items-center gap-2">
        {/* Pausing "the receptionist" is only unambiguous with exactly one. */}
        {assistant && assistants.length === 1 && (
          <AssistantPowerToggle
            id={assistant.id}
            enabled={assistant.enabled}
            pauseLabel={h.pause}
            resumeLabel={h.resume}
          />
        )}
        {assistantNumber && (
          <a
            href={`tel:${assistantNumber}`}
            className="press inline-flex h-8 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 text-[13px] font-medium text-neutral-700 hover:border-neutral-400 hover:text-neutral-900"
          >
            <Phone className="h-3.5 w-3.5" />
            {h.callToTry}
          </a>
        )}
      </div>
    </div>
  );

  const rangeToggle = (
    <div className="inline-flex shrink-0 self-start rounded-full border border-neutral-200 bg-white p-0.5 text-[13px] font-medium">
      {[
        { label: o.today, href: "/dashboard", active: !month },
        { label: o.thisMonth, href: "/dashboard?range=month", active: month },
      ].map((r) => (
        <Link
          key={r.href}
          href={r.href}
          aria-current={r.active ? "true" : undefined}
          className={`press rounded-full px-3.5 py-2 transition-colors ${
            r.active ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          {r.label}
        </Link>
      ))}
    </div>
  );

  const tiles = month ? (
    <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
      <Tile label={t.analytics.totalCalls} value={analytics?.totals.calls ?? 0} />
      <Tile label={t.analytics.avgCallTime} value={analytics?.totals.avgDuration ?? "-"} />
      <Tile label={t.analytics.answerRate} value={analytics?.totals.answerRate ?? "-"} />
      <Tile label={t.analytics.bookings} value={analytics?.totals.bookings ?? 0} />
    </div>
  ) : (
    <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
      <Tile label={t.nav.calls} value={data.today.calls} />
      <Tile label={o.answered} value={data.today.answered} />
      {/* The only tile that goes anywhere: missed calls are the one number
          you'd want to act on straight away. */}
      <Link href="/dashboard/calls?status=unanswered" className="press rounded-[20px]">
        <Tile label={o.missed} value={data.today.missed} alert />
      </Link>
      <Tile label={o.booked} value={data.today.booked} />
    </div>
  );

  // Needs attention: real operational issues derived from what's actually
  // connected. Ordered most-urgent first and capped at 3 so the rail never
  // needs to scroll; an empty list shows the all-clear row so the panel still
  // answers "is anything broken?" with a plain no.
  const issues: { level: "red" | "amber"; text: string; action: string; href: string }[] = [];
  const minutesIncluded = plan?.limits.minutesIncluded ?? 0;
  const minutesUsed = data.monthUsage.minutes;
  if (assistant && !online)
    issues.push({ level: "amber", text: h.pausedTitle, action: o.fixResume, href: "/dashboard/assistant" });
  if (!assistantNumber)
    issues.push({ level: "red", text: o.issueNoNumber, action: o.fixGetNumber, href: "/dashboard/assistant" });
  if (!calendarConnected)
    issues.push({ level: "amber", text: o.issueNoCalendar, action: o.fixConnectCalendar, href: "/dashboard/calendar" });
  if (minutesIncluded > 0 && minutesUsed / minutesIncluded >= 0.9)
    issues.push({ level: "amber", text: o.issueMinutes, action: o.fixMinutes, href: "/pricing" });

  const needsAttention = (
    <SectionCard title={o.needsAttention} className="shrink-0">
      {issues.length === 0 ? (
        <div className="flex items-center gap-2.5 text-sm text-neutral-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
          {o.allClear}
        </div>
      ) : (
        <ul className="space-y-2">
          {issues.slice(0, 3).map((issue, i) => (
            <li key={i}>
              <Link
                href={issue.href}
                className="press flex items-center gap-2.5 rounded-lg text-sm text-neutral-700 hover:text-neutral-900"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${issue.level === "red" ? "bg-rose-500" : "bg-amber-500"}`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate">{issue.text}</span>
                <span className="shrink-0 text-xs font-medium text-neutral-400">{issue.action} →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );

  const rows: ActivityRow[] = data.recentCalls.map((c) => ({
    id: c.id,
    headline: outcomeLabel(c.outcome, t.data),
    caller: c.name,
    when: relTimeFrom(c.agoMinutes, locale),
    href: `/dashboard/calls?selected=${c.id}`,
  }));

  // Today: the activity feed is the page's ONE scroll region.
  const todayPanel =
    rows.length > 0 ? (
      <SectionCard
        title={o.activity}
        className="flex min-h-0 flex-col lg:col-span-2"
        bodyClassName="min-h-0 flex-1 overflow-y-auto"
        action={
          <Link
            href="/dashboard/calls"
            className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
          >
            {t.common.viewAll} →
          </Link>
        }
      >
        <ActivityFeed rows={rows} />
      </SectionCard>
    ) : (
      <SectionCard
        className="flex min-h-0 flex-col lg:col-span-2"
        bodyClassName="flex min-h-0 flex-1 flex-col items-center justify-center text-center"
      >
        <AiAvatar mood="greeting" className="h-20 w-20" />
        <h2 className="mt-4 text-base font-semibold text-neutral-900">{o.noCallsTitle}</h2>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-neutral-500">{o.noCallsBody}</p>
        {assistantNumber && (
          <>
            <p className="mt-4 text-xl font-medium tabular-nums text-neutral-900">{formatPhone(assistantNumber)}</p>
            <a
              href={`tel:${assistantNumber}`}
              className="press mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800"
            >
              <Phone className="h-4 w-4" />
              {h.callToTry}
            </a>
          </>
        )}
      </SectionCard>
    );

  // Month: the two charts are fixed-height and together exceed the panel at
  // 1280x720, so this panel is the month view's single scroll region. Doc 02
  // assumed both would fit and nothing would scroll; clipping a chart is worse
  // than scrolling, and the one-region-per-page rule still holds.
  const monthPanel = (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto lg:col-span-2">
      <SectionCard title={t.analytics.callVolume} subtitle={t.analytics.callVolumeSub} className="shrink-0">
        <BarChart data={analytics?.volume ?? []} countTemplate={t.data.callsCount} />
      </SectionCard>
      <SectionCard title={o.howCallersFelt} className="shrink-0">
        {analytics && analytics.sentiment.length > 0 ? (
          <DonutChart
            segments={analytics.sentiment.map((s) => ({ ...s, label: sentimentLabel(s, t.data) }))}
            centerLabel={`${analytics.sentiment.find((s) => s.key === "positive")?.value ?? 0}%`}
            centerSub={t.data.sentimentPositive}
          />
        ) : (
          <p className="text-sm text-neutral-500">{t.analytics.noCalls}</p>
        )}
      </SectionCard>
    </div>
  );

  return (
    <div className={`rise flex flex-col gap-3 ${CAP}`}>
      {statusBand}
      {rangeToggle}
      {tiles}
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-3">
        {month ? monthPanel : todayPanel}
        <div className="flex min-h-0 flex-col gap-3">
          {needsAttention}
          <SectionCard
            title={o.upcoming}
            className="flex min-h-0 flex-1 flex-col"
            bodyClassName="min-h-0 flex-1"
            action={
              <Link
                href="/dashboard/calendar"
                className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
              >
                {t.common.viewAll} →
              </Link>
            }
          >
            <UpcomingAppointments bookings={bookings} tz={tz} />
          </SectionCard>
          {plan && (
            <SectionCard
              title={h.planUsage}
              className="shrink-0"
              action={
                <Link
                  href="/dashboard/settings"
                  className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  {plan.planName}
                </Link>
              }
            >
              {/* Minutes only. Assistant and number counts are multi-entity
                  plumbing a single-receptionist account should never see. */}
              <PlanMeter label={h.minutes} used={minutesUsed} limit={minutesIncluded} />
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
