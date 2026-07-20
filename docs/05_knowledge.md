# 05 - Knowledge (/dashboard/knowledge)

## Purpose
"What does my receptionist know, and how do I teach it more?" One page to read the
AI's current knowledge and edit it: add a website, upload a PDF, write notes, remove sources.

## Today
Two overlapping surfaces. /dashboard/knowledge is a read-only digest: About-you rows,
per-org card with AI summary (summarizeOrgKnowledgeCached), expandable source list with
per-source AI summaries and character counts, assistant chips, calendar capability line.
All copy is hardcoded English and says "organization" throughout (app/dashboard/knowledge/page.tsx:103-114, 241-242).
Editing lives on /dashboard/company/[id]: name form, website import, PDF dropzone, notes
textarea, assistant assign/unassign, type-to-confirm delete - six stacked cards that
scroll freely (app/dashboard/company/[id]/page.tsx:131). Every action round-trips through
?saved=1 / ?error= redirects (app/dashboard/company/actions.ts:92, 136, 174, 212, 227).
Zero-org accounts hit a dead end: a "Create an organization" button linking to
/dashboard/company (knowledge/page.tsx:109-114). Problems: org concept leaks everywhere,
duplicate surfaces, character-count jargon, no single scroller, redirect-based feedback.

## Layout
```
+----------------------------------------------------------------------+
| A  What your receptionist knows                  [business chip >1]  |
+----------------------------------------------------------------------+
| B  (avatar, studying) "What it can answer"                           |
|    AI digest sentence . . . . . . . . . . . . . . . . . . . . . .    |
+----------------------------------------------------------------------+
| C  Teach bar:  [https://yourcompany.com   ][Add website]             |
|                [ Drop a PDF here or click to browse ]  [Edit notes]  |
+----------------------------------------------------------------------+
| D  Sources (ONLY overflow-y-auto region)                             |
|    Notes                    your own words        [Edit]  [Remove]   |
|    acme.com     website     Added 2 days ago      v       [Remove]   |
|    Price list   PDF         Added 5 days ago      v       [Remove]   |
+----------------------------------------------------------------------+
| E  About you: shared / not shared -> Settings  |  Booking: 1         |
|    calendar connected -> Appointments                                |
+----------------------------------------------------------------------+
```
Zones:
- A: PageHeader with retitled heading; business-switcher chip renders ONLY when >1 org
  exists (?business= searchParam picks the active one; plain wording, never "organization").
- B: AI digest card - the kept summary sentence, Suspense + Skeleton while generating.
- C: teach bar - website form, PDF dropzone, Edit-notes button (opens modal). Fixed height.
- D: source list - the single named scroller (`overflow-y-auto`). Rows expand in place
  (details) to show the per-source AI summary. Notes render as the first row when set.
- E: one-line footer strip: About-you share status linking to /dashboard/settings, and
  booking capability line linking to /dashboard/calendar (see 04_appointments.md).

One-screen mechanism: page root gets `md:h-[calc(100dvh-8rem)] md:overflow-hidden`
(extending the lg-only pattern at app/dashboard/page.tsx:22 down to md); zones A/B/C/E are
fixed, zone D is `flex-1 min-h-0 overflow-y-auto`. Mobile (<md): the cap relaxes and the
page scrolls naturally; teach bar stacks vertically. No silent clipping anywhere.

Empty state (no sources and no notes): zone D is replaced by a static AiAvatar in
studying mood (app/onboarding/AiAvatar.tsx) narrating "Teach your receptionist about your
business - add your website, a PDF, or a few notes", pointing at the teach bar. Zero-org
accounts see the exact same state - no create-org step, the first teach action creates
the hidden org automatically.

## Content and data
- Everything loads through `getAiKnowledge(ownerId)` (lib/dashboard/ai-knowledge.ts:39):
  account, ownerNotes, organizations (OrgKnowledge: org, assistants, notes, sources), unaffiliated.
- B digest -> `summarizeOrgKnowledgeCached(entry)` (lib/dashboard/ai-knowledge.ts:92);
  cache key is a content checksum, so edits regenerate on the next render automatically.
- D rows -> `entry.sources` + `entry.notes`; per-source summary is `source.summary`,
  generated at upload time by `summarizeSourceMarkdown` (lib/dashboard/ai-knowledge.ts:143).
  Row meta: kind label (Website / PDF), relative "Added ..." time from `source.addedAt`
  (reuse relTimeOf from app/dashboard/company/[id]/page.tsx:36). NO character counts.
- E About-you -> `k.ownerNotes` truthiness, same logic as today (knowledge/page.tsx:72-78),
  compressed to one status line + Settings link (rows editing lives in 07_settings.md).
- E booking line -> `connectedCalendarCount(ownerId)` (lib/dashboard/ai-knowledge.ts:61),
  link repointed from /dashboard/integrations (knowledge/page.tsx:271) to /dashboard/calendar.
- A chip -> `k.organizations` when length > 1; active org resolved from ?business= or first.
- Server-side limits stay: MAX_SOURCE_CHARS / MAX_SOURCES (lib/knowledge/sources.ts:21-22),
  15 MB PDF, surfaced as plain-language inline errors, never as counts in the UI.

## Interactions
All teach actions move to a new app/dashboard/knowledge/actions.ts, converted from the
?saved=1 redirect pattern to state-returning actions (useActionState) with inline save
pills (pending / saved / error) - the same pill pattern 07_settings.md uses. Each action
revalidates /dashboard/knowledge and keeps the fire-and-forget agent re-sync via after()
(resyncOrgAgents pattern, app/dashboard/company/actions.ts:60-71), so saves feel instant.
- Add website (form in C) -> `addWebsiteKnowledgeAction`: fetchWebsiteMarkdown ->
  summarizeSourceMarkdown -> addSource -> updateOrganizationKnowledge
  (lib/dashboard/organizations.ts:58). Pending text on the submit button (import is slow).
- Upload PDF (dropzone in C) -> `addPdfKnowledgeAction`: parsePdfMarkdown -> same chain.
  UploadDropzone auto-submits on file pick (moved component, see below).
- Edit notes (button in C, Edit on notes row in D) -> NotesModal: one-topic self-saving
  modal with the textarea + examples hint -> `updateKnowledgeNotesAction`. No sticky bars.
- Remove source (per row in D) -> `removeKnowledgeSourceAction`, per-row pending state.
  Removing the notes row clears notes via the notes action with an empty value.
- Expand/collapse a source row -> client-only details, shows the AI summary.
- Zero-org auto-create: every teach action, when the account has no org, first creates the
  hidden org through the same `createOrganization` call createOrganizationAction uses
  (lib/dashboard/organizations.ts:37), named from account_settings.company
  (getAccountSettings, lib/dashboard/account.ts) with fallback "My business", then proceeds.
- Business chip (A) -> sets ?business=<orgId>; renders only when >1 org. Teach forms carry
  the active org id as a hidden input; actions fall back to the single/first org when absent.
- Links out: Settings (E), Appointments (E). No other navigation.
Multi-entity gating: business chip >1 org only. The assistant-chip sections are cut (below);
singleton accounts see zero plumbing.

## Moves and cuts
Absorbed from /dashboard/company/[id] (app/dashboard/company/[id]/page.tsx):
- Website import form (:213-227), PDF dropzone form (:253-256), notes form (:266-281,
  becomes a modal), per-source Remove (SourceRow :47-86), UploadDropzone.tsx component.
Cut, with reasons:
- Routes /dashboard/company and /dashboard/company/[id]: replaced by redirect shims to
  /dashboard/knowledge. The org list, create form, and 3-step setup guide
  (OrganizationsList.tsx, CreateOrganizationForm.tsx) present a multi-company mental model
  a singleton B2C account must never see.
- Company-name card ([id]/page.tsx:171-190): business name moves to Settings
  "You and your business", still syncing the org row via updateOrganizationAction
  (see 07_settings.md).
- Assistant assign/unassign card ([id]/page.tsx:285-370): provisioning automates membership.
- Danger zone + DeleteOrganization.tsx ([id]/page.tsx:373-381): account closure is a
  support/billing flow.
- On the knowledge page itself: "Create an organization" empty state (:96-116), "Manage"
  links to company (:125, :153), "Assistants answering from this" (:210-233) and
  "Assistants without an organization" (:239-257) - org leak; character counts (:147, :180);
  hardcoded-English "organization" copy throughout.
Preserved UI-less server actions (the ledger, stay in app/dashboard/company/actions.ts):
- createOrganizationAction (:31) - provisioning + zero-org auto-create path.
- deleteOrganizationAction (:95) - account closure via support.
- toggleAssistantOrganizationAction (:232) - multi-org edges via support.
- updateOrganizationAction (:73) - regains UI in Settings (07_settings.md owns its
  inline-pill conversion (07 implementation step 2); this doc only repoints its
  company paths).
Cross-refs: sidebar Company nav item removal and DashboardGuide/tutorial mappings
(app/dashboard/components/Sidebar.tsx:38, app/dashboard/components/DashboardGuide.tsx:20,
app/dashboard/tutorial/guide.ts:32,42) are owned by 01_dashboard-shell.md; the
assistant-detail Organization card links to /dashboard/company
(app/dashboard/assistant/[id]/page.tsx:198,207) are cut by 06_receptionist.md.
The shims below make every stale link land correctly regardless of order.

## Implementation steps
1. Create app/dashboard/knowledge/actions.ts: move addOrgWebsiteKnowledgeAction (:141),
   addOrgPdfKnowledgeAction (:177), updateOrganizationNotesAction (:121),
   removeOrgKnowledgeSourceAction (:215) out of app/dashboard/company/actions.ts as
   addWebsiteKnowledgeAction / addPdfKnowledgeAction / updateKnowledgeNotesAction /
   removeKnowledgeSourceAction. Convert each to `(prev, formData) => {ok?, error?}` for
   useActionState: drop the redirect(?saved/?error) calls and the orgError helper path,
   return localized error strings (getDictionary in the action), keep
   revalidatePath -> "/dashboard/knowledge", keep the after() re-sync (copy
   resyncOrgAgents, company/actions.ts:60-71).
2. In the same file add `ensureActiveOrganization(ownerId, requestedId?)`: resolve the
   requested org (ownership-checked like ownedOrgOrRedirect, company/actions.ts:46-54, but
   returning an error state instead of redirecting), else the single/first org from
   listOrganizations (lib/dashboard/organizations.ts:18), else create one via
   createOrganization (:37) named from account_settings.company, fallback "My business".
3. Repoint every remaining company path in app/dashboard/company/actions.ts to
   /dashboard/knowledge: createOrganizationAction redirects (:39, :43) and
   revalidatePath (:42); ownedOrgOrRedirect (:48, :51); orgError (:57);
   updateOrganizationAction (:75, :90-92); deleteOrganizationAction (:114, :116);
   toggleAssistantOrganizationAction (:236-237, :257, :259). Keep
   revalidatePath("/dashboard/assistant") at :258.
4. Move app/dashboard/company/UploadDropzone.tsx to app/dashboard/knowledge/UploadDropzone.tsx;
   switch its strings from t.organizations.docsDrop/docsDropHint to the new t.knowledge keys.
5. Build the new page components under app/dashboard/knowledge/: NotesModal.tsx (client,
   self-saving modal + inline pill), BusinessChip.tsx (client, ?business= switcher, renders
   only when >1 org), TeachBar.tsx (website form + dropzone + notes button, useActionState
   pills), SourceList.tsx (rows, expand, remove).
6. Rewrite app/dashboard/knowledge/page.tsx to the A-E layout: getAiKnowledge +
   connectedCalendarCount as today, active org from searchParams.business, digest kept via
   the existing OrgSummary/summarizeOrgKnowledgeCached Suspense block, empty state with
   studying-mood AiAvatar, one-screen cap `md:h-[calc(100dvh-8rem)] md:overflow-hidden`
   with zone D as the only overflow-y-auto region; natural scroll below md. Repoint the
   capabilities link (:271) to /dashboard/calendar. Remove all char counts and org copy.
7. Redirect shims: replace app/dashboard/company/page.tsx and
   app/dashboard/company/[id]/page.tsx bodies with `redirect("/dashboard/knowledge")`
   (next/navigation). Delete app/dashboard/company/loading.tsx,
   app/dashboard/company/[id]/loading.tsx, OrganizationsList.tsx,
   CreateOrganizationForm.tsx, DeleteOrganization.tsx.
8. Dictionaries: add a `knowledge` section (page title, digest heading and fallbacks,
   teach-bar labels, dropzone strings, notes modal, source row meta "Added {when}",
   remove/save/pending/saved labels, empty-state narration, About-you strip, booking line,
   business chip aria) to ALL 8 dictionary files: lib/i18n/dictionaries/en.ts, de.ts,
   es.ts, fr.ts, it.ts, nl.ts, pt.ts, sk.ts. Localize the action error strings from step 1
   there too. Retire now-unused t.organizations UI keys once no component reads them.
9. Verify: zero-org account teaches on first action (org auto-created, no redirect),
   single-org account never sees the chip, >1 org switches via ?business=, old
   /dashboard/company and /dashboard/company/<id> URLs land on /dashboard/knowledge,
   every save shows an inline pill without losing scroll position, digest regenerates
   after an edit, agents re-sync in the background (server logs).

## Acceptance criteria
- [ ] Page fits one desktop (md+) screen; the source list (zone D) is the only region
      that scrolls; below md the cap relaxes to natural page scroll; nothing silently clips.
- [ ] Add website, upload PDF, edit notes (modal), and remove source all work from
      /dashboard/knowledge with inline save pills - no ?saved=/?error= redirects, no
      sticky save bar, scroll position preserved.
- [ ] A zero-org account can teach immediately: first action auto-creates the hidden org
      and succeeds; no create-organization UI exists anywhere.
- [ ] The AI digest sentence renders (with skeleton fallback) and reflects edits on the
      next view.
- [ ] Business-switcher chip appears only when >1 org exists, worded plainly; singleton
      accounts see zero multi-entity UI (no assistant chips, no assign controls).
- [ ] No jargon or org leak in copy: no "organization", "source count", or character
      counts; persona is "your receptionist"; no gendered pronouns.
- [ ] All new and changed strings exist in all 8 dictionaries (en, de, es, fr, it, nl,
      pt, sk), including action error messages; nothing hardcoded English remains on the page.
- [ ] /dashboard/company and /dashboard/company/[id] redirect to /dashboard/knowledge;
      no dashboard link targets them (in concert with 01_dashboard-shell.md and
      06_receptionist.md).
- [ ] No capability silently lost: createOrganizationAction, deleteOrganizationAction,
      toggleAssistantOrganizationAction, updateOrganizationAction remain in
      app/dashboard/company/actions.ts with all redirect/revalidatePath targets repointed;
      business-name editing reachable via Settings (07_settings.md); knowledge edits still
      trigger the background agent re-sync.
