# 04 - Appointments (/dashboard/calendar)

## Purpose

"What appointments did my receptionist book, is anything waiting on me, and is my
calendar hooked up?" One page owns bookings AND the calendar connection.

## Today

- Three stacked cards that always scroll: a 7-col month grid (min-w-[560px], min-h-24
  cells, up to 3 booking chips + "+n more", app/dashboard/calendar/page.tsx:202-253),
  a full-month day-grouped agenda (page.tsx:256-397), and a conditional "Requests to
  confirm" card for undated bookings (page.tsx:399-424).
- Failed-sync strip per booking with Retry (page.tsx:342-360, retryBookingSyncAction);
  copy says "Calendar sync failed" (en.ts:331) - sync jargon.
- CancelBooking form is hardcoded English (app/dashboard/calendar/CancelBooking.tsx:19-66);
  month-nav aria labels too (page.tsx:69,76).
- Calendar connection lives on a separate, nav-less /dashboard/integrations page with an
  operator-only "Setup required" badge (integrations/page.tsx:173-177), a raw "API key
  check failed" probe string (page.tsx:82), a dead CredentialForm path (page.tsx:35-61),
  and a blurred Developer/CRM webhook section (page.tsx:252-379). Users must find it.

## Layout

```
+--------------------------------------------------------------------+
| Appointments                            [Today] [<] July 2026 [>]  |  A header
+--------------------------------------------------------------------+
| Connected calendar: [G] Google Calendar  Primary        [Manage]   |  B panel
+--------------------------------------------------------------------+
| [2 requests to confirm] [Didn't reach your calendar - try again]   |  C chips
+------------------------+-------------------------------------------+
| Mo Tu We Th Fr Sa Su   | Tue 21 Jul - 3 appointments               |
|  1  2  3  4  5  6  7   |  09:00  Haircut - Anna   [Confirmed]      |
|  .        . ..         |  10:30  ...              [Cancel] [View]  |
|  8  9 10 [11] 12 13 14 |  14:00  ...                               |
|  ..    .               |  ...                                      |
| (fixed 6-row grid)     |  (scrolls)                                |
|  D mini month grid     |  E day agenda                             |
+------------------------+-------------------------------------------+
```

Zones:
- A: PageHeader + month nav (Today link, prev/next chevrons). Fixed.
- B: "Connected calendar" panel - ONE slim strip owning all connection and management.
  Fixed.
- C: attention chips - "N requests to confirm" and "Didn't reach your calendar - try
  again". Each renders only when its count > 0; row collapses when both are zero. Fixed.
- D: dots-only mini month grid, ~1/3 width, fixed cell height (about h-9), always exactly
  the month's week rows; never grows, never needs horizontal scroll. Fixed.
- E: selected-day agenda, ~2/3 width - the page's SOLE overflow-y-auto region.

One-screen mechanism: page root gets h-[calc(100dvh-8rem)] + overflow-hidden at md and
up (extend the lg-only pattern on app/dashboard/page.tsx to md+); zone E is the only
scroller. Mobile (<md): the cap relaxes, zones stack A-B-C-D-E, natural page scroll.
No silent clipping: the grid is dots (nothing to clip) and the agenda scrolls.

## Content and data

- Month cursor: ?month= via parseMonth/shiftMonth/monthParam (lib/dashboard/calendar.ts:119-140).
- Selected day: ?day=YYYY-MM-DD searchParam, server-rendered. Default: today when viewing
  the current month; else the month's first day with bookings; else none (agenda shows the
  empty hint).
- Bookings: listBookings(ownerId) (lib/dashboard/calendar.ts:64), grouped with
  groupByDay (calendar.ts:183) in ownerTimezone (lib/dashboard/timezone.ts).
- Grid dots: per day, one dot per booking up to 3, colored by status using the existing
  TONE mapping (page.tsx:28-33): confirmed=emerald, to-confirm=amber, failed=rose,
  cancelled=neutral. Today keeps the inverted circle (page.tsx:220-229); the selected day
  gets a ring.
- Chips: requests count from undatedBookings (calendar.ts:202); failed count = bookings
  with status "failed" and no cancellation. Retry-auto note uses MAX_SYNC_ATTEMPTS
  (lib/dashboard/booking-retry.ts:14).
- Agenda rows: reuse the existing row internals (page.tsx:283-391) - time spine, title,
  status chip (statusDone/Pending/Failed/Cancelled labels, en.ts:327-330), meta line
  (caller, booked by, provider display name from PROVIDER_NAMES page.tsx:52-58, added on),
  notes blockquote, failed strip + RetrySyncButton, cancellation strip with notify status
  (en.ts:335-339), View call link, CancelBooking.
- Connected calendar panel: listIntegrations filtered to type "calendar"
  (lib/dashboard/db.ts); primary = config.primary flag else first enabled
  (integrations/page.tsx:121-124); provider defs from CALENDAR_PROVIDERS
  (integrations/providers.ts:20-47) with ProviderIcon brand SVGs; connect availability
  via isOAuthConfigured (lib/dashboard/oauth.ts:91); health via the existing getBusy
  credential probe (integrations/page.tsx:65-74) inside Suspense, surfaced as a plain
  "Reconnect needed" chip - never the raw provider error.
- Empty state (zero connected calendars AND zero bookings): zones C-E replaced by a
  static AiAvatar (greeting mood, see 01_dashboard-shell.md) narrating "Connect your
  calendar and your receptionist can book real appointments" + the three connect buttons.

## Interactions

- Prev/next/Today month nav -> Links updating ?month= (clears ?day=).
- Click a day cell -> Link setting ?day= (keeps ?month=). Server-rendered swap of zone E.
- "N requests to confirm" chip -> ?view=requests: zone E lists undated bookings (current
  Requests card content, page.tsx:399-424) with View call links.
- "Didn't reach your calendar - try again" chip -> ?view=attention: zone E lists failed
  bookings, each with its retry strip. Selecting a day clears ?view=.
- Retry -> retryBookingSyncAction (app/dashboard/calendar/actions.ts:28) via
  RetrySyncButton; result shown as an inline pill, not a ?saved= redirect.
- Cancel -> CancelBooking inline form (reason, offer-a-new-time checkbox) ->
  cancelBookingAction (calendar/actions.ts:41); customer notified by AI call with SMS
  fallback in after() (calendar/actions.ts:62). Localized during the move.
- View call -> /dashboard/calls/[callId] (route survives, see 03_calls.md).
- Connect Google/Outlook/Cal.com -> existing GET
  /api/integrations/[provider]/connect?next=/dashboard/calendar (route.ts:11-15 validates
  next; callback returns there with ?connected=1, callback/route.ts:77). Page reads
  ?connected= and shows a success pill.
- Manage (panel button) -> one-topic self-saving modal: per connected calendar a row with
  Set primary (setPrimaryCalendarAction), Disconnect (two-step confirm,
  disconnectCalendarAction), Reconnect button when the probe failed (same connect link);
  plus connect buttons for not-yet-connected providers.
- Multi-entity gating: "Primary" chip and "Set primary" render only when >1 calendar is
  connected; with exactly one, the panel just says "Connected calendar: Google Calendar".
- Inline-pill conversion (replaces the back() ?saved/?error redirect helper,
  calendar/actions.ts:23-26) affects: retryBookingSyncAction, cancelBookingAction,
  setPrimaryCalendarAction, disconnectCalendarAction. ?connected=1 stays a redirect param
  (external OAuth round-trip) rendered once as a pill.
- The per-calendar none/read/write access select STAYS on the Receptionist page
  (see 06_receptionist.md); this page never edits assistant access.

## Moves and cuts

Absorbed from /dashboard/integrations (page dies, redirect shim to /dashboard/calendar):
- Connect Google/Outlook/Cal.com OAuth buttons (integrations/page.tsx:230-237).
- Set primary / Disconnect forms (page.tsx:211-226) with their actions
  (integrations/actions.ts:81-105), moved into app/dashboard/calendar/actions.ts.
- Credential probe (page.tsx:65-86), reworded from "API key check failed: {raw error}"
  to "Reconnect needed" + plain sentence.
- providers.ts and ProviderIcon.tsx move under app/dashboard/calendar/.

Cut with the integrations page:
- "Setup required" operator-env badge (page.tsx:148,173-177): when isOAuthConfigured is
  false and nothing is connected, that provider's connect button simply does not render -
  users cannot fix env vars.
- Blurred Developer/CRM webhook section (page.tsx:252-379): feature unshipped; UI removed
  everywhere.
- Dead CredentialForm path (page.tsx:35-61) and connectCalendarAction
  (integrations/actions.ts:15-40): every provider is OAuth with zero credential fields, so
  the form-based path is unreachable; both are deleted. providers.ts fields/live
  machinery trimmed accordingly.
- t.integrations dictionary section (en.ts:344-353) retired; calendarConnected and
  continueWith move under t.calendar. Tutorial "integrations" guide section
  (en.ts:495-503) merges into the calendar section (en.ts:442-451).

Preserved UI-less server actions (the ledger): createCrmAction and deleteCrmAction
(integrations/actions.ts:42-79) stay in code - CRM push is unshipped; the blurred section
is cut everywhere. connectCalendarAction is NOT preserved (dead path, see above).

Jargon renames on this page: "Calendar sync failed" -> "Didn't reach your calendar";
"Retry sync" -> "Try again"; no "sync", "provider", "integration", or "API key" in any
user-facing string.

## Implementation steps

1. Dictionaries (all 8: lib/i18n/dictionaries/de.ts, en.ts, es.ts, fr.ts, it.ts, nl.ts,
   pt.ts, sk.ts): retitle t.calendar.title to "Appointments"; rename syncFailed/
   retrySync/retrying keys; add keys for the connected-calendar panel, Manage modal,
   Reconnect needed, attention chips, view labels, empty-state narration, connect
   buttons (move calendarConnected/continueWith from t.integrations), and every
   CancelBooking string; retire t.integrations; merge the tutorial integrations section
   into the calendar section; drop nav.integrations.
2. Move app/dashboard/integrations/providers.ts and ProviderIcon.tsx to
   app/dashboard/calendar/, trimming ProviderField/fields/live members and the calendly
   icon branch if unused by CALENDAR_PROVIDERS.
3. Move setPrimaryCalendarAction and disconnectCalendarAction into
   app/dashboard/calendar/actions.ts; repoint their revalidatePath("/dashboard/integrations")
   and redirect("/dashboard/integrations") to /dashboard/calendar; convert them plus
   retryBookingSyncAction and cancelBookingAction from the back() redirect helper
   (calendar/actions.ts:23-26) to returned {ok, message} state rendered as inline pills.
4. Build ConnectedCalendarPanel + Manage modal components in app/dashboard/calendar/;
   reuse the Suspense probe from integrations/page.tsx:65-86 with reworded output;
   connect links use /api/integrations/[provider]/connect?next=/dashboard/calendar.
5. Rebuild app/dashboard/calendar/page.tsx: md+ height cap + overflow-hidden on the
   root; zones A-E; dots-only grid (drop min-w-[560px] and booking-chip links); ?day=
   and ?view= searchParams driving zone E; read ?connected= for the success pill.
6. Localize CancelBooking.tsx (all strings via dict props) and the MonthNav aria labels
   (page.tsx:69,76); replace the em dash and curly quotes in the cancellation strip
   (page.tsx:367) with localized ASCII copy.
7. Empty states: no-calendar-and-no-bookings avatar narration with connect buttons;
   plain "nothing this day" hint in zone E.
8. Replace app/dashboard/integrations/page.tsx with a redirect shim
   (redirect("/dashboard/calendar")); delete integrations/loading.tsx and CredentialForm;
   trim integrations/actions.ts to createCrmAction/deleteCrmAction only; repoint the
   preserved CRM actions' stale targets in app/dashboard/integrations/actions.ts -
   createCrmAction's error redirect at :48, revalidatePath at :62, and ?connected=1
   redirect at :64; deleteCrmAction's revalidatePath at :75 and redirect at :78
   - all to /dashboard/calendar; KEEP the
   revalidatePath("/dashboard/assistant", "layout") calls at :63 and :76.
9. Repoint the OAuth route fallbacks "/dashboard/integrations" -> "/dashboard/calendar"
   in app/api/integrations/[provider]/connect/route.ts:25 and
   app/api/integrations/[provider]/callback/route.ts:24.
10. Repoint inbound links: app/dashboard/assistant/[id]/page.tsx:286 and
    app/dashboard/knowledge/page.tsx:271 -> /dashboard/calendar; tutorial/guide mappings
    for the integrations section are removed by 01_dashboard-shell.md (steps 5 and 9);
    UpcomingAppointments row deep-links to ?day=<day> are repointed by 02_home.md step 8;
    this doc owns only the ?day= param contract.
11. Update app/dashboard/calendar/loading.tsx to match the new zones (slim panel bar,
    compact grid block, agenda rows).

## Acceptance criteria

- [ ] Desktop (md+): the page fits one screen; only the day agenda (zone E) scrolls;
      grid, panel, chips, and header never move; no horizontal page scroll at any width.
- [ ] Mobile (<md): cap relaxed, zones stack, natural page scroll, nothing clipped.
- [ ] Month nav, ?day= selection, and both chip views work as server-rendered searchParam
      swaps; refresh/back preserve state.
- [ ] Calendar connect, set primary, disconnect, and reconnect all work from this page;
      OAuth returns to /dashboard/calendar with a success pill; /dashboard/integrations
      redirects here.
- [ ] No jargon or org leak in copy: no "sync", "provider", "integration", "API key",
      "Setup required", "organization", or raw error strings; retry copy reads "Didn't
      reach your calendar - try again"; no gendered pronouns.
- [ ] All strings localized in all 8 dictionaries, including CancelBooking, aria labels,
      probe rewording, and the new panel/chips/modal copy.
- [ ] No capability silently lost: retry sync, cancel with customer notification (call +
      SMS fallback), view-call deep links, undated-request follow-up, set primary,
      disconnect, and connect all still reachable; createCrmAction/deleteCrmAction remain
      in code UI-less; per-calendar access editing still lives on the Receptionist page.
- [ ] "Set primary"/"Primary" render only when >1 calendar is connected.
- [ ] Inline pills replace every ?saved=/?error= redirect from this page's actions.
