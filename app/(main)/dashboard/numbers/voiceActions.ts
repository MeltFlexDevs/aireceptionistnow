"use server";

import { unstable_cache } from "next/cache";
import { currentUserId } from "@/lib/auth";
import { voicePreferenceScore } from "@/lib/call-engine/voice/catalog";
import { isSupportedLanguageBase } from "@/lib/call-engine/voice/phone-language";
import { authConfigured, devDashboardBypass } from "@/lib/supabase/config";
import type { VoiceOption } from "./voices";

interface ElevenVoice {
  voice_id: string;
  name: string;
  preview_url?: string;
  category?: string;
  labels?: Record<string, string>;
  verified_languages?: Array<{ language?: string }>;
}

const baseLang = (code: string): string => code.split("-")[0].toLowerCase();

// Voice catalogs change rarely - cache across requests so mounting a voice
// picker doesn't hit ElevenLabs every time. Failures throw inside the cached
// function so an empty error fallback is never cached for 10 minutes.
const loadVoicesCached = unstable_cache(loadVoicesLive, ["eleven-account-voices"], {
  revalidate: 600,
});

// Both exports are server actions any client can call, and each list costs
// ElevenLabs calls: signed-in owners only. Dev mode (auth off or the
// DEV_DASHBOARD preview) has no user, so it passes - the isOwnedBy rule.
async function signedIn(): Promise<boolean> {
  if (!authConfigured() || devDashboardBypass()) return true;
  return (await currentUserId()) !== null;
}

// No sign-in check: for use after one, and inside the cached library loader,
// where cookies cannot be read.
function accountVoices(): Promise<VoiceOption[]> {
  return loadVoicesCached().catch(() => []);
}

export async function loadVoices(): Promise<VoiceOption[]> {
  if (!(await signedIn())) return [];
  return accountVoices();
}

async function loadVoicesLive(): Promise<VoiceOption[]> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return [];
  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": key },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`elevenlabs voices ${res.status}`);
  {
    const data = (await res.json()) as { voices?: ElevenVoice[] };
    // Female / professional voices first (stable within ties) - the default
    // voice policy - without hiding the rest of the account list.
    return (data.voices ?? [])
      .map((v) => {
        const langs = new Set<string>();
        if (v.labels?.language) langs.add(baseLang(v.labels.language));
        for (const vl of v.verified_languages ?? []) {
          if (vl.language) langs.add(baseLang(vl.language));
        }
        return {
          option: {
            voiceId: v.voice_id,
            name: v.name,
            previewUrl: v.preview_url,
            description: [v.labels?.accent, v.labels?.gender, v.labels?.description, v.category]
              .filter(Boolean)
              .join(" · "),
            languages: langs.size ? [...langs] : undefined,
            nativeLanguage: v.labels?.language ? baseLang(v.labels.language) : undefined,
          } satisfies VoiceOption,
          score: voicePreferenceScore(v.labels?.gender, `${v.labels?.description ?? ""} ${v.labels?.use_case ?? ""}`),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((v) => v.option);
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
  language?: string;
  locale?: string;
}

const loadLibraryVoicesCached = unstable_cache(
  loadLibraryVoicesLive,
  ["eleven-library-voices"],
  { revalidate: 600 },
);

export async function loadLibraryVoices(language: string): Promise<VoiceOption[]> {
  if (!(await signedIn())) return [];
  // An unknown code would be a new cache entry and a new paid library search.
  // The cache key is the base: "pt-BR" and "pt" load the same list.
  if (typeof language !== "string" || !isSupportedLanguageBase(language)) return [];
  // On a library failure fall back to (uncached-on-failure) account voices.
  return loadLibraryVoicesCached(baseLang(language)).catch(() => accountVoices());
}

async function loadLibraryVoicesLive(language: string): Promise<VoiceOption[]> {
  const base = language.split("-")[0].toLowerCase();
  if (!base) return accountVoices();
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return [];

  const account = (await loadVoicesLive()).filter((v) => v.nativeLanguage === base);

  let library: VoiceOption[] = [];
  {
    const q = new URLSearchParams({ language: base, page_size: "40", sort: "trending" });
    const res = await fetch(`https://api.elevenlabs.io/v1/shared-voices?${q}`, {
      headers: { "xi-api-key": key },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`elevenlabs shared-voices ${res.status}`);
    {
      const data = (await res.json()) as { voices?: SharedVoice[] };
      library = (data.voices ?? [])
        .filter((v) => v.public_owner_id && v.voice_id && baseLang(v.language ?? v.locale ?? "") === base)
        .map((v) => ({
          option: {
            voiceId: `lib:${v.public_owner_id}:${v.voice_id}:${encodeURIComponent(v.name ?? "Voice")}`,
            name: v.name ?? "Voice",
            previewUrl: v.preview_url,
            description: [v.accent, v.gender, v.use_case, v.descriptive].filter(Boolean).join(" · "),
            languages: [base],
          } satisfies VoiceOption,
          score: voicePreferenceScore(v.gender, `${v.descriptive ?? ""} ${v.use_case ?? ""}`),
        }))
        .sort((a, b) => b.score - a.score)
        .map((v) => v.option);
    }
  }

  return [...account, ...library];
}
