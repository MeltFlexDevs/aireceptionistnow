import test from "node:test";
import assert from "node:assert/strict";

import { receiptWhen } from "./format";

test("the call time shows on the business clock with the zone name", () => {
  assert.match(
    receiptWhen("2026-10-27T06:54:00Z", "en", "America/Chicago"),
    /^Tuesday, October 27 at 1:54\sAM CDT$/,
  );
});

test("an appointment after the DST change shows standard time", () => {
  assert.match(
    receiptWhen("2026-11-01T15:00:00Z", "en", "America/Chicago"),
    /^Sunday, November 1 at 9:00\sAM CST$/,
  );
});

test("a business with no zone, or a bad one, reads in UTC and says so", () => {
  assert.match(receiptWhen("2026-10-27T06:54:00Z", "en", ""), /6:54\sAM UTC$/);
  assert.match(receiptWhen("2026-10-27T06:54:00Z", "en", "Not/AZone"), /6:54\sAM UTC$/);
});

test("an empty or unparseable time renders nothing", () => {
  assert.equal(receiptWhen("", "en", "America/Chicago"), "");
  assert.equal(receiptWhen("not a date", "en", "America/Chicago"), "");
});
