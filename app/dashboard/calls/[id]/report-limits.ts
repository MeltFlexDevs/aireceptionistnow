/**
 * Shared by the report form (maxLength) and the server action (validation).
 * Lives outside actions.ts because a "use server" module may only export
 * async functions.
 */
export const MAX_MESSAGE_CHARS = 2000;
