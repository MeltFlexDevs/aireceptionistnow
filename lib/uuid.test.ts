import { test } from "node:test";
import assert from "node:assert/strict";

import { isUuid } from "./uuid";

test("isUuid accepts a v4 id in lower or upper case", () => {
  assert.equal(isUuid("3f2b8c1e-9a4d-4e7b-8c2a-1d5e6f7a8b9c"), true);
  assert.equal(isUuid("3F2B8C1E-9A4D-4E7B-8C2A-1D5E6F7A8B9C"), true);
});

test("isUuid rejects anything Postgres would refuse as a uuid", () => {
  assert.equal(isUuid("abc"), false);
  assert.equal(isUuid(""), false);
  assert.equal(isUuid("3f2b8c1e9a4d4e7b8c2a1d5e6f7a8b9c"), false);
  assert.equal(isUuid(" 3f2b8c1e-9a4d-4e7b-8c2a-1d5e6f7a8b9c"), false);
  assert.equal(isUuid("3f2b8c1e-9a4d-4e7b-8c2a-1d5e6f7a8b9c\n"), false);
});
