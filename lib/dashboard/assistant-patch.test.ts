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
