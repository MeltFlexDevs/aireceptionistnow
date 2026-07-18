import { currentUserId } from "@/lib/auth";
import { getOnboardingProfile } from "@/lib/dashboard/onboarding-profile";

// Poll target for the /onboarding provisioning screen.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const userId = await currentUserId();
  if (!userId) return Response.json({ status: "guest" });
  const profile = await getOnboardingProfile(userId);
  if (!profile) return Response.json({ status: "nothing" });
  return Response.json({
    status: profile.status,
    e164: profile.result.e164 ?? null,
    error: profile.result.error ?? null,
  });
}
