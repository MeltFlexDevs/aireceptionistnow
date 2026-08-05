import { CALENDAR_PROVIDERS } from "@/lib/calendar/providers";
import { fetchCalendarConnections, loadIntegrations } from "@/lib/dashboard/calendar-events";
import { mobileRoute } from "@/lib/mobile/auth";
import { webHandoffUrl } from "@/lib/mobile/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Connected calendars plus the providers you could still link.
 *
 * Uses the same live credential check as the dashboard panel, so "connected"
 * means the token actually works rather than just that a row exists - a phone
 * showing a green calendar that silently stopped booking is worse than useless.
 *
 * `connectUrl` is a one-time signed web handoff, not the bare
 * `/api/integrations/<id>/connect` path: OAuth consent needs a cookie session
 * on the site to bind the resulting tokens to this user, and the app carries a
 * bearer token instead. See lib/mobile/link.ts. Null when the handoff cannot be
 * minted, and the app then says to finish on the web rather than opening a
 * page that would bounce to sign-in.
 */
export const GET = mobileRoute(async (userId) => {
  const integrations = await loadIntegrations(userId);
  const connections = await fetchCalendarConnections(integrations).catch(() => []);

  const connectedProviders = new Set(connections.map((c) => c.provider));
  const connectable = CALENDAR_PROVIDERS.filter((p) => p.oauth && !connectedProviders.has(p.id));

  const links = await Promise.all(
    connectable.map(async (p) => ({
      id: p.id,
      name: p.name,
      connectUrl: await webHandoffUrl(userId, `/api/integrations/${p.id}/connect?next=/dashboard/calendar`),
    })),
  );

  return {
    connected: connections.map((c) => ({
      id: c.id,
      provider: c.provider,
      name: c.name,
      account: c.account,
      isPrimary: c.isPrimary,
      needsReconnect: !c.ok,
    })),
    connectable: links,
  };
}, "calendar-connections");
