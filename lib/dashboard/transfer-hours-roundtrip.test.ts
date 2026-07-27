import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  TRANSFER_POLICY_OPEN,
  parseTransferHours,
  transferPolicyLine,
} from "../call-engine/transfer-hours";
import { SECTION, buildAssistantPatch, type PatchPrev } from "./assistant-patch";

/**
 * The transfer-hours feature spans three files that never import each other:
 * the form fields rendered by TransferHoursFields.tsx, the names read by
 * buildAssistantPatch, and the shape parsed by parseTransferHours on a live
 * call. A typo in any one of them silently does nothing - the save "succeeds",
 * the schedule is empty, and transfers stay open forever. tsc cannot see it,
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

const COMPONENT = readFileSync(
  new URL("../../app/(main)/dashboard/assistant/TransferHoursFields.tsx", import.meta.url),
  "utf8",
);

test("the UI renders exactly the field names the patch layer reads", () => {
  // Guards the seam tsc cannot: rename a field on one side and this fails.
  for (const name of [
    "transfer_hours_tz",
    "transfer_day_",
    "transfer_start_",
    "transfer_end_",
  ]) {
    assert.ok(
      COMPONENT.includes(name),
      `TransferHoursFields.tsx no longer renders ${name}, which buildAssistantPatch reads`,
    );
  }
});

test("a schedule saved from the form decides real calls correctly", () => {
  const form = new FormData();
  form.set("id", "a1");
  form.set(SECTION.alerts, "1");
  form.set("transfer_to", "+14155550199");
  // Exactly what the component submits for Mon-Fri 09:00-17:00 in Bratislava.
  form.set("transfer_hours_tz", "Europe/Bratislava");
  for (const day of [1, 2, 3, 4, 5]) {
    form.set(`transfer_day_${day}`, "on");
    form.set(`transfer_start_${day}`, "09:00");
    form.set(`transfer_end_${day}`, "17:00");
  }

  const patch = buildAssistantPatch(form, PREV, CTX);

  // Survives the JSON round trip the database actually performs.
  const stored = JSON.parse(JSON.stringify(patch.routing)) as Record<string, unknown>;
  const hours = parseTransferHours(stored.transferHours);
  assert.ok(hours, "the saved schedule must parse back on a live call");

  // Monday 2026-07-27, 12:00 UTC = 14:00 Bratislava -> a human is reachable.
  const during = transferPolicyLine(hours, new Date(Date.UTC(2026, 6, 27, 12, 0)));
  assert.equal(during, TRANSFER_POLICY_OPEN);

  // Same Monday, 20:00 UTC = 22:00 Bratislava -> closed.
  const after = transferPolicyLine(hours, new Date(Date.UTC(2026, 6, 27, 20, 0)));
  assert.match(after, /Do NOT use transfer_to_number/);
  assert.match(after, /Mon-Fri 09:00-17:00/);

  // Sunday -> closed all day.
  const sunday = transferPolicyLine(hours, new Date(Date.UTC(2026, 6, 26, 12, 0)));
  assert.match(sunday, /Do NOT use transfer_to_number/);
});

test("a form with the schedule switched off leaves transfers unrestricted", () => {
  // The component submits a blank timezone when the toggle is off.
  const form = new FormData();
  form.set("id", "a1");
  form.set(SECTION.alerts, "1");
  form.set("transfer_to", "+14155550199");
  form.set("transfer_hours_tz", "");

  const patch = buildAssistantPatch(form, PREV, CTX);
  const stored = JSON.parse(JSON.stringify(patch.routing)) as Record<string, unknown>;

  assert.equal(stored.transferHours, undefined);
  assert.equal(
    transferPolicyLine(parseTransferHours(stored.transferHours), new Date()),
    TRANSFER_POLICY_OPEN,
    "no schedule must mean transfers work exactly as they did before this feature",
  );
});

test("an overnight on-call window saved from the form works past midnight", () => {
  const form = new FormData();
  form.set("id", "a1");
  form.set(SECTION.alerts, "1");
  form.set("transfer_hours_tz", "UTC");
  form.set("transfer_day_5", "on"); // Friday
  form.set("transfer_start_5", "18:00");
  form.set("transfer_end_5", "02:00");

  const hours = parseTransferHours(
    (buildAssistantPatch(form, PREV, CTX).routing as Record<string, unknown>).transferHours,
  );
  assert.ok(hours);

  // Friday 2026-07-31 23:00 UTC, and Saturday 01:00 UTC - both inside.
  assert.equal(
    transferPolicyLine(hours, new Date(Date.UTC(2026, 6, 31, 23, 0))),
    TRANSFER_POLICY_OPEN,
  );
  assert.equal(
    transferPolicyLine(hours, new Date(Date.UTC(2026, 7, 1, 1, 0))),
    TRANSFER_POLICY_OPEN,
  );
  // Saturday 03:00 UTC is past the window.
  assert.match(
    transferPolicyLine(hours, new Date(Date.UTC(2026, 7, 1, 3, 0))),
    /Do NOT use transfer_to_number/,
  );
});
