import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SkipLink } from "@/app/components/SkipLink";
import { dictionaries } from "@/lib/i18n/dictionaries";

// Source guard for the skip link: the repo has no component test runner, so
// this pins the shell wiring that tsc cannot see.
const src = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const DASH = src("app/(main)/dashboard/layout.tsx");
const ONB_LAYOUT = src("app/(main)/onboarding/layout.tsx");
const ONB_PAGE = src("app/(main)/onboarding/page.tsx");
const LINK = "<SkipLink label={dict.common.skipToContent} />";

test("the skip link is hidden until focused and jumps to #main", () => {
  const html = renderToStaticMarkup(createElement(SkipLink, { label: "Skip to content" }));
  assert.match(html, /^<a href="#main" class="sr-only focus:not-sr-only /);
  assert.ok(html.endsWith(">Skip to content</a>"), html);
});

test("every dashboard language names the skip link", () => {
  for (const [locale, dict] of Object.entries(dictionaries)) {
    assert.ok(dict.common.skipToContent.trim(), locale);
    if (locale !== "en") assert.notEqual(dict.common.skipToContent, dictionaries.en.common.skipToContent, locale);
  }
});

test("the dashboard shell puts the skip link before the sidebar and targets its main", () => {
  assert.ok(DASH.includes(LINK));
  assert.ok(DASH.indexOf(LINK) < DASH.indexOf("<Sidebar />"));
  assert.ok(DASH.includes('<main id="main" tabIndex={-1}'));
});

test("onboarding has the skip link and one focusable main", () => {
  assert.ok(ONB_LAYOUT.includes(LINK));
  assert.equal(ONB_PAGE.split('id="main"').length - 1, 1);
  assert.match(ONB_PAGE, /<main\s+id="main"\s+tabIndex=\{-1\}/);
});
