import assert from "node:assert/strict";
import { test } from "node:test";

import {
  TRANSFER_POLICY_OPEN,
  describeTransferHours,
  isTransferOpen,
  parseTime,
  parseTransferHours,
  transferPolicyLine,
  type TransferHours,
} from "./transfer-hours";

// This decides whether a caller asking for a person gets one. The two failure
// modes are not symmetric: wrongly refusing every transfer is silent and much
// worse than wrongly allowing one, so "fails open" is asserted explicitly.

const NINE_TO_FIVE: TransferHours = {
  timezone: "Europe/Bratislava",
  days: [
    null, // Sun
    { start: "09:00", end: "17:00" },
    { start: "09:00", end: "17:00" },
    { start: "09:00", end: "17:00" },
    { start: "09:00", end: "17:00" },
    { start: "09:00", end: "17:00" },
    null, // Sat
  ],
};

test("parseTime accepts 24-hour times and rejects everything else", () => {
  assert.equal(parseTime("00:00"), 0);
  assert.equal(parseTime("09:30"), 570);
  assert.equal(parseTime("23:59"), 1439);
  for (const bad of ["24:00", "9:00", "09:60", "", "noon", "09:00:00", "-1:00"]) {
    assert.equal(parseTime(bad), null, `${bad} must not parse`);
  }
});

test("a weekday inside the window is open, outside is closed", () => {
  // 2026-07-27 is a Monday. Bratislava is UTC+2 in July.
  const at = (utcHour: number, min = 0) =>
    new Date(Date.UTC(2026, 6, 27, utcHour, min));

  assert.equal(isTransferOpen(NINE_TO_FIVE, at(6, 59)), false, "08:59 local");
  assert.equal(isTransferOpen(NINE_TO_FIVE, at(7, 0)), true, "09:00 local, inclusive");
  assert.equal(isTransferOpen(NINE_TO_FIVE, at(12, 0)), true, "14:00 local");
  assert.equal(isTransferOpen(NINE_TO_FIVE, at(14, 59)), true, "16:59 local");
  assert.equal(isTransferOpen(NINE_TO_FIVE, at(15, 0)), false, "17:00 local, exclusive");
});

test("a closed day is closed all day", () => {
  // 2026-07-26 is a Sunday.
  for (const h of [0, 8, 12, 20, 23]) {
    assert.equal(
      isTransferOpen(NINE_TO_FIVE, new Date(Date.UTC(2026, 6, 26, h))),
      false,
      `Sunday ${h}:00 UTC`,
    );
  }
});

test("the window is read in the schedule's timezone, not the server's", () => {
  // 15:00 UTC is 17:00 in Bratislava (closed) but 10:00 in New York (open).
  const at = new Date(Date.UTC(2026, 6, 27, 15, 0));
  assert.equal(isTransferOpen(NINE_TO_FIVE, at), false);
  assert.equal(isTransferOpen({ ...NINE_TO_FIVE, timezone: "America/New_York" }, at), true);
});

test("DST is handled by the tz database, not a fixed offset", () => {
  // Bratislava is UTC+1 in January and UTC+2 in July. 08:30 UTC is therefore
  // 09:30 local in winter (open) and 10:30 local in summer (also open), while
  // 07:30 UTC is 08:30 local in winter (CLOSED) and 09:30 in summer (open).
  const winter = new Date(Date.UTC(2026, 0, 26, 7, 30)); // Mon 2026-01-26
  const summer = new Date(Date.UTC(2026, 6, 27, 7, 30)); // Mon 2026-07-27
  assert.equal(isTransferOpen(NINE_TO_FIVE, winter), false, "08:30 local in winter");
  assert.equal(isTransferOpen(NINE_TO_FIVE, summer), true, "09:30 local in summer");
});

test("a window that wraps past midnight stays open into the next morning", () => {
  const onCall: TransferHours = {
    timezone: "UTC",
    days: [
      null,
      { start: "22:00", end: "06:00" }, // Mon night -> Tue morning
      null,
      null,
      null,
      null,
      null,
    ],
  };
  // Monday 2026-07-27
  assert.equal(isTransferOpen(onCall, new Date(Date.UTC(2026, 6, 27, 21, 59))), false);
  assert.equal(isTransferOpen(onCall, new Date(Date.UTC(2026, 6, 27, 22, 0))), true);
  assert.equal(isTransferOpen(onCall, new Date(Date.UTC(2026, 6, 27, 23, 30))), true);
  // Tuesday small hours - covered by MONDAY's wrapping window.
  assert.equal(isTransferOpen(onCall, new Date(Date.UTC(2026, 6, 28, 0, 30))), true);
  assert.equal(isTransferOpen(onCall, new Date(Date.UTC(2026, 6, 28, 5, 59))), true);
  assert.equal(isTransferOpen(onCall, new Date(Date.UTC(2026, 6, 28, 6, 0))), false);
  // Tuesday evening is NOT covered - Tuesday has no window of its own.
  assert.equal(isTransferOpen(onCall, new Date(Date.UTC(2026, 6, 28, 23, 0))), false);
});

test("a Sunday-night wrap reaches back across the week boundary", () => {
  // Guards the (weekday + 6) % 7 wraparound: Monday 01:00 must consult Sunday.
  const hours: TransferHours = {
    timezone: "UTC",
    days: [{ start: "20:00", end: "04:00" }, null, null, null, null, null, null],
  };
  assert.equal(isTransferOpen(hours, new Date(Date.UTC(2026, 6, 27, 1, 0))), true, "Mon 01:00");
  assert.equal(isTransferOpen(hours, new Date(Date.UTC(2026, 6, 27, 5, 0))), false, "Mon 05:00");
});

test("no schedule means transfers are always allowed", () => {
  // The pre-feature behaviour, and the one every fallback path relies on.
  assert.equal(isTransferOpen(null, new Date()), true);
});

test("an unknown timezone fails open rather than blocking every transfer", () => {
  const broken: TransferHours = { ...NINE_TO_FIVE, timezone: "Mars/Olympus_Mons" };
  // 03:00 UTC on a Sunday would be closed under any sane reading of the schedule.
  assert.equal(isTransferOpen(broken, new Date(Date.UTC(2026, 6, 26, 3, 0))), true);
});

test("parseTransferHours rejects junk instead of inventing a restriction", () => {
  for (const bad of [
    null,
    undefined,
    "09:00-17:00",
    42,
    [],
    {},
    { timezone: "Europe/Bratislava" }, // no days
    { days: [] }, // no timezone
    { timezone: "Nowhere/Nothing", days: [{ start: "09:00", end: "17:00" }] },
    { timezone: "UTC", days: [{ start: "9am", end: "5pm" }] }, // unparseable -> all closed
    { timezone: "UTC", days: [{ start: "09:00", end: "09:00" }] }, // zero-length -> all closed
  ]) {
    assert.equal(parseTransferHours(bad), null, `${JSON.stringify(bad)} must not parse`);
  }
});

test("parseTransferHours keeps valid days and drops malformed ones", () => {
  const parsed = parseTransferHours({
    timezone: "UTC",
    days: [
      null,
      { start: "09:00", end: "17:00" },
      { start: "bad", end: "17:00" },
      { start: "09:00", end: "09:00" },
      { start: "10:00", end: "18:00" },
      "nonsense",
      undefined,
    ],
  });
  assert.ok(parsed);
  assert.equal(parsed.timezone, "UTC");
  assert.deepEqual(parsed.days[1], { start: "09:00", end: "17:00" });
  assert.equal(parsed.days[2], null, "unparseable time");
  assert.equal(parsed.days[3], null, "zero-length window");
  assert.deepEqual(parsed.days[4], { start: "10:00", end: "18:00" });
  assert.equal(parsed.days[5], null);
  assert.equal(parsed.days.length, 7, "always exactly seven days");
});

test("a schedule missing trailing days is padded, not left short", () => {
  const parsed = parseTransferHours({
    timezone: "UTC",
    days: [null, { start: "09:00", end: "17:00" }],
  });
  assert.ok(parsed);
  assert.equal(parsed.days.length, 7);
  assert.equal(parsed.days[6], null);
});

test("describeTransferHours collapses the working week into one run", () => {
  assert.equal(describeTransferHours(NINE_TO_FIVE), "Mon-Fri 09:00-17:00");
});

test("describeTransferHours splits runs when the window differs", () => {
  const mixed: TransferHours = {
    timezone: "UTC",
    days: [
      null,
      { start: "09:00", end: "17:00" },
      { start: "09:00", end: "17:00" },
      { start: "09:00", end: "17:00" },
      { start: "09:00", end: "17:00" },
      { start: "09:00", end: "12:00" },
      { start: "10:00", end: "14:00" },
    ],
  };
  assert.equal(
    describeTransferHours(mixed),
    "Mon-Thu 09:00-17:00, Fri 09:00-12:00, Sat 10:00-14:00",
  );
});

test("describeTransferHours does not merge non-adjacent days", () => {
  const gapped: TransferHours = {
    timezone: "UTC",
    days: [
      null,
      { start: "09:00", end: "17:00" },
      null,
      { start: "09:00", end: "17:00" },
      null,
      null,
      null,
    ],
  };
  assert.equal(describeTransferHours(gapped), "Mon 09:00-17:00, Wed 09:00-17:00");
});

test("describeTransferHours puts Sunday last, not first", () => {
  // Sunday is index 0 for Date.getDay(), but reads as the end of the week.
  const withSunday: TransferHours = {
    timezone: "UTC",
    days: [
      { start: "11:00", end: "15:00" },
      { start: "09:00", end: "17:00" },
      null,
      null,
      null,
      null,
      null,
    ],
  };
  assert.equal(describeTransferHours(withSunday), "Mon 09:00-17:00, Sun 11:00-15:00");
});

test("describeTransferHours is empty for no schedule", () => {
  assert.equal(describeTransferHours(null), "");
});

// ── The prompt variable ─────────────────────────────────────────────────────

test("inside the window the agent is told it may transfer", () => {
  const line = transferPolicyLine(NINE_TO_FIVE, new Date(Date.UTC(2026, 6, 27, 12, 0)));
  assert.equal(line, TRANSFER_POLICY_OPEN);
  assert.match(line, /use transfer_to_number/);
  assert.doesNotMatch(line, /do NOT/i);
});

test("outside the window the agent is prohibited and told what to do instead", () => {
  const line = transferPolicyLine(NINE_TO_FIVE, new Date(Date.UTC(2026, 6, 27, 20, 0)));
  assert.match(line, /Do NOT use transfer_to_number/);
  assert.match(line, /take a message/i);
  // The window is quoted back so the agent can tell the caller when to ring.
  assert.match(line, /Mon-Fri 09:00-17:00/);
  assert.match(line, /Europe\/Bratislava/);
});

test("with no schedule the agent is always permitted", () => {
  assert.equal(transferPolicyLine(null, new Date()), TRANSFER_POLICY_OPEN);
});

test("the policy line never leaves an unfilled placeholder", () => {
  // The prompt interpolates this verbatim; a stray {{...}} would be spoken.
  for (const at of [
    new Date(Date.UTC(2026, 6, 27, 12, 0)),
    new Date(Date.UTC(2026, 6, 27, 20, 0)),
  ]) {
    for (const hours of [NINE_TO_FIVE, null]) {
      assert.doesNotMatch(transferPolicyLine(hours, at), /\{\{|\}\}/);
    }
  }
});
