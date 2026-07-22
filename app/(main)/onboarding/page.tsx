import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/config";
import { getBilling } from "@/lib/billing";
import { getDictionary } from "@/lib/i18n/server";
import { getOnboardingProfile } from "@/lib/dashboard/onboarding-profile";
import { listIntegrations } from "@/lib/dashboard/db";
import { DEFAULT_COUNTRY } from "@/lib/number-pricing";
import { Logo } from "../dashboard/icons";
import { LanguageSwitcher } from "../dashboard/components/LanguageSwitcher";
import { StepIndicator } from "./StepIndicator";
import { ONB_STEP_COOKIE } from "./progress";
import { BasicsStep } from "./steps/BasicsStep";
import { KnowledgeStep } from "./steps/KnowledgeStep";
import { CalendarStep } from "./steps/CalendarStep";
import { PlanStep } from "./steps/PlanStep";
import { ProvisioningView } from "./steps/ProvisioningView";

export const dynamic = "force-dynamic";

const TOTAL_STEPS = 4;
// The plan/payment step is no longer a numbered stop in the funnel - the
// progress indicator only counts the three setup steps. Payment and
// provisioning render with all three shown as complete.
const FUNNEL_STEPS = 3;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const stepParam = typeof sp.step === "string" ? sp.step : undefined;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const connected = sp.connected === "1";

  const [t, ownerId] = await Promise.all([getDictionary(), currentUserId()]);
  const o = t.onboarding;
  // Start every read this page might need in one round trip: the profile
  // decides the step, billing decides whether payment is skippable, and the
  // integrations list is only awaited if the calendar step actually renders.
  const profilePromise = ownerId ? getOnboardingProfile(ownerId) : Promise.resolve(null);
  const billingPromise = ownerId ? getBilling(ownerId).catch(() => null) : Promise.resolve(null);
  const calendarsPromise = ownerId ? listIntegrations(ownerId).catch(() => []) : Promise.resolve([]);
  const profile = await profilePromise;
  const cfg = profile?.config ?? {};

  // Finished funnels go straight to the dashboard (except the celebratory
  // provisioning screen itself).
  if (profile?.status === "done" && stepParam !== "go") redirect("/dashboard");

  const firstIncomplete = !((cfg.companyName || cfg.companyWebsite) && cfg.assistantName)
    ? 1
    : !cfg.knowledgeDone
      ? 2
      : !cfg.calendarDone
        ? 3
        : 4;

  // A user with an active subscription never sees the payment step again -
  // once their config steps are done they go straight to provisioning. This
  // covers webhook loss (paid but profile still draft) and returning
  // subscribers, either of whom PlanStep would otherwise double-charge.
  const billing = profile ? await billingPromise : null;
  const paid = billing?.status === "active" || billing?.status === "trialing";
  const goView =
    stepParam === "go" ||
    profile?.status === "provisioning" ||
    profile?.status === "error" ||
    (paid && firstIncomplete === 4);
  // Never let a link jump past the furthest step the caller has actually
  // unlocked. Signed-in users are gated by their saved config (firstIncomplete);
  // guests, where nothing persists, are gated by a progress cookie that each
  // step's action bumps once the prior step is done. This closes the URL-jump
  // hole the old "guests get the whole funnel" rule left open.
  const authed = authConfigured() && !!ownerId;
  const cookieStep = authed
    ? 1
    : Number((await cookies()).get(ONB_STEP_COOKIE)?.value) || 1;
  const unlocked = authed ? firstIncomplete : Math.max(firstIncomplete, cookieStep);
  const cap = Math.min(Math.max(unlocked, 1), TOTAL_STEPS);
  const requested = stepParam === "plan" ? 4 : Number(stepParam);
  const step = goView
    ? TOTAL_STEPS
    : Number.isInteger(requested) && requested >= 1
      ? Math.min(requested, cap)
      : Math.min(firstIncomplete, cap);

  const calendars =
    step === 3
      ? (await calendarsPromise).filter((i) => i.type === "calendar" && i.enabled)
      : [];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex items-center justify-between px-5 pt-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-neutral-900">
          <Logo className="h-5 w-5" />
          <span className="text-sm font-medium tracking-tight">{o.brand}</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <StepIndicator
            current={step >= 4 ? FUNNEL_STEPS + 1 : step}
            total={FUNNEL_STEPS}
            reachable={Math.min(cap, FUNNEL_STEPS)}
          />
        </div>
      </header>

      <main
        className={`mx-auto flex w-full flex-1 flex-col px-5 sm:px-6 ${
          goView
            ? "max-w-2xl pb-12 pt-4"
            : step === 1
              ? "max-w-lg justify-center pb-4 pt-2"
              : step === 2
                ? "max-w-3xl justify-center pb-4 pt-2"
                : step === 3
                  ? "max-w-md justify-center pb-4 pt-2"
                  : "max-w-2xl justify-center pb-4 pt-2"
        }`}
      >
        {error && (
          <div className="rise mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error.slice(0, 200)}
          </div>
        )}
        {goView ? (
          <ProvisioningView assistantName={cfg.assistantName ?? ""} />
        ) : step === 1 ? (
          <BasicsStep config={cfg} />
        ) : step === 2 ? (
          <KnowledgeStep sources={cfg.sources ?? []} />
        ) : step === 3 ? (
          <CalendarStep
            calendars={calendars}
            connected={connected}
            assistantName={cfg.assistantName ?? ""}
          />
        ) : (
          <PlanStep
            country={cfg.country ?? DEFAULT_COUNTRY}
            assistantName={cfg.assistantName ?? ""}
            companyName={cfg.companyName ?? ""}
          />
        )}
      </main>
    </div>
  );
}
