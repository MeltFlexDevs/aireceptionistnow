/**
 * The one rule for a phone number we store and later dial or text: transfer
 * destinations, the escalation page number, alert numbers and the profile phone.
 *
 * A number the call engine cannot dial used to save fine: the page said saved,
 * then lib/call-engine/escalation.ts dropped it and no transfer ever happened.
 * Checking at save time makes that mistake visible. The mobile app checks the
 * same rule on its side.
 */

/** What people type between digits: spaces, dots, dashes and parentheses. */
const SEPARATORS = /[\s().-]/g;
/** E.164: "+", a country code that does not start with 0, 7 to 15 digits in total. */
const E164 = /^\+[1-9]\d{6,14}$/;
/** North America (+1): exactly 10 digits; area code and exchange never start with 0 or 1. */
const NANP = /^\+1[2-9]\d{2}[2-9]\d{6}$/;

/**
 * The stored form of `raw` (for example "+14155550142"), or null when it is not
 * a number we can dial. Empty input is null too: each caller decides what an
 * empty field means.
 */
export function normalizePhone(raw: string): string | null {
  const phone = raw.replace(SEPARATORS, "");
  if (!E164.test(phone)) return null;
  if (phone.startsWith("+1") && !NANP.test(phone)) return null;
  return phone;
}

/**
 * What a settings save stores for the phone field: `raw` is the typed value,
 * `stored` the value saved now. Only a changed number is checked, so a number
 * saved before this rule as typed does not block saving the rest of the form.
 * Empty clears the field. Null means a changed number we cannot dial.
 */
export function phoneToSave(raw: string, stored: string): string | null {
  const typed = raw.replace(SEPARATORS, "");
  if (!typed) return "";
  if (typed === stored.replace(SEPARATORS, "")) return stored;
  return normalizePhone(typed);
}
