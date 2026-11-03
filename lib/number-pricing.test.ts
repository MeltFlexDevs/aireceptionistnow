import assert from "node:assert/strict";
import { test } from "node:test";

import { DIAL_OPTIONS, joinPhone } from "./number-pricing";

test("every dial option has a local example that joins to a valid number", () => {
  assert.ok(DIAL_OPTIONS.length > 0);
  for (const d of DIAL_OPTIONS) {
    assert.ok(d.example, `${d.code} has an example`);
    // The picker shows the +code; the example is the local part without the trunk 0.
    assert.ok(!/^[+0]/.test(d.example), `${d.code}: ${d.example}`);
    const e164 = joinPhone(d.dial, d.example);
    assert.match(e164, /^\+[1-9]\d{6,14}$/, `${d.code} -> ${e164}`);
    if (d.dial === "+1") assert.match(e164, /^\+1[2-9]\d{2}[2-9]\d{6}$/, `${d.code} -> ${e164}`);
  }
});

test("the US example is a fictional 555-01xx number", () => {
  assert.equal(DIAL_OPTIONS.find((d) => d.code === "US")?.example, "415 555 0142");
});
