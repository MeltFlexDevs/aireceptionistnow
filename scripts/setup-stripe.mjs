import Stripe from "stripe";

const ANNUAL_DISCOUNT = 0.15;
const annual = (monthlyCents) =>
  Math.round(monthlyCents * 12 * (1 - ANNUAL_DISCOUNT));

const PLANS = [
  {
    id: "solo",
    name: "AI Receptionist — Solo",
    description: "1,000 minutes/mo · 1 number · for 1–20 calls/day",
    monthlyCents: 9900,
  },
  {
    id: "team",
    name: "AI Receptionist — Team",
    description: "3,000 minutes/mo · 3 numbers · for 20–100 calls/day",
    monthlyCents: 29900,
  },
];
const CURRENCY = "eur";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY before running this script.");
  process.exit(1);
}
const live = key.startsWith("sk_live") || key.startsWith("rk_live");
const stripe = new Stripe(key);

async function findProduct(planId) {
  try {
    const res = await stripe.products.search({
      query: `metadata['air_plan']:'${planId}' AND active:'true'`,
    });
    if (res.data[0]) return res.data[0];
  } catch {
    const all = await stripe.products.list({ limit: 100, active: true });
    const hit = all.data.find((p) => p.metadata?.air_plan === planId);
    if (hit) return hit;
  }
  return null;
}

async function findPrice(productId, amountCents, interval) {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });
  return prices.data.find(
    (p) =>
      p.unit_amount === amountCents &&
      p.currency === CURRENCY &&
      p.recurring?.interval === interval,
  );
}

async function ensurePrice(product, amountCents, interval, planId, cycle) {
  let price = await findPrice(product.id, amountCents, interval);
  if (price) {
    console.log(`  ${cycle} price: reusing ${price.id}`);
  } else {
    price = await stripe.prices.create({
      product: product.id,
      currency: CURRENCY,
      unit_amount: amountCents,
      recurring: { interval },
      metadata: { air_plan: planId, air_cycle: cycle },
    });
    console.log(`  ${cycle} price: created ${price.id}`);
  }
  return price;
}

async function run() {
  console.log(`\nStripe ${live ? "LIVE" : "TEST"} mode — setting up plans…\n`);
  const envLines = [];

  for (const plan of PLANS) {
    let product = await findProduct(plan.id);
    if (product) {
      console.log(`• product ${plan.id}: reusing ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { air_plan: plan.id },
      });
      console.log(`• product ${plan.id}: created ${product.id}`);
    }

    const monthlyPrice = await ensurePrice(
      product,
      plan.monthlyCents,
      "month",
      plan.id,
      "monthly",
    );
    const annualPrice = await ensurePrice(
      product,
      annual(plan.monthlyCents),
      "year",
      plan.id,
      "annual",
    );

    // Default the product to its monthly price for the Stripe dashboard.
    await stripe.products.update(product.id, {
      default_price: monthlyPrice.id,
    });

    const upper = plan.id.toUpperCase();
    envLines.push(
      `NEXT_PUBLIC_STRIPE_PRICE_${upper}_MONTHLY=${monthlyPrice.id}`,
    );
    envLines.push(`NEXT_PUBLIC_STRIPE_PRICE_${upper}_ANNUAL=${annualPrice.id}`);
  }

  console.log("\n──────────────────────────────────────────────");
  console.log("Add these to Vercel + .env.local:\n");
  console.log(envLines.join("\n"));
  console.log("──────────────────────────────────────────────\n");
}

run().catch((err) => {
  console.error("\nSetup failed:", err.message);
  process.exit(1);
});
