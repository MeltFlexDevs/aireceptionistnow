/**
 * Calendar connect errors travel in `?error=` as one of these codes, never as
 * free text: anyone can craft a link, so pages must not print the param. The
 * codes also reach the mobile app through /mobile/done, which slugs them
 * ("not_configured" -> "not-configured", "sign_in" -> "sign-in") and matches
 * on denied / expired / not-configured / sign-in.
 */
export type ConnectErrorCode = "denied" | "not_configured" | "expired" | "sign_in" | "failed";

const KNOWN: readonly ConnectErrorCode[] = ["denied", "not_configured", "expired", "sign_in", "failed"];

/** Reads a raw `?error=` value (or a provider's OAuth `error`). Unknown text -> "failed". */
export function connectErrorCode(raw: string | null | undefined): ConnectErrorCode | null {
  if (!raw) return null;
  if (raw === "access_denied") return "denied";
  return (KNOWN as readonly string[]).includes(raw) ? (raw as ConnectErrorCode) : "failed";
}

/** The `t.calendar` key that explains a code to the user. */
export function connectErrorKey(
  code: ConnectErrorCode,
): "connectErrorDenied" | "connectErrorNotConfigured" | "connectErrorFailed" {
  if (code === "denied") return "connectErrorDenied";
  if (code === "not_configured") return "connectErrorNotConfigured";
  return "connectErrorFailed";
}
