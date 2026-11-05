import "server-only";

import { serviceClient } from "@/lib/dashboard/supabase";
import { deletePushDevicesByDeviceId, deletePushDevicesExceptDeviceId } from "@/lib/mobile/push";
export { isDeviceId } from "@/lib/mobile/device-id";

/**
 * The account's signed-in app installs.
 *
 * One row per (account, device), keyed by the `device_id` the app mints on first
 * launch and keeps in the OS keychain. See supabase/migrations/0010 for why this
 * is not `push_devices`: that table is a push delivery address and only exists
 * on a handset that granted notification permission, so it cannot answer "where
 * am I signed in".
 *
 * Everything here fails soft on the caller's side. Registering a device is
 * bookkeeping that runs beside a working session - it must never be the reason
 * an app that just signed in shows an error.
 */

/** Client-supplied display strings are capped before they reach the table. */
const MAX_LABEL = 120;

/**
 * Whether the failure is "migration 0010 has not been run on this project".
 *
 * Worth its own case because the app calls `registerDevice` on every sign-in:
 * without this the whole feature fails as a generic 500 and the first thing
 * anyone checks is the code, not the schema. PostgREST answers PGRST205 for an
 * unknown table and Postgres 42P01 for an undefined relation.
 */
export function isMissingTable(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? "");
  return (
    message.includes("PGRST205") ||
    message.includes("42P01") ||
    /relation .*account_devices.* does not exist/i.test(message) ||
    /Could not find the table/i.test(message)
  );
}

function label(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, MAX_LABEL);
  return trimmed || null;
}

function platform(value: unknown): string {
  return value === "ios" || value === "android" ? value : "unknown";
}

export interface DeviceInput {
  platform?: unknown;
  model?: unknown;
  osVersion?: unknown;
  appVersion?: unknown;
}

/**
 * Record (or refresh) one install against this account.
 *
 * Upserts on (owner_id, device_id) because the app calls this on every
 * foreground session; the point of the write is `last_seen_at`, and inserting
 * instead would give one handset a new row per launch.
 */
export async function registerDevice(
  ownerId: string,
  deviceId: string,
  input: DeviceInput,
): Promise<void> {
  const { error } = await serviceClient()
    .from("account_devices")
    .upsert(
      {
        owner_id: ownerId,
        device_id: deviceId,
        platform: platform(input.platform),
        model: label(input.model),
        os_version: label(input.osVersion),
        app_version: label(input.appVersion),
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "owner_id,device_id" },
    );
  if (error) throw new Error(error.message);
}

export interface AccountDevice {
  deviceId: string;
  platform: string;
  model: string | null;
  osVersion: string | null;
  appVersion: string | null;
  lastSeenAt: string;
  createdAt: string;
}

/** Every install signed into this account, most recently used first. */
export async function listDevices(ownerId: string): Promise<AccountDevice[]> {
  const { data, error } = await serviceClient()
    .from("account_devices")
    .select("device_id, platform, model, os_version, app_version, last_seen_at, created_at")
    .eq("owner_id", ownerId)
    .order("last_seen_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    deviceId: String(row.device_id),
    platform: String(row.platform ?? "unknown"),
    model: (row.model as string | null) ?? null,
    osVersion: (row.os_version as string | null) ?? null,
    appVersion: (row.app_version as string | null) ?? null,
    lastSeenAt: String(row.last_seen_at),
    createdAt: String(row.created_at),
  }));
}

/**
 * Forget one install, and stop its call alerts.
 *
 * Scoped by owner so a caller can only ever drop their own row, and deliberately
 * NOT an auth action: the device keeps its refresh token until it signs out or
 * GoTrue expires it. See the migration's header note. What it does end is push:
 * a lost phone that stays "revoked" but keeps buzzing with every call is the
 * thing a person revoking it most wants to stop.
 */
export async function revokeDevice(ownerId: string, deviceId: string): Promise<void> {
  const { error } = await serviceClient()
    .from("account_devices")
    .delete()
    .eq("owner_id", ownerId)
    .eq("device_id", deviceId);
  if (error) throw new Error(error.message);
  await deletePushDevicesByDeviceId(ownerId, deviceId);
}

/**
 * Forget every install but the caller's, and stop their call alerts: the
 * server half of "Sign out everywhere else". Unlike `revokeDevice` this follows
 * an auth action. The app first ends its other sessions with
 * `signOut({ scope: "others" })`, so the phones dropped here fail `mobileAuth`
 * and cannot register themselves again. Scoped by owner. `device_id` is
 * `not null` in account_devices (migration 0010), so `neq` covers every other row.
 */
export async function revokeOtherDevices(ownerId: string, keepDeviceId: string): Promise<void> {
  const { error } = await serviceClient()
    .from("account_devices")
    .delete()
    .eq("owner_id", ownerId)
    .neq("device_id", keepDeviceId);
  if (error) throw new Error(error.message);
  await deletePushDevicesExceptDeviceId(ownerId, keepDeviceId);
}
