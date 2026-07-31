import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_DISCLOSURE,
  disclosureLine,
  groundingLine,
  guardrailLines,
  hasGuardrails,
  parseDisclosure,
  parseGuardrails,
} from "./policy";

test("disclosure defaults to answering honestly when asked", () => {
  // The old behaviour - deny being an AI - is now opt-in. If this default ever
  // flips back silently, every assistant starts dodging the question again.
  assert.equal(DEFAULT_DISCLOSURE, "if_asked");
  assert.equal(parseDisclosure({}), "if_asked");
  assert.equal(parseDisclosure(null), "if_asked");
  assert.equal(parseDisclosure({ disclosure: "nonsense" }), "if_asked");
});

test("the three disclosure modes are honoured", () => {
  assert.equal(parseDisclosure({ disclosure: "upfront" }), "upfront");
  assert.equal(parseDisclosure({ disclosure: "deflect" }), "deflect");
  assert.equal(parseDisclosure({ disclosure: " if_asked " }), "if_asked");
});

test("if_asked tells the truth but never raises it first", () => {
  const line = disclosureLine("if_asked", "Bright Dental");
  assert.match(line, /Never volunteer what you are/);
  assert.match(line, /tell them the truth/);
  assert.match(line, /Bright Dental/);
});

test("upfront discloses in the first breath and still answers honestly later", () => {
  const line = disclosureLine("upfront", "Bright Dental");
  assert.match(line, /first thing you say/);
  assert.match(line, /caller's own language/, "must not hard-code an English sentence");
  assert.match(line, /tell them the truth/, "a caller who asks later still gets a straight answer");
});

test("deflect keeps the old wording for operators who choose it", () => {
  const line = disclosureLine("deflect", "Bright Dental");
  assert.match(line, /don't discuss it/);
  assert.doesNotMatch(line, /tell them the truth/);
});

test("guardrail rules are trimmed, capped and stripped of blanks", () => {
  const g = parseGuardrails({
    guardrails: {
      neverDiscuss: ["  refund eligibility  ", "", 42, "x".repeat(500)],
      alwaysEscalate: Array.from({ length: 30 }, (_, i) => `rule ${i}`),
    },
  });
  assert.deepEqual(g.neverDiscuss.slice(0, 2), ["refund eligibility", "x".repeat(160)]);
  assert.equal(g.alwaysEscalate.length, 10);
});

test("no guardrails configured produces no prompt block at all", () => {
  const g = parseGuardrails({});
  assert.equal(hasGuardrails(g), false);
  assert.deepEqual(guardrailLines(g, true), []);
});

test("a forbidden subject always comes with what to do instead", () => {
  // A bare prohibition leaves the model to improvise the recovery, which is
  // exactly where the invented answer comes from.
  const g = parseGuardrails({ guardrails: { neverDiscuss: ["exact pricing for custom jobs"] } });
  const [line] = guardrailLines(g, true);
  assert.match(line, /exact pricing for custom jobs/);
  assert.match(line, /take a message/);
  assert.match(line, /do not estimate/i);
});

test("without a message tool the fallback promises a callback instead", () => {
  const g = parseGuardrails({ guardrails: { neverDiscuss: ["refunds"] } });
  const [line] = guardrailLines(g, false);
  assert.match(line, /someone from our team will follow up/);
  assert.doesNotMatch(line, /take a message/);
});

test("the standing grounding rule names the categories that actually cost money", () => {
  const line = groundingLine(true);
  for (const risky of ["prices", "refundable", "legal", "medical"]) {
    assert.match(line, new RegExp(risky, "i"), `${risky} must be called out explicitly`);
  }
});
