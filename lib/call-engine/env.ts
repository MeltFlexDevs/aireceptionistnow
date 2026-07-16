import { z } from "zod";

const schema = z.object({
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_API_KEY_SID: z.string().optional(),
  TWILIO_API_KEY_SECRET: z.string().optional(),
  // A2P-registered Messaging Service for US SMS (see docs/A2P-10DLC.md).
  TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),

  // ElevenLabs - the entire voice + agent runtime plus voice catalog lookups.
  ELEVENLABS_API_KEY: z.string().min(1),
  ELEVENLABS_AGENT_ID: z.string().optional(),
  ELEVENLABS_AGENT_PHONE_NUMBER_ID: z.string().optional(),
  // Optional: workspace post-call webhook object id, wired by /api/agent/setup.
  ELEVENLABS_POST_CALL_WEBHOOK_ID: z.string().optional(),

  // Gemini - our only backend LLM (post-call summary + greeting localization).
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),

  // Persistence
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  APP_BASE_URL: z.string().url(),

  AGENT_WEBHOOK_SECRET: z.string().optional(),
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
