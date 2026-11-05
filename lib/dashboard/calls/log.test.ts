import test from "node:test";
import assert from "node:assert/strict";

import { applyFilters, callerSearchText } from "./log";
import type { CallLogRow } from "./types";

const row = (over: Partial<CallLogRow> = {}): CallLogRow => ({
  key: "db:c1", dbId: "c1", sid: "CA1", date: "2026-11-04T09:00:00Z", dateLabel: "",
  status: "completed", statusLabel: "Completed", direction: "inbound",
  from: "+353857654321", to: "+35315550000", durationSec: 60, durationLabel: "1:00",
  outcome: "booked", assistant: "Ava", source: "db", needsReview: false, ...over,
});

test("callerSearchText reads the booking attendee and the message caller", () => {
  assert.equal(
    callerSearchText({
      call_actions: [
        { type: "booking", payload: { attendee_name: "Sinead Walsh" } },
        { type: "message", payload: { caller_name: " Conor Byrne " } },
      ],
      summary: "Booked a check-up.",
    }),
    "Sinead Walsh Conor Byrne Booked a check-up.",
  );
});

test("callerSearchText is empty for a row read without the search columns", () => {
  assert.equal(callerSearchText({ id: "c1" }), "");
  assert.equal(
    callerSearchText({ call_actions: [{ type: "booking", payload: { attendee_name: "  " } }] }),
    "",
  );
});

test("a search by the caller's name finds the call, in any case", () => {
  const text = new Map([["c1", "Sinead Walsh"]]);
  assert.equal(applyFilters([row()], { q: "sinead" }, text).length, 1);
  assert.equal(applyFilters([row()], { q: "SINEAD" }, text).length, 1);
});

test("a name search does not match a call with no such name", () => {
  assert.equal(applyFilters([row()], { q: "sinead" }, new Map([["c1", "Conor Byrne"]])).length, 0);
  assert.equal(
    applyFilters(
      [row({ dbId: null, key: "CA1", source: "twilio" })],
      { q: "sinead" },
      new Map([["c1", "Sinead Walsh"]]),
    ).length,
    0,
  );
});

test("number search still works without extra text", () => {
  assert.equal(applyFilters([row()], { q: "857654" }).length, 1);
});
