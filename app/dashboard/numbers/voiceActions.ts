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
}

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
    return (data.voices ?? []).map((v) => ({
      voiceId: v.voice_id,
      name: v.name,
      previewUrl: v.preview_url,
      description: [v.labels?.accent, v.labels?.gender, v.labels?.description, v.category]
        .filter(Boolean)
        .join(" · "),
    }));
  } catch {
    return [];
  }
}
