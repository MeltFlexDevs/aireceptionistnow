import { getAuthClaims } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/server";
import type { OnboardingConfig } from "@/lib/dashboard/onboarding-profile";
import { DEFAULT_VOICE_ID, voicePreviewUrls } from "@/lib/call-engine/voice/catalog";
import { countryForLocale } from "@/lib/number-pricing";
import { ENGLISH_AMERICA_VOICES } from "@/app/dashboard/numbers/voices";
import { MeetAssistant } from "./MeetAssistant";

export async function BasicsStep({ config }: { config: OnboardingConfig }) {
  // Locale, auth claims, and the ElevenLabs preview URLs are independent reads
  // (previews even leave the building) - fetch all three at once.
  const [locale, rawClaims, previews] = await Promise.all([
    getLocale(),
    getAuthClaims(),
    voicePreviewUrls(ENGLISH_AMERICA_VOICES.map((v) => v.voiceId)),
  ]);
  const claims = rawClaims as { email?: string } | null;
  const emailDefault = config.alertsEmail || (typeof claims?.email === "string" ? claims.email : "");
  // Default to the saved voice or Rachel (American English). The picker filters
  // the rest by country language; these two are always offered as defaults.
  const voiceDefault = config.voiceId || DEFAULT_VOICE_ID;
  const countryDefault = config.country || countryForLocale(locale);
  const defaults = ENGLISH_AMERICA_VOICES.map((v) =>
    previews[v.voiceId] ? { ...v, previewUrl: previews[v.voiceId] } : v,
  );

  return (
    <MeetAssistant
      config={config}
      voiceDefault={voiceDefault}
      countryDefault={countryDefault}
      emailDefault={emailDefault}
      defaults={defaults}
    />
  );
}
