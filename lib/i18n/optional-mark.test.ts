import assert from "node:assert/strict";
import { test } from "node:test";

import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { OptionalMark } from "@/app/components/forms/validated-form";
import { I18nProvider } from "./client";
import { sk } from "./dictionaries/sk";

// I18nProvider calls useRouter(), which needs a mounted app router.
const router = { push() {}, replace() {}, refresh() {}, back() {}, forward() {}, prefetch() {} };
const inSlovak = (node: ReactNode) =>
  renderToStaticMarkup(
    createElement(
      AppRouterContext.Provider,
      { value: router as never },
      createElement(I18nProvider, { value: { locale: "sk", dict: sk } } as never, node),
    ),
  );

test("OptionalMark keeps English outside an I18nProvider (marketing auth dialog)", () => {
  const html = renderToStaticMarkup(createElement(OptionalMark));
  assert.ok(html.endsWith("> (optional)</span>"), html);
});

test("OptionalMark follows the dashboard language inside an I18nProvider", () => {
  const html = inSlovak(createElement(OptionalMark));
  assert.ok(html.endsWith(`> (${sk.common.optional})</span>`), html);
  assert.ok(!html.includes("(optional)"), html);
});
