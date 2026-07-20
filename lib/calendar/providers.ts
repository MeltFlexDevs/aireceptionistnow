/**
 * The calendars a receptionist can book into.
 *
 * Pure data with no React and no route affinity, which is why it lives in lib/
 * rather than under a dashboard folder: onboarding reads it too, and a route
 * rename has already broken that import once.
 *
 * Every provider is OAuth-only - there are no credential fields to fill in - so
 * the old `fields` / `live` / `blurb` members are gone along with the
 * form-based connect path they served.
 */
export interface CalendarProviderDef {
  id: string;
  name: string;
  /** Supports "Continue with…" when its OAuth env is configured. */
  oauth: boolean;
}

export const CALENDAR_PROVIDERS: CalendarProviderDef[] = [
  { id: "google", name: "Google Calendar", oauth: true },
  { id: "outlook", name: "Microsoft Calendar", oauth: true },
  { id: "calcom", name: "Cal.com", oauth: true },
];

/**
 * Display name for a provider id. Covers ids that are no longer connectable but
 * may still be stored against an existing booking, so an old appointment never
 * renders a raw internal id.
 */
const LEGACY_NAMES: Record<string, string> = {
  calendly: "Calendly",
  webhook: "Custom calendar",
};

export function providerName(id: string): string {
  return CALENDAR_PROVIDERS.find((p) => p.id === id)?.name ?? LEGACY_NAMES[id] ?? id;
}
