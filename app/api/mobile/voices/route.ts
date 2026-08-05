import { LANGUAGES } from "@/app/(main)/dashboard/numbers/languages";
import { FALLBACK_VOICES, FUNNEL_VOICES } from "@/app/(main)/dashboard/numbers/voices";
import { voicePreviewUrls } from "@/lib/call-engine/voice/catalog";
import { mobileRoute } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Voices and languages for the pickers.
 *
 * Only the curated sets ship: the full ElevenLabs library is thousands of
 * entries behind a paged search, which is a desk task, not something to scroll
 * on a phone. Preview URLs are resolved server-side so the app never needs an
 * ElevenLabs key of its own.
 */
export const GET = mobileRoute(async () => {
  const ids = [...new Set([...FUNNEL_VOICES, ...FALLBACK_VOICES].map((v) => v.voiceId))];
  const previews = await voicePreviewUrls(ids).catch(() => ({}) as Record<string, string>);

  const voices = FALLBACK_VOICES.map((v) => {
    const funnel = FUNNEL_VOICES.find((f) => f.voiceId === v.voiceId);
    return {
      voiceId: v.voiceId,
      name: v.name,
      description: v.description ?? "",
      gender: funnel?.gender ?? null,
      previewUrl: previews[v.voiceId] ?? null,
    };
  });

  return {
    voices,
    // The funnel subset, in funnel order, for the onboarding picker.
    funnelVoiceIds: FUNNEL_VOICES.map((v) => v.voiceId),
    languages: LANGUAGES,
  };
}, "voices");
