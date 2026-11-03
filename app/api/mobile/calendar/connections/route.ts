import { CALENDAR_PROVIDERS } from "@/lib/calendar/providers";
import { fetchCalendarConnections, loadIntegrations } from "@/lib/dashboard/calendar-events";
import { mobileRoute } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Connected calendars plus the providers you could still link.
 *
 * Uses the same live credential check as the dashboard panel, so "connected"
 * means the token actually works rather than just that a row exists - a phone
 * showing a green calendar that silently stopped booking is worse than useless.
 *
 * No connect URL is minted here. This screen refetches on every focus, and a
 * magic-link handoff minted per provider per load could be superseded or expire
 * before the tap. The app asks POST /api/mobile/web-link
 * `{ target: 'calendar', provider, returnUrl }` for one at tap time instead.
 */
export const GET = mobileRoute(async (userId) => {
  const integrations = await loadIntegrations(userId);
  const connections = await fetchCalendarConnections(integrations).catch(() => []);

  const connectedProviders = new Set(connections.map((c) => c.provider));
  const connectable = CALENDAR_PROVIDERS.filter((p) => p.oauth && !connectedProviders.has(p.id));

  return {
    connected: connections.map((c) => ({
      id: c.id,
      provider: c.provider,
      name: c.name,
      account: c.account,
      isPrimary: c.isPrimary,
      needsReconnect: !c.ok,
    })),
    connectable: connectable.map((p) => ({ id: p.id, name: p.name })),
  };
}, "calendar-connections");
