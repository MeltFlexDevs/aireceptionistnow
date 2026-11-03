import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Source guard for the sign-in dialog: the repo has no component test runner,
// so this pins the keyboard, zoom and screen-reader fixes tsc cannot see.
const BODY = readFileSync(
  new URL("../../app/components/AuthDialogBody.tsx", import.meta.url),
  "utf8",
);

test("focus moves into the dialog, stays in the panel, and returns to the opener", () => {
  assert.match(BODY, /const opener = document\.activeElement/);
  assert.ok(BODY.includes("if (opener?.isConnected) opener.focus();"));
  assert.ok(BODY.includes("if (!sentTo) emailRef.current?.focus();"));
  assert.ok(BODY.includes('if (e.key !== "Tab") return;'));
  assert.ok(BODY.includes("ref={panelRef}"));
  assert.ok(BODY.includes("ref={emailRef}"));
});

test("the dialog is named by its visible heading", () => {
  assert.ok(BODY.includes('aria-modal="true"'));
  assert.ok(BODY.includes("aria-labelledby={titleId}"));
  assert.equal(BODY.split("id={titleId}").length - 1, 2);
});

test("a panel taller than the viewport scrolls from its top (200% zoom)", () => {
  assert.ok(!BODY.includes("sm:items-center"));
  assert.ok(BODY.includes('className="relative my-auto w-full max-w-[880px]'));
});

test("errors are announced and tied to the input that caused them", () => {
  assert.match(BODY, /<div id=\{id\} role="alert"/);
  assert.equal(BODY.split("<ErrorBox id={errorId} message={error} />").length - 1, 2);
  assert.ok(BODY.includes("aria-invalid={error ? true : undefined}"));
  assert.ok(BODY.includes("aria-describedby={error ? errorId : undefined}"));
  assert.ok(BODY.includes("aria-invalid={error && emailInvalid ? true : undefined}"));
  assert.ok(BODY.includes("aria-describedby={error && emailInvalid ? errorId : undefined}"));
  assert.ok(BODY.includes('setEmailInvalid(error ? authErrorKey(error) === "invalidEmail" : false);'));
});

test("the code input is named and both inputs show a visible focus ring", () => {
  assert.equal(BODY.split("aria-labelledby={titleId}").length - 1, 2);
  assert.ok(!BODY.includes("focus:border-neutral-400"));
  const ring = "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2";
  assert.equal(BODY.split(ring).length - 1, 2);
});
