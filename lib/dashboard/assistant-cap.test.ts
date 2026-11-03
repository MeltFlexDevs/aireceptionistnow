import test from "node:test";
import assert from "node:assert/strict";

import { FALLBACK_LIMITS } from "@/lib/plans";
import { mayAddAssistant } from "./assistant-cap";

const plan = (assistants: number, cap: number) => async () => ({
  usage: { numbers: 0, assistants },
  limits: { ...FALLBACK_LIMITS, assistants: cap },
});

test("mayAddAssistant allows a create under the cap", async () => {
  assert.equal(await mayAddAssistant("u1", plan(0, 1)), true);
});

test("mayAddAssistant refuses a create at or over the cap", async () => {
  assert.equal(await mayAddAssistant("u1", plan(1, 1)), false);
  assert.equal(await mayAddAssistant("u1", plan(2, 1)), false);
});

test("mayAddAssistant fails open when there is no plan or the read fails", async () => {
  assert.equal(await mayAddAssistant("u1", async () => null), true);
  assert.equal(
    await mayAddAssistant("u1", async () => {
      throw new Error("db down");
    }),
    true,
  );
});
