import assert from "node:assert/strict";
import { test } from "node:test";

import { dictionaries } from "./dictionaries";
import { plural, type PluralForms } from "./plural";

const f: PluralForms = { one: "{n} x1", few: "{n} x2", many: "{n} x3", other: "{n} x4" };

test("plural picks the CLDR form of the locale", () => {
  assert.equal(plural("en", 1, f), "1 x1");
  assert.equal(plural("en", 2, f), "2 x4");
  assert.equal(plural("en", 1000, f), "1,000 x4");
  assert.equal(plural("sk", 1, f), "1 x1");
  assert.equal(plural("sk", 3, f), "3 x2");
  assert.equal(plural("sk", 5, f), "5 x4");
  assert.equal(plural("fr", 0, f), "0 x1");
});

test("plural fills {count} as well as {n}", () => {
  const c: PluralForms = { one: "{count} x1", few: "{count} x2", many: "{count} x3", other: "{count} x4" };
  assert.equal(plural("en", 1, c), "1 x1");
  assert.equal(plural("en", 7, c), "7 x4");
});

const FORM_KEYS = ["few", "many", "one", "other"] as const;

// Every { one, few, many, other } object in a dictionary, with its dotted path.
function formsIn(node: unknown, path: string): [string, PluralForms][] {
  if (!node || typeof node !== "object" || Array.isArray(node)) return [];
  if (Object.keys(node).sort().join() === FORM_KEYS.join()) return [[path, node as PluralForms]];
  return Object.entries(node).flatMap(([k, v]) => formsIn(v, path ? `${path}.${k}` : k));
}

test("every plural form in every dictionary keeps its number placeholder", () => {
  for (const [code, dict] of Object.entries(dictionaries)) {
    for (const [path, forms] of formsIn(dict, "")) {
      for (const k of FORM_KEYS) {
        assert.match(forms[k], /\{(n|count)\}/, `${code}.${path}.${k} has no {n} or {count}`);
      }
    }
  }
});

test("dashboard bar titles use the call count forms", () => {
  assert.equal(plural("en", 1, dictionaries.en.data.callsCount), "1 call");
  assert.equal(plural("en", 4, dictionaries.en.data.callsCount), "4 calls");
  assert.equal(plural("sk", 3, dictionaries.sk.data.callsCount), "3 hovory");
  assert.equal(plural("sk", 5, dictionaries.sk.data.callsCount), "5 hovorov");
});

test("calendar counts use their plural forms", () => {
  assert.equal(plural("en", 1, dictionaries.en.calendar.chipRequests), "1 request to confirm");
  assert.equal(plural("en", 2, dictionaries.en.calendar.chipRequests), "2 requests to confirm");
  assert.equal(plural("en", 1, dictionaries.en.calendar.nBookings), "1 appointment");
  assert.equal(plural("sk", 3, dictionaries.sk.calendar.nBookings), "3 termíny");
  assert.equal(plural("sk", 3, dictionaries.sk.calendar.chipRequests), "3 žiadosti na potvrdenie");
});

test("plan limits use their plural forms", () => {
  assert.equal(plural("en", 1, dictionaries.en.settings.limitConcurrent), "1 call at once");
  assert.equal(plural("en", 3, dictionaries.en.settings.limitConcurrent), "3 calls at once");
  assert.equal(plural("en", 3000, dictionaries.en.settings.limitContacts), "3,000 contacts");
  assert.equal(plural("en", 1, dictionaries.en.settings.limitUsers), "1 user");
  assert.equal(plural("sk", 3, dictionaries.sk.settings.limitConcurrent), "3 hovory naraz");
});
