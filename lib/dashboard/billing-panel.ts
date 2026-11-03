import type { BillingProvider } from "@/lib/billing";
import type { BillingCycle } from "@/lib/plans";

/**
 * Pure views for the settings plan panel. No server imports, so they are unit
 * tested directly (lib/dashboard/plan.ts is server-only).
 */

/** Who bills the active plan, and its period. */
export interface PlanBilling {
  provider: BillingProvider | null;
  cycle: BillingCycle | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export type BillingPanelMode = "store-apple" | "store-google" | "comp" | "stripe" | "none";

/** The store page where the user changes or cancels an App Store / Google Play plan. */
export const STORE_SUBSCRIPTIONS_URL = {
  "store-apple": "https://apps.apple.com/account/subscriptions",
  "store-google": "https://play.google.com/store/account/subscriptions",
} as const;

/**
 * What the plan panel offers. A store plan is changed on the phone and a comp
 * grant has nothing to bill, so only 'stripe' gets the billing portal. An
 * active plan without a known provider (or a plan context cached before the
 * billing field existed) keeps the portal button, as before.
 */
export function billingPanelMode(ctx: {
  active: boolean;
  billing?: PlanBilling | null;
}): BillingPanelMode {
  if (!ctx.active) return "none";
  switch (ctx.billing?.provider) {
    case "apple":
      return "store-apple";
    case "google":
      return "store-google";
    case "comp":
      return "comp";
    default:
      return "stripe";
  }
}

/** A period end date in the viewer's language and display zone; "" when missing or invalid. */
export function formatBillingDate(
  iso: string | null | undefined,
  locale: string,
  timeZone: string,
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const opts = { dateStyle: "long" } as const;
  let fmt: Intl.DateTimeFormat;
  try {
    fmt = new Intl.DateTimeFormat(locale, { ...opts, timeZone: timeZone || "UTC" });
  } catch {
    fmt = new Intl.DateTimeFormat(locale, { ...opts, timeZone: "UTC" });
  }
  return fmt.format(d);
}

export interface PeriodLabels {
  cycleMonthly: string;
  cycleAnnual: string;
  renewsOn: string;
  endsOn: string;
}

/**
 * "Billed monthly · Renews on December 1, 2026", or "Ends on ..." once the
 * plan is set to cancel at the period end. Unknown parts are left out; ""
 * when nothing is known.
 */
export function billingPeriodLine(
  billing: PlanBilling | null | undefined,
  labels: PeriodLabels,
  locale: string,
  timeZone: string,
): string {
  if (!billing) return "";
  const cycle =
    billing.cycle === "annual"
      ? labels.cycleAnnual
      : billing.cycle === "monthly"
        ? labels.cycleMonthly
        : "";
  const date = formatBillingDate(billing.currentPeriodEnd, locale, timeZone);
  const end = date
    ? (billing.cancelAtPeriodEnd ? labels.endsOn : labels.renewsOn).replace("{date}", date)
    : "";
  return [cycle, end].filter(Boolean).join(" · ");
}
