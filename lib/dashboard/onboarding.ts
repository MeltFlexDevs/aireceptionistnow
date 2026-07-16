import { currentUserId } from "../auth";
import { getAssistantNumbers, listAssistants, listIntegrations } from "./db";
import { listOrganizations } from "./organizations";

export type OnboardingStepId = "organization" | "calendar" | "assistant" | "live";

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  done: boolean;
  detail?: string;
}

export interface OnboardingState {
  steps: OnboardingStep[];
  doneCount: number;
  complete: boolean;
}

export async function getOnboardingState(): Promise<OnboardingState> {
  const ownerId = (await currentUserId()) ?? undefined;

  const [orgs, assistants, integrations] = await Promise.all([
    listOrganizations(ownerId).catch(() => []),
    listAssistants(ownerId).catch(() => []),
    listIntegrations(ownerId).catch(() => []),
  ]);

  const calendars = integrations.filter((i) => i.type === "calendar" && i.enabled);

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
