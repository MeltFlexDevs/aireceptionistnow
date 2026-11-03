/** One read of a row: its value and the version a write must still match (null: no row yet). */
export interface Versioned<T> {
  value: T;
  version: string | null;
}

export const CAS_ATTEMPTS = 3;

/**
 * Read, change and write only if nobody wrote in between (compare-and-swap).
 * `write` returns false when the row changed since `read`; the loop then
 * reads again and applies `change` to the fresh value. Two quick source adds
 * in the funnel used to read the same list, and the later write dropped the
 * other source. A thrown write error is not retried.
 */
export async function updateWithRetry<T>(
  read: () => Promise<Versioned<T>>,
  write: (next: T, version: string | null) => Promise<boolean>,
  change: (current: T) => T,
  attempts = CAS_ATTEMPTS,
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    const current = await read();
    const next = change(current.value);
    if (await write(next, current.version)) return next;
  }
  throw new Error("This changed somewhere else at the same time. Try again.");
}
