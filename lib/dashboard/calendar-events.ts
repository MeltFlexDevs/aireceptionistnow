import { cache } from "react";
import { resolveCalendarById } from "@/lib/call-engine/integrations/registry";
import type { ConnectionCheck } from "@/lib/call-engine/integrations/types";
import type { IntegrationConfig } from "@/lib/call-engine/types";
import { providerName } from "@/lib/calendar/providers";
import { listIntegrations, type Integration } from "./db";

/**
 * Real calendar data pulled live from the owner's connected calendars for the
 * dashboard. Two independent reads share one integrations fetch:
 *  - fetchExternalEvents: the actual events (titles, times) in a window.
 *  - fetchCalendarConnections: per-calendar health + connected account.
 *
 * Both are best-effort and never throw: a dead provider drops out of the result
 * rather than failing the page.
 */

// Request-memoized so the connected-calendar panel and the agenda body, which
// render in separate Suspense boundaries, don't each hit the DB.
export const loadIntegrations = cache(
  (ownerId?: string | null): Promise<Integration[]> =>
    listIntegrations(ownerId ?? undefined).catch(() => [] as Integration[]),
);

export interface ExternalEvent {
  // Stable React key / de-dup key: an event id is only unique within its
  // calendar, so it is namespaced by the integration it came from.
  id: string;
  integrationId: string;
  provider: string;
  providerLabel: string;
  title: string;
  start: string; // ISO 8601 instant
  end: string; // ISO 8601 instant
  allDay: boolean;
  location: string;
  url: string;
}

function calendarsOf(integrations: Integration[]): Integration[] {
  return integrations.filter((i) => i.type === "calendar");
}

export async function fetchExternalEvents(
  integrations: Integration[],
  timeMin: string,
  timeMax: string,
): Promise<ExternalEvent[]> {
  const enabled = calendarsOf(integrations).filter((i) => i.enabled);
  const perCalendar = await Promise.all(
    enabled.map(async (integration): Promise<ExternalEvent[]> => {
      const resolved = resolveCalendarById([integration as IntegrationConfig], integration.id);
      const list = resolved?.provider.listEvents;
      if (!list) return [];
      const res = await list({ timeMin, timeMax }).catch(() => ({ ok: false as const, events: [] }));
      if (!res.ok) return [];
      const label = providerName(integration.provider);
      return res.events.map((e) => ({
        id: `${integration.id}:${e.id}`,
        integrationId: integration.id,
        provider: integration.provider,
        providerLabel: label,
        title: e.title.trim(),
        start: e.start,
        end: e.end,
        allDay: e.allDay,
        location: (e.location ?? "").trim(),
        url: e.url ?? "",
      }));
    }),
  );

  // Cheap guard against a provider echoing the same event id twice in one
  // response. Collapsing an event shared across two connected calendars would
  // need the provider's iCalUID; that is intentionally not attempted - each
  // calendar's copy is a distinct entry and renders as its own row.
  const seen = new Set<string>();
  const events = perCalendar.flat().filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
  events.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  return events;
}

export function groupEventsByDay(
  events: ExternalEvent[],
  toKey: (d: Date) => string,
): Map<string, ExternalEvent[]> {
  const byDay = new Map<string, ExternalEvent[]>();
  for (const e of events) {
    // All-day events are date-anchored; converting their instant through a
    // timezone can bump them onto the previous/next day, so key by the date
    // prefix directly. Timed events key by the owner's local day.
    let key: string;
    if (e.allDay) {
      key = e.start.slice(0, 10);
    } else {
      const t = Date.parse(e.start);
      if (!Number.isFinite(t)) continue;
      key = toKey(new Date(t));
    }
    const list = byDay.get(key);
    if (list) list.push(e);
    else byDay.set(key, [e]);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  }
  return byDay;
}

export interface CalendarConnection {
  id: string;
  provider: string;
  name: string;
  account: string; // "" when the provider gives no identity
  ok: boolean; // credentials verified live (disabled calendars report true)
  isPrimary: boolean;
}

// Identity to show before/without a live check: what we captured at connect.
function storedAccount(config: Record<string, unknown>): string {
  const v =
    config.account_email ?? config.attendee_email ?? config.username ?? config.calendar_id ?? "";
  return typeof v === "string" ? v : "";
}

export async function fetchCalendarConnections(
  integrations: Integration[],
): Promise<CalendarConnection[]> {
  const calendars = calendarsOf(integrations);
  // Explicitly chosen primary wins; otherwise the first enabled calendar.
  const primaryId =
    calendars.find((i) => i.enabled && (i.config as { primary?: boolean })?.primary)?.id ??
    calendars.find((i) => i.enabled)?.id;

  return Promise.all(
    calendars.map(async (i): Promise<CalendarConnection> => {
      const resolved = i.enabled ? resolveCalendarById([i as IntegrationConfig], i.id) : null;
      const check = resolved?.provider.checkConnection;
      let ok = true;
      let account = storedAccount(i.config);
      if (check) {
        const res = await check().catch((): ConnectionCheck => ({ ok: false }));
        ok = res.ok;
        if (res.account) account = res.account;
      }
      return {
        id: i.id,
        provider: i.provider,
        name: providerName(i.provider),
        account,
        ok,
        isPrimary: i.id === primaryId,
      };
    }),
  );
}
