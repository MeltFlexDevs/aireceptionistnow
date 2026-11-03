import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import nextConfig from "../next.config";

const MAIN = path.resolve(__dirname, "../app/(main)");
// The pages the native app opens with ?app=1 (see lib/legal.ts).
const APP_MODE_PAGES = ["support", "privacy-policy", "terms-of-service"];

test("?app=1 on a legal page rewrites to its static in-app route", async () => {
  const rewrites = await nextConfig.rewrites?.();
  assert.ok(rewrites && !Array.isArray(rewrites), "rewrites() must return { beforeFiles }");
  for (const page of APP_MODE_PAGES) {
    assert.deepEqual(rewrites.beforeFiles?.find((r) => r.source === `/${page}`), {
      source: `/${page}`,
      has: [{ type: "query", key: "app", value: "1" }],
      destination: `/${page}/in-app`,
    });
  }
});

test("legal pages do not read searchParams, so they stay static", () => {
  for (const page of APP_MODE_PAGES) {
    for (const file of [path.join(page, "page.tsx"), path.join(page, "in-app", "page.tsx")]) {
      assert.ok(fs.existsSync(path.join(MAIN, file)), `${file} is missing`);
      const src = fs.readFileSync(path.join(MAIN, file), "utf8");
      assert.doesNotMatch(src, /searchParams/, `${file} reads searchParams`);
    }
  }
});

test("the in-app copies are not indexed", () => {
  for (const page of APP_MODE_PAGES) {
    const src = fs.readFileSync(path.join(MAIN, page, "in-app", "page.tsx"), "utf8");
    assert.match(src, /robots: \{ index: false, follow: false \}/, `${page}/in-app/page.tsx must be noindex`);
  }
});
