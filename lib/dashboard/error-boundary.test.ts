import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import DashboardError from "@/app/(main)/dashboard/error";
import { I18nProvider } from "@/lib/i18n/client";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { sk } from "@/lib/i18n/dictionaries/sk";

// I18nProvider calls useRouter(), which needs a mounted app router.
const router = { push() {}, replace() {}, refresh() {}, back() {}, forward() {}, prefetch() {} };
const inSlovak = (node: ReactNode) =>
  renderToStaticMarkup(
    createElement(
      AppRouterContext.Provider,
      { value: router as never },
      // eslint-disable-next-line react/no-children-prop -- createElement typing needs children in props
      createElement(I18nProvider, { value: { locale: "sk", dict: sk }, children: node }),
    ),
  );

const KEYS = ["dashboardErrorTitle", "dashboardErrorRetry", "dashboardErrorHome"] as const;

test("every dashboard language has the error boundary copy", () => {
  for (const [locale, dict] of Object.entries(dictionaries)) {
    for (const key of KEYS) {
      assert.ok(dict.common[key].trim(), `${locale}.${key}`);
      if (locale !== "en") assert.notEqual(dict.common[key], dictionaries.en.common[key], `${locale}.${key}`);
    }
  }
});

test("the dashboard error boundary speaks the dashboard language and links back", () => {
  const html = inSlovak(
    createElement(DashboardError, { error: new Error("secret-detail"), unstable_retry: () => {} }),
  );
  for (const key of KEYS) assert.ok(html.includes(sk.common[key]), key);
  assert.ok(html.includes('href="/dashboard"'), html);
  assert.equal(html.split("<h1").length - 1, 1, html);
  assert.ok(!html.includes("secret-detail"), html);
});

test("the dashboard error boundary is a client component that re-fetches on retry", () => {
  const src = readFileSync(new URL("../../app/(main)/dashboard/error.tsx", import.meta.url), "utf8");
  assert.ok(src.startsWith('"use client";'));
  assert.ok(src.includes("unstable_retry()"));
  assert.ok(!src.includes("reset"), "reset() does not re-fetch server data");
});
