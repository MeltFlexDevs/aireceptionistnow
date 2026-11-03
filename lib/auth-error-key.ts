/**
 * The sign-in dialog never shows Supabase's raw (English) error message. It
 * maps the auth error to one of these keys and shows the localized text from
 * UiCopy["auth"]["errors"] (content/i18n/_ui-copy.ts).
 */
export type AuthErrorKey = "invalidCode" | "rateLimited" | "invalidEmail" | "notConfigured" | "generic";

// Codes from @supabase/auth-js (lib/error-codes; the ErrorCode type is not exported). GoTrue answers otp_expired
// for a wrong code and for an expired one, so one key covers both. A Map, not
// an object, so a code such as "constructor" cannot hit a prototype key.
const BY_CODE = new Map<string, AuthErrorKey>([
  ["otp_expired", "invalidCode"],
  ["over_email_send_rate_limit", "rateLimited"],
  ["over_request_rate_limit", "rateLimited"],
  ["email_address_invalid", "invalidEmail"],
  ["provider_disabled", "notConfigured"],
  ["email_provider_disabled", "notConfigured"],
]);

/** The error code decides first, then HTTP 429, else "generic". */
export function authErrorKey(
  error: { code?: string | null; status?: number | null } | null | undefined,
): AuthErrorKey {
  const byCode = error?.code ? BY_CODE.get(error.code) : undefined;
  if (byCode) return byCode;
  if (error?.status === 429) return "rateLimited";
  return "generic";
}
