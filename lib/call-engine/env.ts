import { z } from "zod";

// Server-side configuration. Validated once, lazily, so a missing key fails fast
// with a clear message. None of these are NEXT_PUBLIC — they stay server-side.
//
// The call runtime (STT + LLM brain + TTS + media) runs entirely inside
// ElevenLabs. This backend only: serves the agent's tool webhooks, receives its
// post-call transcript, and enriches with Gemini (post-call summary + greeting
// localization). So the required keys are ElevenLabs + Gemini + Supabase; Twilio
// is optional (only for SMS message-alerts).

const schema = z.object({
  // Telephony — optional. Only used to text the owner when the agent takes a
  // message (take_message). Unset ⇒ SMS alerts are skipped, calls unaffected.
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_API_KEY_SID: z.string().optional(),
  TWILIO_API_KEY_SECRET: z.string().optional(),
  // A2P-registered Messaging Service for US SMS (see docs/A2P-10DLC.md).
  TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),

  // ElevenLabs — the entire voice + agent runtime plus voice catalog lookups.
  ELEVENLABS_API_KEY: z.string().min(1),
  // The managed agent that answers/places calls, and the number connected to it.
  // ELEVENLABS_AGENT_ID is now only the outbound "Talk to our AI" demo agent;
  // inbound assistants each get their own managed agent (see agent/sync.ts).
  ELEVENLABS_AGENT_ID: z.string().optional(),
  ELEVENLABS_AGENT_PHONE_NUMBER_ID: z.string().optional(),
  // Optional: workspace post-call webhook object id, wired by /api/agent/setup.
  ELEVENLABS_POST_CALL_WEBHOOK_ID: z.string().optional(),

  // Gemini — our only backend LLM (post-call summary + greeting localization).
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),

  // Persistence
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Deployment. Public HTTPS base URL of the Next app — the origin ElevenLabs
  // webhooks and Twilio number config call back into.
  APP_BASE_URL: z.string().url(),

  // ElevenLabs managed-agent webhooks (tier A).
  // Shared secret the agent's server tools present (Authorization: Bearer … or
  // x-agent-secret). Unset ⇒ the /api/agent/* tool routes refuse all calls.
  AGENT_WEBHOOK_SECRET: z.string().optional(),
  // Secret ElevenLabs signs its post-call + conversation-init webhooks with.
  // Unset ⇒ those routes refuse.
  ELEVENLABS_WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid call-engine environment:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
