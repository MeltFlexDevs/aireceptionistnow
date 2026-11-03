/** Keep only the last 4 digits of a phone number for logs. */
export function maskPhone(value: string | null | undefined): string {
  if (!value) return "(none)";
  const digits = value.replace(/\D/g, "");
  return digits.length > 4 ? `***${digits.slice(-4)}` : "***";
}

/** Keep the first letter and the domain of an email for logs. */
export function maskEmail(value: string | null | undefined): string {
  if (!value) return "(none)";
  const at = value.lastIndexOf("@");
  return at > 0 ? `${value[0]}***${value.slice(at)}` : "***";
}
