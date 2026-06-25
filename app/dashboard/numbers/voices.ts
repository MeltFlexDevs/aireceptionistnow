// ElevenLabs voice options. The live list is fetched from the account via the
// loadVoices server action; this curated set is the fallback when the API key
// or network is unavailable (preview playback needs the live preview URLs).

export interface VoiceOption {
  voiceId: string;
  name: string;
  previewUrl?: string;
  description?: string;
}

export const FALLBACK_VOICES: VoiceOption[] = [
  { voiceId: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", description: "American · calm" },
  { voiceId: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "American · soft" },
  { voiceId: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "British · warm" },
  { voiceId: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", description: "American · narration" },
  { voiceId: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", description: "English · friendly" },
  { voiceId: "pNInz6obpgDQGcFmaJgB", name: "Adam", description: "American · deep" },
  { voiceId: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", description: "British · news" },
  { voiceId: "cgSgspJ2msm6clMCkdW9", name: "Jessica", description: "American · expressive" },
];
