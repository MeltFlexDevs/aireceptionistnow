import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

// Share-image guards for page metadata. app/(main)/opengraph-image.png sits in
// a route group, so Next serves it under a hashed URL: a hardcoded siteUrl +
// "/opengraph-image.png" is a 404 and shared links show no picture. Pages use
// ogCardImage (lib/site.ts, public/og-card.png) instead. Sources are read off
// disk so this test stays free of React and Next.
const APP_DIR = path.resolve(__dirname, "../../app");

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(p);
    return /\.tsx?$/.test(entry.name) ? [p] : [];
  });
}

test("no metadata hardcodes the route-group opengraph-image.png URL", () => {
  const offenders = sourceFiles(APP_DIR)
    .filter((f) => /\$\{siteUrl\}\/opengraph-image\.png/.test(fs.readFileSync(f, "utf8")))
    .map((f) => path.relative(APP_DIR, f));
  assert.deepEqual(offenders, []);
});

// Brace-matched body of every `openGraph: {` object literal in a source file.
function openGraphBlocks(src: string): string[] {
  const blocks: string[] = [];
  for (const m of src.matchAll(/openGraph:\s*\{/g)) {
    const start = m.index ?? 0;
    let i = start + m[0].length;
    let depth = 1;
    while (depth > 0 && i < src.length) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    blocks.push(src.slice(start, i));
  }
  return blocks;
}

// baseMetadata leaves images to the app/(main) opengraph-image.png file
// convention and to each [locale] page, which sets its own.
const NO_IMAGE_OK = new Set([path.join("_shared", "root-shell.tsx")]);

test("every openGraph object in app/ sets images", () => {
  // A page-level openGraph replaces the layout's whole openGraph, so one
  // without images publishes no og:image at all.
  const offenders = sourceFiles(APP_DIR)
    .filter((f) => !NO_IMAGE_OK.has(path.relative(APP_DIR, f)))
    .filter((f) => openGraphBlocks(fs.readFileSync(f, "utf8")).some((b) => !/\bimages:/.test(b)))
    .map((f) => path.relative(APP_DIR, f));
  assert.deepEqual(offenders, []);
});
