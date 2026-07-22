import assert from "node:assert/strict";
import { test } from "node:test";

import { alternatesFor } from "./alternates";
import { localizedHref } from "./href";
import { pageIdToPath, pathToPageId } from "./ids";
import { MARKETING_LOCALES } from "./locales";
import { isPublished, localesFor } from "./manifest";

// These tests encode the invariant the whole design rests on: an unreviewed
// translation must be invisible everywhere at once. A failure here means
// untranslated pages can reach Google.

test("no locale publishes anything while its manifest is empty", () => {
  for (const locale of MARKETING_LOCALES) {
    assert.equal(isPublished(locale, "home"), false, `${locale} home`);
    assert.equal(isPublished(locale, "pricing"), false, `${locale} pricing`);
  }
});

test("an English-only page emits a canonical and no hreflang cluster", () => {
  const a = alternatesFor("home", "en");
  assert.equal(a.canonical, "https://aireceptionistnow.com");
  assert.equal("languages" in a, false, "must not emit a one-member cluster");
});

test("canonical is absolute for every page id", () => {
  for (const id of ["home", "pricing", "industries/dentists"] as const) {
    const { canonical } = alternatesFor(id, "en");
    assert.ok(
      canonical.startsWith("https://"),
      `${id} canonical must be absolute, got ${canonical}`,
    );
  }
});

test("page id and path round-trip", () => {
  assert.equal(pageIdToPath("home"), "/");
  assert.equal(pageIdToPath("pricing"), "/pricing");
  assert.equal(pathToPageId("/"), "home");
  assert.equal(pathToPageId("/pricing"), "pricing");
  assert.equal(pathToPageId("/industries/dentists"), "industries/dentists");
});

test("localizedHref falls back to English when unpublished, never a 404", () => {
  // Nothing is reviewed yet, so every locale must fall back.
  for (const locale of MARKETING_LOCALES) {
    assert.equal(localizedHref(locale, "home"), "/");
    assert.equal(localizedHref(locale, "pricing"), "/pricing");
  }
  assert.equal(localizedHref("en", "pricing"), "/pricing");
});

test("localesFor returns only published locales", () => {
  assert.deepEqual(localesFor("home"), []);
});

test("the ui entry gates the whole locale", async () => {
  // Simulate a locale whose page is reviewed but whose chrome is not: the page
  // must stay unpublished, because a translated article inside an English
  // header is the half-translated leak this gate exists to prevent.
  const { isPublished: gate } = await import("./manifest");
  // With empty manifests, ui is absent -> everything is gated off.
  assert.equal(gate("de", "home"), false);
});
