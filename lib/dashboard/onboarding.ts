import { currentUserId } from "../auth";
import { getAssistantNumbers, listAssistants, listIntegrations } from "./db";
import { listOrganizations } from "./organizations";

// New-user setup state. Every step is derived from real data - nothing is
// stored and nothing is "dismissed", so the guide can't claim you've done
// something you haven't (or nag about something you have).

export type OnboardingStepId = "organization" | "calendar" | "assistant" | "live";

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  body: string;
  /** Where the step is completed. Absent on the final step. */
  href?: string;
  cta?: string;
  done: boolean;
  /** Filled in once done - the real thing that satisfied the step. */
  detail?: string;
}

export interface OnboardingState {
  steps: OnboardingStep[];
  doneCount: number;
  /** True once every step is satisfied - the guide stops showing. */
  complete: boolean;
}

/**
 * Where the user is in setup. The order is the order the product needs: an
 * organization holds the knowledge, a calendar gives the assistant something to
 * book into, and only then is an assistant with a number worth pointing callers
 * at. Each read is independent and failure-tolerant - a broken query marks its
 * step not-done rather than blanking the guide.
 */
export async function getOnboardingState(): Promise<OnboardingState> {
  const ownerId = (await currentUserId()) ?? undefined;

  const [orgs, assistants, integrations] = await Promise.all([
    listOrganizations(ownerId).catch(() => []),
    listAssistants(ownerId).catch(() => []),
    listIntegrations(ownerId).catch(() => []),
  ]);

  const calendars = integrations.filter((i) => i.type === "calendar" && i.enabled);

  // An assistant only counts once it has a number - without one it can't take a
  // call, which is the whole point of the step.
  const numbered = (
    await Promise.all(
      assistants.map(async (a) =>
        (await getAssistantNumbers(a.id).catch(() => [])).length > 0 ? a : null,
      ),
    )
  ).filter((a): a is NonNullable<typeof a> => a !== null);

  const org = orgs[0];
  const live = numbered[0];

  const steps: OnboardingStep[] = [
    {
      id: "organization",
      title: "Create your organization",
      body: "It holds the knowledge every assistant answers from - your services, hours, and any pages or PDFs you upload.",
      href: "/dashboard/organizations",
      cta: "Create organization",
      done: orgs.length > 0,
      detail: org ? org.name : undefined,
    },
    {
      id: "calendar",
      title: "Connect your calendar",
      body: "Let callers book real appointments on the call. The assistant checks your availability before it offers a time.",
      href: "/dashboard/integrations",
      cta: "Connect calendar",
      done: calendars.length > 0,
      detail:
        calendars.length > 0
          ? `${calendars.length} connected`
          : undefined,
    },
    {
      id: "assistant",
      title: "Set up your AI assistant",
      body: "Give it a name, a voice, and a phone number. That number is what your callers dial.",
      href: "/dashboard/assistant",
      cta: "Set up assistant",
      done: numbered.length > 0,
      detail: live ? live.name : undefined,
    },
    {
      id: "live",
      title: "Let it roll",
      body: "You're live - your assistant answers 24/7. Every call lands in Calls with its transcript and AI summary, and Analytics tracks how it's doing.",
      done: numbered.length > 0,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  return { steps, doneCount, complete: steps.every((s) => s.done) };
}
