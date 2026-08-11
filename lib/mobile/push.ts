import "server-only";

import { serviceClient } from "@/lib/dashboard/supabase";

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

interface ExpoTicket {
  status?: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

interface DeviceRow {
  token: string;
}

/**
 * Register (or refresh) one install's push token.
 *
 * Upserts on `token` rather than inserting, because the app re-registers on
 * every cold start and the token outlives a sign-out: if a second user signs in
 * on the same handset, the row must move to them or they would receive the
 * previous user's call alerts. That re-assignment is the reason `owner_id` is
 * in the update set.
 */
export async function registerPushDevice(
  ownerId: string,
  token: string,
  platform: string,
): Promise<void> {
  const { error } = await serviceClient()
    .from("push_devices")
    .upsert(
      {
        owner_id: ownerId,
        token,
        platform: platform === "ios" || platform === "android" ? platform : "unknown",
        enabled: true,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "token" },
    );
  if (error) throw error;
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

async function postChunk(
  tokens: string[],
  message: PushMessage,
): Promise<string[]> {
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
        tokens.map((to) => ({
          to,
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
      return [];
    }
    const body = (await res.json()) as { data?: ExpoTicket[] };
    const dead: string[] = [];
    (body.data ?? []).forEach((ticket, i) => {
      if (ticket.status !== "error") return;
      if (ticket.details?.error === "DeviceNotRegistered") dead.push(tokens[i]);
      else console.error(`[push] ticket error: ${ticket.message ?? ticket.details?.error}`);
    });
    return dead;
  } catch (err) {
    console.error("[push] send failed", err);
    return [];
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
      .select("token")
      .eq("owner_id", ownerId)
      .eq("enabled", true);
    if (error) throw error;

    const tokens = ((data ?? []) as DeviceRow[]).map((d) => d.token).filter(Boolean);
    if (tokens.length === 0) return 0;

    const dead: string[] = [];
    for (let i = 0; i < tokens.length; i += CHUNK) {
      dead.push(...(await postChunk(tokens.slice(i, i + CHUNK), message)));
    }
    await pruneDeadTokens(dead);
    return tokens.length;
  } catch (err) {
    console.error("[push] sendPushToOwner failed", err);
    return 0;
  }
}
