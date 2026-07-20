# 06 - Receptionist (/dashboard/assistant)

## Purpose
"Who is answering my phone, on what number, and how does it behave?" One place to see, test, and tune the receptionist. Slug stays /dashboard/assistant; nav label retitles to "Receptionist" (see 01_dashboard-shell.md).

## Today
- List page (app/dashboard/assistant/page.tsx) always shows a create form plus row list - pointless for the typical single-receptionist account.
- Detail page (app/dashboard/assistant/[id]/page.tsx) is ~8 stacked SectionCards behind two tabs with a sticky Save bar (lines 385-393); far past one screen.
- Phone number is a small line in a card (lines 154-186) with a "Twilio" StatusRow leaking the vendor (lines 176-182).
- Organization SectionCard (lines 188-212) leaks the hidden org concept; blurred CRM "coming soon" card (lines 342-381) is dead weight.
- updateAssistantAction (app/dashboard/assistant/actions.ts:83-205) rebuilds EVERY field from formData on save - any partial submit silently wipes transfer number, SMS alerts, calendar access, email transcripts and resets name and language. Details in Interactions.
- Numbers area (/dashboard/numbers + /numbers/[id]) duplicates number management; its reassign select labels unassigned as "Free" (app/dashboard/numbers/[id]/page.tsx:62).
- Hardcoded English all over: EnabledToggle.tsx:27,41, TestCallButton.tsx:9,25, DeleteAssistant.tsx modal body, AdvancedVoiceSettings.tsx slider labels, most detail-page card titles and pills.
- Feedback travels via ?saved=1 / ?error= redirects; ?calling=1 (actions.ts:327) is set but never rendered.

## Layout
```
+------------------------------------------------------------------+
| banner strip: error / notice / saved / calling pills (fixed)     |
+------------------------------------------------------------------+
| HERO BAND (fixed)                                                |
| [avatar 52px]  Name            | PHONE NUMBER (labeled card)     |
|  On duty (dot) [Pause/Resume]  |  +1 (415) 555-0142  (LARGE)     |
|  [Test call]                   |  or GetNumberForm / "Not        |
|                                |  assigned" | Unlink | Reassign  |
+------------------------------------------------------------------+
| SETTINGS REGION  << the ONLY overflow-y-auto scroller >>         |
| Phase 1: existing Tabs (Settings | Advanced) + sticky Save bar   |
| Phase 2: one-topic cards opening self-saving modals:             |
|  [Voice] [Greeting] [When to pass a call to you]                 |
|  [Booking appointments] [Fine-tune]                              |
+------------------------------------------------------------------+
```
Zones: banner strip (fixed), hero band (fixed), settings region (named scroller "settings").
- One-screen mechanism: page root gets h-[calc(100dvh-8rem)] + overflow-hidden at md+ (extend the lg-only pattern from app/dashboard/page.tsx to all desktop breakpoints); the settings region is the single overflow-y-auto area; hero and banners never scroll. Modal bodies (Phase 2) scroll internally.
- Mobile (<md): the height cap relaxes, natural page scroll; hero stacks above the settings region; no clipping.
- Singleton skip: /dashboard/assistant with exactly one assistant redirects straight to /dashboard/assistant/[id] (search params forwarded). The auto-redirect fires ONLY when exactly 1 assistant exists - never with 0 - so the zero case cannot loop. The list + CreateAssistantForm render only when >1 assistant exists; a small "Add another receptionist" link shows on the detail page only when plan allows more (getPlanContextCached usage.assistants < limits.assistants, lib/dashboard/plan.ts:18-21, lib/plans.ts:12).
- Zero-assistant state: /dashboard/assistant with 0 assistants renders the shared empty-state pattern - static AiAvatar in greeting mood narrating, with CreateAssistantForm as the single primary action (01_dashboard-shell.md Shared patterns). deleteAssistantAction redirects to /dashboard/assistant, so deleting the last receptionist lands here, not on a dead end.

## Content and data
- Hero avatar: AiAvatar + moodForVoiceId (already used at [id]/page.tsx:116-125).
- Name: assistant.name (getAssistant, lib/dashboard/db). Phase 1: display only in hero, edited via the Basics tab below - a hero-only name save is unsafe until the patch refactor (see Interactions). Phase 2: inline-editable, self-saving.
- On-duty status: assistant.enabled -> "On duty" / "Paused" chip + EnabledToggle (app/dashboard/assistant/EnabledToggle.tsx).
- Phone number card (labeled "Phone number"): getAssistantNumber -> country flag (countryFromPhone) + formatPhone(e164) rendered large; StatusDot tone kept but the "Twilio" label and "Not configured" detail text are cut (operator-only info, vendor leak).
  - No number: GetNumberForm (app/dashboard/assistant/GetNumberForm.tsx) - pool-claim path (lines 30-49) or country pick + buy path (lines 51-100), credits from getPlanContextCached limits.minutesIncluded.
  - Has number: Unlink button (unlinkNumberAction) and, ONLY when >1 assistant exists, a reassign select posting setAssistantAction (app/dashboard/numbers/actions.ts:123-181) with the unassign option relabeled "Not assigned" (today "Free", app/dashboard/numbers/[id]/page.tsx:62). Never a kebab menu.
- Test call: TestCallButton (app/dashboard/assistant/TestCallButton.tsx) in the hero, in its own form with hidden assistant_id and hidden to = routing.transferTo; disabled with a plain hint when no transfer number is set. testCallAction reads to ?? transfer_to (actions.ts:305).
- Settings region content (both phases) maps to existing form fields on [id]/page.tsx: greeting (line 227), voice (VoiceSelect, line 231), system_prompt (lines 243-250), transfer_to + sms_alerts (lines 257-280), per-calendar none/read/write selects (lines 282-311) - the three-level select STAYS, do not collapse to a toggle; calendar connect/disconnect itself lives on Appointments (see 04_appointments.md) - voice speed/stability sliders and per-language voices (AdvancedVoiceSettings.tsx), email transcripts (lines 325-340).
- Delete receptionist: DeleteAssistant (app/dashboard/assistant/DeleteAssistant.tsx) - already type-to-confirm (name or "delete", lines 12-13). Phase 1: stays in the bottom danger-zone card. Phase 2: moves inside the Fine-tune modal. Never under billing.

## Interactions
Every user action -> server action (all in app/dashboard/assistant/actions.ts unless noted):
- Pause/Resume -> toggleAssistantEnabledAction (:287-301); optimistic, no redirect; also revalidates /dashboard (home status band, see 02_home.md).
- Get number / Assign from pool -> getAgentNumberAction (:233-285).
- Unlink -> unlinkNumberAction (:330-353).
- Reassign (gated >1 assistant) -> setAssistantAction (app/dashboard/numbers/actions.ts:123-181), redirects repointed to /dashboard/assistant/[id].
- Test call -> testCallAction (:303-328); page must render the ?calling=1 pill it already sets at :327 ("Calling your phone now"); reword the E.164 error at :310 to plain language ("Enter your number with country code, e.g. +1 415 555 0142").
- Save settings -> updateAssistantAction (:83-205). THE FULL-OVERWRITE HAZARD, cited:
  - routing is rebuilt from scratch (:113) - only greetingByLanguage / autoVoiceByLanguage survive (:109-116). transferTo and smsAlerts exist only if transfer_to was submitted (:117-120); calendar access only if cal_access_* fields were submitted (:91-99, :121); crm targets (:101-104, :122); emailTranscripts only if email_enabled=on AND email_to present (:124-128); voice sliders (:130-135); voiceByLanguage (:137-165).
  - top-level fields are overwritten unconditionally (:171-179): a missing name field resets to "My assistant" (:172), greeting / system_prompt / voice_id blank out (:173-175), language resets to "en" (:176) - the form only avoids this via a hidden language=multi input ([id]/page.tsx:232).
  - Consequence: Phase 2's one-topic modals are BLOCKED until this action gets patch semantics. Refactor: build the update object only from fields present in formData (formData.has guards), deep-merge routing over the previous value, and use explicit present-but-empty submissions to clear a field. Add a regression test: submitting only {id, greeting} must preserve transfer number, SMS alerts, calendar access, email transcripts, name, voice, language.
  - syncAssistantAgent is awaited on every save (:184-193, comment at :184-185: rapid saves must serialize, failures must reach the user). Every Phase 2 modal save therefore takes seconds (agent + knowledge sync). UX: modal stays open with a pending state ("Updating your receptionist...") until the sync resolves; success shows an inline save pill; do not fire-and-forget.
- Delete -> deleteAssistantAction (:207-229) behind type-to-confirm.
- Create (only when list renders) -> createAssistantAction (:59-81) with the existing progress overlay.
Modals (Phase 2, each self-saving via the patched action): Voice (default voice, speed, expressiveness), Greeting, "When to pass a call to you" (transfer number, SMS alerts, test call), "Booking appointments" (per-calendar three-level access select), Fine-tune (role prompt, per-language voices, email transcripts, delete receptionist).
Multi-entity gating: list/create only when >1 assistant (or "Add another" link when plan allows more); reassign select only when >1 assistant; singleton sees none of it.

## Moves and cuts
Absorbed:
- /dashboard/numbers list + /dashboard/numbers/[id] reassign -> the hero Phone number card (GetNumberForm, unlink, gated reassign). Both routes become redirect shims to /dashboard/assistant.
Cut (with reason):
- Organization SectionCard ([id]/page.tsx:188-212) - org concept must stay hidden; knowledge management lives on Knowledge (see 05_knowledge.md).
- Blurred CRM "coming soon" SectionCard ([id]/page.tsx:342-381) and crm_target_* form fields - feature unshipped, cut everywhere.
- "Twilio" StatusRow + "Not configured" detail ([id]/page.tsx:176-182) - vendor jargon, operator-only diagnostics.
- Numbers list page status badges (Live / Not connected / Available) - the singleton hero states replace them.
Renames: "Free" -> "Not assigned"; "Stability" -> "Expressiveness" (AdvancedVoiceSettings.tsx:88-93); statuses phrased "On duty" / "Paused"; copy says "your receptionist", never gendered pronouns, never organization / E.164 / Twilio / ElevenLabs (the voice-import notice at actions.ts:197-203 mentions "ElevenLabs account" - reword).
Preserved UI-less server actions (the ledger - keep code, no UI):
- registerCnamAction (app/dashboard/assistant/actions.ts:355-379) - caller-ID registration, operator task.
- addNumberAction (app/dashboard/numbers/actions.ts:52-84), buyNumberAction (:86-121), updateNumberAction (:183-215), deleteNumberAction (:217-240) - operator number-inventory tasks.
- app/dashboard/numbers/voiceActions.ts (loadVoices / loadLibraryVoices) is NOT dead: VoiceSelect imports it and the detail page imports VoiceSelect and languages from numbers/ ([id]/page.tsx:17-18) - keep the numbers/ directory modules, shim only the two pages.

## Implementation steps
One ordered checklist across both phases; sibling docs reference these steps by number.

Phase 1 - hero band above the existing tabbed form (plan explicitly: ship this first, no modal work):
1. [ ] app/dashboard/assistant/page.tsx: fetch assistants + getPlanContextCached; when exactly 1 assistant (and only then), redirect to /dashboard/assistant/[id] forwarding ?error/?notice; when 0 assistants, render the shared empty state (AiAvatar in greeting mood + CreateAssistantForm, per 01_dashboard-shell.md Shared patterns) - deleteAssistantAction redirects here, so the 0 case must render, never redirect, or deleting the last receptionist loops; render list + CreateAssistantForm only when >1.
2. [ ] app/dashboard/assistant/[id]/page.tsx: build the hero band (avatar, name display, On duty chip + EnabledToggle, Phone number card with large formatted number / GetNumberForm / Unlink / gated reassign select, TestCallButton in its own form with hidden to); add an "Add another receptionist" link gated on plan limits.
3. [ ] Same file: cut the Organization SectionCard (188-212), the CRM SectionCard (342-381), and the Twilio StatusRow (176-182); render the ?calling=1 pill.
4. [ ] Reassign select posts setAssistantAction; repoint every redirect and revalidatePath in app/dashboard/numbers/actions.ts from /dashboard/numbers[...] to /dashboard/assistant[/(id)]: setAssistantAction (:131, :135, :142, :175, :178, :180), requireNumberOwner (:48), and the preserved UI-less actions addNumberAction (:56, :63, :70, :79, :82, :83), buyNumberAction (:92, :102, :109, :119, :120), updateNumberAction (:185, :207, :212, :213, :214), deleteNumberAction (:237, :239); relabel the unassign option "Not assigned".
5. [ ] Redirect shims: replace app/dashboard/numbers/page.tsx and app/dashboard/numbers/[id]/page.tsx with server redirects to /dashboard/assistant (forward ?error=); keep actions.ts, voiceActions.ts, VoiceSelect.tsx, languages.ts, voices.ts in place.
6. [ ] One-screen cap: root h-[calc(100dvh-8rem)] + overflow-hidden at md+, settings region (the Tabs form) becomes the single overflow-y-auto scroller; sticky Save bar survives Phase 1 inside it; cap relaxes below md.
7. [ ] Localize + de-jargon all touched strings in ALL 8 dictionaries (lib/i18n/dictionaries/en.ts, de.ts, es.ts, fr.ts, it.ts, nl.ts, pt.ts, sk.ts): hero labels ("Phone number", "On duty", "Paused", "Not assigned", "Test call", "Calling your phone now"), EnabledToggle.tsx (Active/Disabled/Enable/Disable), TestCallButton.tsx, DeleteAssistant.tsx modal, AdvancedVoiceSettings.tsx (Speaking speed, Expressiveness + hints), detail-page card titles/pills ("Settings saved.", English-only banner, Basics, Role, Calendar access, Voice options, Danger zone), reworded E.164 and voice-import messages.

Phase 2 (BLOCKED on the patch-semantics refactor) - one-topic self-saving modals; do not start modal UI before it lands:
8. [ ] Refactor updateAssistantAction (app/dashboard/assistant/actions.ts:83-205) to patch semantics: formData.has guards for every top-level field, deep-merge routing over prevRouting, explicit clears; drop the hidden language=multi crutch; regression test proving a partial submit preserves transfer number, SMS alerts, calendar access, email transcripts, name, voice, language.
9. [ ] Convert redirect feedback to inline save pills (action-layer conversion, budget it): updateAssistantAction (:204), getAgentNumberAction (:242, :284), unlinkNumberAction (:352), setAssistantAction (numbers/actions.ts:180), testCallAction (:327) - return state instead of ?saved/?calling redirects; error redirects become returned errors rendered inline.
10. [ ] Build the five modals (Voice, Greeting, When to pass a call to you, Booking appointments incl. the three-level calendar access select, Fine-tune incl. per-language voices, role prompt, email transcripts); each save awaits syncAssistantAgent with a visible pending state and inline pill on completion.
11. [ ] Move DeleteAssistant into the Fine-tune modal (keep type-to-confirm); remove the Tabs form and the sticky Save bar; settings region becomes the topic-card grid.
12. [ ] Dictionary pass for all modal titles, pending copy ("Updating your receptionist..."), and pill strings in the same 8 files.

## Acceptance criteria
- [ ] Desktop (md+): page fits one screen; only the named "settings" region scrolls; hero, banners, and Phone number card never scroll; below md natural page scroll, nothing clipped.
- [ ] A singleton account never sees the assistant list or create form; /dashboard/assistant lands directly on the receptionist.
- [ ] Deleting the last receptionist lands on the create empty state (AiAvatar in greeting mood + CreateAssistantForm) at /dashboard/assistant - no dead end, no redirect loop.
- [ ] Phone number renders LARGE in a card labeled "Phone number"; get/claim, unlink, and (only with >1 assistant) reassign all work from this page; unassigned state reads "Not assigned"; no kebab menu anywhere.
- [ ] /dashboard/numbers and /dashboard/numbers/[id] redirect to /dashboard/assistant; no capability silently lost: number get/buy/claim, unlink, reassign, test call, per-language voices, three-level calendar access select, email transcripts, delete (type-to-confirm) all remain reachable; registerCnam/add/buy/update/deleteNumber actions remain in code.
- [ ] No jargon or org leak in copy: no "organization", "Twilio", "ElevenLabs", "E.164", "sync", "Free", "stability"; no gendered pronouns; persona is "your receptionist".
- [ ] Every new or changed string exists in all 8 dictionaries (en, de, es, fr, it, nl, pt, sk); EnabledToggle, TestCallButton, DeleteAssistant, AdvancedVoiceSettings no longer hardcode English.
- [ ] Phase 2 gate honored: no one-topic modal ships before updateAssistantAction has patch semantics with a passing regression test that a partial submit preserves transfer number, SMS alerts, calendar access, email transcripts, name, and language.
- [ ] Every modal save awaits the agent sync with a visible pending state; failures surface inline to the user, not a server log; feedback is inline pills, not ?saved= redirects.
- [ ] Organization card and CRM card are gone; sidebar nav shows "Receptionist" (01_dashboard-shell.md).
