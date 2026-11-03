import assert from "node:assert/strict";
import { test } from "node:test";

import { EN_NOT_FOUND_LINKS } from "@/app/components/en-not-found-links";
import { enUi } from "@/content/i18n/en/ui";
import { UI_COPY } from "@/content/i18n/ui-registry";
import { MARKETING_LOCALES } from "./locales";

const KEYS = ["metaTitle", "title", "body", "home", "didYouMean", "or", "pricing"] as const;

test("every locale fills the 404 copy", () => {
  for (const [l, ui] of Object.entries(UI_COPY)) {
    for (const k of KEYS) assert.ok(ui.notFound[k].trim().length > 0, `${l}.notFound.${k}`);
  }
});

test("the English 404 copy is the old hardcoded text", () => {
  assert.deepEqual(enUi.notFound, {
    metaTitle: "Page not found",
    title: "The page you dialed is not in service.",
    body: "Wrong extension, probably. Our receptionist answers everything. This one's on us.",
    home: "Back to the front desk",
    didYouMean: "Did you mean",
    or: "or",
    pricing: "Pricing",
  });
});

test("translated 404 copy is not left in English", () => {
  for (const l of MARKETING_LOCALES) {
    for (const k of ["metaTitle", "title", "body", "home", "didYouMean"] as const) {
      assert.notEqual(UI_COPY[l].notFound[k], enUi.notFound[k], `${l}.notFound.${k}`);
    }
  }
});

test("the English 404 suggestions are unchanged by the move", () => {
  assert.deepEqual(EN_NOT_FOUND_LINKS.slice(0, 4), [
    { href: "/pricing", label: "Pricing" },
    { href: "/industries", label: "Industries" },
    { href: "/blog", label: "Blog" },
    { href: "/answers", label: "Answers" },
  ]);
  assert.ok(EN_NOT_FOUND_LINKS.length > 50, String(EN_NOT_FOUND_LINKS.length));
});
