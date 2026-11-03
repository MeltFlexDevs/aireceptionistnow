import test from "node:test";
import assert from "node:assert/strict";

import { LIVE_MAX_AGE_MS, bookingWhenLabel, callOutcomeLabel, fmtDuration, isLiveStatus, pickActiveCallId, showInCallLog, statusBucket } from "./format";
import { en } from "../../i18n/dictionaries/en";

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const fresh = ago(5 * 60_000);
const sixHoursOld = ago(6 * 60 * 60_000);

test("the live age limit is four hours", () => {
  assert.equal(LIVE_MAX_AGE_MS, 4 * 60 * 60 * 1000);
});

test("a fresh in-progress call is live and active", () => {
  for (const raw of ["in-progress", "in_progress", "In-Progress"]) {
    assert.equal(isLiveStatus(raw, fresh), true, raw);
    assert.equal(statusBucket(raw, fresh), "active", raw);
  }
});

test("a six-hour-old in-progress row lost its end webhook and is over", () => {
  // Without the age guard a stuck row reads "in progress" forever: the Home
  // banner never clears and the recording route answers 409 for good.
  assert.equal(isLiveStatus("in-progress", sixHoursOld), false);
  assert.equal(statusBucket("in-progress", sixHoursOld), "unanswered");
});

test("ringing and queued follow the same rule", () => {
  for (const raw of ["ringing", "queued", "initiated"]) {
    assert.equal(isLiveStatus(raw, fresh), true, raw);
    assert.equal(statusBucket(raw, fresh), "active", raw);
    assert.equal(isLiveStatus(raw, sixHoursOld), false, raw);
    assert.equal(statusBucket(raw, sixHoursOld), "unanswered", raw);
  }
});

test("no date means no age guard, so callers must pass one", () => {
  assert.equal(isLiveStatus("in-progress"), true);
  assert.equal(statusBucket("ringing"), "active");
});

test("no-answer and busy are unanswered and never live, whatever their age", () => {
  for (const raw of ["no-answer", "busy"]) {
    for (const when of [fresh, sixHoursOld, undefined]) {
      assert.equal(isLiveStatus(raw, when), false, `${raw} ${when}`);
      assert.equal(statusBucket(raw, when), "unanswered", `${raw} ${when}`);
    }
  }
});

test("completed is completed and never live, whatever its age", () => {
  for (const when of [fresh, sixHoursOld, undefined]) {
    assert.equal(isLiveStatus("completed", when), false);
    assert.equal(statusBucket("completed", when), "completed");
  }
});

test("an unparseable date does not make a live call stale", () => {
  assert.equal(isLiveStatus("in-progress", "not a date"), true);
});

const row = (status: string, durationSec: number, date: string, assistant: string | null = "Ava") => ({
  status,
  durationSec,
  date,
  assistant,
});

test("the call log keeps a 0-second call that is stuck, missed, failed, answered or live", () => {
  // A row stuck in progress for hours lost its end webhook. It reads Missed on
  // Home and the detail page, so the log must list it too.
  assert.equal(showInCallLog(row("in_progress", 0, sixHoursOld)), true);
  assert.equal(showInCallLog(row("in-progress", 0, fresh)), true);
  for (const status of ["failed", "no-answer", "busy", "canceled", "completed"]) {
    assert.equal(showInCallLog(row(status, 0, fresh)), true, status);
  }
});

test("the call log drops a row with no assistant, whatever its length", () => {
  assert.equal(showInCallLog(row("completed", 75, fresh, null)), false);
  assert.equal(showInCallLog(row("in_progress", 0, sixHoursOld, null)), false);
});

test("the call log drops a 0-second row that is neither live nor ended", () => {
  assert.equal(showInCallLog(row("", 0, fresh)), false);
  assert.equal(showInCallLog(row("something-new", 0, fresh)), false);
  // With length it is a real conversation and stays.
  assert.equal(showInCallLog(row("something-new", 30, fresh)), true);
});

const d = en.data;

test("a call that never finished or never connected never reads 'Call handled'", () => {
  // The stuck in-progress call and the failed call both read "Call handled" on Home before.
  assert.equal(callOutcomeLabel(d, "in_progress", null, sixHoursOld), "Missed call");
  assert.equal(callOutcomeLabel(d, "failed", null, fresh), "Missed call");
  assert.equal(callOutcomeLabel(d, "no-answer", null, fresh), "Missed call");
  // The end state wins over a stray outcome.
  assert.equal(callOutcomeLabel(d, "failed", "booked", fresh), "Missed call");
});

test("a live call reads in progress", () => {
  assert.equal(callOutcomeLabel(d, "in_progress", null, fresh), "Call in progress");
});

test("an answered call reads what the receptionist did, a hang-up included", () => {
  assert.equal(callOutcomeLabel(d, "completed", "booked", fresh), d.outcomeBooked);
  assert.equal(callOutcomeLabel(d, "completed", "Message", fresh), d.outcomeMessage);
  assert.equal(callOutcomeLabel(d, "completed", "transferred", fresh), d.outcomeTransferred);
  assert.equal(callOutcomeLabel(d, "completed", "resolved", fresh), d.outcomeResolved);
  assert.equal(callOutcomeLabel(d, "completed", "abandoned", fresh), "Caller hung up");
});

test("an answered call with no known outcome reads 'Call handled'", () => {
  assert.equal(callOutcomeLabel(d, "completed", null, fresh), "Call handled");
  assert.equal(callOutcomeLabel(d, "completed", "something-new", fresh), "Call handled");
});

test("the pane opens the call the URL asks for, even when the list does not show it", () => {
  const rows = [{ dbId: null }, { dbId: "newest" }, { dbId: "older" }];
  assert.equal(pickActiveCallId("older", rows), "older");
  // Not on this page (filtered out or past the scan): still that call, never silently another one.
  assert.equal(pickActiveCallId("not-listed", rows), "not-listed");
});

test("without a selection the pane opens the newest call that has a record", () => {
  assert.equal(pickActiveCallId("", [{ dbId: null }, { dbId: "newest" }, { dbId: "older" }]), "newest");
  assert.equal(pickActiveCallId("", [{ dbId: null }]), "");
  assert.equal(pickActiveCallId("", []), "");
});

test("a booking stored as a Z instant shows on the business clock", () => {
  // 15:00Z on Nov 1 2026 is 09:00 CST in Chicago, not 15:00.
  assert.equal(
    bookingWhenLabel("2026-11-01T15:00:00Z", "2026-11-01T16:00:00Z", "en-GB", "America/Chicago"),
    "Sun 1 Nov · 09:00 - 10:00",
  );
});

test("a booking stored with an offset is read as the same instant", () => {
  assert.equal(
    bookingWhenLabel("2026-11-01T09:00:00-06:00", "2026-11-01T10:00:00-06:00", "en-GB", "America/Chicago"),
    "Sun 1 Nov · 09:00 - 10:00",
  );
});

test("a booking with no end shows only the start", () => {
  assert.equal(bookingWhenLabel("2026-11-01T15:00:00Z", "", "en-GB", "America/Chicago"), "Sun 1 Nov · 09:00");
});

test("a bad zone falls back to UTC and a bad start renders nothing", () => {
  assert.equal(
    bookingWhenLabel("2026-11-01T15:00:00Z", "2026-11-01T16:00:00Z", "en-GB", "Not/AZone"),
    "Sun 1 Nov · 15:00 - 16:00",
  );
  assert.equal(bookingWhenLabel("not a date", "", "en-GB", "America/Chicago"), "");
});

test("fmtDuration shows seconds alone under a minute, else minutes and padded seconds", () => {
  assert.equal(fmtDuration(47), "47s");
  assert.equal(fmtDuration(0), "0s");
  assert.equal(fmtDuration(59.6), "1m 00s");
  assert.equal(fmtDuration(94), "1m 34s");
  assert.equal(fmtDuration(185), "3m 05s");
  assert.equal(fmtDuration(-5), "0s");
});
