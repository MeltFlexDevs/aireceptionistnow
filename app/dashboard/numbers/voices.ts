
export interface VoiceOption {
  voiceId: string;
  name: string;
  previewUrl?: string;
  description?: string;
  languages?: string[];
  nativeLanguage?: string;
}

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
