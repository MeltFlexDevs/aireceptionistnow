import crypto from "node:crypto";
import { getEnv } from "../env";

// Auth for the tier-A (ElevenLabs managed agent) webhooks. Two schemes:
//   • Tool calls  — a shared bearer secret the agent presents on every request.
//   • Post-call / conversation-init — an HMAC ElevenLabs signs the body with.
// Both fail closed: if the corresponding secret is unset, the request is
// rejected, so a tier-B-only deploy never exposes an unauthenticated endpoint.

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/**
 * Verify a server-tool request's shared secret. Accepts either
 * `Authorization: Bearer <secret>` or an `x-agent-secret: <secret>` header —
 * ElevenLabs can attach either as a secret header on the tool config.
 */
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

// How old an ElevenLabs webhook signature may be. Bounds replay of a captured
// signed body.
const SIG_TOLERANCE_MS = 30 * 60_000;

/**
 * Verify an ElevenLabs webhook signature over the raw request body. The header
 * is `elevenlabs-signature: t=<unix-seconds>,v0=<hex hmac>`, where the HMAC is
 * SHA-256 over `"<t>.<rawBody>"` keyed by ELEVENLABS_WEBHOOK_SECRET. Rejects a
 * missing secret, malformed header, stale timestamp, or bad digest.
 */
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
