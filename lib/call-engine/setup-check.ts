// A missing server setup is not a temporary fault, so callers show "contact support"
// instead of "try again". Pure module: no framework, SDK or env.ts imports.

export type EnvLike = Record<string, string | undefined>;

export function twilioConfigured(env: EnvLike = process.env): boolean {
  return Boolean(
    env.TWILIO_ACCOUNT_SID &&
      (env.TWILIO_AUTH_TOKEN ||
        (env.TWILIO_API_KEY_SID && env.TWILIO_API_KEY_SECRET)),
  );
}

export function voiceConfigured(env: EnvLike = process.env): boolean {
  return Boolean(env.ELEVENLABS_API_KEY);
}

export class SetupMissingError extends Error {
  readonly code = "setup_missing";
  constructor(message: string) {
    super(message);
    this.name = "SetupMissingError";
  }
}

export function isSetupMissing(err: unknown): boolean {
  return err instanceof SetupMissingError;
}
