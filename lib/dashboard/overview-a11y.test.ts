import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Source guard for the Home page markup (axe page-has-heading-one, dlitem):
// the repo has no component test runner.
const PAGE = readFileSync(new URL("../../app/(main)/dashboard/page.tsx", import.meta.url), "utf8");

test("Home has one h1, rendered before the Suspense boundary", () => {
  assert.equal(PAGE.split("<h1").length - 1, 1);
  assert.ok(PAGE.includes('<h1 className="sr-only">{t.nav.overview}</h1>'));
  assert.ok(PAGE.indexOf("<h1") < PAGE.indexOf("<Suspense key="));
});

test("the plan meter uses no dt or dd outside a dl", () => {
  assert.doesNotMatch(PAGE, /<\/?d[td][\s>]/);
});
