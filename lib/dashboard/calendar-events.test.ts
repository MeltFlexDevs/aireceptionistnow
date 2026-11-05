import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fetchExternalEventsStatus,
  groupEventsByDay,
  isEventPast,
  type ExternalEvent,
} from "./calendar-events";
import type { Integration } from "./db";
import type { EventsResult } from "../call-engine/integrations/types";
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

// ── isEventPast ─────────────────────────────────────────────────────────────

test("an event whose end is before now is past (same-zone 13:00-14:00 at 15:40)", () => {
  // The reported case, with the event and 'now' in one consistent zone (+02:00).
  const now = Date.parse("2026-07-22T15:40:00+02:00");
  const e = ev({
    id: "x",
    start: "2026-07-22T13:00:00+02:00",
    end: "2026-07-22T14:00:00+02:00",
  });
  assert.equal(isEventPast(e, now), true);
});

test("a still-running event is not past (documents the timezone mismatch)", () => {
  // now = 15:40 local (+02:00) = 13:40 UTC. An event shown as 13:00-14:00 when
  // the owner timezone is UTC is really 15:00-16:00 local, so it is NOT past.
  const now = Date.parse("2026-07-22T15:40:00+02:00");
  const e = ev({ id: "y", start: "2026-07-22T13:00:00Z", end: "2026-07-22T14:00:00Z" });
  assert.equal(isEventPast(e, now), false);
});

test("isEventPast falls back to start when end is unparseable", () => {
  const now = Date.parse("2026-07-22T15:40:00Z");
  assert.equal(isEventPast(ev({ id: "z", start: "2026-07-22T09:00:00Z", end: "" }), now), true);
});

// ── fetchExternalEventsStatus ───────────────────────────────────────────────

function cal(id: string, provider: string): Integration {
  return { id, type: "calendar", provider, enabled: true, config: {}, created_at: "" };
}

const MIN = "2026-11-01T00:00:00Z";
const MAX = "2026-11-30T00:00:00Z";

test("a calendar that misses its deadline is unavailable and the others still show", async () => {
  const listFor = (i: Integration) =>
    i.id === "slow"
      ? () => new Promise<EventsResult>(() => undefined)
      : async (): Promise<EventsResult> => ({
          ok: true,
          events: [
            {
              id: "e1",
              title: " Dentist ",
              start: "2026-11-05T09:00:00Z",
              end: "2026-11-05T10:00:00Z",
              allDay: false,
            },
          ],
        });
  const res = await fetchExternalEventsStatus(
    [cal("slow", "google"), cal("fast", "outlook")],
    MIN,
    MAX,
    20,
    listFor,
  );
  assert.deepEqual(
    res.events.map((e) => [e.id, e.title, e.providerLabel]),
    [["fast:e1", "Dentist", "Microsoft Calendar"]],
  );
  assert.deepEqual(res.unavailable, ["Google Calendar"]);
});

test("a refused answer or an error marks the calendar unavailable, one label per provider", async () => {
  const listFor = (i: Integration) => {
    if (i.id === "refused") return async (): Promise<EventsResult> => ({ ok: false, events: [], error: "401" });
    if (i.id === "broken") return async (): Promise<EventsResult> => { throw new Error("network"); };
    if (i.id === "ok") return async (): Promise<EventsResult> => ({ ok: true, events: [] });
    return undefined; // a webhook calendar cannot list events
  };
  const res = await fetchExternalEventsStatus(
    [cal("refused", "google"), cal("broken", "google"), cal("ok", "outlook"), cal("hook", "webhook")],
    MIN,
    MAX,
    1000,
    listFor,
  );
  assert.deepEqual(res.events, []);
  assert.deepEqual(res.unavailable, ["Google Calendar"]);
});

test("a calendar whose provider throws on setup is unavailable and the others still show", async () => {
  const listFor = (i: Integration) => {
    if (i.id === "bad") throw new TypeError("Cannot read properties of null (reading 'refresh_token')");
    return async (): Promise<EventsResult> => ({ ok: true, events: [] });
  };
  const res = await fetchExternalEventsStatus(
    [cal("bad", "google"), cal("ok", "outlook")],
    MIN,
    MAX,
    1000,
    listFor,
  );
  assert.deepEqual(res.events, []);
  assert.deepEqual(res.unavailable, ["Google Calendar"]);
});

test("disabled calendars are not read and not reported", async () => {
  let calls = 0;
  const listFor = () => async (): Promise<EventsResult> => {
    calls++;
    return { ok: false, events: [] };
  };
  const res = await fetchExternalEventsStatus(
    [{ ...cal("off", "google"), enabled: false }],
    MIN,
    MAX,
    1000,
    listFor,
  );
  assert.equal(calls, 0);
  assert.deepEqual(res.unavailable, []);
});
