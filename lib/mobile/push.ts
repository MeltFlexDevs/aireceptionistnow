import "server-only";

import { serviceClient } from "@/lib/dashboard/supabase";
import { readTickets, type ExpoTicket, type PushTarget, type PushTicketRow } from "@/lib/mobile/push-receipts";

/**
 * Expo push delivery for the native app.
 *
 * The app is what a business actually watches its phone line through, and the
 * one thing it could not do until now is tell you something happened while it
 * was closed. Everything else in `/api/mobile/*` is a pull; this is the only
 * push.
 *
 * Delivery is best-effort by design. Every caller runs this from a background
 * hook (`after()` / `Promise.allSettled`) after the work that matters has
 * already been committed, so a push that fails must never surface as a failed
 * call, a failed booking, or a 500 - it is a notification, not a receipt.
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/** Expo's documented per-request cap. Exceeding it is rejected outright. */
const CHUNK = 100;

const TIMEOUT_MS = 10_000;

/**
 * Expo tokens are `ExponentPushToken[...]` (and `ExpoPushToken[...]` on some
 * older SDKs). Validated rather than trusted: an unchecked string would let a
 * client fill the table with junk that every later send pays to retry, and
 * `sendPushToOwner` would keep reporting those rows as reachable devices.
 */
export function isExpoPushToken(value: unknown): value is string {
  return typeof value === "string" && /^Expo(nent)?PushToken\[[^\]\s]+\]$/.test(value);
}

export type PushCategory = "call" | "booking" | "escalation" | "system";

export interface PushMessage {
  title: string;
  body: string;
  /**
   * Deep-link target inside the app, e.g. `/call/<id>`. The app routes on this
   * when the notification is tapped, so it must be an in-app path - never a URL.
   */
  path?: string;
  category?: PushCategory;
}

/**
 * Whether the failure is "migration 0012 has not added push_devices.device_id".
 * Postgres answers 42703 for an undefined column; PostgREST wraps it as PGRST204.
 */
function isMissingDeviceColumn(err: unknown): boolean {
  const message =
    err instanceof Error ? err.message : String((err as { message?: unknown })?.message ?? err ?? "");
  const code = String((err as { code?: unknown })?.code ?? "");
  return (
    code === "42703" ||
    code === "PGRST204" ||
    (/device_id/i.test(message) && /column|schema cache/i.test(message))
  );
}

/**
 * Register (or refresh) one install's push token.
 *
 * Upserts on `token` rather than inserting, because the app re-registers on
 * every cold start and the token outlives a sign-out: if a second user signs in
 * on the same handset, the row must move to them or they would receive the
 * previous user's call alerts. That re-assignment is the reason `owner_id` is
 * in the update set.
 *
 * `deviceId` is the keychain install id the app sends as `X-Device-Id`; it is
 * what lets `revokeDevice` (lib/mobile/devices.ts) find and drop this row. Only
 * written when given, so an older build without the header does not blank a
 * value a newer build stored.
 *
 * `enabled` is the app's stored mute (see `enabledOnRegister` in
 * lib/mobile/push-register.ts). Writing it in this same upsert is what stops a
 * cold-start register from un-muting the phone.
 */
export async function registerPushDevice(
  ownerId: string,
  token: string,
  platform: string,
  deviceId?: string | null,
  enabled = true,
): Promise<void> {
  const row: Record<string, unknown> = {
    owner_id: ownerId,
    token,
    platform: platform === "ios" || platform === "android" ? platform : "unknown",
    enabled,
    last_seen_at: new Date().toISOString(),
  };
  if (deviceId) row.device_id = deviceId;

  const { error } = await serviceClient().from("push_devices").upsert(row, { onConflict: "token" });
  if (!error) return;

  // An unmigrated project must still register for alerts: retry without the
  // column and say why, rather than failing every registration until 0012 runs.
  if (deviceId && isMissingDeviceColumn(error)) {
    console.warn("[push] push_devices.device_id is missing - run migration 0012");
    delete row.device_id;
    const retry = await serviceClient().from("push_devices").upsert(row, { onConflict: "token" });
    if (retry.error) throw retry.error;
    return;
  }
  throw error;
}

/**
 * Drop every push row this owner registered from one install. Called by
 * `revokeDevice` so a revoked handset stops receiving call alerts, not just
 * its listing. Scoped by owner: a device id is client-supplied.
 */
export async function deletePushDevicesByDeviceId(ownerId: string, deviceId: string): Promise<void> {
  const { error } = await serviceClient()
    .from("push_devices")
    .delete()
    .eq("owner_id", ownerId)
    .eq("device_id", deviceId);
  if (!error) return;
  if (isMissingDeviceColumn(error)) {
    // Nothing to match on yet; the revoke of the account_devices row stands.
    console.warn("[push] push_devices.device_id is missing - run migration 0012");
    return;
  }
  throw error;
}

/**
 * Drop every push row this owner has except the ones from `keepDeviceId`: the
 * push half of "sign out everywhere else" (`revokeOtherDevices`). `neq` never
 * matches a null `device_id`, so those rows get their own delete. They come
 * from a build that did not send `X-Device-Id` and cannot be matched to the
 * caller; if one was the caller's, its app registers again on the next cold
 * start. Scoped by owner: a device id is client-supplied.
 */
export async function deletePushDevicesExceptDeviceId(ownerId: string, keepDeviceId: string): Promise<void> {
  const client = serviceClient();
  const others = await client
    .from("push_devices")
    .delete()
    .eq("owner_id", ownerId)
    .neq("device_id", keepDeviceId);
  const error =
    others.error ??
    (await client.from("push_devices").delete().eq("owner_id", ownerId).is("device_id", null)).error;
  if (!error) return;
  if (isMissingDeviceColumn(error)) {
    // No row can be told apart from the caller's yet; the account_devices
    // delete stands, as in deletePushDevicesByDeviceId.
    console.warn("[push] push_devices.device_id is missing - run migration 0012");
    return;
  }
  throw error;
}

/** Sign-out and the alerts toggle both land here. Scoped to the owner so one user cannot mute another's device. */
export async function setPushDeviceEnabled(
  ownerId: string,
  token: string,
  enabled: boolean,
): Promise<void> {
  const { error } = await serviceClient()
    .from("push_devices")
    .update({ enabled })
    .eq("owner_id", ownerId)
    .eq("token", token);
  if (error) throw error;
}

export async function deletePushDevice(ownerId: string, token: string): Promise<void> {
  const { error } = await serviceClient()
    .from("push_devices")
    .delete()
    .eq("owner_id", ownerId)
    .eq("token", token);
  if (error) throw error;
}

/** True when the owner has at least one live target - lets callers skip building a payload nobody will see. */
export async function hasPushDevices(ownerId: string): Promise<boolean> {
  const { count, error } = await serviceClient()
    .from("push_devices")
    .select("token", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("enabled", true);
  if (error) return false;
  return (count ?? 0) > 0;
}

/**
 * A token Expo reports as dead is deleted, not disabled.
 *
 * `DeviceNotRegistered` means the app was uninstalled or the token was rotated;
 * it will never come back. Leaving the row would make every later send pay for
 * a guaranteed failure, and `hasPushDevices` would keep claiming the user is
 * reachable when they are not.
 */
async function pruneDeadTokens(tokens: string[]): Promise<void> {
  if (tokens.length === 0) return;
  const { error } = await serviceClient().from("push_devices").delete().in("token", tokens);
  if (error) console.error("[push] prune failed", error);
}

/**
 * Store the ok tickets so the push-receipts cron can read their receipts
 * (lib/mobile/push-receipts.ts). Best-effort like the send: before migration
 * 0018 the insert fails and only logs.
 */
async function recordTickets(rows: PushTicketRow[]): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await serviceClient().from("push_tickets").insert(rows);
  if (error) console.error("[push] storing tickets failed", error);
}

async function postChunk(
  targets: PushTarget[],
  message: PushMessage,
): Promise<{ dead: string[]; pending: PushTicketRow[] }> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      signal: abort.signal,
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(
        targets.map(({ token }) => ({
          to: token,
          title: message.title,
          body: message.body,
          sound: "default",
          // Read by the app's notification handler to decide where to navigate.
          data: { path: message.path ?? "", category: message.category ?? "system" },
          // Android needs a channel that exists on the device; the app creates
          // this one at startup. An unknown channel silently drops the alert.
          channelId: "calls",
        })),
      ),
    });
    if (!res.ok) {
      console.error(`[push] expo responded ${res.status}`);
      return { dead: [], pending: [] };
    }
    const body = (await res.json()) as { data?: ExpoTicket[] };
    // Dead tokens in tickets are pruned now. The ok tickets wait for their
    // receipts, which report most dead tokens (lib/mobile/push-receipts.ts).
    const { dead, pending, errors } = readTickets(targets, body.data ?? []);
    for (const error of errors) console.error(`[push] ticket error: ${error}`);
    return { dead, pending };
  } catch (err) {
    console.error("[push] send failed", err);
    return { dead: [], pending: [] };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Notify every live install belonging to one owner.
 *
 * Never throws: see the file header. Returns the number of tokens it attempted,
 * which is useful in logs to tell "nobody was registered" apart from "we tried
 * and Expo failed".
 */
export async function sendPushToOwner(
  ownerId: string | null | undefined,
  message: PushMessage,
): Promise<number> {
  if (!ownerId) return 0;
  try {
    const { data, error } = await serviceClient()
      .from("push_devices")
      .select("id, token")
      .eq("owner_id", ownerId)
      .eq("enabled", true);
    if (error) throw error;

    const targets = ((data ?? []) as PushTarget[]).filter((d) => Boolean(d.token));
    if (targets.length === 0) return 0;

    const dead: string[] = [];
    const pending: PushTicketRow[] = [];
    for (let i = 0; i < targets.length; i += CHUNK) {
      const sent = await postChunk(targets.slice(i, i + CHUNK), message);
      dead.push(...sent.dead);
      pending.push(...sent.pending);
    }
    await recordTickets(pending);
    await pruneDeadTokens(dead);
    return targets.length;
  } catch (err) {
    console.error("[push] sendPushToOwner failed", err);
    return 0;
  }
}
