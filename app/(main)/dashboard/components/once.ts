/**
 * Client-only "has this one-time event already fired?" gate, shared by the
 * guide's first-visit tip and the avatar's celebrate pulse.
 *
 * The module-level Set is what makes it StrictMode-safe: the second invocation
 * of a double-fired effect sees the key already claimed. Storage failures
 * (private mode) resolve to "already fired" so we never nag in a loop.
 *
 * Only call this from inside an effect - it touches localStorage, so calling it
 * during render would break hydration.
 */
const fired = new Set<string>();

export function claimOnce(key: string): boolean {
  if (fired.has(key)) return false;
  fired.add(key);
  try {
    if (localStorage.getItem(key) === "1") return false;
    localStorage.setItem(key, "1");
  } catch {
    return false;
  }
  return true;
}
