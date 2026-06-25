import { z } from "zod";

// Server-side configuration. Validated once, lazily, so a missing key fails
// fast with a clear message instead of surfacing as an opaque runtime error
// deep in the call. None of these are NEXT_PUBLIC — they must stay server-side.

const schema = z.object({
  // Telephony
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1), // required: webhook signatures are signed with it
  // Optional: scoped API Key for REST calls (recommended over the auth token).
  TWILIO_API_KEY_SID: z.string().optional(),
  TWILIO_API_KEY_SECRET: z.string().optional(),
  // Optional: A2P-registered Messaging Service for US SMS (see docs/A2P-10DLC.md).
  TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),

  // Speech-to-text
  DEEPGRAM_API_KEY: z.string().min(1),
  DEEPGRAM_MODEL: z.string().default("nova-2-phonecall"),
  STT_PROVIDER: z.enum(["deepgram", "elevenlabs"]).default("deepgram"),

  // LLM (Claude)
  ANTHROPIC_API_KEY: z.string().min(1),
  CLAUDE_MODEL: z.string().default("claude-opus-4-8"),

  // Text-to-speech
  ELEVENLABS_API_KEY: z.string().min(1),
  ELEVENLABS_MODEL: z.string().default("eleven_flash_v2_5"),

  // Persistence
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Deployment
  APP_BASE_URL: z.string().url(), // public https URL Twilio calls back into
  MEDIA_WS_URL: z.string().min(1), // public wss URL of the media server
  MEDIA_WS_PORT: z.coerce.number().default(8080),
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
