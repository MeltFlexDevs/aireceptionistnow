import assert from "node:assert/strict";
import { test } from "node:test";
import {
  freeSharedCap,
  isServedCountry,
  reserveTestCall,
  testCallCountry,
  testCallRefusalMessage,
  type ReserveReply,
  type TestCallStore,
} from "./test-call-limit";

/** In-memory store with the same rules as reserve_test_call. */
function fakeStore() {
  const rows: { id: string; owner: string; free: boolean }[] = [];
  let n = 0;
  const store: TestCallStore = {
    async reserve(i): Promise<ReserveReply> {
      if (rows.filter((r) => r.owner === i.owner).length >= i.ownerCap) {
        return { refused: "owner_limit" };
      }
      if (i.free && rows.filter((r) => r.free).length >= i.freeCap) {
        return { refused: "free_limit" };
      }
      const id = `row${++n}`;
      rows.push({ id, owner: i.owner, free: i.free });
      return { id };
    },
    async release(id) {
      const at = rows.findIndex((r) => r.id === id);
      if (at >= 0) rows.splice(at, 1);
    },
  };
  return { store, rows };
}

const req = (owner: string, free: boolean) => ({ owner, assistant: "a1", free, country: "US" });

test("free account: the 3rd call is allowed and the 4th refused", async () => {
  const { store } = fakeStore();
  for (let i = 0; i < 3; i++) {
    assert.equal((await reserveTestCall(store, req("u1", true), 50)).ok, true);
  }
  const fourth = await reserveTestCall(store, req("u1", true), 50);
  assert.deepEqual(fourth, { ok: false, reason: "owner_limit" });
});

test("paid account: the 20th call is allowed and the 21st refused", async () => {
  const { store } = fakeStore();
  for (let i = 0; i < 20; i++) {
    assert.equal((await reserveTestCall(store, req("u1", false))).ok, true);
  }
  assert.deepEqual(await reserveTestCall(store, req("u1", false)), {
    ok: false,
    reason: "owner_limit",
  });
});

test("all free accounts share one cap; paid accounts ignore it", async () => {
  const { store } = fakeStore();
  assert.equal((await reserveTestCall(store, req("u1", true), 2)).ok, true);
  assert.equal((await reserveTestCall(store, req("u2", true), 2)).ok, true);
  assert.deepEqual(await reserveTestCall(store, req("u3", true), 2), {
    ok: false,
    reason: "free_limit",
  });
  assert.equal((await reserveTestCall(store, req("u4", false), 2)).ok, true);
});

test("a failed placement frees its slot, once", async () => {
  const { store, rows } = fakeStore();
  const slot = await reserveTestCall(store, req("u1", true), 50);
  assert.ok(slot.ok);
  assert.equal(rows.length, 1);
  await slot.release();
  await slot.release();
  assert.equal(rows.length, 0);
  for (let i = 0; i < 3; i++) {
    assert.equal((await reserveTestCall(store, req("u1", true), 50)).ok, true);
  }
});

test("a store error propagates so the caller fails closed", async () => {
  const store: TestCallStore = {
    reserve: async () => {
      throw new Error("rpc missing");
    },
    release: async () => {},
  };
  await assert.rejects(reserveTestCall(store, req("u1", true)), /rpc missing/);
});

test("testCallCountry: served countries pass, others are refused", () => {
  assert.equal(testCallCountry("+14155550142"), "US");
  assert.equal(testCallCountry("+447700900123"), "GB");
  assert.equal(testCallCountry("+421903123456"), "SK");
  assert.equal(testCallCountry("+79161234567"), null);
});

test("testCallCountry refuses NANP toll-fraud area codes", () => {
  for (const area of ["876", "242", "809", "900", "345"]) {
    assert.equal(testCallCountry(`+1${area}2345678`), null, area);
  }
  assert.equal(testCallCountry("+14165550142"), "US");
});

test("freeSharedCap reads the env value, default 50", () => {
  assert.equal(freeSharedCap("10"), 10);
  assert.equal(freeSharedCap(undefined), 50);
  assert.equal(freeSharedCap(""), 50);
  assert.equal(freeSharedCap("abc"), 50);
  assert.equal(freeSharedCap("0"), 50);
  assert.equal(freeSharedCap("-4"), 50);
  assert.equal(freeSharedCap("2.5"), 50);
});

test("refusal messages name the right limit", () => {
  assert.match(testCallRefusalMessage("owner_limit", true), /3 free test calls/);
  assert.match(testCallRefusalMessage("owner_limit", false), /20 test calls/);
  assert.match(testCallRefusalMessage("free_limit", true), /busy today/);
});

test("isServedCountry accepts only served upper-case codes", () => {
  assert.equal(isServedCountry("US"), true);
  assert.equal(isServedCountry("SK"), true);
  assert.equal(isServedCountry("KP"), false);
  assert.equal(isServedCountry("XX"), false);
  assert.equal(isServedCountry("us"), false);
});
