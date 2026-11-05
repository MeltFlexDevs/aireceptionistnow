
export interface VoiceOption {
  voiceId: string;
  name: string;
  previewUrl?: string;
  description?: string;
  languages?: string[];
  nativeLanguage?: string;
  gender?: "f" | "m";
}

// Always-available American English pair, pinned to the top of the funnel voice
// picker so every locale can fall back to a known-good English voice. Both are
// on the platform account (plain ids), so the provisioner persists them as-is.
export const ENGLISH_AMERICA_VOICES: VoiceOption[] = [
  { voiceId: "zGjIP4SZlMnY9m93k97r", name: "Hope", description: "American English · female", languages: ["en"] },
  { voiceId: "Aa6nEBJJMKJwJkCx8VU2", name: "Quentin", description: "American English · male", languages: ["en"] },
];

// The curated voices an owner can pick. Each is premade or tuned for the
// eleven_v4_turbo model, has live moderation off (ElevenAgents cannot use those)
// and a notice period of a year or more. Names come from the ElevenLabs API.
// All are plain ids: on the platform account or premade, so no import is needed.
export const CURATED_VOICES: VoiceOption[] = [
  { voiceId: "zGjIP4SZlMnY9m93k97r", name: "Hope", description: "American · female", gender: "f" },
  { voiceId: "l4Coq6695JDX9xtLqXDE", name: "Lauren", description: "American · female", gender: "f" },
  { voiceId: "6fZce9LFNG3iEITDfqZZ", name: "Charlotte", description: "British · female", gender: "f" },
  { voiceId: "56bWURjYFHyYyVf490Dp", name: "Emma", description: "Australian · female", gender: "f" },
  { voiceId: "Aa6nEBJJMKJwJkCx8VU2", name: "Quentin", description: "American · male", gender: "m" },
  { voiceId: "cjVigY5qzO86Huf0OWal", name: "Eric", description: "American · male", gender: "m" },
  { voiceId: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", description: "British · male", gender: "m" },
  { voiceId: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Australian · male", gender: "m" },
];

// Irish voices from the ElevenLabs library. They are not on the account until an
// owner picks one: the pick value is "lib:<owner>:<voice id>:<name>" (see
// libraryPickValue), which the save path adds to the account.
export interface LibraryVoice extends VoiceOption {
  ownerId: string;
  gender: "f" | "m";
}
export const LIBRARY_VOICES: LibraryVoice[] = [
  {
    voiceId: "C92s6vssSLlabgIln1iY",
    ownerId: "ad598cfdbf0d63bed5de560d343d1427cac42d2be6b5b3ac0c7a2724a70d8ce9",
    name: "Michelle",
    description: "Irish · female",
    gender: "f",
  },
  {
    voiceId: "BOt7zZh6gzfWlIUYnyPz",
    ownerId: "014c1a54c9fcde9c63538a39cfd7013ae93686ee5492d3fd5f90018fe7261019",
    name: "Caleb O'Farrell",
    description: "Irish · male",
    gender: "m",
  },
];
export const libraryPickValue = (v: LibraryVoice): string =>
  `lib:${v.ownerId}:${v.voiceId}:${encodeURIComponent(v.name)}`;

// Voices that older receptionists still use. The ids once labeled Rachel and
// Charlotte now resolve to these copied voices, so show the names callers hear.
// They are not offered in the new-voice list.
export const LEGACY_VOICES: VoiceOption[] = [
  { voiceId: "21m00Tcm4TlvDq8ikWAM", name: "Janet", description: "female" },
  { voiceId: "XB0fDUnXU5powFXDhCwa", name: "Helen", description: "female" },
];

// Plain-id voices the dashboard can name: the curated set, then the legacy ones.
export const FALLBACK_VOICES: VoiceOption[] = [...CURATED_VOICES, ...LEGACY_VOICES];

// A small curated set offered in the onboarding funnel. All are plain ids, so
// the provisioner stores them as-is and they speak the caller's language
// whatever the locale. `gender` lets a picked name default to a fitting voice.
// Every funnel voice must be in FALLBACK_VOICES (the catalog route names them).
export interface FunnelVoice extends VoiceOption {
  gender: "f" | "m";
}
export const FUNNEL_VOICES: FunnelVoice[] = [
  { voiceId: "zGjIP4SZlMnY9m93k97r", name: "Hope", gender: "f", description: "American · female" },
  { voiceId: "6fZce9LFNG3iEITDfqZZ", name: "Charlotte", gender: "f", description: "British · female" },
  { voiceId: "Aa6nEBJJMKJwJkCx8VU2", name: "Quentin", gender: "m", description: "American · male" },
  { voiceId: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", gender: "m", description: "British · male" },
];
export const FUNNEL_VOICE_FEMALE = "zGjIP4SZlMnY9m93k97r";
export const FUNNEL_VOICE_MALE = "Aa6nEBJJMKJwJkCx8VU2";
