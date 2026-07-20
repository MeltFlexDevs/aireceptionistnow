# 01 - Dashboard shell

The frame every page doc (02-07) hangs off: nav, topbar, avatar system, help,
design language, and the shared patterns each page follows. Page docs reference
this file instead of restating it.

## Purpose and principles

- One user, one business, one receptionist, one number. The dashboard reads as
  "your receptionist's desk", not an admin panel. The org concept stays hidden.
- Minimal: 5 nav items + Settings/Help footer. Everything cut stays routable
  only as a redirect shim; server actions survive in code (the ledger below).
- One screen: every page fits a desktop viewport with exactly one named scroll
  region (mechanism spelled out once in Shared patterns).
- Self-explanatory: the avatar narrates status and empty states; the guide
  overlay is the only help surface. No jargon: never organization, org, E.164,
  Twilio, ElevenLabs, sync, provider, webhook, HMAC, p95 in UI copy.
- Persona: "your receptionist", never gendered pronouns (voice is
  user-configurable). Renames: "expressiveness" for stability, "Not assigned"
  for "Free", "Didn't reach your calendar - try again" for retry sync.

## Frame

app/dashboard/layout.tsx stays a server component: auth guard (layout.tsx:27-36),
then parallel getLocale/getDictionary/listAssistants (layout.tsx:40-44) and the
AiStatus derivation (layout.tsx:47-48). Structure is unchanged:

```
dash-bg flex min-h-screen
+- Sidebar (sticky h-screen w-64, md+ only)      Sidebar.tsx:222-230
+- flex-1 column
|  +- Topbar (sticky h-16 bg-white/80 blur)      Topbar.tsx:11
|  +- main flex-1 px-4 py-6 lg:px-8 lg:py-8      layout.tsx:56
|     +- mx-auto max-w-7xl {children}
+- DashboardGuide overlay                        layout.tsx:60
```

Shell changes:
- layout.tsx additionally fetches getOwnedNumbers(ownerId) (lib/dashboard/db.ts)
  in the existing Promise.all. AiStatus extends: "offline" when no assistant OR
  no number linked to an enabled assistant; "paused" when all assistants
  disabled; "online" otherwise. Layout passes to Sidebar: status, the primary
  number (e164), and the singleton assistant {id, enabled} for the popover's
  Pause/Resume.
- layout.tsx also passes hasCalls/hasBookings booleans (from
  getOverviewCached(ownerId), already cached 30s) to drive the celebrate
  wiring (see Avatar interactibles).
- A GuideProvider client context (exported from
  app/dashboard/components/DashboardGuide.tsx) wraps Sidebar + Topbar +
  DashboardGuide so the Help footer item and first-visit tips can open the
  overlay.
- The shell itself never scrolls internally and imposes no height cap; the
  one-screen cap is per-page (Shared patterns). Document scroll remains for
  mobile.

Topbar (app/dashboard/components/Topbar.tsx:9-23) keeps: MobileNav hamburger
(md:hidden), then right-aligned LanguageSwitcher, NotificationsBell, UserMenu.
No search, no additions. NotificationsBell rows keep deep-linking to
/dashboard/calls/[id]; its "View all calls" footer link stays.

Mobile nav (app/dashboard/components/MobileNav.tsx): keep the hamburger +
w-64 slide-in drawer reusing Brand + DashboardNav (MobileNav.tsx:61-62), close
on overlay/Escape/route change, body scroll lock (MobileNav.tsx:19-30). The
drawer inherits the new 5-item nav, footer Settings + Help, avatar status chip,
and avatar popover automatically. Localize the hardcoded aria labels "Open
menu" (MobileNav.tsx:37) and "Navigation" (MobileNav.tsx:55) via new nav dict
keys.

## Left menu

Final nav, flat, no group title (the single-group title is already hidden,
Sidebar.tsx:196). Labels come from dict nav keys; icons from
app/dashboard/icons.tsx.

| # | Label (en)   | Slug                 | Icon (icons.tsx)  | Dict key        |
|---|--------------|----------------------|-------------------|-----------------|
| 1 | Home         | /dashboard           | Grid (:25)        | nav.overview -> "Home" |
| 2 | Calls        | /dashboard/calls     | Phone (:29)       | nav.calls       |
| 3 | Appointments | /dashboard/calendar  | Calendar (:33)    | nav.appointments|
| 4 | Knowledge    | /dashboard/knowledge | Sparkle (:101)    | nav.knowledge   |
| 5 | Receptionist | /dashboard/assistant | Bot (:49)         | nav.assistants -> "Receptionist" |

Footer (mt-auto, Sidebar.tsx:211):
- Settings -> /dashboard/settings, Gear (:65), nav.settings.
- Help -> a button, not a Link: calls useGuide().open() to show the
  DashboardGuide overlay. Icon Info (:113). New key nav.help. Active-state
  styling never applies (no route).

Full route table - ALL existing slugs are kept; cut routes become redirect
shims (server actions stay in code, UI removed):

| Existing route             | Fate      | Target / new label                       |
|----------------------------|-----------|------------------------------------------|
| /dashboard                 | kept      | nav label "Home"; absorbs analytics via ?range= (see 02) |
| /dashboard/calls           | kept      | master-detail via ?selected= (see 03)    |
| /dashboard/calls/[id]      | kept      | real route survives (bell + calendar chips deep-link; mobile full-screen) |
| /dashboard/calendar        | kept      | nav label "Appointments" (see 04)        |
| /dashboard/knowledge       | kept      | promoted to the single editable knowledge surface (see 05) |
| /dashboard/assistant       | kept      | nav label "Receptionist" (see 06)        |
| /dashboard/assistant/[id]  | kept      | singleton accounts land here directly    |
| /dashboard/settings        | kept      | footer only, 3 tabs (see 07)             |
| /dashboard/company         | cut       | redirect /dashboard/knowledge            |
| /dashboard/company/[id]    | cut       | redirect /dashboard/knowledge            |
| /dashboard/analytics       | cut       | redirect /dashboard?range=month          |
| /dashboard/numbers         | cut       | redirect /dashboard/assistant            |
| /dashboard/numbers/[id]    | cut       | redirect /dashboard/assistant            |
| /dashboard/integrations    | cut       | redirect /dashboard/calendar             |
| /dashboard/tutorial        | cut       | redirect /dashboard (guide overlay replaces it) |

Preserved UI-less server actions (the ledger - keep the files, repoint any
redirect()/revalidatePath targets that name a cut route):
- app/dashboard/assistant/actions.ts: registerCnamAction (operator task).
- app/dashboard/numbers/actions.ts: addNumberAction, buyNumberAction,
  updateNumberAction, deleteNumberAction (operator tasks).
- app/dashboard/company/actions.ts: createOrganizationAction (provisioning +
  zero-org auto-create from Knowledge), deleteOrganizationAction (account
  closure is a support/billing flow), toggleAssistantOrganizationAction
  (provisioning automates membership; multi-org edges via support).
- Integrations CRM: createCrmAction/deleteCrmAction (feature unshipped; the
  blurred Developer/CRM section is cut everywhere).
- The "Setup required" operator-env badge on integrations is cut (users cannot
  fix env vars).

## Avatar interactibles

The complete catalog. Two characters share one visual system: AiAvatar
(app/onboarding/AiAvatar.tsx, static, server-safe) and LiveAvatar
(app/onboarding/LiveAvatar.tsx, client, motion/react). Doc 01 owns this list;
page docs only reference entries.

Moods - `mood` prop, type Mood (app/onboarding/personality.ts:13); mouth
shapes in MOUTHS (AiAvatar.tsx:10):
- greeting (blank-slate wave; heads empty states), friendly (default), calm,
  confident, bright (open grin; guide open), celebrate (sparkles, SPARKS
  AiAvatar.tsx:22), studying (focused mouth; heads Knowledge).
- Voice-derived mood: voicePersonality/moodForVoiceId (personality.ts:32,44).
- Route moods: BRAND_MOODS (Sidebar.tsx:88-93). Keep knowledge -> studying,
  assistant -> greeting, settings -> calm, default friendly. Drop the
  analytics -> confident entry (route cut).

Activities/scenes - `activity` prop, type Activity (LiveAvatar.tsx:18),
rendered by DeskProps bottom-right with pop-in/out:
- phone: handset buzzes ~1.7s with ring chirps, eyes clock it, swings to ear
  with a greeting nod, then alternates talking/listening every 1.7s
  (LiveAvatar.tsx:168-210, prop art :341-427).
- calendar: desk calendar pops in, tick self-draws (LiveAvatar.tsx:430-466).
- chart: 3 bars spring-grow staggered (LiveAvatar.tsx:468-495).
- study: open book bobs (LiveAvatar.tsx:497-520).
- gear: 8-tooth gear rotates 360deg/7s (LiveAvatar.tsx:522-554).
- Route mapping: BRAND_ACTIVITIES (Sidebar.tsx:80-86): calls -> phone,
  calendar -> calendar, knowledge -> study, settings -> gear. The now-dead
  chart entry (analytics cut) RETARGETS to /dashboard?range=month so the chart
  scene plays when the Home month view is open.

Nudge - `nudge` counter prop (LiveAvatar.tsx:115-120): 0.42s forward nod.
Driven on route change by Sidebar Brand (Sidebar.tsx:107-112) and
DashboardGuide (DashboardGuide.tsx:51-56). Keep.

Rewind - `rewind` counter prop (LiveAvatar.tsx:124-130): backward lean wobble,
eyes glance left. Onboarding-only today; stays unused in the dashboard.

Idle desk scenes - Sidebar Brand state (Sidebar.tsx:117-134): on routes
without a mapped activity, every 12-18s the receptionist acts out phone (60%)
or calendar for 5.6s; cleared when a route activity takes over; off under
reduced motion. Keep.

Eyes - cursor tracking via window pointermove -> springed eyeX/eyeY
(LiveAvatar.tsx:66-89), idle glances after 2.6s; studying mode reads lines
left-to-right instead (LiveAvatar.tsx:93-106); prop-glance at desk props every
4.2s (LiveAvatar.tsx:214-233). Keep all.

Micro-reactions - wave hello on mount (LiveAvatar.tsx:109-112; AiAvatar via
`wave` prop -> data-wave -> ava-wave keyframes, globals.css:139-143), hover
lean-in (LiveAvatar.tsx:142-145), tap boop (LiveAvatar.tsx:237-246), ambient
talking flutter (LiveAvatar.tsx:149-162). Keep.

Breathing ring - CSS holders: .ava-ring sized by --ava-size + .ava-breathe
(globals.css:196-220), hero .ava-aura (globals.css:167-193). Sidebar mounts
the 120px ring (Sidebar.tsx:148); guide button the 56px ring
(DashboardGuide.tsx:118-119). Keep.

Status dot - `status` prop on Brand (Sidebar.tsx:158-172): emerald/amber/rose
16px dot, localized title/aria from t.home.online/paused/offline, positioned
outside .ava-ring (the `.ava-ring > span` rule paints a white disc,
globals.css:211). Keep, driven by the extended AiStatus from layout.tsx.

NEW status chip - plain-language line under the avatar, driven by the same
AiStatus prop: online -> "Answering calls", paused -> "Paused", offline ->
"No phone number yet". New dict keys (nav or home namespace). Rendered in
Brand (Sidebar.tsx) below the ring; the colored dot stays.

NEW click popover - clicking the avatar opens a status popover, NOT
navigation. Today the whole Brand is one Link (Sidebar.tsx:137); split it: the
wordmark keeps the /dashboard home link, the avatar ring becomes a button
toggling a small glass shape-card popover containing: status line with the
formatted number, Pause/Resume via EnabledToggle
(app/dashboard/assistant/EnabledToggle.tsx), and a tel: "Call to try it" link.
Props (number e164, assistant id/enabled) come from layout.tsx. New component
app/dashboard/components/AvatarStatusPopover.tsx.

NEW celebrate wiring - the unused `celebrate` prop (LiveAvatar.tsx:133-138)
fires once on first call and once on first booking: Brand receives
hasCalls/hasBookings from layout.tsx, compares against localStorage flags
(ar-celebrated-call / ar-celebrated-booking), pulses celebrate ~1.5s and sets
the flag.

Guide overlay - DashboardGuide floating 56px avatar bottom-right
(DashboardGuide.tsx:64,111-129), mood friendly closed / bright open
(DashboardGuide.tsx:123), nudge on route change. See Help system.

Empty-state narration - static AiAvatar in greeting mood narrates every empty
state (page docs specify copy); studying mood heads Knowledge. AiAvatar is
server-safe so empty states stay RSC.

Reduced motion - all of the above degrade: CSS kill-switch
(globals.css:429-448), useReducedMotion checks in LiveAvatar, MotionConfig
reducedMotion="user" in DeskProps and DashboardGuide. Avatar CSS lives in
globals.css; onboarding.css only holds onb-* scene classes around it
(onboarding.css:5).

Deferred: live-call detection (avatar picks up the phone during a real call)
is future work. LiveBanner does not carry call state; do not assume it.

## Help system

DashboardGuide (app/dashboard/components/DashboardGuide.tsx) becomes the ONLY
help surface:
- /dashboard/tutorial is cut; its page.tsx becomes a redirect shim to
  /dashboard. app/dashboard/tutorial/guide.ts is deleted once nothing imports
  it (DashboardGuide defines its own SectionKey from the dictionary type).
- The guide card keeps its current anatomy: nav label, section.purpose,
  section.can checklist, amber section.gotcha - all from t.tutorial.sections
  (DashboardGuide.tsx:91-106).
- SECTIONS route map (DashboardGuide.tsx:16-27) shrinks to the kept pages:
  calls, calendar, knowledge, assistant, settings, overview (fallback). Remove
  entries for analytics, company/organizations, numbers, integrations; their
  t.tutorial.sections content is folded into the surviving sections' copy
  where still true (e.g. number facts move into the assistant section,
  calendar-connect facts into calendar) - dictionary rewrite, all 8 locales.
- Export GuideProvider + useGuide from DashboardGuide.tsx; layout.tsx wraps
  the shell so the Help footer item (Sidebar) opens the overlay from anywhere.
- One-time first-visit tip per page: on first visit to a section key
  (localStorage ar-guide-tip:<key>), the guide card auto-opens once showing
  that section; closing it stores the flag. No spotlight/tour mechanics.

## Design language

Tokens and classes from app/globals.css - reuse, do not invent:
- Color: jet black #1D1D1D remapped over --color-black/--color-neutral-900 and
  --accent (globals.css:9-14); the ONLY semantic colors are --success #16a34a,
  --warning #ca8a04, --error #dc2626 (globals.css:18-20). Monochrome plus
  semantic accents; no new hues.
- Surfaces: .glass frosted card (globals.css:256-265) paired with .shape-card
  / .shape-card-alt (20px radii, one 4px corner, globals.css:104-109);
  .shape-pill (globals.css:110); .brand-grad 135deg near-black gradient for
  active nav pill and avatar ring (globals.css:123-125); .glass-dark
  (globals.css:266).
- Shadows: --shadow-card / --shadow-pop (globals.css:21-22), .shadow-card
  utility (globals.css:95-97).
- Backdrop: .dash-bg off-white #fafafa fixed 22px dot grid (globals.css:283-290).
- Micro-interaction: .press scale-down on :active, disabled under reduced
  motion (globals.css:411-416).
- Avatar: .ai-avatar/.ai-float/.ai-eyes/.ai-mouth/.ai-spark and
  .ava-ring/.ava-aura/.ava-breathe (globals.css:133-252).
- Focus/cursors/scrollbars: 2px accent focus-visible ring, aria-driven
  cursors, thin neutral scrollbars (globals.css:34-91).
- Typography (Tailwind defaults): page h1 text-2xl font-semibold
  tracking-tight; card titles text-sm font-medium; meta text-xs; stat values
  ~28px; micro-labels 11px uppercase tracked (as in Sidebar.tsx:197,
  DashboardGuide.tsx:78).
- Card rule: one SectionCard (app/dashboard/components/SectionCard.tsx) per
  zone; no nested cards; dropdown-in-glass z-index handled by
  .glass:has([data-el-dropdown="open"]) (globals.css:277-280).

## Shared patterns

Stated once here; every page doc (02-07) follows them.

One-screen mechanism (desktop): the page root gets
`h-[calc(100dvh-8rem)] overflow-hidden` at ALL breakpoints - extend the
existing lg-only pattern at app/dashboard/page.tsx:22
(`lg:h-[calc(100dvh-8rem)] lg:overflow-hidden`; 8rem = h-16 topbar + main
py-8). Exactly ONE named overflow-y-auto region per page (each page doc names
it), with the sole decided exception that Calls has two (list and detail body,
see 03_calls.md); every other zone is fixed-height. No silent clipping anywhere: if content
can exceed its zone, it is the named scroller or it deep-links to a fuller
view. Mobile (<md): the cap relaxes and natural page scroll is allowed.

Forms: one-topic self-saving modals; no sticky save bars. Inline save pills
replace the ?saved=/?error= redirect pattern - an action-layer conversion:
affected server actions return state to the client (useActionState) instead of
redirect(query). Each page doc lists which of its actions convert.

Avatar empty states: every empty state is narrated by a static AiAvatar in
greeting mood (studying on Knowledge) with a single primary action; no bare
icon-plus-sentence empty states.

Multi-entity gating: lists, switchers, and reassign controls render ONLY when
more than one of the entity exists (>1 org -> business-switcher chip, >1
assistant -> list and reassign select). Singleton accounts never see them.

Localization: every new or changed user-facing string lands in ALL 8
dictionary files under lib/i18n/dictionaries/: de.ts, en.ts, es.ts, fr.ts,
it.ts, nl.ts, pt.ts, sk.ts. Hardcoded English found while touching a
component gets keyed in the same pass.

Copy: persona and jargon rules from Purpose and principles apply to every
string, aria-label, and title attribute.

## Implementation steps

1. Dictionaries (all 8 files in lib/i18n/dictionaries/): retitle
   nav.overview -> "Home" and nav.assistants -> "Receptionist"; retire
   nav.analytics, nav.numbers, nav.organizations, nav.tutorial, the t.numbers
   section, and home.readyAssistants / home.readyCompanies across all 8
   dictionaries once no component reads them (t.analytics STAYS - Home's
   This-month view reuses its keys, see 02_home.md); add nav.help,
   nav.openMenu, nav.navigation (MobileNav aria); add status-chip keys
   (home.statusAnswering, home.statusPaused, home.statusNoNumber) and popover
   keys (home.callToTry); rewrite t.tutorial.sections to the 6 kept sections,
   folding still-true facts from the removed analytics/organizations/numbers/
   integrations sections into the survivors; retire nav.monitor and nav.setup
   once guide.ts (their only consumer, via whereOf) is deleted in step 9.
2. app/dashboard/layout.tsx: add getOwnedNumbers to the Promise.all; extend
   the AiStatus derivation (no linked number -> offline); fetch
   getOverviewCached-derived hasCalls/hasBookings; pass {status, number,
   assistant, hasCalls, hasBookings} to Sidebar; wrap the tree in
   GuideProvider.
3. app/dashboard/components/Sidebar.tsx: replace NAV (Sidebar.tsx:33-46) with
   the 5 items; footer = Settings link + Help button (useGuide().open());
   retarget BRAND_ACTIVITIES chart entry to fire when pathname is /dashboard
   and ?range=month is set (read via useSearchParams); drop the analytics
   BRAND_MOODS entry; split Brand into wordmark Link + avatar button; render
   the status chip under the ring.
4. New app/dashboard/components/AvatarStatusPopover.tsx: glass shape-card
   popover with status line + formatted number, EnabledToggle
   (app/dashboard/assistant/EnabledToggle.tsx), tel: link; Escape/outside
   click closes; aria-expanded on the avatar button.
5. app/dashboard/components/DashboardGuide.tsx: export GuideProvider/useGuide;
   trim SECTIONS to kept routes; add first-visit auto-open with
   localStorage ar-guide-tip:<key>; keep nudge-on-route and moods.
6. Celebrate wiring in Sidebar Brand: localStorage-guarded celebrate pulse on
   first hasCalls / first hasBookings.
7. app/dashboard/components/MobileNav.tsx: swap hardcoded aria labels for the
   new dict keys; verify drawer inherits nav, chip, popover, Help (it reuses
   Brand + DashboardNav, so no structural change).
8. Redirect shims - shim targets: /dashboard/company and
   /dashboard/company/[id] -> /dashboard/knowledge; /dashboard/analytics ->
   /dashboard?range=month; /dashboard/numbers and /dashboard/numbers/[id] ->
   /dashboard/assistant, forwarding ?error= per 06_receptionist.md;
   /dashboard/integrations -> /dashboard/calendar; /dashboard/tutorial ->
   /dashboard. Param forwarding and which co-located files are kept, moved, or
   deleted are owned per route by 02_home.md (analytics), 04_appointments.md
   (integrations), 05_knowledge.md (company), 06_receptionist.md (numbers).
9. Delete app/dashboard/tutorial/guide.ts after step 5 removes its last
   import; delete the analytics OrganizationPicker/AssistantPicker usage with
   the analytics page (kept components may be removed by doc 02's merge).
10. Repoint every redirect()/revalidatePath in preserved server actions that
    names a cut route (app/dashboard/company/actions.ts,
    app/dashboard/numbers/actions.ts, integrations actions) at the shim
    target's new owner (details in docs 05 and 06).
11. Verify: `npm run build` (or the project's check) passes; click through
    every nav item, every cut URL, the Help button, the avatar popover, and a
    reduced-motion pass.

## Acceptance criteria

- [ ] Sidebar shows exactly 5 items (Home, Calls, Appointments, Knowledge,
      Receptionist) plus footer Settings and Help; no Company, Analytics,
      Numbers, Integrations, or Tutorial entries anywhere.
- [ ] Every cut route URL redirects to its table target; no 404s; deep links
      to /dashboard/calls/[id] and /dashboard/assistant/[id] still work.
- [ ] Avatar keeps all existing behaviors (route scenes, moods, idle scenes,
      nod, eyes, breathing, status dot, reduced-motion fallbacks) and gains:
      status chip with plain wording, click popover with Pause/Resume and
      tel: link (wordmark still navigates home), celebrate on first call and
      first booking, chart scene on /dashboard?range=month.
- [ ] Help button opens the DashboardGuide overlay on every page including the
      mobile drawer; each page auto-opens its guide card exactly once.
- [ ] All new/changed strings exist in de, en, es, fr, it, nl, pt, sk; no
      hardcoded English added; MobileNav aria labels localized.
- [ ] No jargon or org leak in any shell copy (organization, Twilio, sync,
      provider, E.164 never appear).
- [ ] Shell introduces no scroll region of its own; pages own the one-screen
      cap; mobile keeps natural page scroll.
- [ ] No capability silently lost: the ledgered server actions remain in code
      and their redirect/revalidate targets point at live routes.
