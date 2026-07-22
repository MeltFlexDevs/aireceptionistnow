import { test } from "node:test";
import assert from "node:assert/strict";
import { groupEventsByDay, type ExternalEvent } from "./calendar-events";
import { dayKeyFn } from "./timezone";

function ev(partial: Partial<ExternalEvent> & Pick<ExternalEvent, "id" | "start">): ExternalEvent {
  return {
    integrationId: "int",
    provider: "google",
    providerLabel: "Google Calendar",
    title: "Event",
    end: partial.start,
    allDay: false,
    location: "",
    url: "",
    ...partial,
  };
}

test("all-day events key by their date prefix, not the timezone-shifted instant", () => {
  // In a timezone far behind UTC, midnight-UTC on the 5th is still the 4th
  // locally. An all-day event on the 5th must still land on the 5th.
  const toKey = dayKeyFn("America/Los_Angeles");
  const byDay = groupEventsByDay(
    [ev({ id: "a", start: "2026-07-05T00:00:00Z", allDay: true })],
    toKey,
  );
  assert.deepEqual([...byDay.keys()], ["2026-07-05"]);
});

test("timed events group by the owner's local day", () => {
  // 01:30 UTC on the 6th is 21:30 on the 5th in New York.
  const toKey = dayKeyFn("America/New_York");
  const byDay = groupEventsByDay(
    [ev({ id: "b", start: "2026-07-06T01:30:00Z", allDay: false })],
    toKey,
  );
  assert.deepEqual([...byDay.keys()], ["2026-07-05"]);
});

test("events on the same day are sorted earliest first", () => {
  const toKey = dayKeyFn("UTC");
  const byDay = groupEventsByDay(
    [
      ev({ id: "late", start: "2026-07-05T15:00:00Z" }),
      ev({ id: "early", start: "2026-07-05T09:00:00Z" }),
    ],
    toKey,
  );
  assert.deepEqual(
    byDay.get("2026-07-05")?.map((e) => e.id),
    ["early", "late"],
  );
});

test("events with an unparseable start are dropped, not grouped", () => {
  const toKey = dayKeyFn("UTC");
  const byDay = groupEventsByDay([ev({ id: "bad", start: "not-a-date", allDay: false })], toKey);
  assert.equal(byDay.size, 0);
});
