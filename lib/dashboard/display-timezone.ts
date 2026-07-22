import { cookies } from "next/headers";
import { getAccountSettings } from "./account";

function isValidTimezone(tz: string): boolean {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Timezone to DISPLAY dashboard times in. Prefers the account setting; when the
 * user has not set one, falls back to the browser timezone captured by
 * TimezoneSync in the `tz` cookie, then UTC. Deliberately separate from
 * ownerTimezone (the business timezone the calling flow uses) so a viewer's
 * browser zone can never leak into an assistant's prompt.
 */
export async function displayTimezone(ownerId?: string | null): Promise<string> {
  const account = ownerId ? (await getAccountSettings(ownerId)).timezone.trim() : "";
  if (account) return account;
  const raw = (await cookies()).get("tz")?.value;
  const tz = raw ? decodeURIComponent(raw) : "";
  return isValidTimezone(tz) ? tz : "UTC";
}
