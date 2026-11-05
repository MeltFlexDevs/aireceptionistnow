import assert from "node:assert/strict";
import { test } from "node:test";

import { DEFAULT_COUNTRY } from "@/lib/number-pricing";

import { provisionCountry } from "./provision-country";

// A blank saved country must reach the free-pool claim as the default, the way
// buyTwilioNumber already reads it. As "" it skipped the pool and bought a new number.
test("a blank or missing saved country provisions in the default country", () => {
  assert.equal(provisionCountry(""), DEFAULT_COUNTRY);
  assert.equal(provisionCountry(undefined), DEFAULT_COUNTRY);
  assert.equal(provisionCountry(null), DEFAULT_COUNTRY);
});

test("a saved country is upper-cased", () => {
  assert.equal(provisionCountry("gb"), "GB");
  assert.equal(provisionCountry("US"), "US");
});
