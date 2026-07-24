import "server-only";

// Complimentary / test accounts: emails that skip Stripe checkout entirely and
// are granted an active subscription, so they can run the full onboarding and
// dashboard for free. Handy for our own end-to-end testing without paying.
//
// Configure the list via the COMP_ACCOUNT_EMAILS env var (comma-separated).
// A built-in default keeps our primary testing address working even when the
// env var is unset.
const DEFAULT_COMP_EMAILS = ["meltflexsales@gmail.com"];

// Synthetic customer id we store for comp accounts. Prefixed so nothing ever
// mistakes it for a real Stripe customer id (see billing-portal route).
export const COMP_CUSTOMER_PREFIX = "comp:";

function compEmailSet(): Set<string> {
  const fromEnv = (process.env.COMP_ACCOUNT_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...DEFAULT_COMP_EMAILS, ...fromEnv]);
}

export function isCompEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return compEmailSet().has(email.trim().toLowerCase());
}

export function isCompCustomerId(customerId: string | null | undefined): boolean {
  return !!customerId && customerId.startsWith(COMP_CUSTOMER_PREFIX);
}
