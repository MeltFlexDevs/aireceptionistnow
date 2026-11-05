import {
  deletePushDevice,
  isExpoPushToken,
  registerPushDevice,
  setPushDeviceEnabled,
} from "@/lib/mobile/push";
import { mobileAuth } from "@/lib/mobile/auth";
import { isDeviceId } from "@/lib/mobile/devices";
import { enabledOnRegister } from "@/lib/mobile/push-register";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The app's push-token registry.
 *
 * POST   register / refresh this install, or flip its enabled flag
 * DELETE drop it (sign-out)
 *
 * Not built on `mobileRoute` because both verbs need the request body, and a
 * malformed token deserves a 400 rather than the wrapper's 500.
 */

async function body(req: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * The install id the app sends on every request (see the devices route). It
 * is stored beside the token so revoking the device can drop the token too.
 * Optional here: an install without the header still gets alerts, it just
 * cannot be silenced by revoking it from the dashboard.
 */
function deviceIdOf(req: Request): string | null {
  const header = (req.headers.get("x-device-id") ?? "").trim();
  return isDeviceId(header) ? header : null;
}

export async function POST(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "push-register");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const payload = await body(req);
  if (!payload || !isExpoPushToken(payload.token)) {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  try {
    // `enabled: false` is the Alerts toggle, which must not resurrect a row the
    // user has just signed out of - so it updates in place and never inserts.
    if (payload.enabled === false) {
      await setPushDeviceEnabled(userId, payload.token, false);
    } else {
      // A register carries the app's stored mute as `muted`, so a cold start
      // cannot turn alerts back on (older builds omit it and stay enabled).
      await registerPushDevice(
        userId,
        payload.token,
        String(payload.platform ?? "unknown"),
        deviceIdOf(req),
        enabledOnRegister(payload),
      );
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[mobile:push-register]", err);
    return Response.json({ error: "Could not register for alerts." }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "push-unregister");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const payload = await body(req);
  if (!payload || !isExpoPushToken(payload.token)) {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  try {
    await deletePushDevice(userId, payload.token);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[mobile:push-unregister]", err);
    return Response.json({ error: "Could not turn off alerts." }, { status: 500 });
  }
}
