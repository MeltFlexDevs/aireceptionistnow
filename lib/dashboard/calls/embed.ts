
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

export function assistantName(row: Record<string, unknown>): string | null {
  const asst = one(row.assistant);
  const name = asst ? asst.name : null;
  return typeof name === "string" ? name : null;
}

export function assistantOwnerId(row: Record<string, unknown>): string | null {
  const pn = one(row.phone_number);
  const asst = pn ? one(pn.assistant) : null;
  const id = asst ? asst.owner_id : null;
  return typeof id === "string" ? id : null;
}
