import test from "node:test";
import assert from "node:assert/strict";

import { type BasicsDraft, encodeBasicsDraft, parseBasicsDraft } from "./onboarding-draft";

const LAST = 4;
const draft: BasicsDraft = {
  email: "user@example.com",
  step: 2,
  business: "Bright Dental",
  website: "",
  name: "Emma",
  countryCode: "US",
  phoneCode: "US",
  phoneLocal: "415 555 0142",
  voiceId: "voice-1",
  gender: "f",
};

test("no stored draft gives null", () => {
  assert.equal(parseBasicsDraft(null, draft.email, LAST), null);
});

test("a draft for the same account comes back whole", () => {
  assert.deepEqual(parseBasicsDraft(encodeBasicsDraft(draft), draft.email, LAST), draft);
});

test("a draft saved for another account is ignored", () => {
  assert.equal(parseBasicsDraft(encodeBasicsDraft(draft), "other@example.com", LAST), null);
});

test("broken JSON is ignored", () => {
  assert.equal(parseBasicsDraft("{not json", draft.email, LAST), null);
});

test("a draft with a wrong field type is ignored", () => {
  const raw = JSON.stringify({ ...draft, business: 7 });
  assert.equal(parseBasicsDraft(raw, draft.email, LAST), null);
});

test("a draft with an unknown gender is ignored", () => {
  const raw = JSON.stringify({ ...draft, gender: "x" });
  assert.equal(parseBasicsDraft(raw, draft.email, LAST), null);
});

test("without a business or website the step goes back to the first substep", () => {
  const raw = encodeBasicsDraft({ ...draft, business: "  ", website: "" });
  assert.equal(parseBasicsDraft(raw, draft.email, LAST)?.step, 0);
});

test("a website alone keeps the saved step", () => {
  const raw = encodeBasicsDraft({ ...draft, business: "", website: "example.com", step: 3 });
  assert.equal(parseBasicsDraft(raw, draft.email, LAST)?.step, 3);
});

test("the done beat is never restored", () => {
  const raw = encodeBasicsDraft({ ...draft, step: LAST + 1 });
  assert.equal(parseBasicsDraft(raw, draft.email, LAST)?.step, LAST);
});

test("a negative step is raised to the first substep", () => {
  const raw = encodeBasicsDraft({ ...draft, step: -2 });
  assert.equal(parseBasicsDraft(raw, draft.email, LAST)?.step, 0);
});
