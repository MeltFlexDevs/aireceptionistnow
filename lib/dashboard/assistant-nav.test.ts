import test from "node:test";
import assert from "node:assert/strict";

import { assistantsNavHref } from "./assistant-nav";

test("one assistant links straight to it", () => {
  assert.equal(assistantsNavHref(1, { id: "a1" }), "/dashboard/assistant/a1");
});

test("no assistants links to the list page", () => {
  assert.equal(assistantsNavHref(0, null), "/dashboard/assistant");
});

test("several assistants link to the list page", () => {
  assert.equal(assistantsNavHref(2, { id: "a1" }), "/dashboard/assistant");
});

test("count 1 without an assistant falls back to the list page", () => {
  assert.equal(assistantsNavHref(1, null), "/dashboard/assistant");
});
