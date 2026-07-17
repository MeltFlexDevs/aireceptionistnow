import type { IntegrationConfig } from "../types";
import { createCalcom } from "./calcom";
import { createGoogleCalendar } from "./google";
import { createOutlookCalendar } from "./outlook";
import type { CalendarFactory, CalendarProvider } from "./types";
import { createWebhookCalendar } from "./webhook";

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

export interface CalendarAccessEntry {
  integrationId: string;
  level: string; // read | write | busy (legacy)
}

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

// Whether a provider's calendars can answer availability (implements getBusy).
// Derived from the factory output so it can't drift from the implementations
// (e.g. Outlook can create events but exposes no busy-window read).
const busySupport = new Map<string, boolean>();

export function providerSupportsBusy(provider: string): boolean {
  let hit = busySupport.get(provider);
  if (hit === undefined) {
    const factory = FACTORIES[provider] ?? createWebhookCalendar;
    hit = typeof factory({}).getBusy === "function";
    busySupport.set(provider, hit);
  }
  return hit;
}

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
