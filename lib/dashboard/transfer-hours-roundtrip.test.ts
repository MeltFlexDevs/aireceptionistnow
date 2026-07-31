import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  TRANSFER_POLICY_OPEN,
  parseTransferHours,
  transferPolicyLine,
} from "../call-engine/transfer-hours";
import { escalationPolicyLine, parseEscalation } from "../call-engine/escalation";
import { SECTION, buildAssistantPatch, type PatchPrev } from "./assistant-patch";

/**
 * Escalation spans three files that never import each other: the form fields
 * rendered by EscalationFields.tsx, the names read by buildAssistantPatch, and
 * the shape parsed by parseEscalation on a live call. A typo in any one of them
 * silently does nothing - the save "succeeds", the destination is empty, and a
 * caller who asks for a person is told nobody is available. tsc cannot see it,
 * because form field names are strings.
 *
 * So this walks the whole chain: submit the form the component actually renders,
 * patch it, store it, parse it back, and ask the engine for a decision.
 */

const PREV: PatchPrev = {
  name: "Front desk",
  greeting: "Hi",
  system_prompt: "",
  voice_id: "v1",
  language: "multi",
  routing: { transferTo: "+14155550199" },
};

const CTX = { calendarIds: [], crmIds: [] };

const src = (file: string): string =>
  readFileSync(new URL(`../../app/(main)/dashboard/assistant/${file}`, import.meta.url), "utf8");

const ESCALATION = src("EscalationFields.tsx");
const HOURS = src("TransferHoursFields.tsx");

test("the UI renders exactly the field names the patch layer reads", () => {
  // Guards the seam tsc cannot: rename a field on one side and this fails.
  for (const name of [
    "esc_keys",
    "_label",
    "_number",
    "_when",
    "_warm",
    "_tz",
    "_day_",
    "_start_",
    "_end_",
    "esc_triggers",
    "esc_sla",
    "esc_page",
    "esc_page_number",
  ]) {
    assert.ok(
      ESCALATION.includes(name),
      `EscalationFields.tsx no longer renders ${name}, which buildAssistantPatch reads`,
    );
  }
  // The weekly grid takes its names from the caller now, so its own file must
  // not reintroduce hard-coded ones - that would silently ignore the row key
  // and write every destination's schedule to the same fields.
  assert.doesNotMatch(HOURS, /name="transfer_/);
  assert.match(HOURS, /name=\{names\./);
});

/** The form EscalationFields submits for one destination, keyed r0. */
function destinationForm(fields: Record<string, string>): FormData {
  const form = new FormData();
  form.set("id", "a1");
  form.set(SECTION.escalation, "1");
  form.set("esc_keys", "r0");
  for (const [k, v] of Object.entries(fields)) form.set(k, v);
  return form;
}

test("a destination saved from the form decides real calls correctly", () => {
  const form = destinationForm({
    esc_r0_label: "Front desk",
    esc_r0_number: "+14155550199",
    esc_r0_tz: "Europe/Bratislava",
  });
  for (const day of [1, 2, 3, 4, 5]) {
    form.set(`esc_r0_day_${day}`, "on");
    form.set(`esc_r0_start_${day}`, "09:00");
    form.set(`esc_r0_end_${day}`, "17:00");
  }

  const patch = buildAssistantPatch(form, PREV, CTX);

  // Survives the JSON round trip the database actually performs.
  const stored = JSON.parse(JSON.stringify(patch.routing)) as Record<string, unknown>;
  const cfg = parseEscalation(stored);
  assert.equal(cfg.targets.length, 1, "the saved destination must parse back on a live call");
  assert.ok(cfg.targets[0].hours, "and so must its schedule");

  // Monday 2026-07-27, 12:00 UTC = 14:00 Bratislava -> a person is reachable.
  assert.equal(
    escalationPolicyLine(cfg, new Date(Date.UTC(2026, 6, 27, 12, 0))),
    TRANSFER_POLICY_OPEN,
  );

  // Same Monday, 20:00 UTC = 22:00 Bratislava -> closed.
  const after = escalationPolicyLine(cfg, new Date(Date.UTC(2026, 6, 27, 20, 0)));
  assert.match(after, /Do NOT use transfer_to_number/);
  assert.match(after, /Mon-Fri 09:00-17:00/);

  // Sunday -> closed all day.
  assert.match(
    escalationPolicyLine(cfg, new Date(Date.UTC(2026, 6, 26, 12, 0))),
    /Do NOT use transfer_to_number/,
  );
});

test("two destinations keep their own schedules through the whole chain", () => {
  // The failure this catches: both rows writing to the same field names, so the
  // second destination inherits the first one's hours (or wipes them).
  const form = destinationForm({
    esc_keys: "r0,r1",
    esc_r0_label: "Front desk",
    esc_r0_number: "+14155550199",
    esc_r1_label: "On call",
    esc_r1_number: "+14155550100",
    esc_r1_tz: "UTC",
    esc_r1_day_1: "on",
    esc_r1_start_1: "18:00",
    esc_r1_end_1: "07:00",
  });

  const stored = JSON.parse(
    JSON.stringify(buildAssistantPatch(form, PREV, CTX).routing),
  ) as Record<string, unknown>;
  const cfg = parseEscalation(stored);

  assert.equal(cfg.targets[0].hours, null, "the front desk was left unscheduled");
  assert.ok(cfg.targets[1].hours, "on call kept its own overnight window");

  // Monday 12:00 UTC: front desk open, on-call not.
  const midday = escalationPolicyLine(cfg, new Date(Date.UTC(2026, 6, 27, 12, 0)));
  assert.match(midday, /you can transfer to: Front desk/);
  assert.match(midday, /cannot transfer to: On call/);

  // Monday 20:00 UTC: both reachable (the overnight window has opened).
  const evening = escalationPolicyLine(cfg, new Date(Date.UTC(2026, 6, 27, 20, 0)));
  assert.doesNotMatch(evening, /cannot transfer/);
});

test("a form with the schedule switched off leaves transfers unrestricted", () => {
  // The component submits a blank timezone when the toggle is off.
  const form = destinationForm({ esc_r0_number: "+14155550199", esc_r0_tz: "" });

  const stored = JSON.parse(
    JSON.stringify(buildAssistantPatch(form, PREV, CTX).routing),
  ) as Record<string, unknown>;
  const cfg = parseEscalation(stored);

  assert.equal(cfg.targets[0].hours, null);
  assert.equal(
    escalationPolicyLine(cfg, new Date()),
    TRANSFER_POLICY_OPEN,
    "no schedule must mean transfers work exactly as they did before this feature",
  );
});

test("an overnight on-call window saved from the form works past midnight", () => {
  const form = destinationForm({
    esc_r0_number: "+14155550199",
    esc_r0_tz: "UTC",
    esc_r0_day_5: "on", // Friday
    esc_r0_start_5: "18:00",
    esc_r0_end_5: "02:00",
  });

  const cfg = parseEscalation(buildAssistantPatch(form, PREV, CTX).routing);
  assert.ok(cfg.targets[0].hours);

  // Friday 2026-07-31 23:00 UTC, and Saturday 01:00 UTC - both inside.
  assert.equal(escalationPolicyLine(cfg, new Date(Date.UTC(2026, 6, 31, 23, 0))), TRANSFER_POLICY_OPEN);
  assert.equal(escalationPolicyLine(cfg, new Date(Date.UTC(2026, 7, 1, 1, 0))), TRANSFER_POLICY_OPEN);
  // Saturday 03:00 UTC is past the window.
  assert.match(
    escalationPolicyLine(cfg, new Date(Date.UTC(2026, 7, 1, 3, 0))),
    /Do NOT use transfer_to_number/,
  );
});

test("a config saved before escalation existed still decides calls the same way", () => {
  // No UI writes these field names any more, but assistants configured through
  // the old form are still in the database. Their stored shape must keep
  // working, and must keep producing the exact wording it always did.
  const legacy = {
    transferTo: "+14155550199",
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
  };

  const at = new Date(Date.UTC(2026, 6, 27, 20, 0)); // Monday 22:00 local
  assert.equal(
    escalationPolicyLine(parseEscalation(legacy), at),
    transferPolicyLine(parseTransferHours(legacy.transferHours), at),
  );
});
