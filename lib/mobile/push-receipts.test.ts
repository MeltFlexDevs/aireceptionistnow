import test from "node:test";
import assert from "node:assert/strict";

import {
  DELETE_CHUNK,
  RECEIPT_BATCH,
  RECEIPT_DELAY_MS,
  TICKET_MAX_AGE_MS,
  UNANSWERED_MAX_AGE_MS,
  checkPushReceipts,
  readReceipts,
  readTickets,
  type ExpoReceipt,
  type PushTicketRow,
  type ReceiptSweepDeps,
} from "./push-receipts";

const NOW = Date.parse("2026-11-04T12:00:00.000Z");

test("readTickets keeps ok tickets with their device id and splits out dead tokens and other errors", () => {
  const targets = [
    { id: "dev-1", token: "ExponentPushToken[a]" },
    { id: "dev-2", token: "ExponentPushToken[b]" },
    { id: "dev-3", token: "ExponentPushToken[c]" },
    { id: "dev-4", token: "ExponentPushToken[d]" },
  ];
  const result = readTickets(targets, [
    { status: "ok", id: "ticket-1" },
    { status: "error", message: "gone", details: { error: "DeviceNotRegistered" } },
    { status: "error", message: "too big", details: { error: "MessageTooBig" } },
    { status: "ok" },
  ]);
  assert.deepEqual(result.pending, [{ ticket_id: "ticket-1", push_device_id: "dev-1" }]);
  assert.deepEqual(result.dead, ["ExponentPushToken[b]"]);
  assert.deepEqual(result.errors, ["too big"]);
});

test("readTickets ignores a ticket without a matching target", () => {
  const result = readTickets(
    [{ id: "dev-1", token: "ExponentPushToken[a]" }],
    [
      { status: "ok", id: "ticket-1" },
      { status: "ok", id: "ticket-2" },
    ],
  );
  assert.deepEqual(result.pending, [{ ticket_id: "ticket-1", push_device_id: "dev-1" }]);
  assert.deepEqual(result.dead, []);
  assert.deepEqual(result.errors, []);
});

test("readReceipts marks each ticket with a receipt as done and lists each dead device once", () => {
  const asked: PushTicketRow[] = [
    { ticket_id: "t1", push_device_id: "dev-1" },
    { ticket_id: "t2", push_device_id: "dev-2" },
    { ticket_id: "t3", push_device_id: "dev-2" },
    { ticket_id: "t4", push_device_id: "dev-3" },
    { ticket_id: "t5", push_device_id: "dev-4" },
  ];
  const result = readReceipts(asked, {
    t1: { status: "ok" },
    t2: { status: "error", details: { error: "DeviceNotRegistered" } },
    t3: { status: "error", details: { error: "DeviceNotRegistered" } },
    t4: { status: "error", message: "rate", details: { error: "MessageRateExceeded" } },
  });
  // t5 has no receipt yet: it waits for the next run.
  assert.deepEqual(result.done, ["t1", "t2", "t3", "t4"]);
  assert.deepEqual(result.deadDeviceIds, ["dev-2"]);
  assert.deepEqual(result.errors, ["rate"]);
});

function fakeDeps(
  due: (PushTicketRow & { created_at?: string })[],
  receipts: Record<string, ExpoReceipt>,
) {
  const calls = {
    order: [] as string[],
    expired: [] as Date[],
    listed: [] as [Date, number][],
    fetched: [] as string[][],
    devices: [] as string[][],
    tickets: [] as string[][],
  };
  const deps: ReceiptSweepDeps = {
    deleteExpired: async (before) => {
      calls.order.push("expired");
      calls.expired.push(before);
    },
    listDue: async (before, limit) => {
      calls.order.push("list");
      calls.listed.push([before, limit]);
      // Just due, unless a row says when it was sent.
      return due.map((row) => ({ created_at: new Date(NOW - RECEIPT_DELAY_MS).toISOString(), ...row }));
    },
    fetchReceipts: async (ids) => {
      calls.order.push("fetch");
      calls.fetched.push(ids);
      return receipts;
    },
    deleteDevices: async (ids) => {
      calls.order.push("devices");
      calls.devices.push(ids);
    },
    deleteTickets: async (ids) => {
      calls.order.push("tickets");
      calls.tickets.push(ids);
    },
  };
  return { deps, calls };
}

test("checkPushReceipts drops expired tickets, checks due ones, then deletes dead devices before done tickets", async (t) => {
  const log = t.mock.method(console, "error", () => {});
  const { deps, calls } = fakeDeps(
    [
      { ticket_id: "t1", push_device_id: "dev-1" },
      { ticket_id: "t2", push_device_id: "dev-2" },
      { ticket_id: "t3", push_device_id: "dev-3" },
      { ticket_id: "t4", push_device_id: "dev-4" },
    ],
    {
      t1: { status: "ok" },
      t2: { status: "error", details: { error: "DeviceNotRegistered" } },
      t4: { status: "error", message: "rate", details: { error: "MessageRateExceeded" } },
    },
  );
  const result = await checkPushReceipts(deps, NOW);
  assert.deepEqual(result, { checked: 4, done: 3, dead: 1 });
  assert.deepEqual(calls.order, ["expired", "list", "fetch", "devices", "tickets"]);
  assert.deepEqual(calls.expired, [new Date(NOW - TICKET_MAX_AGE_MS)]);
  assert.deepEqual(calls.listed, [[new Date(NOW - RECEIPT_DELAY_MS), RECEIPT_BATCH]]);
  assert.deepEqual(calls.fetched, [["t1", "t2", "t3", "t4"]]);
  assert.deepEqual(calls.devices, [["dev-2"]]);
  assert.deepEqual(calls.tickets, [["t1", "t2", "t4"]]);
  assert.equal(log.mock.callCount(), 1);
  assert.equal(log.mock.calls[0].arguments[0], "[push] receipt error: rate");
});

test("checkPushReceipts does not call Expo when no ticket is due", async () => {
  const { deps, calls } = fakeDeps([], {});
  const result = await checkPushReceipts(deps, NOW);
  assert.deepEqual(result, { checked: 0, done: 0, dead: 0 });
  assert.deepEqual(calls.order, ["expired", "list"]);
});

test("checkPushReceipts keeps every ticket when the Expo request fails", async () => {
  const { deps, calls } = fakeDeps([{ ticket_id: "t1", push_device_id: "dev-1" }], {});
  deps.fetchReceipts = async () => {
    throw new Error("expo responded 500");
  };
  await assert.rejects(checkPushReceipts(deps, NOW), /expo responded 500/);
  assert.deepEqual(calls.devices, []);
  assert.deepEqual(calls.tickets, []);
});

test("checkPushReceipts keeps the tickets when deleting a dead device fails", async () => {
  const { deps, calls } = fakeDeps([{ ticket_id: "t1", push_device_id: "dev-1" }], {
    t1: { status: "error", details: { error: "DeviceNotRegistered" } },
  });
  deps.deleteDevices = async () => {
    throw new Error("db down");
  };
  await assert.rejects(checkPushReceipts(deps, NOW), /db down/);
  assert.deepEqual(calls.tickets, []);
});

test("checkPushReceipts drops a ticket that still has no receipt an hour after the send", async () => {
  const hourOld = new Date(NOW - UNANSWERED_MAX_AGE_MS - 1).toISOString();
  const { deps, calls } = fakeDeps(
    [
      { ticket_id: "old", push_device_id: "dev-1", created_at: hourOld },
      { ticket_id: "new", push_device_id: "dev-2" },
      { ticket_id: "ok", push_device_id: "dev-3", created_at: hourOld },
    ],
    { ok: { status: "ok" } },
  );
  const result = await checkPushReceipts(deps, NOW);
  // "new" was sent just over 15 minutes ago, so it waits for the next run.
  assert.deepEqual(calls.tickets, [["ok", "old"]]);
  assert.deepEqual(result, { checked: 3, done: 1, dead: 0 });
});

test("checkPushReceipts deletes done tickets in chunks", async () => {
  const due = Array.from({ length: RECEIPT_BATCH }, (_, i) => ({
    ticket_id: `t${i}`,
    push_device_id: "dev-1",
  }));
  const receipts: Record<string, ExpoReceipt> = {};
  for (const row of due) receipts[row.ticket_id] = { status: "ok" };
  const { deps, calls } = fakeDeps(due, receipts);
  const result = await checkPushReceipts(deps, NOW);
  assert.deepEqual(result, { checked: RECEIPT_BATCH, done: RECEIPT_BATCH, dead: 0 });
  assert.deepEqual(
    calls.tickets.map((ids) => ids.length),
    [DELETE_CHUNK, DELETE_CHUNK],
  );
  assert.deepEqual(calls.devices, []);
});
