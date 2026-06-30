import { z } from "zod";

// Server-side configuration. Validated once, lazily, so a missing key fails
// fast with a clear message instead of surfacing as an opaque runtime error
// deep in the call. None of these are NEXT_PUBLIC — they must stay server-side.
//
// Provider keys are conditionally required (see superRefine): you only need a
// key for the engines you actually run. The default stack is ElevenLabs (STT +
// TTS) + Gemini (brain), so a minimal deploy needs only Twilio + ElevenLabs +
// Gemini + Supabase keys.

const schema = z
  .object({
    // Telephony
    TWILIO_ACCOUNT_SID: z.string().min(1),
    TWILIO_AUTH_TOKEN: z.string().min(1), // required: webhook signatures are signed with it
    // Optional: scoped API Key for REST calls (recommended over the auth token).
    TWILIO_API_KEY_SID: z.string().optional(),
    TWILIO_API_KEY_SECRET: z.string().optional(),
    // Optional: A2P-registered Messaging Service for US SMS (see docs/A2P-10DLC.md).
    TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),

    // Speech-to-text. Default is ElevenLabs Scribe so all voice (in + out) runs
    // on one vendor; Deepgram stays available as a telephony-tuned alternative.
    DEEPGRAM_API_KEY: z.string().optional(),
    DEEPGRAM_MODEL: z.string().default("nova-2-phonecall"),
    STT_PROVIDER: z.enum(["deepgram", "elevenlabs"]).default("elevenlabs"),

    // LLM brain. Gemini is the default; Claude is the alternate.
    LLM_PROVIDER: z.enum(["gemini", "claude"]).default("gemini"),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
    ANTHROPIC_API_KEY: z.string().optional(),
    CLAUDE_MODEL: z.string().default("claude-opus-4-8"),

    // Text-to-speech (all voice synthesis runs here).
    ELEVENLABS_API_KEY: z.string().min(1),
    ELEVENLABS_MODEL: z.string().default("eleven_flash_v2_5"),
    // Per-language voice overrides used in auto-detect mode: a JSON map of base
    // language code -> ElevenLabs voice id, e.g. {"sk":"<slovak-voice-id>"}. When
    // the caller's language is detected and has an entry here, that voice is used
    // for the rest of the call; languages with no entry keep the assistant's own
    // configured voice (the multilingual model still pronounces them correctly).
    ELEVENLABS_VOICE_OVERRIDES: z.string().optional(),

    // Security. Stream parameters Twilio carries to the media server are signed
    // with this secret so a stranger can't open a media stream against a callId.
    // Falls back to TWILIO_AUTH_TOKEN when unset (both ends share the same env).
    MEDIA_STREAM_SECRET: z.string().optional(),

    // Persistence
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    // Deployment
    APP_BASE_URL: z.string().url(), // public https URL Twilio calls back into
    MEDIA_WS_URL: z.string().min(1), // public wss URL of the media server
    MEDIA_WS_PORT: z.coerce.number().default(8080),
  })
  .superRefine((env, ctx) => {
    if (env.STT_PROVIDER === "deepgram" && !env.DEEPGRAM_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DEEPGRAM_API_KEY"],
        message: "required when STT_PROVIDER=deepgram",
      });
    }
    if (env.LLM_PROVIDER === "gemini" && !env.GEMINI_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["GEMINI_API_KEY"],
        message: "required when LLM_PROVIDER=gemini",
      });
    }
    if (env.LLM_PROVIDER === "claude" && !env.ANTHROPIC_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ANTHROPIC_API_KEY"],
        message: "required when LLM_PROVIDER=claude",
      });
    }
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

/** The secret used to sign/verify media-stream parameters. */
export function streamSecret(): string {
  const env = getEnv();
  return env.MEDIA_STREAM_SECRET || env.TWILIO_AUTH_TOKEN;
}
