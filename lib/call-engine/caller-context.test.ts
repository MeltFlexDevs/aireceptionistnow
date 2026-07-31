import assert from "node:assert/strict";
import { test } from "node:test";

import {
  NO_CALLER_CONTEXT,
  callerContextLine,
  recognizeCallersEnabled,
} from "./caller-context";

const NOW = new Date("2026-08-01T12:00:00Z");

test("no history still produces a usable sentence", () => {
  // A blank dynamic variable would leave the live prompt reading "you know: ."
  const line = callerContextLine(null, NOW);
  assert.equal(line, NO_CALLER_CONTEXT);
  assert.notEqual(line.trim(), "");
});

test("a known caller's name and last call are handed to the agent", () => {
  const line = callerContextLine(
    { name: "Jane Doe", lastSummary: "Booked a check-up for Tuesday.", lastAt: "2026-07-29T09:00:00Z" },
    NOW,
  );
  assert.match(line, /Jane Doe/);
  assert.match(line, /Booked a check-up/);
  assert.match(line, /3 days ago/);
});

test("recency is spoken, never a timestamp", () => {
  const at = (iso: string) =>
    callerContextLine({ name: "", lastSummary: "", lastAt: iso }, NOW);
  assert.match(at("2026-08-01T08:00:00Z"), /earlier today/);
  assert.match(at("2026-07-31T08:00:00Z"), /yesterday/);
  assert.match(at("2026-07-25T08:00:00Z"), /7 days ago|last week/);
  assert.match(at("2026-06-20T08:00:00Z"), /weeks ago/);
  // 60 days is the cut-off; past it everything collapses to one vague phrase
  // rather than "9 weeks ago", which nobody says out loud.
  assert.match(at("2026-04-01T08:00:00Z"), /couple of months/);
  // An unparseable timestamp must not leak "Invalid Date" onto a live call.
  assert.doesNotMatch(at("not a date"), /Invalid|NaN/);
});

test("the agent is told not to recite the record back", () => {
  // A phone number is not a person - shared lines, switchboards, recycled
  // numbers. Reading a previous caller's history to whoever picks up the phone
  // is the failure this wording exists to prevent.
  const line = callerContextLine(
    { name: "Jane", lastSummary: "Asked about a refund.", lastAt: "2026-07-30T09:00:00Z" },
    NOW,
  );
  assert.match(line, /Do not read any of this back/);
  assert.match(line, /do not mention that you have a record/);
  assert.match(line, /treat them as new/);
});

test("recognition is on by default and only an explicit false turns it off", () => {
  assert.equal(recognizeCallersEnabled({}), true);
  assert.equal(recognizeCallersEnabled(null), true);
  assert.equal(recognizeCallersEnabled({ recognizeCallers: "no" }), true);
  assert.equal(recognizeCallersEnabled({ recognizeCallers: false }), false);
});
