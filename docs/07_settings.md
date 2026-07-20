# 07 - Settings (/dashboard/settings)

## Purpose
"Who am I, how do you reach me, and what am I paying for?" Account identity, alert
preferences, and plan/billing - nothing about the receptionist's behavior, calendar, or knowledge.

## Today
- One long page of three stacked SectionCard forms (app/dashboard/settings/page.tsx):
  Account (name, email read-only, company, role, phone, timezone, about, share toggle,
  lines 72-134), Notifications (email/SMS toggles, lines 136-162), Billing (PlanUsage +
  BillingPortalButton or /pricing link, lines 164-180). Well past one screen.
- Feedback is redirect-based: saveAccountAction and saveNotificationsAction
  (app/dashboard/settings/actions.ts:30, :50) end in done()/fail() helpers (actions.ts:9-16)
  that redirect with ?saved= / ?error=, rendered as top-of-page pills (page.tsx:59-66).
  Every save is a full page round-trip that loses scroll position.
- The "Company" field writes only account_settings.company (lib/dashboard/account.ts:60);
  the hidden org row keeps its own name, so renaming the business here changes nothing
  the receptionist says.
- PlanUsage (app/dashboard/components/PlanUsage.tsx:43-73) and BillingPortalButton
  (app/dashboard/settings/BillingPortalButton.tsx:13-36) are hardcoded English.
- Copy says "assistants" plural throughout (en.ts settings section, lines 354-385).

## Layout
```
+------------------------------------------------------------+
| Settings                                       (PageHeader)|  fixed
+------------------------------------------------------------+
| [ You and your business ] [ Alerts ] [ Plan and billing ]  |  fixed tab bar
+------------------------------------------------------------+
| active tab panel                                        ^  |
|   one card of fields                                    |  |  "tab panel"
|   [Save]  (Saved pill fades in next to the button)      |  |  ONLY scroller
|                                                         v  |
+------------------------------------------------------------+
```
Zones:
- Header: PageHeader, fixed.
- Tab bar: Tabs (app/dashboard/components/Tabs.tsx), fixed. Three labels, arrow-key
  navigation already built in.
- Tab panel: the page's single named overflow-y-auto region. Everything else is fixed.

One-screen mechanism (desktop): page root gets the h-[calc(100dvh-...)] +
overflow-hidden cap at all breakpoints (same pattern as app/dashboard/page.tsx, see
01_dashboard-shell.md); only the active tab panel scrolls. Mobile (<md): the cap
relaxes, natural page scroll. No silent clipping.

## Content and data
- Tab bar -> Tabs (app/dashboard/components/Tabs.tsx), client-side state only, first tab default.
- Tab 1 "You and your business":
  - Your name, Business name, Your role, Phone, Time zone, About you, share toggle ->
    getAccountSettings (lib/dashboard/account.ts:40).
  - Email (read-only) -> supabase.auth.getClaims (page.tsx:37-45).
  - Time zone -> TimezoneSelect (app/dashboard/settings/TimezoneSelect.tsx) with
    supportedTimezones (lib/dashboard/timezones.ts); keeps browser detection, live
    local-time hint, and the invalid-zone repair warning (TimezoneSelect.tsx:49, 67-75).
  - Business-name sync target -> listOrganizations (lib/dashboard/organizations.ts:18)
    to find the account's single hidden org.
  - "Your role" stays: it feeds what the receptionist can say about the owner via
    accountKnowledgeNotes (lib/dashboard/account.ts:68-77). Cutting it would silently
    lose that capability.
- Tab 2 "Alerts": notify_email and notify_sms toggles from the same getAccountSettings
  row. Copy states alerts go to the email and phone on the first tab.
- Tab 3 "Plan and billing":
  - PlanUsage (app/dashboard/components/PlanUsage.tsx) fed by getPlanContextCached
    (lib/dashboard/plan.ts, imported in page.tsx:6).
  - BillingPortalButton (app/dashboard/settings/BillingPortalButton.tsx) -> POST
    /api/billing-portal (app/api/billing-portal/route.ts, see BILLING.md) -> Stripe portal.
  - No-subscription box with /pricing link when planCtx is not active (page.tsx:171-178).
- Sign-in Hint when no userId stays (page.tsx:68-70), rendered above the tabs.

## Interactions
- Switch tab -> client state in Tabs; keyboard arrows already supported.
- Save "You and your business" -> saveAccountAction (app/dashboard/settings/actions.ts:30),
  converted to return state for an inline save pill (see steps). When the account has
  exactly one org, the same submit also syncs the org row name via
  updateOrganizationAction (app/dashboard/company/actions.ts:73) semantics, so the
  receptionist introduces the business by its new name.
- Save "Alerts" -> saveNotificationsAction (app/dashboard/settings/actions.ts:50), converted.
- "Manage billing" -> BillingPortalButton POST, redirects to the Stripe portal.
- "Choose a plan" / "Upgrade" -> /pricing (PlanUsage.tsx:54-61 and the no-subscription box).
- No modals. No destructive actions anywhere on this page.
- Multi-entity gating: business-name -> org sync runs only when exactly one org exists.
  With >1 org, the field saves account_settings.company only and a hint under it says
  each business's name is edited on the Knowledge page (business-switcher chip,
  see 05_knowledge.md).

Server actions that must convert from ?saved=/?error= redirects to returned state
(the inline-save-pill conversion, complete list for this page):
1. saveAccountAction (app/dashboard/settings/actions.ts:30) - including the
   timezoneOrFail redirect (actions.ts:18-28), which becomes a returned field error.
2. saveNotificationsAction (app/dashboard/settings/actions.ts:50).
3. updateOrganizationAction (app/dashboard/company/actions.ts:73-93) - converted here
   as part of the business-name sync (05_knowledge.md owns only the company-path
   repointing).

## Moves and cuts
- Absorbs: nothing from other pages. Same three concerns as today, re-chunked into tabs.
- What Settings does NOT absorb, and why:
  - Calendar connect/primary/disconnect/reconnect: lives entirely in the "Connected
    calendar" panel on Appointments (04_appointments.md). There is NO calendar tab here;
    one home for calendar state avoids the current settings-vs-integrations split.
  - Business facts and knowledge sources: Knowledge is the single editable knowledge
    surface (05_knowledge.md). Only the owner-profile fields (About you + share toggle)
    stay here because they describe the person, not the business.
  - Receptionist behavior, phone number, per-receptionist SMS alert number and email
    transcript address: Receptionist page (06_receptionist.md). The Alerts tab covers
    account-level preferences only.
  - Delete receptionist: type-to-confirm modal on the Receptionist page
    (06_receptionist.md), not under billing or settings.
  - Account closure / org deletion: support/billing flow; deleteOrganizationAction
    stays preserved UI-less (the cut-routes ledger, see 01_dashboard-shell.md).
  - Language: the switcher stays in the topbar (01_dashboard-shell.md).
- Cuts:
  - The ?saved= / ?error= top-of-page pills (page.tsx:59-66) - replaced by inline pills.
  - Stacked Account/Notifications/Billing cards - replaced by tabs.
  - "assistants" plural copy - persona is "your receptionist" (rewrite settings
    dictionary section; e.g. shareBody, notificationsSub, emailNotifSub, smsNotifSub
    in lib/i18n/dictionaries/en.ts:354-385).
- Note: account_settings.notify_email_address / notify_sms_number exist and are written
  by onboarding (lib/dashboard/provision.ts:155-156) but nothing reads them; no new UI
  for them in this pass - Alerts keeps the two toggles.

## Implementation steps
1. Convert actions in app/dashboard/settings/actions.ts: change saveAccountAction and
   saveNotificationsAction to (prevState, formData) => Promise<{ ok: boolean;
   error?: string }>; delete done()/fail() (lines 9-16); keep
   revalidatePath("/dashboard/settings"); timezoneOrFail returns the error instead of
   redirecting.
2. Extend the converted saveAccountAction: fetch listOrganizations(userId)
   (lib/dashboard/organizations.ts:18); if exactly one org and the business name
   changed, update the org row name via updateOrganizationAction
   (app/dashboard/company/actions.ts:73-93), converting that action here from the
   ?saved= redirect pattern to a state-returning action ({ ok, error }) consumed by
   the inline save pill, keeping its org-row update and call to resyncOrgAgents
   (company/actions.ts:60-71) so the agent picks up the new business
   name - today a rename never re-syncs, which is a gap. If >1 org, skip the sync.
3. New client form components with useActionState + SubmitButton
   (app/dashboard/components/SubmitButton.tsx): app/dashboard/settings/BusinessForm.tsx
   (all tab-1 fields incl. TimezoneSelect) and app/dashboard/settings/AlertsForm.tsx
   (two toggles). Each renders a transient "Saved" pill beside its Save button on
   ok, and the returned error inline. No sticky save bars.
4. Rebuild app/dashboard/settings/page.tsx: keep it a server component; fetch email,
   getAccountSettings, getPlanContextCached, listOrganizations in parallel; render
   PageHeader + sign-in Hint + Tabs with the three localized labels; pass data into the
   client forms; delete the saved/error searchParams handling (page.tsx:26-31, 59-66).
5. One-screen cap: root div gets h-[calc(100dvh-...)] + overflow-hidden at md+ per the
   shared mechanism (01_dashboard-shell.md); make the active tab panel the single
   overflow-y-auto region - extend Tabs (app/dashboard/components/Tabs.tsx) with an
   optional panelClassName prop (backward compatible) or wrap each panel's content in
   a scrolling container. Below md, no cap.
6. Localize PlanUsage (app/dashboard/components/PlanUsage.tsx:43-73: "Plan",
   "Active subscription", "No active subscription...", "Upgrade", "Choose a plan",
   meter labels, footer limits) - rename the "Assistants" meter label to receptionist
   wording.
7. Localize BillingPortalButton strings (BillingPortalButton.tsx:13-36: "Manage
   billing", "Opening...", "Could not open billing.").
8. Dictionary updates in ALL 8 locale files under lib/i18n/dictionaries/ (de, en, es,
   fr, it, nl, pt, sk): three tab labels, "Business name" label + sync hint (+ the
   >1-business hint), rewritten Alerts copy, plan/billing strings from steps 6-7,
   the shared "Saved" pill string, and the de-jargoned settings section (no
   "organization", no "assistants" plural).
9. Update app/dashboard/settings/loading.tsx to match the new shape: header + tab bar
   + one card skeleton instead of three stacked cards.
10. Coordinate with 05_knowledge.md: the Knowledge page's About-you strip link keeps
    targeting /dashboard/settings (tab 1 is the default, so a plain link still lands right).
11. Copy pass: description string drops "assistants" plural; confirm no "organization",
    no vendor names (the Stripe portal button says "Manage billing", never "Stripe").

## Acceptance criteria
- [ ] Fits one desktop screen at all md+ breakpoints; only the active tab panel scrolls;
      below md the page scrolls naturally; nothing is silently clipped.
- [ ] Exactly three tabs: You and your business, Alerts, Plan and billing. No calendar
      tab (calendar lives on Appointments, 04_appointments.md). No delete buttons of
      any kind on this page.
- [ ] Saving either form shows an inline pill next to its Save button with no full-page
      redirect, no scroll jump, and no ?saved=/?error= URL params; errors (including
      an invalid time zone) appear inline in the form.
- [ ] With exactly one business, saving a changed business name updates the org row and
      triggers the agent re-sync; with more than one, the sync is skipped and the hint
      points to Knowledge. The word "organization" appears nowhere.
- [ ] No capability silently lost: role field, share toggle, timezone detection and
      repair warning, email read-only display, billing portal, /pricing links, and the
      signed-out Hint all survive.
- [ ] Every new or changed string exists in all 8 dictionary files (de, en, es, fr, it,
      nl, pt, sk), including PlanUsage and BillingPortalButton, which are hardcoded
      English today.
- [ ] No jargon in copy: no "assistants" plural, no vendor names, receptionist persona
      throughout, no gendered pronouns.
- [ ] Tab bar remains keyboard-accessible (Tabs arrow-key behavior unchanged).
