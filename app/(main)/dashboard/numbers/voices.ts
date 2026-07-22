
export interface VoiceOption {
  voiceId: string;
  name: string;
  previewUrl?: string;
  description?: string;
  languages?: string[];
  nativeLanguage?: string;
}

// Always-available American English pair, pinned to the top of the funnel voice
// picker so every locale can fall back to a known-good English voice. Both are
// premade ElevenLabs voices (plain ids), so the provisioner persists them as-is.
export const ENGLISH_AMERICA_VOICES: VoiceOption[] = [
  { voiceId: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", description: "American English · female", languages: ["en"] },
  { voiceId: "pNInz6obpgDQGcFmaJgB", name: "Adam", description: "American English · male", languages: ["en"] },
];

// Female professional voices first - the default policy (Rachel is the default).
export const FALLBACK_VOICES: VoiceOption[] = [
  { voiceId: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", description: "American · professional, calm" },
  { voiceId: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "American · professional, soft" },
  { voiceId: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", description: "English · friendly" },
  { voiceId: "cgSgspJ2msm6clMCkdW9", name: "Jessica", description: "American · expressive" },
  { voiceId: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "British · warm" },
  { voiceId: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", description: "British · news" },
  { voiceId: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", description: "American · narration" },
  { voiceId: "pNInz6obpgDQGcFmaJgB", name: "Adam", description: "American · deep" },
];

// A small curated set of premade ElevenLabs voices offered in the onboarding
// funnel. All are multilingual premade voices, so they speak the caller's
// language whatever the locale. `gender` lets a picked name default to a
// fitting voice.
export interface FunnelVoice extends VoiceOption {
  gender: "f" | "m";
}
export const FUNNEL_VOICES: FunnelVoice[] = [
  { voiceId: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", gender: "f", description: "American · calm, professional" },
  { voiceId: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", gender: "f", description: "English · warm, friendly" },
  { voiceId: "pNInz6obpgDQGcFmaJgB", name: "Adam", gender: "m", description: "American · deep, natural" },
  { voiceId: "JBFqnCBsd6RMkjVDRZzb", name: "George", gender: "m", description: "British · warm, calm" },
];
export const FUNNEL_VOICE_FEMALE = "21m00Tcm4TlvDq8ikWAM";
export const FUNNEL_VOICE_MALE = "pNInz6obpgDQGcFmaJgB";
