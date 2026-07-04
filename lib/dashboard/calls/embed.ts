// Supabase returns embedded relations as either an object or a single-element
// array depending on the inferred cardinality. These helpers normalize that and
// coerce loosely-typed row values without resorting to `any`.

export function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function num(v: unknown): number {
  return typeof v === "number" ? v : 0;
}

function one(v: unknown): Record<string, unknown> | null {
  const x = Array.isArray(v) ? v[0] : v;
  return x && typeof x === "object" ? (x as Record<string, unknown>) : null;
}

/** The call's assistant name from the insert-time `calls.assistant_id` snapshot
 *  (embedded as `row.assistant`), NOT the number's current assistant. A recycled
 *  pooled number would otherwise label the original owner's calls with the new
 *  holder's assistant name. Null for pre-trigger legacy rows (no snapshot). */
export function assistantName(row: Record<string, unknown>): string | null {
  const asst = one(row.assistant);
  const name = asst ? asst.name : null;
  return typeof name === "string" ? name : null;
}

/** calls → phone_number → assistant.owner_id: the LIVE chain, used only as the
 *  pre-trigger fallback for owner scoping when the call carries no owner_id
 *  stamp. Callers must prefer the stamped calls.owner_id first. */
export function assistantOwnerId(row: Record<string, unknown>): string | null {
  const pn = one(row.phone_number);
  const asst = pn ? one(pn.assistant) : null;
  const id = asst ? asst.owner_id : null;
  return typeof id === "string" ? id : null;
}
