/**
 * Shared result shape for server actions that report back inline instead of
 * redirecting with ?saved= / ?error=.
 *
 * Actions localize their own copy (getDictionary() works inside "use server"
 * modules) and return one of these; the client renders it with <SavePill />.
 *
 * This file carries no "use server" directive on purpose - such a module may
 * only export async functions, and both the actions and the client forms need
 * these types and helpers.
 */
export interface ActionState {
  /** null = untouched, so the pill renders nothing on first paint. */
  ok: boolean | null;
  /** Plain-language failure, already localized by the action. */
  error?: string;
  /** Success copy overriding the shared "Saved." pill. */
  message?: string;
  /** Per-field errors keyed by the input's `name`. */
  fields?: Record<string, string>;
  /**
   * Change token. Two identical saves in a row produce equal states, and the
   * pill's fade timer keys off this so the second one still re-fires.
   */
  at?: number;
}

export const IDLE: ActionState = { ok: null };

export function ok(message?: string): ActionState {
  return { ok: true, message, at: Date.now() };
}

export function fail(error: string, fields?: Record<string, string>): ActionState {
  return { ok: false, error, fields, at: Date.now() };
}
