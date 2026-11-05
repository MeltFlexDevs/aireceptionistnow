import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

// Source guard for finding settings-2, option B. The account-wide email and SMS
// switches wrote notify_email and notify_sms, which no call path reads. Texts and
// recaps are set per receptionist. The repo has no component test runner.
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const read = (file: string) => readFileSync(join(ROOT, file), "utf8");

test("the dashboard Alerts tab has no account email or SMS switches", () => {
  const src = read("app/(main)/dashboard/settings/AlertsForm.tsx");
  assert.ok(!src.includes('type="checkbox"'), "a switch is still there");
  assert.ok(!src.includes("notify_email"), "notify_email is still there");
  assert.ok(!src.includes("notify_sms"), "notify_sms is still there");
  assert.ok(!src.includes("saveNotificationsAction"), "the save action is still used");
});

test("the dashboard Alerts tab links to the per-receptionist alert settings", () => {
  const src = read("app/(main)/dashboard/settings/AlertsForm.tsx");
  assert.ok(src.includes('href="/dashboard/assistant"'));
  assert.ok(src.includes("a.textAlerts"));
  assert.ok(src.includes("a.sendEmailTranscripts"));
});

test("the settings actions no longer save the account alert switches", () => {
  const src = read("app/(main)/dashboard/settings/actions.ts");
  assert.ok(!src.includes("saveNotificationsAction"));
  assert.ok(!src.includes("saveNotificationSettings"));
  assert.ok(!src.includes("notify_email"));
  assert.ok(!src.includes("notify_sms"));
});

test("the mobile settings API still accepts notifyEmail and notifySms from older app builds", () => {
  const src = read("app/api/mobile/settings/route.ts");
  assert.ok(src.includes('if (has("notifyEmail") || has("notifySms")) {'));
  assert.ok(src.includes("await saveNotificationSettings(userId, {"));
});
