/**
 * The `X-Device-Id` rules, kept free of `server-only` so node:test can load
 * them. lib/mobile/devices.ts re-exports `isDeviceId` for the routes.
 */

/**
 * A keychain UUID. Validated rather than trusted - it is a primary key input.
 * The one rule for the `X-Device-Id` header, shared by the devices and push
 * routes so both tables key on the same shape.
 */
export function isDeviceId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9._:-]{8,64}$/.test(value);
}

/** What `DELETE /api/mobile/devices` was asked to do. */
export type DeviceRevoke =
  | { scope: "one"; deviceId: string }
  | { scope: "others"; keepDeviceId: string };

/**
 * `?deviceId=<id>` forgets one install. `?others=1` forgets every install but
 * the caller's, named by its `X-Device-Id` header. Without a valid header there
 * is no way to know which install to keep, so that is a bad request and never
 * a fallback to the single revoke. Null means 400.
 */
export function deviceRevokeOf(params: URLSearchParams, headerDeviceId: string): DeviceRevoke | null {
  if (params.get("others") === "1") {
    return isDeviceId(headerDeviceId) ? { scope: "others", keepDeviceId: headerDeviceId } : null;
  }
  const target = params.get("deviceId") ?? "";
  return isDeviceId(target) ? { scope: "one", deviceId: target } : null;
}
