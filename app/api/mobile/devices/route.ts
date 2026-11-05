import { mobileAuth } from "@/lib/mobile/auth";
import { deviceRevokeOf } from "@/lib/mobile/device-id";
import {
  isDeviceId,
  isMissingTable,
  listDevices,
  registerDevice,
  revokeDevice,
  revokeOtherDevices,
} from "@/lib/mobile/devices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The account's app installs.
 *
 * GET    list every device signed into this account
 * POST   register / refresh this install
 * DELETE forget one install (and stop push to it - see revokeDevice)
 *        ?others=1: forget every install but the caller's X-Device-Id (revokeOtherDevices)
 *
 * The `device_id` is what links a handset to the website account: the app mints
 * it once, keeps it in the keychain, and sends it on every `/api/mobile/*` call
 * as `X-Device-Id`. Signing in on the phone with the same email as the web
 * dashboard therefore lands on the same account and shows up here - the account
 * is shared, the device row is what makes that visible.
 *
 * Not built on `mobileRoute` because DELETE needs a query param and a bad
 * device id deserves a 400 rather than the wrapper's 500.
 */

function deviceIdOf(req: Request): string {
  const header = req.headers.get("x-device-id") ?? "";
  return header.trim();
}

export async function GET(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "devices-list");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  try {
    const devices = await listDevices(userId);
    // The caller's own row is flagged rather than filtered out: the list is
    // most useful when you can see which one you are holding.
    const current = deviceIdOf(req);
    return Response.json({
      devices: devices.map((d) => ({ ...d, current: Boolean(current) && d.deviceId === current })),
    });
  } catch (err) {
    // An unmigrated project is a deploy step that was missed, not a broken
    // account - answer with an empty list so the screen says "no devices yet"
    // rather than "something went wrong", and log the real reason.
    if (isMissingTable(err)) {
      console.warn("[mobile:devices-list] account_devices is missing - run migration 0010");
      return Response.json({ devices: [] });
    }
    console.error("[mobile:devices-list]", err);
    return Response.json({ error: "Could not load your devices." }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "devices-register");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    // An empty body is fine - the header carries the identity.
  }

  // The header is authoritative; the body is a fallback for callers that cannot
  // set headers. Either way it is validated before it becomes a key.
  const deviceId = deviceIdOf(req) || String(body.deviceId ?? "");
  if (!isDeviceId(deviceId)) {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  try {
    await registerDevice(userId, deviceId, {
      platform: body.platform,
      model: body.model,
      osVersion: body.osVersion,
      appVersion: body.appVersion,
    });
    return Response.json({ ok: true });
  } catch (err) {
    if (isMissingTable(err)) {
      console.warn("[mobile:devices-register] account_devices is missing - run migration 0010");
      // The caller treats this as fire-and-forget; a 200 keeps an unmigrated
      // project from logging a failed request on every single sign-in.
      return Response.json({ ok: false, warning: "Device registry is not set up yet." });
    }
    console.error("[mobile:devices-register]", err);
    return Response.json({ error: "Could not register this device." }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "devices-revoke");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const action = deviceRevokeOf(new URL(req.url).searchParams, deviceIdOf(req));
  if (!action) {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  try {
    if (action.scope === "others") {
      await revokeOtherDevices(userId, action.keepDeviceId);
    } else {
      await revokeDevice(userId, action.deviceId);
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[mobile:devices-revoke]", err);
    const error =
      action.scope === "others" ? "Could not sign out your other devices." : "Could not remove this device.";
    return Response.json({ error }, { status: 500 });
  }
}
