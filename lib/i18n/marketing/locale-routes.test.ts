import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { navHrefs } from "./href";
import { MARKETING_LOCALES } from "./locales";
import { localizedNotFoundLinks } from "./not-found-links";

const LOCALE_DIR = join(process.cwd(), "app", "[locale]");
const REST_DIR = join(LOCALE_DIR, "[...rest]");
const read = (p: string) => readFileSync(p, "utf8");

function leafPages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return p === REST_DIR ? [] : leafPages(p);
    return e.name === "page.tsx" ? [p] : [];
  });
}

test("every localized leaf page keeps dynamicParams = false", () => {
  const pages = leafPages(LOCALE_DIR);
  assert.ok(pages.length >= 4, String(pages.length));
  for (const p of pages) assert.match(read(p), /export const dynamicParams = false;/, p);
});

test("the locale layout leaves dynamicParams and static params to the leaves", () => {
  const src = read(join(LOCALE_DIR, "layout.tsx"));
  assert.doesNotMatch(src, /export const dynamicParams/);
  assert.doesNotMatch(src, /export (async )?function generateStaticParams/);
});

test("the catch-all page always 404s and its not-found is empty", () => {
  assert.match(read(join(REST_DIR, "page.tsx")), /notFound\(\)/);
  assert.match(read(join(REST_DIR, "not-found.tsx")), /return null;/);
  assert.ok(existsSync(join(REST_DIR, "layout.tsx")));
  assert.doesNotMatch(read(join(REST_DIR, "page.tsx")), /generateStaticParams/);
});

test("localized 404 suggestions stay in the locale", () => {
  for (const l of MARKETING_LOCALES) {
    const links = localizedNotFoundLinks(l);
    const nav = navHrefs(l);
    assert.equal(links[0].href, nav.pricing, l);
    assert.equal(links[1].href, nav.blog, l);
    for (const link of links.slice(2)) {
      assert.ok(link.href.startsWith(`/${l}/blog/`), `${l}: ${link.href}`);
    }
    for (const link of links) assert.ok(link.label.trim().length > 0, `${l}: ${link.href}`);
    assert.equal(new Set(links.map((x) => x.href)).size, links.length, `${l}: hrefs must be unique (React keys)`);
  }
  // sk has a published blog with 35 articles today.
  assert.ok(localizedNotFoundLinks("sk").length > 2);
});

test("unknown first segments render the English 404 instead of the bare Next 404", () => {
  const root = read(join(LOCALE_DIR, "layout.tsx"));
  assert.doesNotMatch(root, /notFound\(/);
  assert.match(root, /isMarketingLocale\(locale\) \? locale : "en"/);
  const rest = read(join(REST_DIR, "layout.tsx"));
  assert.match(rest, /<NotFoundView links=\{EN_NOT_FOUND_LINKS\} \/>/);
  assert.doesNotMatch(rest, /notFound\(/);
  assert.doesNotMatch(rest, /return \{\};/);
  assert.match(rest, /title: "Page not found"/);
});
