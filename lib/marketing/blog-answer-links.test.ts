import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

// Blog posts link to /answers/<slug> by hand, and the seven translations are
// generated from the English posts. A wrong slug passes typecheck and the
// build and ships a 404 link (the Italian escalation post once linked
// "can-an-receptionist-..."). Sources are read off disk, like
// lib/i18n/marketing/blog-slugs.test.ts, so this test stays free of React and
// of the post modules.
const ROOT = path.resolve(__dirname, "../..");
const ANSWERS_FILE = path.join(ROOT, "app/(main)/answers/_answers/index.tsx");
const EN_POSTS_DIR = path.join(ROOT, "app/(main)/blog/_posts");
const LOCALES_DIR = path.join(ROOT, "content/i18n");

function answerSlugs(): Set<string> {
  const src = fs.readFileSync(ANSWERS_FILE, "utf8");
  return new Set([...src.matchAll(/^\s+slug: "([^"]+)",$/gm)].map((m) => m[1]));
}

function blogFiles(): string[] {
  const localeBlogDirs = fs
    .readdirSync(LOCALES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(LOCALES_DIR, entry.name, "blog"))
    .filter((dir) => fs.existsSync(dir));
  return [EN_POSTS_DIR, ...localeBlogDirs].flatMap((dir) =>
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => path.join(dir, f)),
  );
}

test("every blog link to /answers/<slug> names an existing answer", () => {
  const slugs = answerSlugs();
  // Guards the parser: if the answers file changes shape, fail loudly
  // instead of reporting every link as broken or none at all.
  assert.ok(slugs.size >= 10, `parsed only ${slugs.size} answer slugs`);
  let links = 0;
  const broken: string[] = [];
  for (const file of blogFiles()) {
    const src = fs.readFileSync(file, "utf8");
    for (const m of src.matchAll(/href="\/answers\/([^"]+)"/g)) {
      links++;
      const slug = m[1].split(/[#?]/)[0];
      if (!slugs.has(slug)) broken.push(`${path.relative(ROOT, file)}: ${slug}`);
    }
  }
  assert.ok(links > 0, "found no /answers links in the blog folders");
  assert.deepEqual(broken, []);
});
