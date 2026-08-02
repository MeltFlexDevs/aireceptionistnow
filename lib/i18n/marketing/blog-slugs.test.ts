import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import {
  BLOG_SLUGS,
  TRANSLATABLE_BLOG_SLUGS,
  blogSlugFromLocalized,
  localizedBlogSlug,
} from "./blog-slugs";
import { localizedPageIdToPath, pageIdToPath } from "./ids";
import { MARKETING_LOCALES } from "./locales";

// The localized slug map is the one piece of this system with no runtime
// feedback: a wrong slug does not throw, it just publishes an article on a URL
// nothing links to and quietly loses the keyword it was written for.
//
// The English post list is read off disk rather than imported, so these tests
// stay free of React and of the 36 article modules.
const EN_DIR = path.resolve(__dirname, "../../../app/(main)/blog/_posts");

// Deliberately English-only. Documented in blog-slugs.ts: a US local-SEO page
// has no honest translation, so it is exempt from the coverage test below.
const ENGLISH_ONLY = new Set(["ai-receptionist-orange-county"]);

function englishSlugs(): string[] {
  return fs
    .readdirSync(EN_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.replace(/\.tsx$/, ""));
}

test("every English post is either translated or explicitly English-only", () => {
  // Catches the real failure mode: someone adds an article and the seven
  // localized URLs silently never come into existence.
  const missing = englishSlugs().filter(
    (slug) => !ENGLISH_ONLY.has(slug) && !(slug in BLOG_SLUGS),
  );
  assert.deepEqual(
    missing,
    [],
    `add these to BLOG_SLUGS (or to ENGLISH_ONLY with a reason): ${missing.join(", ")}`,
  );
});

test("every slug in the map names a real English post", () => {
  const real = new Set(englishSlugs());
  for (const slug of TRANSLATABLE_BLOG_SLUGS) {
    assert.ok(real.has(slug), `BLOG_SLUGS has "${slug}" but no such article exists`);
  }
});

test("every article has a slug in all seven locales", () => {
  for (const slug of TRANSLATABLE_BLOG_SLUGS) {
    for (const locale of MARKETING_LOCALES) {
      assert.ok(
        BLOG_SLUGS[slug][locale],
        `${slug} has no ${locale} slug`,
      );
    }
  }
});

test("slugs are URL-safe ASCII", () => {
  // Percent-encoded UTF-8 in a SERP is unreadable and breaks copy-paste, so
  // diacritics are transliterated rather than encoded.
  for (const slug of TRANSLATABLE_BLOG_SLUGS) {
    for (const locale of MARKETING_LOCALES) {
      const value = BLOG_SLUGS[slug][locale];
      assert.match(
        value,
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        `${locale}/${slug} -> "${value}" is not lowercase ASCII with single hyphens`,
      );
    }
  }
});

test("slugs are unique within a locale", () => {
  // A collision would make the second article unreachable. blog-slugs.ts throws
  // at module load; this states the invariant where a reader will look for it.
  for (const locale of MARKETING_LOCALES) {
    const seen = new Map<string, string>();
    for (const slug of TRANSLATABLE_BLOG_SLUGS) {
      const value = BLOG_SLUGS[slug][locale];
      const clash = seen.get(value);
      assert.equal(
        clash,
        undefined,
        `${locale}: "${value}" is used by both ${clash} and ${slug}`,
      );
      seen.set(value, slug);
    }
  }
});

test("localized slugs round-trip back to the English one", () => {
  // The router only ever receives the localized slug; if this mapping is not
  // total and exact, a live URL 404s.
  for (const slug of TRANSLATABLE_BLOG_SLUGS) {
    for (const locale of MARKETING_LOCALES) {
      assert.equal(
        blogSlugFromLocalized(locale, BLOG_SLUGS[slug][locale]),
        slug,
      );
    }
  }
});

test("an unknown localized slug resolves to nothing", () => {
  assert.equal(blogSlugFromLocalized("de", "does-not-exist"), undefined);
  // English slugs are not valid German URLs: the German article lives at the
  // German slug, and serving it at both would be a duplicate.
  assert.equal(blogSlugFromLocalized("de", "dental-answering-service"), undefined);
});

test("paths carry the locale prefix and the localized slug", () => {
  assert.equal(
    localizedPageIdToPath("de", "blog/dental-answering-service"),
    "/de/blog/telefonservice-zahnarztpraxis",
  );
  assert.equal(
    localizedPageIdToPath("sk", "blog/dental-answering-service"),
    "/sk/blog/telefonicka-sluzba-pre-zubarov",
  );
  // English is the default and lives at the root, with no prefix.
  assert.equal(
    localizedPageIdToPath("en", "blog/dental-answering-service"),
    "/blog/dental-answering-service",
  );
});

test("non-blog pages keep their shared path in every locale", () => {
  assert.equal(localizedPageIdToPath("fr", "pricing"), "/fr/pricing");
  assert.equal(localizedPageIdToPath("fr", "blog"), "/fr/blog");
  assert.equal(localizedPageIdToPath("fr", "home"), "/fr");
  assert.equal(pageIdToPath("home"), "/");
});

test("an English-only article has no localized path", () => {
  // Falls back to the English URL rather than minting /de/blog/<english-slug>,
  // which nothing would serve.
  assert.equal(localizedBlogSlug("de", "ai-receptionist-orange-county"), undefined);
  assert.equal(
    localizedPageIdToPath("de", "blog/ai-receptionist-orange-county"),
    "/blog/ai-receptionist-orange-county",
  );
});
