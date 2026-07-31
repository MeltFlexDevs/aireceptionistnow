import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAssistantPatch, SECTION, type PatchPrev } from "./assistant-patch";

/**
 * Regression suite for the save hazard described in 06_receptionist.md.
 *
 * The old action rebuilt EVERY field from formData on every save, so a partial
 * submit silently wiped whatever that form did not happen to carry. It is
 * invisible to tsc, to the build, and to lint - the only thing that catches it
 * is a test that submits one field and asserts the rest survived.
 */

const PREV: PatchPrev = {
  name: "Front desk",
  greeting: "Hi, thanks for calling Acme.",
  system_prompt: "You are the front desk for Acme.",
  voice_id: "voice-abc",
  language: "multi",
  routing: {
    greetingByLanguage: { de: "Hallo" },
    autoVoiceByLanguage: { de: "voice-de" },
    transferTo: "+14155550199",
    smsAlerts: true,
    calendar: { access: [{ integrationId: "cal-1", level: "write" }] },
    crm: { targets: [{ integrationId: "crm-1" }] },
    emailTranscripts: { enabled: true, to: "owner@acme.com" },
    voice: { speed: 1.1, stability: 0.8 },
    voiceByLanguage: { de: "voice-de-custom" },
    transferHours: {
      timezone: "Europe/Bratislava",
      days: [
        null,
        { start: "09:00", end: "17:00" },
        { start: "09:00", end: "17:00" },
        { start: "09:00", end: "17:00" },
        { start: "09:00", end: "17:00" },
        { start: "09:00", end: "17:00" },
        null,
      ],
    },
  },
};

const CTX = { calendarIds: ["cal-1"], crmIds: ["crm-1"] };

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

test("a partial submit preserves everything it did not carry", () => {
  // The canonical case from the doc: only the greeting was edited.
  const patch = buildAssistantPatch(fd({ id: "a1", [SECTION.basics]: "1", greeting: "New greeting" }), PREV, CTX);

  assert.equal(patch.top.greeting, "New greeting");

  // Nothing else in the form -> nothing else changes.
  assert.equal(patch.routing.transferTo, "+14155550199", "transfer number survived");
  assert.equal(patch.routing.smsAlerts, true, "SMS alerts survived");
  assert.deepEqual(patch.routing.calendar, PREV.routing.calendar, "calendar access survived");
  assert.deepEqual(patch.routing.crm, PREV.routing.crm, "CRM targets survived");
  assert.deepEqual(
    patch.routing.emailTranscripts,
    PREV.routing.emailTranscripts,
    "email recaps survived",
  );
  assert.deepEqual(patch.routing.voice, PREV.routing.voice, "voice sliders survived");
  assert.deepEqual(
    patch.routing.voiceByLanguage,
    PREV.routing.voiceByLanguage,
    "per-language voices survived",
  );

  // Top-level fields the form did not carry must be absent from the patch
  // entirely, so the DB write leaves them alone.
  assert.equal("system_prompt" in patch.top, false, "role not touched");
  assert.equal("voice_id" in patch.top, false, "voice not touched");
  assert.equal("language" in patch.top, false, "language not touched");
});

test("name never resets to a placeholder when submitted empty", () => {
  // The old code defaulted a blank name to "My assistant".
  const patch = buildAssistantPatch(fd({ id: "a1", [SECTION.basics]: "1", name: "   " }), PREV, CTX);
  assert.equal(patch.top.name, "Front desk");
});

test("language is never silently reset to en", () => {
  // The old code defaulted a missing language to "en"; the form only avoided
  // that with a hidden language=multi crutch.
  const patch = buildAssistantPatch(fd({ id: "a1", [SECTION.role]: "1", system_prompt: "x" }), PREV, CTX);
  assert.equal("language" in patch.top, false);

  const explicit = buildAssistantPatch(
    fd({ id: "a1", [SECTION.basics]: "1", language: "de" }),
    PREV,
    CTX,
  );
  assert.equal(explicit.top.language, "de");
});

test("voice sliders survive a submit that omits them", () => {
  // Number(null) is 0 and Number.isFinite(0) is true, so the old code floored
  // speed to the clamp minimum (0.7) and stability to 0 on any partial save.
  const patch = buildAssistantPatch(fd({ id: "a1", [SECTION.alerts]: "1" }), PREV, CTX);
  assert.deepEqual(patch.routing.voice, { speed: 1.1, stability: 0.8 });
});

test("voice sliders present but blank do not floor to the clamp minimum", () => {
  // Number("") is also 0, so a `formData.has` guard alone is not enough.
  const patch = buildAssistantPatch(
    fd({ id: "a1", [SECTION.voice]: "1", voice_speed: "", voice_stability: "" }),
    PREV,
    CTX,
  );
  assert.deepEqual(patch.routing.voice, { speed: 1.1, stability: 0.8 });
});

test("voice sliders update and clamp when actually submitted", () => {
  const patch = buildAssistantPatch(
    fd({ id: "a1", [SECTION.voice]: "1", voice_speed: "9", voice_stability: "0.25" }),
    PREV,
    CTX,
  );
  assert.deepEqual(patch.routing.voice, { speed: 1.2, stability: 0.25 });
});

test("an unchecked SMS box clears the flag only when its section was submitted", () => {
  // Unchecked checkboxes are absent from FormData, so the section marker is
  // what distinguishes "turned off" from "not on this form".
  const submitted = buildAssistantPatch(
    fd({ id: "a1", [SECTION.alerts]: "1", transfer_to: "+14155550199" }),
    PREV,
    CTX,
  );
  assert.equal(submitted.routing.smsAlerts, false, "explicitly turned off");

  const untouched = buildAssistantPatch(fd({ id: "a1", [SECTION.basics]: "1" }), PREV, CTX);
  assert.equal(untouched.routing.smsAlerts, true, "not on this form at all");
});

test("clearing the transfer number is possible, but only explicitly", () => {
  const cleared = buildAssistantPatch(
    fd({ id: "a1", [SECTION.alerts]: "1", transfer_to: "" }),
    PREV,
    CTX,
  );
  assert.equal(cleared.routing.transferTo, undefined);
  assert.equal(cleared.routing.smsAlerts, false);
});

test("calendar access is only rebuilt when its section was submitted", () => {
  const off = buildAssistantPatch(
    fd({ id: "a1", [SECTION.calendar]: "1", cal_access_cal_1: "none" }),
    PREV,
    { calendarIds: ["cal_1"], crmIds: [] },
  );
  assert.deepEqual(off.routing.calendar, { access: [] }, "explicitly set to none");

  const untouched = buildAssistantPatch(fd({ id: "a1", [SECTION.basics]: "1" }), PREV, CTX);
  assert.deepEqual(untouched.routing.calendar, PREV.routing.calendar);
});

test("busy is normalized to read", () => {
  const patch = buildAssistantPatch(
    fd({ id: "a1", [SECTION.calendar]: "1", cal_access_cal_1: "busy" }),
    PREV,
    { calendarIds: ["cal_1"], crmIds: [] },
  );
  assert.deepEqual(patch.routing.calendar, { access: [{ integrationId: "cal_1", level: "read" }] });
});

test("email recaps can be turned off explicitly", () => {
  const off = buildAssistantPatch(
    fd({ id: "a1", [SECTION.email]: "1", email_to: "owner@acme.com" }),
    PREV,
    CTX,
  );
  assert.deepEqual(off.routing.emailTranscripts, { enabled: false, to: "owner@acme.com" });
});

test("keys the sync precomputes are always carried forward", () => {
  // Wiping these re-pays ~25 Gemini calls on the next sync.
  const patch = buildAssistantPatch(fd({ id: "a1", [SECTION.basics]: "1", name: "Reception" }), PREV, CTX);
  assert.deepEqual(patch.routing.greetingByLanguage, { de: "Hallo" });
  assert.deepEqual(patch.routing.autoVoiceByLanguage, { de: "voice-de" });
});

test("a full submit still updates every section", () => {
  // Phase 1 posts the whole form; the patch must behave like the old rebuild.
  const patch = buildAssistantPatch(
    fd({
      id: "a1",
      [SECTION.basics]: "1",
      [SECTION.role]: "1",
      [SECTION.alerts]: "1",
      [SECTION.calendar]: "1",
      [SECTION.email]: "1",
      [SECTION.voice]: "1",
      name: "Reception",
      greeting: "Hello",
      voice_id: "voice-xyz",
      language: "multi",
      system_prompt: "Be helpful.",
      transfer_to: "+14155550100",
      sms_alerts: "on",
      cal_access_cal_1: "read",
      email_enabled: "on",
      email_to: "new@acme.com",
      voice_speed: "0.9",
      voice_stability: "0.4",
    }),
    PREV,
    { calendarIds: ["cal_1"], crmIds: [] },
  );

  assert.equal(patch.top.name, "Reception");
  assert.equal(patch.top.greeting, "Hello");
  assert.equal(patch.top.voice_id, "voice-xyz");
  assert.equal(patch.top.system_prompt, "Be helpful.");
  assert.equal(patch.routing.transferTo, "+14155550100");
  assert.equal(patch.routing.smsAlerts, true);
  assert.deepEqual(patch.routing.calendar, { access: [{ integrationId: "cal_1", level: "read" }] });
  assert.deepEqual(patch.routing.emailTranscripts, { enabled: true, to: "new@acme.com" });
  assert.deepEqual(patch.routing.voice, { speed: 0.9, stability: 0.4 });
});

test("per-language voices are replaced only when that panel was submitted", () => {
  const replaced = buildAssistantPatch(
    fd({ id: "a1", [SECTION.voiceLang]: "1" }),
    PREV,
    CTX,
    { fr: "voice-fr" },
  );
  assert.deepEqual(replaced.routing.voiceByLanguage, { fr: "voice-fr" });

  const untouched = buildAssistantPatch(fd({ id: "a1", [SECTION.basics]: "1" }), PREV, CTX);
  assert.deepEqual(untouched.routing.voiceByLanguage, { de: "voice-de-custom" });
});

// ── Transfer hours ──────────────────────────────────────────────────────────
// Same hazard as everything above: the schedule lives in SECTION.alerts, so a
// save that touches the transfer number must not silently clear the hours, and
// a save that touches anything else must not clear either.

function alertsForm(extra: Record<string, string>): FormData {
  return fd({ id: "a1", [SECTION.alerts]: "1", transfer_to: "+14155550199", ...extra });
}

test("editing another section leaves the transfer hours alone", () => {
  const patch = buildAssistantPatch(
    fd({ id: "a1", [SECTION.basics]: "1", greeting: "New greeting" }),
    PREV,
    CTX,
  );
  assert.deepEqual(patch.routing.transferHours, PREV.routing.transferHours);
});

test("an alerts form with no hours fields preserves the saved schedule", () => {
  // A form that predates the feature still submits SECTION.alerts. Rebuilding
  // from fields it never carried would wipe the schedule.
  const patch = buildAssistantPatch(alertsForm({}), PREV, CTX);
  assert.equal(patch.routing.transferTo, "+14155550199");
  assert.deepEqual(patch.routing.transferHours, PREV.routing.transferHours);
});

test("submitting the hours fields stores the schedule", () => {
  const patch = buildAssistantPatch(
    alertsForm({
      transfer_hours_tz: "America/New_York",
      transfer_day_1: "on",
      transfer_start_1: "08:00",
      transfer_end_1: "16:00",
      transfer_day_6: "on",
      transfer_start_6: "10:00",
      transfer_end_6: "14:00",
    }),
    PREV,
    CTX,
  );
  const hours = patch.routing.transferHours as {
    timezone: string;
    days: ({ start: string; end: string } | null)[];
  };
  assert.equal(hours.timezone, "America/New_York");
  assert.equal(hours.days.length, 7);
  assert.deepEqual(hours.days[1], { start: "08:00", end: "16:00" });
  assert.deepEqual(hours.days[6], { start: "10:00", end: "14:00" });
  assert.equal(hours.days[0], null, "Sunday unchecked");
  assert.equal(hours.days[2], null, "Tuesday unchecked");
});

test("an unchecked day is closed even when its times are still filled in", () => {
  // The inputs stay populated in the DOM when the day toggle is turned off, so
  // the checkbox has to win.
  const patch = buildAssistantPatch(
    alertsForm({
      transfer_hours_tz: "UTC",
      transfer_day_1: "on",
      transfer_start_1: "09:00",
      transfer_end_1: "17:00",
      transfer_start_2: "09:00",
      transfer_end_2: "17:00",
    }),
    PREV,
    CTX,
  );
  const hours = patch.routing.transferHours as { days: unknown[] };
  assert.deepEqual(hours.days[1], { start: "09:00", end: "17:00" });
  assert.equal(hours.days[2], null);
});

test("turning every day off clears the schedule instead of banning transfers", () => {
  // An empty form means "no restriction", not "never transfer".
  const patch = buildAssistantPatch(
    alertsForm({ transfer_hours_tz: "UTC" }),
    PREV,
    CTX,
  );
  assert.equal(patch.routing.transferHours, undefined);
  assert.equal(patch.routing.transferTo, "+14155550199", "the number itself survives");
});

test("a blank timezone clears the schedule", () => {
  const patch = buildAssistantPatch(
    alertsForm({
      transfer_hours_tz: "",
      transfer_day_1: "on",
      transfer_start_1: "09:00",
      transfer_end_1: "17:00",
    }),
    PREV,
    CTX,
  );
  assert.equal(patch.routing.transferHours, undefined);
});

test("clearing the transfer number keeps the hours for when it comes back", () => {
  const patch = buildAssistantPatch(
    fd({
      id: "a1",
      [SECTION.alerts]: "1",
      transfer_to: "",
      transfer_hours_tz: "UTC",
      transfer_day_1: "on",
      transfer_start_1: "09:00",
      transfer_end_1: "17:00",
    }),
    PREV,
    CTX,
  );
  assert.equal(patch.routing.transferTo, undefined);
  assert.ok(patch.routing.transferHours, "schedule is not collateral damage");
});

// ── Escalation destinations ─────────────────────────────────────────────────
// The same hazard again, and worse: this section owns the ONLY way a caller
// reaches a person. A save that silently drops a destination takes the
// receptionist's safety net away without telling anybody.

function escForm(extra: Record<string, string>): FormData {
  return fd({ id: "a1", [SECTION.escalation]: "1", esc_keys: "r0", ...extra });
}

test("an escalation form with no destinations clears the legacy number too", () => {
  const patch = buildAssistantPatch(escForm({ esc_keys: "" }), PREV, CTX);
  assert.deepEqual(patch.routing.escalation, { targets: [] });
  assert.equal(patch.routing.transferTo, undefined, "mirror must follow the list");
});

test("a saved destination mirrors onto the legacy transfer number", () => {
  // The setup checklist, the test-call button and onboarding all still read
  // routing.transferTo. If the mirror breaks they quietly go stale.
  const patch = buildAssistantPatch(
    escForm({ esc_r0_label: "Front desk", esc_r0_number: "+421900000001" }),
    PREV,
    CTX,
  );
  const esc = patch.routing.escalation as { targets: Record<string, unknown>[] };
  assert.equal(esc.targets.length, 1);
  assert.equal(esc.targets[0].label, "Front desk");
  assert.equal(patch.routing.transferTo, "+421900000001");
});

test("a row left blank is not stored as a destination", () => {
  const patch = buildAssistantPatch(
    escForm({
      esc_keys: "r0,r1,r2",
      esc_r0_label: "Front desk",
      esc_r0_number: "+421900000001",
      esc_r1_label: "Typed a name then gave up",
      esc_r1_number: "",
      esc_r2_label: "Billing",
      esc_r2_number: "+421900000002",
    }),
    PREV,
    CTX,
  );
  const esc = patch.routing.escalation as { targets: { label: string }[] };
  assert.deepEqual(
    esc.targets.map((t) => t.label),
    ["Front desk", "Billing"],
  );
});

test("the warm/blind choice stays absent until it is actually made", () => {
  // "" must not collapse to blind: an unset transfer type leaves the ElevenLabs
  // platform default alone, which is the only value that provably does not
  // change how an existing assistant's transfers already behave.
  const unset = buildAssistantPatch(escForm({ esc_r0_number: "+421900000001" }), PREV, CTX);
  const a = (unset.routing.escalation as { targets: Record<string, unknown>[] }).targets[0];
  assert.equal("warm" in a, false);

  const cold = buildAssistantPatch(
    escForm({ esc_r0_number: "+421900000001", esc_r0_warm: "cold" }),
    PREV,
    CTX,
  );
  assert.equal((cold.routing.escalation as { targets: { warm: boolean }[] }).targets[0].warm, false);

  const warm = buildAssistantPatch(
    escForm({ esc_r0_number: "+421900000001", esc_r0_warm: "warm" }),
    PREV,
    CTX,
  );
  assert.equal((warm.routing.escalation as { targets: { warm: boolean }[] }).targets[0].warm, true);
});

test("each destination carries its own schedule", () => {
  const patch = buildAssistantPatch(
    escForm({
      esc_keys: "r0,r1",
      esc_r0_number: "+421900000001",
      esc_r1_number: "+421900000002",
      esc_r1_tz: "Europe/Bratislava",
      esc_r1_day_1: "on",
      esc_r1_start_1: "18:00",
      esc_r1_end_1: "07:00",
    }),
    PREV,
    CTX,
  );
  const targets = (patch.routing.escalation as { targets: Record<string, unknown>[] }).targets;
  assert.equal("hours" in targets[0], false, "no schedule means always reachable");
  assert.deepEqual((targets[1].hours as { days: unknown[] }).days[1], {
    start: "18:00",
    end: "07:00",
  });
});

test("a form that predates the editor cannot erase the destinations", () => {
  const prev: PatchPrev = {
    ...PREV,
    routing: { ...PREV.routing, escalation: { targets: [{ id: "a", number: "+421900000001" }] } },
  };
  // Marker present, esc_keys absent - the guard that stops the rebuild.
  const patch = buildAssistantPatch(fd({ id: "a1", [SECTION.escalation]: "1" }), prev, CTX);
  assert.deepEqual(patch.routing.escalation, prev.routing.escalation);
});

test("an alerts-only form no longer wipes the transfer number", () => {
  // The escalation editor owns the number now and does not carry transfer_to,
  // so the alerts section must guard on the field, not on its marker.
  const patch = buildAssistantPatch(fd({ id: "a1", [SECTION.alerts]: "1" }), PREV, CTX);
  assert.equal(patch.routing.transferTo, "+14155550199");
  assert.equal(patch.routing.smsAlerts, false, "the toggle it does own still applies");
});

// ── Guardrails and disclosure ───────────────────────────────────────────────

test("guardrail lists are split, trimmed and dropped when empty", () => {
  const set = buildAssistantPatch(
    fd({
      id: "a1",
      [SECTION.guardrails]: "1",
      guardrail_never: " refund eligibility \n\n exact prices for custom work \n",
      guardrail_escalate: "anything about a legal dispute",
    }),
    PREV,
    CTX,
  );
  assert.deepEqual(set.routing.guardrails, {
    neverDiscuss: ["refund eligibility", "exact prices for custom work"],
    alwaysEscalate: ["anything about a legal dispute"],
  });

  const cleared = buildAssistantPatch(
    fd({ id: "a1", [SECTION.guardrails]: "1", guardrail_never: "  \n  " }),
    PREV,
    CTX,
  );
  assert.equal(cleared.routing.guardrails, undefined);
});

test("the default disclosure mode is stored as absence, not as a value", () => {
  const back = buildAssistantPatch(
    fd({ id: "a1", [SECTION.guardrails]: "1", disclosure: "if_asked" }),
    { ...PREV, routing: { ...PREV.routing, disclosure: "deflect" } },
    CTX,
  );
  assert.equal(back.routing.disclosure, undefined);

  const opted = buildAssistantPatch(
    fd({ id: "a1", [SECTION.guardrails]: "1", disclosure: "deflect" }),
    PREV,
    CTX,
  );
  assert.equal(opted.routing.disclosure, "deflect");
});

test("row keys are addressed by name, so removing one cannot shuffle the others", () => {
  // The whole reason rows are keyed rather than numbered: dropping the middle
  // destination must leave the third one's fields - including its schedule -
  // attached to the third one.
  const patch = buildAssistantPatch(
    escForm({
      esc_keys: "r0,r2",
      esc_r0_label: "Front desk",
      esc_r0_number: "+421900000001",
      esc_r2_label: "On call",
      esc_r2_number: "+421900000003",
      esc_r2_tz: "Europe/Bratislava",
      esc_r2_day_1: "on",
      esc_r2_start_1: "18:00",
      esc_r2_end_1: "07:00",
    }),
    PREV,
    CTX,
  );
  const targets = (patch.routing.escalation as { targets: Record<string, unknown>[] }).targets;
  assert.deepEqual(
    targets.map((t) => t.label),
    ["Front desk", "On call"],
  );
  assert.equal("hours" in targets[0], false, "the schedule belongs to On call, not Front desk");
  assert.ok(targets[1].hours);
});

test("a key that is not the shape the editor generates is ignored", () => {
  // Keys arrive from the client and are interpolated straight into field
  // lookups, so anything unexpected is dropped rather than trusted.
  const patch = buildAssistantPatch(
    escForm({
      esc_keys: "r0,../evil,r1;drop",
      esc_r0_number: "+421900000001",
    }),
    PREV,
    CTX,
  );
  const targets = (patch.routing.escalation as { targets: { id: string }[] }).targets;
  assert.deepEqual(targets.map((t) => t.id), ["r0"]);
});
