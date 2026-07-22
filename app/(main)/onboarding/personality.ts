import { ENGLISH_AMERICA_VOICES, FALLBACK_VOICES } from "@/app/(main)/dashboard/numbers/voices";
import type { OnboardingConfig } from "@/lib/dashboard/onboarding-profile";

// Maps a voice's name/descriptors onto a friendly "personality" - the emoji
// face the assistant preview wears and a short tone label. Pure and shared by
// the live Step 1 preview (client) and the companion header on later steps
// (server), so the assistant looks the same the whole way through the funnel.

export type ToneKey = "toneFriendly" | "toneCalm" | "toneConfident" | "toneBright";

// The expression the illustrated AI avatar wears. "greeting" is the blank-slate
// wave; "celebrate" is the once-it's-ready / provisioned face.
export type Mood =
  | "greeting"
  | "friendly"
  | "calm"
  | "confident"
  | "bright"
  | "celebrate"
  | "studying";

export interface Personality {
  tone: ToneKey;
  mood: Mood;
}

const BRIGHT_RE = /\b(energetic|cheerful|bright|upbeat|expressive|lively|playful|young)\b/i;
const CONFIDENT_RE = /\b(deep|confident|bold|strong|authoritative|announcer|rich)\b/i;
const CALM_RE = /\b(calm|professional|soft|gentle|smooth|news|narration|serious|mature|articulate)\b/i;

// Friendly & warm is the default - the tone we want when nothing else matches.
export function voicePersonality(name?: string, description?: string): Personality {
  const d = `${name ?? ""} ${description ?? ""}`;
  if (BRIGHT_RE.test(d)) return { tone: "toneBright", mood: "bright" };
  if (CONFIDENT_RE.test(d)) return { tone: "toneConfident", mood: "confident" };
  if (CALM_RE.test(d)) return { tone: "toneCalm", mood: "calm" };
  return { tone: "toneFriendly", mood: "friendly" };
}

const KNOWN_VOICES = [...ENGLISH_AMERICA_VOICES, ...FALLBACK_VOICES];

// Server-side: derive the avatar mood from a stored voice id (no live metadata).
// Library/custom ids we can't resolve fall back to the warm default.
export function moodForVoiceId(voiceId?: string): Mood {
  if (!voiceId) return "friendly";
  const known = KNOWN_VOICES.find((v) => v.voiceId === voiceId);
  return voicePersonality(known?.name, known?.description).mood;
}

// The assistant's identity for the companion header on steps 2-4.
export function assistantIdentity(config: OnboardingConfig): { name: string; mood: Mood } {
  return { name: (config.assistantName ?? "").trim(), mood: moodForVoiceId(config.voiceId) };
}

// Fill {name}/{company} placeholders in a localized template string.
export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

// Map a voice's descriptors onto a business "best for" category (keys into the
// dictionary), so the picker shows real use cases instead of raw labels.
export type BestForKey = "bestForPro" | "bestForWarm" | "bestForConfident" | "bestForVersatile";

const BF_CONFIDENT = /\b(deep|confident|authoritative|bold|strong|narrat|character|dramatic|announcer)\b/i;
const BF_PRO = /\b(professional|calm|serious|news|informative|corporate|formal|articulate|business)\b/i;
const BF_WARM = /\b(warm|friendly|soft|gentle|pleasant|soothing|cheerful|welcoming|casual|social)\b/i;

export function voiceBestFor(description?: string): BestForKey {
  const d = description ?? "";
  if (BF_CONFIDENT.test(d)) return "bestForConfident";
  if (BF_PRO.test(d)) return "bestForPro";
  if (BF_WARM.test(d)) return "bestForWarm";
  return "bestForVersatile";
}

export function genderOf(description?: string): "f" | "m" | undefined {
  const d = description ?? "";
  if (/\bfemale\b/i.test(d)) return "f";
  if (/\bmale\b/i.test(d)) return "m";
  return undefined;
}
