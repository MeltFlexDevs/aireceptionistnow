import type { IntegrationConfig } from "../types";
import { createCalcom } from "./calcom";
import { createGoogleCalendar } from "./google";
import { createOutlookCalendar } from "./outlook";
import type { CalendarFactory, CalendarProvider } from "./types";
import { createWebhookCalendar } from "./webhook";

// Maps an integration's `provider` to an adapter. Dedicated adapters for the
// common calendars; everything else falls back to the generic webhook adapter
// so a user can connect any system by giving us a URL.
const FACTORIES: Record<string, CalendarFactory> = {
  google: createGoogleCalendar,
  outlook: createOutlookCalendar,
  calcom: createCalcom,
  webhook: createWebhookCalendar,
};

export interface ResolvedCalendar {
  provider: CalendarProvider;
  integrationId: string;
}

/** Pick the first enabled calendar integration and build its adapter. */
export function resolveCalendarProvider(
  integrations: IntegrationConfig[],
): ResolvedCalendar | null {
  const calendar = integrations.find((i) => i.type === "calendar" && i.enabled);
  if (!calendar) return null;
  const factory = FACTORIES[calendar.provider] ?? createWebhookCalendar;
  return { provider: factory(calendar.config), integrationId: calendar.id };
}

export interface CalendarAccessEntry {
  integrationId: string;
  level: string; // read | write | busy (legacy)
}

/**
 * Build adapters for every calendar this assistant may read for availability —
 * any granted level (read, write, or legacy busy) contributes to free/busy.
 * Used by check_availability so a "read all calendars" assistant sees conflicts
 * across every connected calendar without being able to book on read-only ones.
 */
export function resolveCalendarsForAccess(
  integrations: IntegrationConfig[],
  access: CalendarAccessEntry[],
): ResolvedCalendar[] {
  const resolved: ResolvedCalendar[] = [];
  for (const entry of access) {
    const found = resolveCalendarById(integrations, entry.integrationId);
    if (found) resolved.push(found);
  }
  return resolved;
}

/** Build the adapter for a specific connected calendar (the one a number picked to write to). */
export function resolveCalendarById(
  integrations: IntegrationConfig[],
  integrationId: string,
): ResolvedCalendar | null {
  const calendar = integrations.find(
    (i) => i.id === integrationId && i.type === "calendar" && i.enabled,
  );
  if (!calendar) return null;
  const factory = FACTORIES[calendar.provider] ?? createWebhookCalendar;
  return { provider: factory(calendar.config), integrationId: calendar.id };
}
