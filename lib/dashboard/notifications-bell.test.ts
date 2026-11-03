import assert from "node:assert/strict";
import { test } from "node:test";

import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { NotificationsBell } from "@/app/(main)/dashboard/components/NotificationsBell";
import { I18nProvider } from "@/lib/i18n/client";
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

test("the notifications bell is labelled in the dashboard language", () => {
  const html = inSlovak(createElement(NotificationsBell));
  assert.ok(html.includes(`aria-label="${sk.common.notifications}"`), html);
  assert.ok(!html.includes('aria-label="Notifications"'), html);
});
