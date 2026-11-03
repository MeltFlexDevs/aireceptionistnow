import assert from "node:assert/strict";
import { test } from "node:test";
import { CAS_ATTEMPTS, updateWithRetry } from "./config-cas";

type V = { sources: string[] };

function makeFake() {
  let store = { value: { sources: [] as string[] }, version: "v0" };
  let n = 0;
  const tick = () => new Promise((r) => setImmediate(r));
  const read = async () => {
    const snap = { value: { sources: [...store.value.sources] }, version: store.version };
    await tick();
    return snap;
  };
  const write = async (next: V, version: string | null) => {
    await tick();
    if (version !== store.version) return false;
    store = { value: next, version: `v${++n}` };
    return true;
  };
  return {
    read,
    write,
    get: () => store,
    set: (s: typeof store) => {
      store = s;
    },
  };
}

const add = (id: string) => (v: V) => ({ sources: [...v.sources, id] });

test("two adds at once both stay", async () => {
  const f = makeFake();
  await Promise.all([
    updateWithRetry(f.read, f.write, add("pdf")),
    updateWithRetry(f.read, f.write, add("note")),
  ]);
  assert.deepEqual([...f.get().value.sources].sort(), ["note", "pdf"]);
});

test("a conflict re-reads and re-applies the change", async () => {
  const f = makeFake();
  let reads = 0;
  const read = async () => {
    reads++;
    const snap = await f.read();
    if (reads === 1) f.set({ value: { sources: ["pdf"] }, version: "other" });
    return snap;
  };
  await updateWithRetry(read, f.write, add("note"));
  assert.deepEqual(f.get().value.sources, ["pdf", "note"]);
  assert.equal(reads, 2);
});

test("three conflicts give an error", async () => {
  const f = makeFake();
  let calls = 0;
  const alwaysConflict = async () => {
    calls++;
    return false;
  };
  await assert.rejects(updateWithRetry(f.read, alwaysConflict, add("x")), /Try again/);
  assert.equal(calls, CAS_ATTEMPTS);
  assert.equal(CAS_ATTEMPTS, 3);
});

test("a write error is not retried", async () => {
  const f = makeFake();
  let calls = 0;
  const failing = async () => {
    calls++;
    throw new Error("db down");
  };
  await assert.rejects(updateWithRetry(f.read, failing, add("x")), /db down/);
  assert.equal(calls, 1);
});
