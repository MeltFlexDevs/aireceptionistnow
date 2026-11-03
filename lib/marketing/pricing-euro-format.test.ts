import assert from "node:assert/strict";
import { test } from "node:test";

import { PRICING_COPY } from "@/content/i18n/pricing-registry";
import { formatEur } from "@/lib/price-format";
import { MARKETING_LOCALES } from "@/lib/i18n/marketing/locales";

// The copy lines must write euro amounts the way formatEur does for the
// locale, so they match the plan prices and never break inside an amount.
test("localized pricing copy writes euro amounts in the Intl format", () => {
  for (const l of MARKETING_LOCALES) {
    const copy = PRICING_COPY[l];
    const lines = [copy.vatNote, ...Object.values(copy.plans).flatMap((p) => p.included)];
    const amounts = [formatEur(0.09, l, 2), formatEur(7, l)];
    let found = 0;
    for (const line of lines) {
      let rest = line;
      for (const a of amounts) {
        found += rest.split(a).length - 1;
        rest = rest.split(a).join("");
      }
      assert.ok(!rest.includes("€"), `${l}: euro sign outside an Intl amount in "${line}"`);
    }
    assert.equal(found, 5, `${l}: expected 5 euro amounts`);
  }
});
