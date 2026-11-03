import { FALLBACK_VOICES, FUNNEL_VOICES } from "@/app/(main)/dashboard/numbers/voices";
import { voicePreviewUrls } from "@/lib/call-engine/voice/catalog";
import { mobilePlans, planTerms } from "@/lib/mobile/plans";
import { DIAL_OPTIONS, NUMBER_COUNTRIES } from "@/lib/number-pricing";

export const runtime = "nodejs";
// Everything here changes on deploy, not per request.
export const revalidate = 3600;

/**
 * Everything the setup funnel needs before there is an account: plans, the
 * countries a number can be bought in, and the curated funnel voices.
 *
 * The ONLY unauthenticated route under /api/mobile, and deliberately so. The app
 * now lets a visitor walk steps 1-3 of the funnel before signing up, exactly
 * like the website does, so the pickers on those steps cannot sit behind the
 * bearer check. Every field here is already public on /pricing and in the web
 * funnel's server-rendered markup.
 *
 * No user data is read and `mobileUserId` is never called - keep it that way. If
 * any of this ever needs to vary per account (a promo price, a grandfathered
 * plan), it must grow an auth check rather than quietly start reading a session.
 */
export async function GET(): Promise<Response> {
  // The funnel picker only ever shows this subset, so only these previews are
  // worth resolving.
  const ids = FUNNEL_VOICES.map((v) => v.voiceId);
  const previews = await voicePreviewUrls(ids).catch(() => ({}) as Record<string, string>);

  const voices = FUNNEL_VOICES.map((f) => {
    const full = FALLBACK_VOICES.find((v) => v.voiceId === f.voiceId);
    return {
      voiceId: f.voiceId,
      name: full?.name ?? f.voiceId,
      description: full?.description ?? "",
      gender: f.gender,
      previewUrl: previews[f.voiceId] ?? null,
    };
  });

  return Response.json({
    plans: mobilePlans(),
    terms: planTerms(),
    countries: NUMBER_COUNTRIES.map((c) => ({ code: c.code, name: c.name, flag: c.flag })),
    // The transfer-number substep needs prefixes, and deriving them app-side
    // would be a second copy of DIAL_PREFIXES to drift.
    dialCodes: DIAL_OPTIONS.map((d) => ({ code: d.code, flag: d.flag, dial: d.dial })),
    voices,
  });
}
