/**
 * Webhook idempotency claims (0014). Pure, with no server imports, so it is
 * unit tested directly. lib/billing.ts uses it for the claim RPCs.
 */

/**
 * What claim_stripe_event and claim_billing_event return: this run owns the
 * event ('claimed'), a run already handled it ('processed'), or another run
 * claimed it less than 5 minutes ago and has not finished ('busy').
 */
export type ClaimState = "claimed" | "processed" | "busy";

/** The claim RPC result as a ClaimState. Throws on any other value, so the route answers 500 and the sender retries. */
export function toClaimState(data: unknown, rpc: string): ClaimState {
  if (data === "claimed" || data === "processed" || data === "busy") return data;
  throw new Error(`${rpc} returned an unexpected value: ${JSON.stringify(data)}`);
}

/**
 * The webhook answer when this run does not own the event, or null when it
 * does. Only a processed event is a duplicate (200). A busy event answers 409:
 * Stripe, Apple and RevenueCat retry any non-2xx answer, so a retry after the
 * lease of a dead run ends takes the claim over and the event is not lost.
 */
export function claimConflictResponse(state: ClaimState): Response | null {
  if (state === "processed") return Response.json({ received: true, duplicate: true });
  if (state === "busy") return Response.json({ error: "Event in progress." }, { status: 409 });
  return null;
}
