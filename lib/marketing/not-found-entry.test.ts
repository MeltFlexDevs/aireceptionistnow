import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { GET } from "@/app/api/not-found-links/route";
import { EN_NOT_FOUND_LINKS } from "@/app/components/en-not-found-links";

// app/(main)/not-found.tsx is part of every English page's client entry, so
// whatever its server tree imports with client parts ships to every visitor.
// Its header and the blog registry's client parts once added about 13 KB gzip
// to each page, the dashboard too. Now the 404 gets its header lazily and its
// link list from a static route, and the layout holds the one next/link copy.
const ROOT = path.resolve(__dirname, "../..");
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), "utf8");

test("the (main) 404 imports neither the link list nor the header", () => {
  const notFound = read("app/(main)/not-found.tsx");
  assert.doesNotMatch(notFound, /en-not-found-links|_posts|_answers/);
  assert.match(notFound, /linksSrc="\/api\/not-found-links"/);
  assert.doesNotMatch(read("app/components/NotFoundView.tsx"), /from "\.\/SiteHeader"/);
});

test("the English root layout keeps its side-effect next/link import", () => {
  assert.match(read("app/(main)/layout.tsx"), /^import "next\/link";$/m);
});

test("the link route is static and serves the English 404 links", async () => {
  assert.match(read("app/api/not-found-links/route.ts"), /export const dynamic = "force-static";/);
  assert.deepEqual(await GET().json(), EN_NOT_FOUND_LINKS);
  assert.ok(EN_NOT_FOUND_LINKS.some((l) => l.href.startsWith("/blog/")));
});
