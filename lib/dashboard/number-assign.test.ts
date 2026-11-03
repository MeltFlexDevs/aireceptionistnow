import test from "node:test";
import assert from "node:assert/strict";

import { assignNumber, type NumberAssignDeps } from "./number-assign";

const input = { ownerId: "owner-1", assistantId: "a-1", country: "US", limit: 1 };
const BOUGHT = { e164: "+15550001234", sid: "PN_test_1" };

// Fake deps that log each call. `over` replaces some of them; it gets the log.
function fakeDeps(over: (calls: string[]) => Partial<NumberAssignDeps> = () => ({})) {
  const calls: string[] = [];
  const deps: NumberAssignDeps = {
    reserve: async () => {
      calls.push("reserve");
      return "ok";
    },
    release: async (assistantId) => {
      calls.push(`release:${assistantId}`);
    },
    claimFree: async () => {
      calls.push("claimFree");
      return null;
    },
    buy: async () => {
      calls.push("buy");
      return BOUGHT;
    },
    store: async (row) => {
      calls.push(`store:${row.e164}:${row.twilioSid}:${row.assistantId}`);
      return "num-1";
    },
    releaseTwilio: async (sid) => {
      calls.push(`releaseTwilio:${sid}`);
    },
    ...over(calls),
  };
  return { deps, calls };
}

test("busy: another run holds the slot, so nothing is bought or released", async () => {
  const { deps, calls } = fakeDeps(() => ({ reserve: async () => "busy" }));
  assert.deepEqual(await assignNumber(input, deps), { status: "busy" });
  assert.deepEqual(calls, []);
});

test("exists and limit come back as they are, before any claim or buy", async () => {
  for (const slot of ["exists", "limit"] as const) {
    const { deps, calls } = fakeDeps(() => ({ reserve: async () => slot }));
    assert.deepEqual(await assignNumber(input, deps), { status: slot });
    assert.deepEqual(calls, []);
  }
});

test("success with a bought number: store gets it and the slot is freed once", async () => {
  const { deps, calls } = fakeDeps();
  assert.deepEqual(await assignNumber(input, deps), {
    status: "ok",
    numberId: "num-1",
    e164: BOUGHT.e164,
  });
  assert.deepEqual(calls, [
    "reserve",
    "claimFree",
    "claimFree",
    "buy",
    "store:+15550001234:PN_test_1:a-1",
    "release:a-1",
  ]);
});

test("a pool number is claimed: nothing is bought", async () => {
  const { deps, calls } = fakeDeps((log) => ({
    claimFree: async (_assistantId, country) => {
      log.push(`claimFree:${country ?? "any"}`);
      return country ? null : { id: "pool-1", e164: "+15550009999" };
    },
  }));
  assert.deepEqual(await assignNumber(input, deps), {
    status: "ok",
    numberId: "pool-1",
    e164: "+15550009999",
  });
  assert.deepEqual(calls, ["reserve", "claimFree:US", "claimFree:any", "release:a-1"]);
});

test("store fails after a buy: the number goes back to Twilio, the slot is freed, the error goes up", async (t) => {
  const log = t.mock.method(console, "error", () => {});
  const boom = new Error("insert failed");
  const { deps, calls } = fakeDeps(() => ({
    store: async () => {
      throw boom;
    },
  }));
  await assert.rejects(assignNumber(input, deps), (err) => err === boom);
  assert.deepEqual(calls, [
    "reserve",
    "claimFree",
    "claimFree",
    "buy",
    "releaseTwilio:PN_test_1",
    "release:a-1",
  ]);
  assert.deepEqual(log.mock.calls[0]?.arguments, ["[numbers] released unused number", "PN_test_1"]);
});

test("the Twilio release fails too: the store error still goes up and the slot is freed", async (t) => {
  t.mock.method(console, "error", () => {});
  const boom = new Error("insert failed");
  const { deps, calls } = fakeDeps(() => ({
    store: async () => {
      throw boom;
    },
    releaseTwilio: async () => {
      throw new Error("twilio down");
    },
  }));
  await assert.rejects(assignNumber(input, deps), (err) => err === boom);
  assert.equal(calls[calls.length - 1], "release:a-1");
});

test("no owner (dev only): no slot is reserved or released", async () => {
  const { deps, calls } = fakeDeps();
  const res = await assignNumber({ ...input, ownerId: null }, deps);
  assert.equal(res.status, "ok");
  assert.deepEqual(calls, ["claimFree", "claimFree", "buy", "store:+15550001234:PN_test_1:a-1"]);
});

test("the reservation call fails: nothing is bought and the error goes up", async () => {
  const down = new Error("rpc down");
  const { deps, calls } = fakeDeps(() => ({
    reserve: async () => {
      throw down;
    },
  }));
  await assert.rejects(assignNumber(input, deps), (err) => err === down);
  assert.deepEqual(calls, []);
});
