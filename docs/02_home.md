# 02 - Home (/dashboard)

## Purpose
Answer "Is my receptionist answering, and what happened?" in one glance, for today by default and for the month on demand.

## Today
- app/dashboard/page.tsx is read-only: a Today strip (4 tiles), a 2/3 Activity timeline, and a right column (Needs attention, Upcoming, Plan usage). No status band, no pause control, no test-call CTA.
- The one-screen cap is lg-only (page.tsx:272 `lg:h-[calc(100dvh-8rem)] lg:overflow-hidden`); below lg everything stacks and scrolls.
- Silent clipping: the Activity card body is `overflow-hidden` (page.tsx:242) and so is Upcoming (page.tsx:281) - rows cut off mid-item with no scroll affordance.
- Missed tile turns amber (TodayTile, page.tsx:96) but links nowhere.
- Needs attention (page.tsx:188-216) renders up to 4 plain-text issues with no fix links.
- Plan usage card shows three meters (minutes, assistants, numbers) via the local PlanMeter (page.tsx:59) - multi-entity leak for singleton accounts.
- /dashboard/analytics is a separate 3-screen page (analytics/page.tsx:32) with an OrganizationPicker (org leak) and engineering widgets (p95 latency, talk ratio).
- LiveBanner (components/LiveBanner.tsx:11), StatCard, RecentCalls, CallSummaries(-List), VolumeChart, AssistantPowerToggle (revived below) are orphans - imported nowhere.
- ActivityFeed outcome headlines and sentiment donut labels come out of lib/dashboard/analytics.ts as capitalized English DB values - not localized.

## Layout
```
+--------------------------------------------------------------------------+
| Status band: (dot) Answering calls at +1 415 555 0100  [Pause] [Call to  |
|              try it]                                                     |
+--------------------------------------------------------------------------+
| [ Today ] [ This month ]   <- ?range= toggle links                       |
| range=today:  [Calls] [Answered] [Missed ->] [Booked]                    |
| range=month:  [Total calls] [Avg call time] [Answer rate] [Bookings]     |
+---------------------------------------------+----------------------------+
| LEFT (2/3)                                  | RIGHT RAIL (1/3, fixed)    |
| range=today: Activity feed                  | Needs attention (max 3,    |
|   ** SOLE overflow-y-auto REGION **         |   each with a fix link)    |
|   . Booked appointment - +1 ...  2 min ago  | Next 3 appointments        |
|   . Answered call - +1 ...       1 hr ago   |   (+ requests-to-confirm   |
|   (empty state: AiAvatar + number + tel CTA)|    badge)                  |
| range=month: 30-day bar chart (fixed h)     | Minutes meter + plan link  |
|              "How callers felt" donut       |                            |
+---------------------------------------------+----------------------------+
```
Zones: (1) status band, fixed; (2) range toggle + tile strip, fixed; (3) left panel - in `today` range the Activity feed is the page's ONLY `overflow-y-auto` region, in `month` range it holds two fixed-height charts and nothing scrolls; (4) right rail, hard-capped (3 issues + 3 appointments + 1 meter), never scrolls, never clips.
Mobile (<md): the height cap relaxes, zones stack in the same order, natural page scroll. Desktop (md+): root gets `md:h-[calc(100dvh-8rem)] md:overflow-hidden` (extend the current lg-only cap at page.tsx:272).

## Content and data
- Status band: uses the EXTENDED AiStatus derivation from 01_dashboard-shell.md (offline when no assistant OR no number linked to an enabled assistant); the base offline/paused/online logic currently lives at app/dashboard/layout.tsx:47-48; number from `getOwnedNumbers` (already fetched, page.tsx:143) formatted by `formatPhone` (lib/call-engine/voice/phone-language). Pause/Resume = AssistantPowerToggle (components/AssistantPowerToggle.tsx:10). AssistantPowerToggle is the orphan revived here; it wraps the same toggleAssistantEnabledAction as EnabledToggle used by 01's popover and 06's hero, so behavior stays identical. "Call to try it" = plain `tel:` anchor on the e164. Mirrors the sidebar avatar popover (see 01_dashboard-shell.md).
- Today tiles: `getOverviewCached(ownerId).today` (lib/dashboard/analytics.ts:703; counts built at analytics.ts:438-446). Missed = not-completed, matching the calls page "Missed" bucket.
- Month tiles: `getAnalyticsCached(ownerId)` (lib/dashboard/analytics.ts:720) `.totals` - calls, avgDuration, answerRate, bookings; labels reuse t.analytics.totalCalls / avgCallTime / answerRate / bookings. No assistant/org filter arguments.
- 30-day bar chart: `getAnalyticsCached(...).volume` via BarChart (components/BarChart.tsx:3), fixed h-44.
- "How callers felt" donut: `getAnalyticsCached(...).sentiment` via DonutChart (components/DonutChart.tsx:9); raw labels ("Positive", "Frustrated", built at analytics.ts:670-680) mapped to dictionary keys at render time.
- Activity feed: `getOverviewCached(...).recentCalls` via ActivityFeed (components/ActivityFeed.tsx:7); outcome headline mapped from the DB outcome value (booked/message/transferred/resolved/abandoned) to dictionary labels.
- Needs attention: same derivations as today (page.tsx:188-193): paused, no number, no calendar, >=90% minutes; capped at 3, ordered most urgent first.
- Next appointments: UpcomingAppointments (components/UpcomingAppointments.tsx:23), already capped at 3 (nextBookings, UpcomingAppointments.tsx:8-19) plus the requests-to-confirm badge (UpcomingAppointments.tsx:86-94).
- Minutes meter: `getPlanContextCached` limits.minutesIncluded + `getOverviewCached(...).monthUsage.minutes`, rendered by the existing PlanMeter helper (page.tsx:59). The full PlanUsage widget (components/PlanUsage.tsx:35) is Settings material (see 07_settings.md).
- Empty state (no calls yet): static AiAvatar in greeting mood narrating t.overview.noCallsTitle/noCallsBody + the number + tel CTA (avatar rules in 01_dashboard-shell.md).

## Interactions
- Pause/Resume -> `toggleAssistantEnabledAction` (app/dashboard/assistant/actions.ts:287), optimistic; it already revalidates /dashboard (actions.ts:299-300), so the band and the sidebar dot catch up without new plumbing. Renders only when an assistant exists.
- "Call to try it" -> `tel:` link; renders only when a number exists.
- Today | This month -> plain Links setting/clearing `?range=month`; server re-renders (page is force-dynamic), Suspense skeleton covers the swap.
- Missed tile -> Link to /dashboard/calls?status=unanswered (param verified: calls/page.tsx:45, CallFilters.tsx:18). Calls and Booked tiles stay non-links (only the missed deep link is specified).
- Activity row -> Link to /dashboard/calls?selected=<id> (master-detail, see 03_calls.md).
- Needs-attention fix links: paused -> Resume sits in the band, row links to /dashboard/assistant; no number -> /dashboard/assistant; no calendar -> /dashboard/calendar; minutes -> /pricing.
- Appointment row -> /dashboard/calendar?day=<YYYY-MM-DD> of the booking; confirm badge -> /dashboard/calendar (see 04_appointments.md).
- Plan-name link on the minutes meter -> /dashboard/settings (Plan and billing tab).
- Both SectionCard header "View all" links are KEPT (Activity -> /dashboard/calls, Upcoming -> /dashboard/calendar).
- No modals. Multi-entity gating: the band controls assistants[0]; with >1 assistant the band shows aggregate status and Pause/Resume hides (pausing "the receptionist" is ambiguous - manage per assistant on /dashboard/assistant).

## Moves and cuts
Absorbed from /dashboard/analytics (route dies, shim below):
- KPI tiles (analytics/page.tsx:101-106) -> month tile strip.
- 30-day call volume BarChart -> month left panel.
- Sentiment donut -> month left panel, retitled "How callers felt".
Cut, with reasons:
- Voice-latency card (median ms, p95, 800ms target; analytics/page.tsx:171-211): engineering jargon a business owner cannot act on. Data stays in `getAnalyticsCached.latency` for operators.
- Talk-ratio donut: char-length sample (analytics.ts:311-335) presented as a precise percentage; no user action follows from it.
- Countries donut: near-zero value for local businesses whose callers are all domestic.
- AssistantStats table (by-assistant rollup): moot for singleton accounts; `getAssistantStatsCached` (analytics.ts:709) is preserved without UI.
- OrganizationPicker (analytics/OrganizationPicker.tsx): org leak, hard rule.
- AssistantPicker: moot for singletons; multi-assistant slicing lives in the preserved stats function if ever needed.
- LiveBanner (components/LiveBanner.tsx): orphan, superseded by the status band + empty state.
- StatCard, RecentCalls, CallSummaries, CallSummariesList, VolumeChart: pre-existing orphans, delete or leave untouched - none is referenced by this plan.
Preserved UI-less: getAnalyticsCached/getAssistantStatsCached and the unused Overview fields (kpis, callVolume, talkRatio, countries, latency, summaries) stay in lib/dashboard/analytics.ts.

## Implementation steps
1. Redirect shim: replace app/dashboard/analytics/page.tsx with `redirect("/dashboard?range=month")`; delete app/dashboard/analytics/AssistantPicker.tsx and OrganizationPicker.tsx. Nav item removal and LiveAvatar chart-activity retarget are 01_dashboard-shell.md's steps.
2. app/dashboard/page.tsx: accept `searchParams: Promise<{ range?: string }>`; `range === "month"` picks the month view. Keep the /onboarding redirect guard (page.tsx:114-121) and the parallel fetch block (page.tsx:137-146); add `getAnalyticsCached(ownerId)` to the Promise.all only when range=month.
3. Build the status band in page.tsx above the tile strip: status line (the extended AiStatus from 01_dashboard-shell.md - offline when no assistant OR no number linked to an enabled assistant - derivable from the fetched `assistants`; base logic currently at layout.tsx:47-48), formatted number, AssistantPowerToggle with t.home.pause/t.home.resume, `tel:` CTA. Gate Pause/Resume to exactly 1 assistant.
4. Range toggle: two Links (t.overview.today, t.overview.thisMonth) styled as a segmented control; today clears the param, month sets `?range=month`.
5. Today view: wrap the Missed TodayTile in a Link to /dashboard/calls?status=unanswered. Month view: 4 KPI tiles from `getAnalyticsCached.totals` reusing the TodayTile shell and t.analytics labels.
6. Activity feed as sole scroller: change the Activity SectionCard body from `overflow-hidden` to `overflow-y-auto` (page.tsx:242); bump `recentCalls` from `slice(0, 6)` to `slice(0, 20)` in lib/dashboard/analytics.ts:448 so the region has content to scroll; make each ActivityFeed row a Link to /dashboard/calls?selected=<id> and map outcome values to dictionary labels (pass labels in as props - ActivityFeed stays presentational).
7. Month left panel: one column, two fixed-height SectionCards - BarChart (t.analytics.callVolume/callVolumeSub) and DonutChart titled with new key t.overview.howCallersFelt, sentiment labels mapped via dictionary. No scroll region in month view.
8. Right rail hard-cap: `issues.slice(0, 3)` and wrap each issue in a Link (fix targets above); drop the Upcoming card's `overflow-hidden` (page.tsx:281) - 3 rows + badge always fit; repoint UpcomingAppointments row links from /dashboard/calendar to /dashboard/calendar?day=<day>; shrink the Plan usage card to the single minutes PlanMeter with the plan-name link pointing to /dashboard/settings.
9. One-screen cap at md+: change `lg:h-[calc(100dvh-8rem)] lg:overflow-hidden` to `md:` (page.tsx:272) and mirror in OverviewSkeleton (page.tsx:22); below md the cap is off and the page scrolls naturally.
10. Empty state: replace the inline phone icon block (page.tsx:256-267) with AiAvatar (greeting mood) + number + `tel:` CTA.
11. Dictionary updates in ALL 8 files - lib/i18n/dictionaries/en.ts, de.ts, es.ts, fr.ts, it.ts, nl.ts, pt.ts, sk.ts: new keys overview.howCallersFelt, home.statusAnsweringAt ("Answering calls at {number}") - the only new band key this doc adds - plus overview.fixResume/fixGetNumber/fixConnectCalendar/fixMinutes, data.outcomeBooked/outcomeMessage/outcomeTransferred/outcomeResolved/outcomeAbandoned, data.sentimentPositive/sentimentNeutral/sentimentNegative/sentimentFrustrated/sentimentAngry. Reuse existing t.overview.today/thisMonth/missed, t.home.pause/resume/pausedTitle, t.home.statusAnswering/statusPaused/statusNoNumber/callToTry (chip/popover keys are defined in 01_dashboard-shell.md step 1), t.analytics.* tile and chart keys.
12. Update t.tutorial.sections / DashboardGuide mapping for the dead analytics route (owned by 01_dashboard-shell.md; noted here because the shim changes where "chart" links land: /dashboard?range=month).

## Acceptance criteria
- [ ] Desktop (md+): the page fits one screen; the Activity feed is the only region that scrolls in `today` range; nothing scrolls in `month` range; below md natural page scroll works.
- [ ] No content is silently clipped anywhere: every list either fits its fixed cap (right rail) or lives in the named scroll region.
- [ ] Status band shows plain-language status, Pause/Resume flips optimistically and survives refresh, and "Call to try it" opens the dialer with the receptionist's number.
- [ ] `?range=month` shows exactly: 4 KPI tiles, 30-day bar chart, "How callers felt" donut; /dashboard/analytics redirects to /dashboard?range=month.
- [ ] Missed tile deep-links to /dashboard/calls?status=unanswered and the count matches that filter's list.
- [ ] Needs attention shows at most 3 issues, each with a working fix link; all-clear row when none.
- [ ] Right rail shows at most 3 appointments plus the confirm badge and a single minutes meter; assistants/numbers meters are gone from Home.
- [ ] No jargon or org leak in copy: no "organization", "p95", "latency", "talk ratio", "sync", vendor names; no gendered pronouns; "your receptionist" phrasing.
- [ ] Every new or changed string exists in all 8 dictionaries (en, de, es, fr, it, nl, pt, sk), including activity outcomes and sentiment legend labels.
- [ ] No capability silently lost: pause/resume, minutes visibility, upcoming appointments, missed-call triage, and month analytics all remain reachable; cut analytics widgets are documented above and their data functions remain in lib/dashboard/analytics.ts.
- [ ] Empty state (zero calls) shows the greeting-mood avatar, the number, and a tel: CTA instead of a bare icon.
