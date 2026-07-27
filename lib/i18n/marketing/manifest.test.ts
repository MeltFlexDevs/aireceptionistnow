import assert from "node:assert/strict";
import { test } from "node:test";

import type { TranslationEntry } from "@/content/i18n/_types";
import { HOME_COPY } from "@/content/i18n/home-registry";
import { PRICING_COPY } from "@/content/i18n/pricing-registry";
import { alternatesFor } from "./alternates";
import { localizedHref } from "./href";
import { pageIdToPath, pathToPageId } from "./ids";
import { MARKETING_LOCALES } from "./locales";
import { gate, isPublished, localesFor } from "./manifest";

// These tests encode the invariant the whole design rests on: an unreviewed
// translation must be invisible everywhere at once. A failure here means
// untranslated pages can reach Google.
//
// The gate tests below run against SYNTHETIC manifests on purpose. The previous
// version of this file asserted "nothing is published", which described the data
// on the day it was written rather than the rule, so every one of those tests
// had to be deleted the moment a locale shipped. These survive a publish.

const REVIEWED_UI: TranslationEntry = { pageId: "ui", status: "reviewed" };

test("the ui entry gates the whole locale", () => {
  // A page reviewed inside unreviewed chrome must stay dark: a translated
  // article in an English header is exactly the half-translated leak the gate
  // exists to prevent.
  const entries: TranslationEntry[] = [
    { pageId: "ui", status: "draft" },
    { pageId: "home", status: "reviewed" },
  ];
  assert.equal(gate(entries, "home"), false);
});

test("a draft page stays dark even under reviewed chrome", () => {
  assert.equal(gate([REVIEWED_UI, { pageId: "home", status: "draft" }], "home"), false);
  assert.equal(
    gate([REVIEWED_UI, { pageId: "home", status: "in-review" }], "home"),
    false,
  );
});

test("a page absent from the manifest is never published", () => {
  assert.equal(gate([REVIEWED_UI], "pricing"), false);
  assert.equal(gate([], "home"), false);
});

test("reviewed chrome plus a reviewed page publishes", () => {
  const entries: TranslationEntry[] = [
    REVIEWED_UI,
    { pageId: "home", status: "reviewed" },
  ];
  assert.equal(gate(entries, "home"), true);
});

test("every marketing locale publishes home and pricing", () => {
  // The live-data counterpart to the gate tests: as of 2026-07-27 all seven
  // locales are reviewed, so the app/[locale] tree is no longer a hard 404.
  // If this fails, either a manifest was reverted or a locale lost its copy.
  for (const locale of MARKETING_LOCALES) {
    assert.equal(isPublished(locale, "home"), true, `${locale} home`);
    assert.equal(isPublished(locale, "pricing"), true, `${locale} pricing`);
  }
  assert.equal(localesFor("home").length, MARKETING_LOCALES.length);
});

test("an English-only page emits a canonical and no hreflang cluster", () => {
  // industries/* is not localized, so it must still emit a bare canonical.
  const a = alternatesFor("industries/dentists", "en");
  assert.equal(a.canonical, "https://aireceptionistnow.com/industries/dentists");
  assert.equal("languages" in a, false, "must not emit a one-member cluster");
});

test("canonical is absolute for every page id", () => {
  for (const id of ["home", "pricing", "industries/dentists"] as const) {
    const { canonical } = alternatesFor(id, "en");
    assert.ok(
      canonical.startsWith("https://"),
      `${id} canonical must be absolute, got ${canonical}`,
    );
  }
});

test("a localized page canonicalizes to its own URL, not to English", () => {
  assert.equal(
    alternatesFor("home", "de").canonical,
    "https://aireceptionistnow.com/de",
  );
  assert.equal(
    alternatesFor("pricing", "sk").canonical,
    "https://aireceptionistnow.com/sk/pricing",
  );
});

test("the hreflang cluster is reciprocal and carries en plus x-default", () => {
  // Every member must see the SAME set of alternates, or Google drops the
  // cluster and the localized URLs compete with the English ones.
  const reference = alternatesFor("home", "en");
  assert.ok("languages" in reference, "expected a cluster now that locales are live");
  const expected = JSON.stringify(reference.languages);

  for (const locale of MARKETING_LOCALES) {
    const member = alternatesFor("home", locale);
    assert.ok("languages" in member, `${locale} must be in the cluster`);
    assert.equal(JSON.stringify(member.languages), expected, `${locale} cluster`);
  }

  const languages = reference.languages as Record<string, string>;
  assert.equal(languages.en, "https://aireceptionistnow.com");
  assert.equal(languages["x-default"], "https://aireceptionistnow.com");
  assert.equal(languages.de, "https://aireceptionistnow.com/de");
});

test("page id and path round-trip", () => {
  assert.equal(pageIdToPath("home"), "/");
  assert.equal(pageIdToPath("pricing"), "/pricing");
  assert.equal(pathToPageId("/"), "home");
  assert.equal(pathToPageId("/pricing"), "pricing");
  assert.equal(pathToPageId("/industries/dentists"), "industries/dentists");
});

test("localizedHref points at the localized page once published", () => {
  for (const locale of MARKETING_LOCALES) {
    assert.equal(localizedHref(locale, "home"), `/${locale}`);
    assert.equal(localizedHref(locale, "pricing"), `/${locale}/pricing`);
  }
  assert.equal(localizedHref("en", "pricing"), "/pricing");
});

test("localizedHref falls back to English for an unlocalized page, never a 404", () => {
  for (const locale of MARKETING_LOCALES) {
    assert.equal(localizedHref(locale, "industries/dentists"), "/industries/dentists");
  }
});

// --- SEO budgets -----------------------------------------------------------
// These guard the change that made the localized tree worth publishing: the
// SERP title used to be `${hero.h1} | AI Receptionist Now`, which spent 22 of
// ~60 visible characters on a brand nobody searches and truncated the keyword
// out of the result. metaTitle now ships verbatim, so its length is load-bearing.

const TITLE_BUDGET = 60;
const DESCRIPTION_BUDGET = 160;

test("every localized metaTitle fits the SERP budget", () => {
  for (const locale of MARKETING_LOCALES) {
    for (const [page, title] of [
      ["home", HOME_COPY[locale].metaTitle],
      ["pricing", PRICING_COPY[locale].metaTitle],
    ] as const) {
      assert.ok(title.length > 0, `${locale} ${page} metaTitle is empty`);
      assert.ok(
        title.length <= TITLE_BUDGET,
        `${locale} ${page} metaTitle is ${title.length} chars, over ${TITLE_BUDGET}: ${title}`,
      );
    }
  }
});

test("every localized metaDescription fits the snippet budget", () => {
  for (const locale of MARKETING_LOCALES) {
    for (const [page, description] of [
      ["home", HOME_COPY[locale].metaDescription],
      ["pricing", PRICING_COPY[locale].metaDescription],
    ] as const) {
      assert.ok(description.length > 0, `${locale} ${page} metaDescription is empty`);
      assert.ok(
        description.length <= DESCRIPTION_BUDGET,
        `${locale} ${page} metaDescription is ${description.length} chars, over ${DESCRIPTION_BUDGET}`,
      );
    }
  }
});

test("no localized metaTitle re-introduces the brand suffix", () => {
  // Guards against someone "restoring" the old `${h1} | AI Receptionist Now`
  // pattern by hand and silently spending the budget again.
  for (const locale of MARKETING_LOCALES) {
    for (const [page, title] of [
      ["home", HOME_COPY[locale].metaTitle],
      ["pricing", PRICING_COPY[locale].metaTitle],
    ] as const) {
      assert.ok(
        !title.includes("AI Receptionist Now"),
        `${locale} ${page} metaTitle spends the budget on the brand: ${title}`,
      );
    }
  }
});
