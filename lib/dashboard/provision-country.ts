import { DEFAULT_COUNTRY } from "@/lib/number-pricing";

/**
 * The number country a provisioning run uses. A blank or missing saved
 * country means the default, as buyTwilioNumber already reads it, so the
 * free-pool claim and the purchase agree. Rows saved by the web funnel before
 * 2026-08 can hold "".
 *
 * Kept out of provision.ts so node:test can load it (provision.ts reaches
 * `server-only`).
 */
export function provisionCountry(saved: string | null | undefined): string {
  return (saved || DEFAULT_COUNTRY).toUpperCase();
}
