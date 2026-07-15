import Link from "next/link";
import type { OnboardingState, OnboardingStep } from "@/lib/dashboard/onboarding";
import { SectionCard } from "./SectionCard";
import { Check, ChartBar, Phone } from "../icons";

// The new-user setup guide. Replaces the old "no calls yet" dead end on the
// overview: same moment, but it says what to do next and ticks itself off from
// real state (see getOnboardingState) rather than tracking dismissals.

function StepNumber({ step, index }: { step: OnboardingStep; index: number }) {
  if (step.done) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-xs font-semibold text-neutral-500">
      {index + 1}
    </span>
  );
}

/** The final step is the payoff, not a task - once live it points at the two
 *  screens where the calls actually show up. */
function LiveStepLinks() {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <Link
        href="/dashboard/calls"
        className="press inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
      >
        <Phone className="h-3.5 w-3.5 text-neutral-400" />
        Transcripts
      </Link>
      <Link
        href="/dashboard/analytics"
        className="press inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
      >
        <ChartBar className="h-3.5 w-3.5 text-neutral-400" />
        Analytics
      </Link>
    </div>
  );
}

export function Onboarding({ state }: { state: OnboardingState }) {
  const { steps, doneCount } = state;
  // The first unfinished step is the only one with a live CTA - one obvious next
  // action beats four competing buttons.
  const nextIndex = steps.findIndex((s) => !s.done);

  return (
    <SectionCard
      title="Get set up"
      subtitle="Four steps to your AI answering the phone."
      action={
        <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 tabular-nums">
          {doneCount} of {steps.length} done
        </span>
      }
    >
      <ol className="space-y-1">
        {steps.map((step, i) => {
          const isNext = i === nextIndex;
          const isLive = step.id === "live";
          return (
            <li
              key={step.id}
              className={`flex gap-3 rounded-xl px-3 py-3 transition-colors ${
                isNext ? "bg-neutral-50" : ""
              }`}
            >
              <StepNumber step={step} index={i} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`text-sm font-medium ${
                      step.done ? "text-neutral-500" : "text-neutral-900"
                    }`}
                  >
                    {step.title}
                  </h3>
                  {step.detail && (
                    <span className="truncate rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                      {step.detail}
                    </span>
                  )}
                </div>
                {/* Body only where it helps: the step you're on, and the payoff. */}
                {(isNext || (isLive && step.done)) && (
                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{step.body}</p>
                )}
                {isLive && step.done && <LiveStepLinks />}
                {isNext && step.href && (
                  <Link
                    href={step.href}
                    className="press mt-2 inline-flex h-8 items-center rounded-lg bg-neutral-900 px-3 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    {step.cta ?? "Continue"}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}
