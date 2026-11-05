import test from "node:test";
import assert from "node:assert/strict";
import { homeCalls, todayCounts } from "./analytics";

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const fresh = ago(5 * 60_000);
const sixHoursOld = ago(6 * 60 * 60_000);
const row = (
  over: Partial<{
    direction: string | null;
    assistant_id: string | null;
    duration_seconds: number | null;
    status: string;
    started_at: string;
  }> = {},
) => ({
  direction: "inbound",
  assistant_id: "a1",
  duration_seconds: 60,
  status: "completed",
  started_at: fresh,
  ...over,
});

test("homeCalls keeps inbound calls and drops outbound ones", () => {
  const rows = [
    row({ direction: "inbound" }),
    row({ direction: null }),
    row({ direction: "outbound-api" }),
    row({ direction: "outbound" }),
    row({ direction: "outbound-dial" }),
  ];
  assert.equal(homeCalls(rows).length, 2);
});

test("homeCalls drops rows the call log hides", () => {
  assert.equal(homeCalls([row({ assistant_id: null })]).length, 0);
  assert.equal(
    homeCalls([row({ duration_seconds: 0, status: "unknown", started_at: fresh })]).length,
    0,
  );
  assert.equal(homeCalls([row({ duration_seconds: 0, status: "no-answer" })]).length, 1);
  assert.equal(
    homeCalls([row({ duration_seconds: 0, status: "in-progress", started_at: fresh })]).length,
    1,
  );
});

test("the scenario: 9 inbound calls and 3 outbound calls count as 9", () => {
  const rows = [
    ...Array.from({ length: 7 }, () => row({ status: "completed" })),
    ...Array.from({ length: 2 }, () => row({ status: "no-answer" })),
    ...Array.from({ length: 3 }, () => row({ direction: "outbound", status: "completed" })),
  ];
  assert.deepEqual(todayCounts(homeCalls(rows)), { calls: 9, answered: 7, missed: 2 });
});

test("a live call is not missed, a stuck one is", () => {
  const rows = [
    row({ status: "completed" }),
    row({ status: "in-progress", started_at: fresh }),
    row({ status: "ringing", started_at: fresh }),
    row({ status: "in-progress", started_at: sixHoursOld }),
  ];
  assert.deepEqual(todayCounts(rows), { calls: 4, answered: 1, missed: 1 });
});

test("answered uses the list's completed bucket", () => {
  const rows = ["completed", "resolved", "busy", "failed"].map((status) => row({ status }));
  assert.deepEqual(todayCounts(rows), { calls: 4, answered: 2, missed: 2 });
});
