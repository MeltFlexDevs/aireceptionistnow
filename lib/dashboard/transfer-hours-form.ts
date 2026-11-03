/**
 * True when the transfer schedule is switched on but no day is ticked.
 * Saving that would store no window, which the server reads as "any time":
 * the opposite of what the user asked for. The form blocks the save instead.
 */
export function hasNoOpenDay(enabled: boolean, openDays: readonly boolean[]): boolean {
  return enabled && openDays.every((d) => !d);
}
