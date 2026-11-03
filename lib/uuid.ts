/**
 * True when `s` is a UUID in the 8-4-4-4-12 hex form. Check an id from a URL
 * with this before it reaches a `uuid` column: Postgres rejects anything else
 * with an error (22P02), which would turn a wrong id into a 500, not a 404.
 */
export function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
