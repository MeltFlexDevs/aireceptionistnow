import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { dashboardCacheTag, timezoneChanged } from "./cache-tags";

const read = (path: string): string => readFileSync(new URL(path, import.meta.url), "utf8");

test("dashboardCacheTag is per user and differs from the plan tag", () => {
  assert.equal(dashboardCacheTag("u1"), "dashboard:u1");
  assert.notEqual(dashboardCacheTag("u1"), dashboardCacheTag("u2"));
  assert.notEqual(dashboardCacheTag("u1"), "plan:u1");
});

test("timezoneChanged is false when the saved zone equals the stored one", () => {
  assert.equal(timezoneChanged({ timezone: "Europe/Bratislava" }, "Europe/Bratislava"), false);
  assert.equal(timezoneChanged({ timezone: "" }, ""), false);
  assert.equal(timezoneChanged({ timezone: null }, ""), false);
});

test("timezoneChanged is true for a new, a cleared or a first zone", () => {
  assert.equal(timezoneChanged({ timezone: "Europe/Bratislava" }, "America/New_York"), true);
  assert.equal(timezoneChanged({ timezone: "Europe/Bratislava" }, ""), true);
  assert.equal(timezoneChanged({ timezone: "" }, "Europe/Bratislava"), true);
});

test("timezoneChanged is true when the stored row is unknown", () => {
  assert.equal(timezoneChanged(null, "Europe/Bratislava"), true);
  assert.equal(timezoneChanged(undefined, ""), true);
});

// One user's profile save used to expire every user's dashboard cache through
// this shared tag (review finding CR-5). Per-user tags replace it.
test("no dashboard cache entry or writer uses the shared dashboard-data tag", () => {
  for (const path of ["./analytics.ts", "./plan.ts", "../../app/(main)/dashboard/settings/actions.ts"]) {
    assert.ok(!read(path).includes('"dashboard-data"'), `${path} still uses "dashboard-data"`);
  }
});

test("the web profile save expires only its own user's tag, and only on a zone change", () => {
  const src = read("../../app/(main)/dashboard/settings/actions.ts");
  assert.ok(
    src.includes("if (timezoneChanged(current, timezone)) revalidateTag(dashboardCacheTag(userId), { expire: 0 });"),
  );
});

test("the mobile profile PATCH expires only its own user's tag, and only on a zone change", () => {
  const src = read("../../app/api/mobile/settings/route.ts");
  assert.ok(
    src.includes("if (timezoneChanged(current, savedZone)) revalidateTag(dashboardCacheTag(userId), { expire: 0 });"),
  );
  assert.ok(src.includes("timezone: savedZone,"));
});
