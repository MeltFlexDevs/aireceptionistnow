import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import GlobalError from "@/app/global-error";

test("the global error page renders its own document with a retry button", () => {
  const html = renderToStaticMarkup(
    createElement(GlobalError, { error: new Error("secret-detail"), unstable_retry: () => {} }),
  );
  assert.ok(html.includes('<html lang="en"'), html);
  assert.ok(html.includes("<body"), html);
  assert.ok(html.includes("Something went wrong."), html);
  assert.ok(html.includes('<button type="button"'), html);
  assert.ok(html.includes("Try again"), html);
  assert.ok(!html.includes("secret-detail"), html);
});

test("the global error page is a client component with no providers or styles to load", () => {
  const src = readFileSync(new URL("../app/global-error.tsx", import.meta.url), "utf8");
  assert.ok(src.startsWith('"use client";'));
  assert.ok(src.includes("unstable_retry()"));
  assert.ok(!src.includes("import "), "global-error must not import anything");
});
