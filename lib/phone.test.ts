import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizePhone, phoneToSave } from "./phone";

test("separators are stripped and the E.164 form comes back", () => {
  assert.equal(normalizePhone("+1 (415) 555-0142"), "+14155550142");
  assert.equal(normalizePhone("+421 905 123 456"), "+421905123456");
  assert.equal(normalizePhone("+44.20.7946.0958"), "+442079460958");
  assert.equal(normalizePhone(" +4930123456 "), "+4930123456");
});

test("a number without the + and country code is rejected", () => {
  assert.equal(normalizePhone("0905 123 456"), null);
  assert.equal(normalizePhone("(512) 555-0177"), null);
  assert.equal(normalizePhone("00421905123456"), null);
});

test("E.164 allows 7 to 15 digits and no leading 0 in the country code", () => {
  assert.equal(normalizePhone("+4412345"), "+4412345");
  assert.equal(normalizePhone("+441234"), null);
  assert.equal(normalizePhone("+421905123456789"), "+421905123456789");
  assert.equal(normalizePhone("+4219051234567890"), null);
  assert.equal(normalizePhone("+0123456789"), null);
});

test("a +1 number needs 10 digits with a real area code and exchange", () => {
  assert.equal(normalizePhone("+1 415 555 0142"), "+14155550142");
  assert.equal(normalizePhone("+1 415 555"), null);
  assert.equal(normalizePhone("+1 415 555 01420"), null);
  assert.equal(normalizePhone("+1 015 555 0142"), null);
  assert.equal(normalizePhone("+1 415 155 0142"), null);
});

test("empty input and letters are rejected", () => {
  assert.equal(normalizePhone(""), null);
  assert.equal(normalizePhone("abc123"), null);
  assert.equal(normalizePhone("+1 415 CALL NOW"), null);
});

test("phoneToSave checks only a changed phone, like the mobile settings route", () => {
  // Unchanged legacy value (separators ignored) is kept exactly as stored.
  assert.equal(phoneToSave("0905 123 456", "0905 123 456"), "0905 123 456");
  assert.equal(phoneToSave("0905-123-456", "0905 123 456"), "0905 123 456");
  // Changed and not dialable: rejected.
  assert.equal(phoneToSave("0905 123 457", "0905 123 456"), null);
  // Changed and dialable: the E.164 form.
  assert.equal(phoneToSave("+421 905 123 457", "0905 123 456"), "+421905123457");
  assert.equal(phoneToSave("+421 905 123 457", ""), "+421905123457");
  // Empty is allowed, also when it clears a stored number.
  assert.equal(phoneToSave("", "0905 123 456"), "");
  assert.equal(phoneToSave("  ", ""), "");
});

test("the test-call error examples follow the rule", () => {
  assert.equal(normalizePhone("+1 415 555 0142"), "+14155550142");
  assert.equal(normalizePhone("+1 555 123 4567"), null);
  // 16 digits: the old test-call regex allowed this.
  assert.equal(normalizePhone("+1234567890123456"), null);
});
