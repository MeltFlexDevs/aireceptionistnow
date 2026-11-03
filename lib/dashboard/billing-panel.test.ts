import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  billingPanelMode,
  billingPeriodLine,
  formatBillingDate,
  STORE_SUBSCRIPTIONS_URL,
  type PlanBilling,
} from "./billing-panel";
import { de } from "../i18n/dictionaries/de";
import { en } from "../i18n/dictionaries/en";
import { es } from "../i18n/dictionaries/es";
import { fr } from "../i18n/dictionaries/fr";
import { it as itDict } from "../i18n/dictionaries/it";
import { nl } from "../i18n/dictionaries/nl";
import { pt } from "../i18n/dictionaries/pt";
import { sk } from "../i18n/dictionaries/sk";

const billing = (over: Partial<PlanBilling> = {}): PlanBilling => ({
  provider: "stripe",
  cycle: "monthly",
  currentPeriodEnd: "2026-11-30T23:30:00Z",
  cancelAtPeriodEnd: false,
  ...over,
});

const LABELS = {
  cycleMonthly: "Billed monthly",
  cycleAnnual: "Billed yearly",
  renewsOn: "Renews on {date}",
  endsOn: "Ends on {date}",
};

// Source guard: the repo has no component test runner, so this pins the
// plan panel wiring in the settings page.
const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const DICTS = { en, sk, de, es, fr, it: itDict, nl, pt };

test("billingPanelMode picks the panel from the provider of an active plan", () => {
  assert.equal(billingPanelMode({ active: true, billing: billing({ provider: "apple" }) }), "store-apple");
  assert.equal(billingPanelMode({ active: true, billing: billing({ provider: "google" }) }), "store-google");
  assert.equal(billingPanelMode({ active: true, billing: billing({ provider: "comp" }) }), "comp");
  assert.equal(billingPanelMode({ active: true, billing: billing() }), "stripe");
  // No known provider keeps today's portal button.
  assert.equal(billingPanelMode({ active: true, billing: billing({ provider: null }) }), "stripe");
  assert.equal(billingPanelMode({ active: true, billing: null }), "stripe");
  // Without an active plan there is nothing to manage, whoever billed it.
  assert.equal(billingPanelMode({ active: false, billing: billing({ provider: "apple" }) }), "none");
  assert.equal(billingPanelMode({ active: false, billing: null }), "none");
});

test("store subscription links open the store's own page", () => {
  assert.equal(STORE_SUBSCRIPTIONS_URL["store-apple"], "https://apps.apple.com/account/subscriptions");
  assert.equal(STORE_SUBSCRIPTIONS_URL["store-google"], "https://play.google.com/store/account/subscriptions");
});

test("formatBillingDate uses the viewer's language and display zone", () => {
  const iso = "2026-11-30T23:30:00Z";
  assert.equal(formatBillingDate(iso, "en", "Europe/Bratislava"), "December 1, 2026");
  assert.equal(formatBillingDate(iso, "en", "UTC"), "November 30, 2026");
  assert.equal(formatBillingDate(iso, "sk", "Europe/Bratislava"), "1. decembra 2026");
  // A bad or empty zone falls back to UTC instead of throwing.
  assert.equal(formatBillingDate(iso, "en", "Not/AZone"), "November 30, 2026");
  assert.equal(formatBillingDate(iso, "en", ""), "November 30, 2026");
  assert.equal(formatBillingDate(null, "en", "UTC"), "");
  assert.equal(formatBillingDate("not a date", "en", "UTC"), "");
});

test("billingPeriodLine shows the cycle and the renewal or end date", () => {
  const tz = "Europe/Bratislava";
  assert.equal(billingPeriodLine(billing(), LABELS, "en", tz), "Billed monthly · Renews on December 1, 2026");
  assert.equal(
    billingPeriodLine(billing({ cycle: "annual", cancelAtPeriodEnd: true }), LABELS, "en", tz),
    "Billed yearly · Ends on December 1, 2026",
  );
  assert.equal(billingPeriodLine(billing({ cycle: null }), LABELS, "en", tz), "Renews on December 1, 2026");
  assert.equal(billingPeriodLine(billing({ currentPeriodEnd: null }), LABELS, "en", tz), "Billed monthly");
  assert.equal(billingPeriodLine(billing({ cycle: null, currentPeriodEnd: null }), LABELS, "en", tz), "");
  assert.equal(billingPeriodLine(null, LABELS, "en", tz), "");
});

test("plan panel texts exist in every language", () => {
  const keys = [
    "cycleMonthly",
    "cycleAnnual",
    "renewsOn",
    "endsOn",
    "billedByAppStore",
    "billedByGooglePlay",
    "storeSubscriptionsLink",
    "compPlanNote",
  ] as const;
  for (const [code, d] of Object.entries(DICTS)) {
    for (const key of keys) assert.ok(d.settings[key].trim().length > 0, `${code}.${key}`);
    assert.ok(d.settings.renewsOn.includes("{date}"), code);
    assert.ok(d.settings.endsOn.includes("{date}"), code);
    assert.ok(d.settings.billedByAppStore.includes("App Store"), code);
    assert.ok(d.settings.billedByGooglePlay.includes("Google Play"), code);
    if (code !== "en") {
      for (const key of keys) assert.notEqual(d.settings[key], en.settings[key], `${code}.${key}`);
    }
  }
});

test("the settings plan panel follows billingPanelMode", () => {
  const SETTINGS = read("app/(main)/dashboard/settings/page.tsx");
  const PLAN_USAGE = read("app/(main)/dashboard/components/PlanUsage.tsx");
  // The portal button is no longer shown for every active plan.
  assert.ok(!SETTINGS.includes("planCtx?.active ? ("));
  assert.ok(SETTINGS.includes('mode === "stripe" ? ('));
  assert.ok(SETTINGS.includes("STORE_SUBSCRIPTIONS_URL[mode]"));
  assert.ok(SETTINGS.includes("{s.compPlanNote}"));
  assert.ok(SETTINGS.includes("<PlanUsage ctx={planCtx} tz={tz} />"));
  assert.ok(PLAN_USAGE.includes("const showUpgrade = !store && (!ctx.active || !ctx.canAddNumber);"));
  assert.ok(PLAN_USAGE.includes("billingPeriodLine(ctx.billing, s, locale, tz)"));
});

test("the billing portal button explains the portal and offers a next step on error", () => {
  const BUTTON = read("app/(main)/dashboard/settings/BillingPortalButton.tsx");
  assert.ok(BUTTON.includes("{s.manageBillingHint}"));
  assert.ok(BUTTON.includes('s.manageBillingRetry.split("{support}")'));
  assert.ok(BUTTON.includes('href="/support"'));
  assert.ok(BUTTON.includes('role="alert"'));
  for (const [code, d] of Object.entries(DICTS)) {
    assert.equal(d.settings.manageBillingRetry.split("{support}").length, 2, code);
    assert.ok(d.settings.manageBillingHint.trim().length > 0, code);
    assert.ok(d.settings.manageBillingSupport.trim().length > 0, code);
    if (code !== "en") {
      assert.notEqual(d.settings.manageBillingHint, en.settings.manageBillingHint, code);
      assert.notEqual(d.settings.manageBillingRetry, en.settings.manageBillingRetry, code);
    }
  }
});
