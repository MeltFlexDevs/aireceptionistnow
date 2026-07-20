# 03 - Calls (/dashboard/calls)

## Purpose
"Who called, and what happened on each call?" One screen: pick a call on the left, read/hear it on the right.

## Today
- List page (app/dashboard/calls/page.tsx) is a full-width table: search + status select (CallFilters.tsx), then CallTable rows that navigate to /dashboard/calls/[id]. Page scrolls with the list (up to 200 rows, 1000 filtered), no height cap.
- Detail page ([id]/page.tsx) is a separate route: header card with from -> to and badges, Recording, Transcript (client-translated), AI summary, ActionItems, ReportIssue popover, LiveRefresh 5s polling. Transcript is unbounded, whole page scrolls.
- Status vocabulary is carrier jargon: statusLabel (lib/dashboard/calls/format.ts:27) title-cases raw statuses ("No Answer", "Busy", "Queued", "Initiated") and statusTone (status.ts) colors by raw status.
- Detail page is largely hardcoded English ("Recording", "Transcript", "AI summary", "Actions", "Live", "Download", "Report an issue", the whole ReportIssue form, ActionItems labels) while the list page is fully keyed.
- Rows without a DB record (CallLogRow.dbId null, types.ts:5) are silently non-clickable.
- Assistant column always renders, showing "-" on unmatched rows, even for single-assistant accounts.
- Booking times in ActionItems render 24h en-US regardless of locale (ActionItems.tsx:32-39).

## Layout
```
+----------------------------------------------------------------------+
| PageHeader "Calls"        [search..............] [status v] [Clear]  |  fixed
+---------------------------+------------------------------------------+
| CALL LIST (~40%)          | CALL DETAIL (~60%)                       |
| [scroll region: list]     |  header: from -> to, badges, meta   fixed|
|  > row (selected)         |  recording player + download        fixed|
|    row                    |  [scroll region: transcript]             |
|    row                    |    summary card                          |
|    row                    |    actions card                          |
|    ...                    |    transcript bubbles...                 |
+---------------------------+------------------------------------------+
```
Zones:
- Filter bar (fixed): search input, status select, Clear.
- Call list pane (fixed width ~40%): the FIRST named scroll region (overflow-y-auto). Compact rows.
- Detail pane (~60%): fixed header card (from -> to, badges, meta) and fixed recording strip; below them the SECOND named scroll region (overflow-y-auto) containing summary, actions, then transcript bubbles, so long content never clips.
- This page intentionally has TWO scroll regions (call list + transcript/detail body) - the decided exception to the one-region default; everything else is fixed.
- Page root gets the one-screen cap at md+: h-[calc(100dvh-8rem)] + overflow-hidden, extending the lg-only pattern on app/dashboard/page.tsx:22 to all desktop breakpoints.
- Mobile (<md): the cap relaxes, natural page scroll. The split pane does not render; the list shows the existing stacked cards (CallTable.tsx:90) and tapping a row navigates to the full-screen /dashboard/calls/[id] route.

## Content and data
- Filter bar -> CallFilters.tsx (kept; q + status URL params, debounced search, spinner).
- Call list rows -> getCallLog (lib/dashboard/calls/log.ts:136) via a compacted CallTable: caller number (formatPhone), status badge, date, duration. Assistant name renders only when >1 assistant exists (listAssistants, lib/dashboard/db.ts:251).
- Row count subtitle -> existing t.calls.callOne/callMany/matched logic (page.tsx:80).
- Status badge label -> statusBucket (lib/dashboard/calls/format.ts:45) mapped to dictionary: completed -> "Answered", unanswered -> "Missed", active -> "In progress". statusTone re-keyed off the bucket, not the raw carrier status. Raw statuses never render.
- Detail pane -> getCallDetail (lib/dashboard/calls/detail.ts:11) for sp.selected, rendered by a new shared CallDetailBody server component extracted from [id]/page.tsx:46-133:
  - Header: direction arrow, from -> to (t.data.unknownCaller for missing from), Live badge, status bucket badge, outcome badge, sentiment badge (localized Positive/Neutral/Negative).
  - Meta row: Date / Duration / Assistant (reuse t.calls.colDate/colDuration/colAssistant; Assistant cell gated to >1 assistant).
  - Recording.tsx (audio + download), TranscriptView.tsx (bubbles, translation toggle), summary text, ActionItems.tsx, ReportIssue.tsx, LiveRefresh.tsx when isLive.
- Empty detail pane (no selectable call) -> static AiAvatar (app/onboarding/AiAvatar.tsx:38) in greeting mood narrating "Pick a call to see the conversation" (localized). Default: when ?selected= is absent or invalid, the newest row with a dbId is auto-selected server-side, so the pane is populated on plain /dashboard/calls.
- Empty list state -> existing phone-icon empty state (page.tsx:84-95), fills the full width, AiAvatar-narrated.
- /dashboard/calls/[id] -> thin wrapper: BackLink + the same CallDetailBody (page variant keeps the current lg 3-col grid); notFound() guard stays ([id]/page.tsx:44).

## Interactions
- Search / status select / Clear -> URL params q, status via router.replace (CallFilters.tsx:34). setParam already preserves other params, so ?selected= survives filter changes; clearFilters (CallFilters.tsx:43) must be fixed to preserve ?selected= (today it replaces with the bare pathname).
- Row click (md+) -> Link to /dashboard/calls?selected=<dbId> (scroll: false, prefetch). Selected row highlighted with aria-current. Server re-renders the detail pane; pane wrapped in its own Suspense keyed by selected so the list does not re-skeleton.
- Row click (<md) -> Link to /dashboard/calls/[id] (full-screen detail).
- Rows without dbId -> not selectable; add a localized tooltip "No details for this call" instead of today's silent no-op.
- Play / download recording -> native audio controls + download anchor (Recording.tsx).
- Show original / Show translation toggle -> TranscriptView.tsx:36 (unchanged).
- Report an issue -> ReportIssue popover -> reportCallIssue server action ([id]/actions.ts:15); works identically in the pane and on the [id] route. No redirect pattern involved (useActionState, no ?saved=), nothing to convert.
- Live call -> LiveRefresh polls router.refresh() every 5s; on the split view this refreshes list and pane together (both are server-rendered from the same route).
- Deep links INTO the [id] route keep working unchanged: notifications bell (lib/dashboard/notifications.ts:62), calendar booking chips and View call links (app/dashboard/calendar/page.tsx:235,380,415). Note: 04_appointments.md's rebuild replaces the booking chips with a dots-only grid, so after 04 ships the surviving calendar sources are the agenda/requests View call links. (RecentCalls and CallSummariesList are orphans - see 02_home.md Moves and cuts)
- Deep link INTO the list: Home's Missed tile links /dashboard/calls?status=unanswered (see 02_home.md); URL param values (completed/unanswered/active) are unchanged, only labels rename.
- Multi-entity gating: Assistant column/meta only when >1 assistant. No other switchers on this page.
- Modals: none. The ReportIssue details-popover stays a popover.

## Moves and cuts
- Absorbed: the [id] detail experience moves into the list page as the ?selected= pane. Component reuse:
  - Verbatim: TranscriptView.tsx (already localized), LiveRefresh.tsx (no strings), statusTone signature in status.ts (re-keyed input only), [id]/loading.tsx.
  - Adapted (localization only): Recording.tsx ("Download", audio fallback line), Transcript.tsx (elapsedTitle "into the call", Transcript.tsx:19), ReportIssue.tsx (all strings), [id]/actions.ts (error strings), ActionItems.tsx (TYPE_LABEL, status badge words, "urgent" pill, plus locale-aware booking time formatting).
  - Decomposed: [id]/page.tsx body -> shared CallDetailBody with a pane/page variant; [id]/page.tsx becomes a wrapper.
- Kept route: /dashboard/calls/[id] survives as a real route (deep links + mobile full-screen). No redirect shim needed in this area - nothing is cut from the route table.
- Cut: raw carrier status labels (statusLabel display path for the UI; the helper stays for internal use), the always-on Assistant column for single-assistant accounts, the "N turns" jargon subtitle (replaced by the ReportIssue action alone in the transcript card header).
- Copy cut from dictionaries: "Twilio" and "Call SID" mentions in t.calls.description and t.calls.emptyBody (jargon ban); transcript speaker label t.data.talkAi value changes from "AI" to "Receptionist"; "AI summary" heading becomes "Summary".
- Preserved UI-less server actions: none owned by this area (reportCallIssue keeps its UI).

## Implementation steps
1. Dictionaries (all 8 files: lib/i18n/dictionaries/en.ts, de.ts, es.ts, fr.ts, it.ts, nl.ts, pt.ts, sk.ts):
   - Rename status labels in t.calls: statusCompleted -> "Answered", statusUnanswered -> "Missed" (statusActive already "In progress"); reuse the same three keys for row/detail badges.
   - Rewrite t.calls.description and t.calls.emptyBody without Twilio/Call SID.
   - Add t.calls.detail block: recording title/subtitle, download, audioUnsupported, transcript title, summary title, summaryLive, summaryNone, actions title/subtitle, live, actionBooking/actionMessage/actionTransfer, actionDone/actionPending/actionFailed, urgent, elapsedIntoCall, selectPrompt, noDetailTooltip, report* (button, sent, question, placeholder, send, sending, errorEmpty, errorTooLong, errorNotSignedIn, errorNotFound, errorGeneric). Sentiment badges reuse t.data.sentimentPositive/sentimentNeutral/sentimentNegative defined in 02_home.md step 11 - no new sentiment keys here.
   - Change t.data.talkAi value to "Receptionist" (key unchanged, en.ts:99).
2. Status mapping: add bucketLabel helper next to statusTone in app/dashboard/calls/status.ts that takes (t, status, dateIso) and returns the localized bucket label via statusBucket (already exported from lib/dashboard/calls/index.ts:3); re-key statusTone to accept the bucket. Apply in CallTable and CallDetailBody.
3. Extract CallDetailBody: new app/dashboard/calls/CallDetailBody.tsx server component from [id]/page.tsx:46-133 with variant "pane" (single column, fixed header + recording, scrollable body containing summary, actions, transcript) and "page" (current 3-col grid). Replace hardcoded strings ([id]/page.tsx:50-51, 57, 77, 97-99, 106, 111-112, 121, 128) with t.calls.detail keys.
4. Localize adapted components: Recording.tsx:7,15; Transcript.tsx:19 (pass a translated elapsed template or the label string down); ActionItems.tsx:5-9 TYPE_LABEL and :117 status badges via dictionary, format booking times with the active locale instead of "en-US" (ActionItems.tsx:32-39); ReportIssue.tsx:16,24,32,38,43-45 via useT; [id]/actions.ts:21-30,60 error strings via getDictionary (or return codes the client maps).
5. Rework app/dashboard/calls/page.tsx: read sp.selected; fetch getCallLog, listAssistants, and (in a nested Suspense keyed by selected) getCallDetail; auto-select newest dbId row when selected is absent/invalid; render the md+ split (list pane + detail pane) and the <md card list; AiAvatar empty states.
6. Compact the list for the pane: in CallTable.tsx drop the Assistant and separate Duration columns from the md+ pane rows (caller, status badge, date, duration inline); gate any assistant display to assistantCount > 1; row href = ?selected= on md+, /dashboard/calls/[id] under md; selected-row highlight; localized tooltip on dbId-less rows (CallTable.tsx:12,36-38); use t.data.unknownCaller for the "Unknown" fallback.
7. Fix CallFilters.tsx clearFilters (line 43) to preserve ?selected= when clearing q/status.
8. One-screen cap: page root md:h-[calc(100dvh-8rem)] md:overflow-hidden; list pane and detail body get min-h-0 + overflow-y-auto; verify no other zone scrolls or clips silently.
9. Slim /dashboard/calls/[id]/page.tsx to BackLink (label from t.calls.title) + CallDetailBody variant "page"; keep notFound(), LiveRefresh, force-dynamic.
10. Update skeletons: app/dashboard/calls/loading.tsx to the split layout; keep [id]/loading.tsx.
11. Regression pass on deep links: lib/dashboard/notifications.ts:62 and app/dashboard/calendar/page.tsx:235,380,415 still resolve (RecentCalls and CallSummariesList are orphans - see 02_home.md Moves and cuts); /dashboard/calls?status=unanswered from Home still filters (see 02_home.md).

## Acceptance criteria
- [ ] Desktop (md+) fits one screen: only the call list and the detail body (summary + actions + transcript) scroll; header, filters, detail header, and recording stay fixed; nothing clips silently.
- [ ] Mobile (<md) relaxes the cap: card list scrolls naturally, tapping a call opens the full-screen /dashboard/calls/[id] route.
- [ ] Selecting a call updates ?selected= without a full-page skeleton flash; the URL is shareable and restores the same selection.
- [ ] /dashboard/calls/[id] still renders standalone; all three deep-link sources (notifications bell, calendar booking chips, calendar View call links) land correctly - after 04_appointments.md's rebuild the chip source is replaced by the agenda/requests View call links (RecentCalls and CallSummariesList are orphans - see 02_home.md Moves and cuts).
- [ ] Statuses render only as Answered / Missed / In progress; no raw carrier vocabulary (busy, no-answer, queued, initiated) or Twilio/Call SID copy anywhere, including dictionaries.
- [ ] Every detail-surface string (recording, transcript, summary, actions, live badge, sentiment, report-issue form and its server errors) is localized in all 8 dictionary files; transcript speaker reads "Receptionist", not "AI".
- [ ] Search, status filter, and Clear work in the split view and preserve the current selection.
- [ ] No capability silently lost: recording playback and download, translation toggle, report an issue (both surfaces), live 5s refresh, action items detail, keyboard row activation, non-DB rows still listed.
- [ ] Assistant column/meta appears only for accounts with >1 assistant.
- [ ] Home's Missed tile deep link (?status=unanswered) shows the Missed-filtered list with the newest missed call selected.
