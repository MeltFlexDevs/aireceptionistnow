import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { UI_COPY } from "@/content/i18n/ui-registry";
import { enUi } from "@/content/i18n/en/ui";

const ROOT = path.resolve(__dirname, "../..");

function texts(auth: Record<string, unknown>): string[] {
  return Object.values(auth).flatMap((v) => (typeof v === "string" ? [v] : texts(v as Record<string, unknown>)));
}

test("every locale has a non-empty text for each sign-in dialog string", () => {
  const keys = texts(enUi.auth).length;
  for (const [locale, ui] of Object.entries(UI_COPY)) {
    const all = texts(ui.auth);
    assert.equal(all.length, keys, `${locale}: auth block has a different number of texts`);
    for (const t of all) assert.ok(t.trim().length > 0, `${locale}: empty auth text`);
  }
});

test("codeSent holds {email} exactly once in every locale", () => {
  for (const [locale, ui] of Object.entries(UI_COPY)) {
    assert.equal(ui.auth.codeSent.split("{email}").length, 2, `${locale}: codeSent needs one {email}`);
  }
});

test("localized locales do not reuse the English dialog text", () => {
  for (const [locale, ui] of Object.entries(UI_COPY)) {
    if (locale === "en") continue;
    assert.notEqual(ui.auth.welcome, enUi.auth.welcome, `${locale}: welcome is still English`);
    assert.notEqual(ui.auth.errors.invalidCode, enUi.auth.errors.invalidCode, `${locale}: invalidCode is still English`);
  }
});

test("the dialog body never shows the raw Supabase error message", () => {
  const src = fs.readFileSync(path.join(ROOT, "app/components/AuthDialogBody.tsx"), "utf8");
  assert.doesNotMatch(src, /setError\(error\.message\)/);
  assert.doesNotMatch(src, /setError\("/, "setError must take localized copy, not a literal");
});

test("every locale has a sign-up subtitle that differs from the sign-in subtitle", () => {
  for (const [locale, ui] of Object.entries(UI_COPY)) {
    assert.ok(ui.auth.signupDescription.trim().length > 0, `${locale}: empty signupDescription`);
    assert.notEqual(ui.auth.signupDescription, ui.auth.defaultDescription, `${locale}: signup reuses sign-in text`);
    if (locale !== "en") {
      assert.notEqual(ui.auth.signupDescription, enUi.auth.signupDescription, `${locale}: signupDescription is still English`);
    }
  }
});

test("the dialog picks its subtitle by mode and pricing passes no English subtitle", () => {
  const body = fs.readFileSync(path.join(ROOT, "app/components/AuthDialogBody.tsx"), "utf8");
  assert.ok(body.includes('mode === "signup" ? copy.signupDescription : copy.defaultDescription'));
  const pricing = fs.readFileSync(path.join(ROOT, "app/(main)/pricing/PricingClient.tsx"), "utf8");
  assert.ok(!pricing.includes("Create your account to start the"));
});
