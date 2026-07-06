"use server";

import type { VoiceOption } from "./voices";

// Loads the account's ElevenLabs voices (premade + custom) with preview URLs.
// Returns [] on missing key / error so the client falls back to the curated set.

interface ElevenVoice {
  voice_id: string;
  name: string;
  preview_url?: string;
  category?: string;
  labels?: Record<string, string>;
  verified_languages?: Array<{ language?: string }>;
}

/** Strip a region subtag: "es-419" -> "es". */
const baseLang = (code: string): string => code.split("-")[0].toLowerCase();

export async function loadVoices(): Promise<VoiceOption[]> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { voices?: ElevenVoice[] };
    return (data.voices ?? []).map((v) => {
      // labels.language marks a native language; verified_languages lists the
      // ones it's been confirmed to speak well - both count for the filter.
      const langs = new Set<string>();
      if (v.labels?.language) langs.add(baseLang(v.labels.language));
      for (const vl of v.verified_languages ?? []) {
        if (vl.language) langs.add(baseLang(vl.language));
      }
      return {
        voiceId: v.voice_id,
        name: v.name,
        previewUrl: v.preview_url,
        description: [v.labels?.accent, v.labels?.gender, v.labels?.description, v.category]
          .filter(Boolean)
          .join(" · "),
        languages: langs.size ? [...langs] : undefined,
        nativeLanguage: v.labels?.language ? baseLang(v.labels.language) : undefined,
      };
    });
  } catch {
    return [];
  }
}

interface SharedVoice {
  public_owner_id?: string;
  voice_id?: string;
  name?: string;
  preview_url?: string;
  accent?: string;
  gender?: string;
  age?: string;
  use_case?: string;
  descriptive?: string;
  /** The voice's primary language (e.g. "sk"). ElevenLabs' ?language= search also
   *  returns voices merely verified for it (American voices verified for Slovak),
   *  so we filter on this to keep only voices native to the language. */
  language?: string;
  locale?: string;
}

/**
 * Voices to offer for a specific language: the ones already on the account that
 * are tagged for it, followed by the full ElevenLabs shared Voice Library for
 * that language (so e.g. Slovak actually lists Slovak voices). Library entries
 * carry a "lib:<owner>:<id>:<name>" voiceId - previewable now, and added to the
 * account by updateAssistantAction on save so ElevenLabs can speak with them.
 */
export async function loadLibraryVoices(language: string): Promise<VoiceOption[]> {
  const base = language.split("-")[0].toLowerCase();
  if (!base) return loadVoices();
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return [];

  // Only voices NATIVE to the language - not ones merely verified for it (an
  // American voice is verified for Slovak but native to English).
  const account = (await loadVoices()).filter((v) => v.nativeLanguage === base);

  let library: VoiceOption[] = [];
  try {
    const q = new URLSearchParams({ language: base, page_size: "40", sort: "trending" });
    const res = await fetch(`https://api.elevenlabs.io/v1/shared-voices?${q}`, {
      headers: { "xi-api-key": key },
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { voices?: SharedVoice[] };
      library = (data.voices ?? [])
        // The ?language= search leaks voices only verified for the language; keep
        // just the ones whose primary language actually is it.
        .filter((v) => v.public_owner_id && v.voice_id && baseLang(v.language ?? v.locale ?? "") === base)
        .map((v) => ({
          voiceId: `lib:${v.public_owner_id}:${v.voice_id}:${encodeURIComponent(v.name ?? "Voice")}`,
          name: v.name ?? "Voice",
          previewUrl: v.preview_url,
          description: [v.accent, v.gender, v.use_case, v.descriptive].filter(Boolean).join(" · "),
          languages: [base],
        }));
    }
  } catch {
    // Ignore: any account voices for the language still show.
  }

  return [...account, ...library];
}
