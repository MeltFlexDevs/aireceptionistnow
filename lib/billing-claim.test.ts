import assert from "node:assert/strict";
import { test } from "node:test";

import { claimConflictResponse, toClaimState } from "./billing-claim";

test("toClaimState passes the three claim results through", () => {
  for (const state of ["claimed", "processed", "busy"] as const) {
    assert.equal(toClaimState(state, "claim_stripe_event"), state);
  }
});

test("toClaimState throws on any other value, so the route answers 500 and the sender retries", () => {
  for (const data of [true, false, null, undefined, "", "done"]) {
    assert.throws(() => toClaimState(data, "claim_billing_event"), /claim_billing_event returned/);
  }
});

test("a claimed event gets no early answer", () => {
  assert.equal(claimConflictResponse("claimed"), null);
});

test("a processed event answers 200 duplicate", async () => {
  const res = claimConflictResponse("processed");
  assert.ok(res);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { received: true, duplicate: true });
});

test("an event another run holds answers 409, so the sender retries later", async () => {
  const res = claimConflictResponse("busy");
  assert.ok(res);
  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { error: "Event in progress." });
});
