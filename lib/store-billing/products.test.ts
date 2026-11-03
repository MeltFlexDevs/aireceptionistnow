import assert from "node:assert/strict";
import { test } from "node:test";

import { mobilePlans } from "@/lib/mobile/plans";
import type { BillingCycle, PlanId } from "@/lib/plans";
import { NOT_YET_IN_PRODUCT, STORE_PRODUCTS, productToPlan, storeProductIdsFor } from "./products";

const PLANS: PlanId[] = ["solo", "team"];
const CYCLES: BillingCycle[] = ["monthly", "annual"];

test("every store product id maps to its plan and cycle, and back", () => {
  for (const plan of PLANS) {
    const ids = storeProductIdsFor(plan);
    for (const cycle of CYCLES) {
      assert.deepEqual(productToPlan("apple", ids.ios[cycle]), { plan, cycle });
      assert.deepEqual(productToPlan("google", ids.android[cycle]), { plan, cycle });
    }
  }
});

test("the mapping table and the id builder agree on the full catalogue", () => {
  const built = PLANS.flatMap((plan) => {
    const ids = storeProductIdsFor(plan);
    return CYCLES.map((cycle) => ({ apple: ids.ios[cycle], google: ids.android[cycle] }));
  });
  assert.deepEqual(
    Object.keys(STORE_PRODUCTS.apple).sort(),
    built.map((b) => b.apple).sort(),
  );
  assert.deepEqual(
    Object.keys(STORE_PRODUCTS.google).sort(),
    built.map((b) => b.google).sort(),
  );
});

test("the ids follow the conventions the stores are configured with", () => {
  const solo = storeProductIdsFor("solo");
  assert.equal(solo.ios.monthly, "com.aireceptionistnow.app.solo.monthly");
  assert.equal(solo.ios.annual, "com.aireceptionistnow.app.solo.annual");
  // RevenueCat spells a Google Play base plan as <subscriptionId>:<basePlanId>
  // and our packages as <plan>_<cycle>.
  assert.equal(solo.android.monthly, "solo:monthly");
  assert.equal(solo.android.annual, "solo:annual");
  assert.equal(solo.android.packageMonthly, "solo_monthly");
  assert.equal(solo.android.packageAnnual, "solo_annual");
});

test("a product we do not sell maps to nothing", () => {
  assert.equal(productToPlan("apple", "com.example.other"), null);
  assert.equal(productToPlan("google", "solo"), null);
  assert.equal(productToPlan("apple", undefined), null);
  assert.equal(productToPlan("google", ""), null);
});

test("the catalogue carries store ids, price-free included lines and only deliverable features", () => {
  const plans = mobilePlans();
  const solo = plans.find((p) => p.id === "solo");
  const team = plans.find((p) => p.id === "team");
  assert.ok(solo && team);

  assert.deepEqual(solo.storeProductIds, storeProductIdsFor("solo"));
  assert.deepEqual(team.storeProductIds, storeProductIdsFor("team"));

  // The store sets the price, so a line quoting euros cannot sit next to an
  // in-app purchase; the suffix goes, the entitlement stays.
  assert.deepEqual(solo.storeIncluded, [
    "1000 minutes",
    "1,000 contacts",
    "No parallel calls",
    "1 phone number",
    "Assistants",
    "1 user",
  ]);
  assert.deepEqual(team.storeIncluded, [
    "3000 minutes",
    "3,000 contacts",
    "3 concurrent calls",
    "3 phone numbers",
    "Assistants",
    "Users",
  ]);
  for (const p of plans) {
    for (const line of p.storeIncluded) assert.ok(!line.includes("€"), `${p.id}: ${line}`);
  }

  // Nothing in the code base delivers these yet, so an IAP must not sell them.
  assert.deepEqual(team.storeFeatures, ["Everything in Solo"]);
  assert.deepEqual(solo.storeFeatures, solo.features);
  for (const p of plans) {
    for (const missing of NOT_YET_IN_PRODUCT) {
      assert.ok(!p.storeFeatures.includes(missing), `${p.id} still sells "${missing}"`);
    }
  }
  // The web copy is untouched: the pricing page still advertises them.
  assert.ok(team.features.includes("Connect own SIP"));
});
