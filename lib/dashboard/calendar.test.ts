import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingWindowFilter } from "./calendar";

test("bookingWindowFilter pads both bounds by a day and keeps undated bookings", () => {
  assert.equal(
    bookingWindowFilter("2026-11-01T12:00:00.000Z", "2026-11-30T12:00:00.000Z"),
    'payload->>start_time.is.null,payload->>start_time.eq."",' +
      "and(payload->>start_time.gte.2026-10-31T12:00:00.000Z," +
      "payload->>start_time.lte.2026-12-01T12:00:00.000Z)",
  );
});

test("bookingWindowFilter with no timeMax leaves the window open at the end", () => {
  assert.equal(
    bookingWindowFilter("2026-11-04T08:00:00.000Z", null),
    'payload->>start_time.is.null,payload->>start_time.eq."",' +
      "payload->>start_time.gte.2026-11-03T08:00:00.000Z",
  );
});

test("a booking stored with a -12:00 offset inside the window passes the padded text bound", () => {
  // 2026-10-30T23:00:00-12:00 is 2026-10-31T11:00:00Z, inside a window that
  // starts at 10:00Z that day. As text it sorts before "2026-10-31", so an
  // unpadded bound would drop it.
  const filter = bookingWindowFilter("2026-10-31T10:00:00.000Z", null);
  const bound = /start_time\.gte\.([^,)]+)/.exec(filter)?.[1] ?? "";
  assert.equal("2026-10-30T23:00:00-12:00" >= bound, true);
  assert.equal("2026-10-30T23:00:00-12:00" >= "2026-10-31T10:00:00.000Z", false);
});
