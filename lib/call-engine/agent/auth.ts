import crypto from "node:crypto";
import { getEnv } from "../env";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function verifyToolSecret(headers: Headers): boolean {
  const secret = getEnv().AGENT_WEBHOOK_SECRET;
  if (!secret) return false; // fail closed

  const bearer = headers.get("authorization");
  if (bearer?.startsWith("Bearer ") && safeEqual(bearer.slice(7), secret)) {
    return true;
  }
  const custom = headers.get("x-agent-secret");
  return custom ? safeEqual(custom, secret) : false;
}

const SIG_TOLERANCE_MS = 30 * 60_000;

export function verifyElevenLabsSignature(rawBody: string, header: string | null): boolean {
  const secret = getEnv().ELEVENLABS_WEBHOOK_SECRET;
  if (!secret || !header) return false;

  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k?.trim(), v?.trim()] as const;
    }),
  );
  const ts = parts.t;
  const sig = parts.v0;
  if (!ts || !sig) return false;

  const ageMs = Date.now() - Number(ts) * 1000;
  if (!Number.isFinite(ageMs) || ageMs < -SIG_TOLERANCE_MS || ageMs > SIG_TOLERANCE_MS) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}.${rawBody}`)
    .digest("hex");
  return safeEqual(expected, sig);
}
