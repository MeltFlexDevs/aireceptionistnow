import test, { mock } from "node:test";
import assert from "node:assert/strict";

import { CANCEL_CLAIM_STALE_MS, staleCancelClaim } from "./calendar";
import {
  cancelBooking,
  planCancelClaim,
  type BookingForCancel,
  type CancelBookingDeps,
  type CancellationState,
} from "./booking-cancel";

const NOW = Date.parse("2026-10-28T12:00:00.000Z");
const ago = (ms: number): string => new Date(NOW - ms).toISOString();
const OLD = ago(CANCEL_CLAIM_STALE_MS + 1_000);

test("a dead cancel claim older than the limit reads as the status before it", () => {
  assert.deepEqual(staleCancelClaim("cancelled", { cancelClaim: { at: OLD, status: "done" } }, NOW), {
    at: OLD,
    status: "done",
  });
});

test("a fresh claim, a saved cancel, a row with no claim and a live row are not stale", () => {
  assert.equal(staleCancelClaim("cancelled", { cancelClaim: { at: ago(60_000), status: "done" } }, NOW), null);
  assert.equal(
    staleCancelClaim("cancelled", { cancelClaim: { at: OLD, status: "done" }, cancellation: { reason: "" } }, NOW),
    null,
  );
  assert.equal(staleCancelClaim("cancelled", {}, NOW), null);
  assert.equal(staleCancelClaim("done", { cancelClaim: { at: OLD, status: "done" } }, NOW), null);
  assert.equal(staleCancelClaim("cancelled", { cancelClaim: { at: "not a date", status: "done" } }, NOW), null);
  assert.equal(staleCancelClaim("cancelled", { cancelClaim: { at: OLD, status: "cancelled" } }, NOW), null);
  assert.equal(staleCancelClaim("cancelled", { cancelClaim: { at: OLD } }, NOW), null);
});

const BOOKING = { actionId: "act-1", status: "done" } as unknown as BookingForCancel;
const INPUT = { reason: "Closed today", offerRebook: true, log: "test" };

function fakeDeps(overrides: Partial<CancelBookingDeps> = {}): {
  deps: CancelBookingDeps;
  log: string[];
  saved: CancellationState[];
} {
  const log: string[] = [];
  const saved: CancellationState[] = [];
  const deps: CancelBookingDeps = {
    claim: async (id) => {
      log.push(`claim:${id}`);
      return true;
    },
    cancelEvent: async () => {
      log.push("cancel-event");
      return { ok: true };
    },
    save: async (id, state) => {
      log.push(`save:${id}`);
      saved.push(state);
    },
    release: async (id, status) => {
      log.push(`release:${id}:${status}`);
    },
    ...overrides,
  };
  return { deps, log, saved };
}

async function quietly<T>(fn: () => Promise<T>): Promise<T> {
  const error = mock.method(console, "error", () => {});
  try {
    return await fn();
  } finally {
    error.mock.restore();
  }
}

test("planCancelClaim: a live row is claimed and keeps its status", () => {
  const now = new Date(NOW);
  assert.deepEqual(planCancelClaim("done", {}, now), {
    claim: { at: now.toISOString(), status: "done" },
    staleAt: null,
  });
});

test("planCancelClaim: a stale claim is taken again, guarded on its old time", () => {
  const now = new Date(NOW);
  assert.deepEqual(planCancelClaim("cancelled", { cancelClaim: { at: OLD, status: "done" } }, now), {
    claim: { at: now.toISOString(), status: "done" },
    staleAt: OLD,
  });
});

test("planCancelClaim: a fresh claim or a saved cancel is refused", () => {
  const now = new Date(NOW);
  assert.equal(planCancelClaim("cancelled", { cancelClaim: { at: ago(60_000), status: "done" } }, now), null);
  assert.equal(planCancelClaim("cancelled", { cancellation: { reason: "" } }, now), null);
  assert.equal(planCancelClaim("done", { cancellation: { reason: "" } }, now), null);
});

test("two racing cancels: one cancels, the other is claimed elsewhere (409)", async () => {
  let taken = false;
  const { deps, log } = fakeDeps({
    claim: async () => {
      await Promise.resolve();
      if (taken) return false;
      taken = true;
      return true;
    },
  });
  const outcomes = await Promise.all([cancelBooking(BOOKING, INPUT, deps), cancelBooking(BOOKING, INPUT, deps)]);
  assert.deepEqual(outcomes.map((o) => o.kind).sort(), ["claimed-elsewhere", "ok"]);
  assert.deepEqual(log, ["cancel-event", "save:act-1"]);
});

test("a cancel saves the pending state and returns the calendar result", async () => {
  const { deps, log, saved } = fakeDeps({
    cancelEvent: async () => ({ ok: false, error: "gone" }),
  });
  const res = await cancelBooking(BOOKING, INPUT, deps);
  assert.deepEqual(res, { kind: "ok", cal: { ok: false, error: "gone" } });
  assert.deepEqual(log, ["claim:act-1", "save:act-1"]);
  assert.equal(saved[0].reason, "Closed today");
  assert.equal(saved[0].offerRebook, true);
  assert.equal(saved[0].notifyStatus, "pending");
  assert.equal(saved[0].calendarCancelled, false);
  assert.equal(saved[0].calendarError, "gone");
});

test("a failed save gives the row back with the status read at load", async () => {
  const { deps, log } = fakeDeps({
    save: async () => {
      throw new Error("db down");
    },
  });
  const res = await quietly(() => cancelBooking(BOOKING, INPUT, deps));
  assert.deepEqual(res, { kind: "failed" });
  assert.deepEqual(log, ["claim:act-1", "cancel-event", "release:act-1:done"]);
});

test("a calendar cancel that throws also gives the row back", async () => {
  const { deps, log } = fakeDeps({
    cancelEvent: async () => {
      throw new Error("calendar down");
    },
  });
  const res = await quietly(() => cancelBooking(BOOKING, INPUT, deps));
  assert.deepEqual(res, { kind: "failed" });
  assert.deepEqual(log, ["claim:act-1", "release:act-1:done"]);
});

test("a release that throws still answers failed", async () => {
  const { deps } = fakeDeps({
    save: async () => {
      throw new Error("db down");
    },
    release: async () => {
      throw new Error("db still down");
    },
  });
  const res = await quietly(() => cancelBooking(BOOKING, INPUT, deps));
  assert.deepEqual(res, { kind: "failed" });
});

test("a claim that throws fails before any side effect", async () => {
  const { deps, log } = fakeDeps({
    claim: async () => {
      throw new Error("db down");
    },
  });
  const res = await quietly(() => cancelBooking(BOOKING, INPUT, deps));
  assert.deepEqual(res, { kind: "failed" });
  assert.deepEqual(log, []);
});
