import type { CSSProperties } from "react";
import Link from "next/link";
import { listAssistants, listNumbers, type Assistant } from "@/lib/dashboard/db";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { currentUserId } from "@/lib/auth";
import { Bot, ChevronDown, Phone } from "../icons";
import { Tooltip } from "../components/Tooltip";
import { EnabledToggle } from "./EnabledToggle";
import { getDictionary } from "@/lib/i18n/server";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
  it: "Italian",
  nl: "Dutch",
};

function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code.toUpperCase();
}

// Async server component: streams below the (instantly drawn) page header and
// create form. The parent <Suspense> waits on this fetch, so the create UI is
// interactive while these rows load in the background.
export async function AssistantsList() {
  const ownerId = await currentUserId();
  const L = (await getDictionary()).assistants;
  const steps = [
    { n: 1, title: L.step1Title, body: L.step1Body },
    { n: 2, title: L.step2Title, body: L.step2Body },
    { n: 3, title: L.step3Title, body: L.step3Body },
  ];

  let assistants: Assistant[] = [];
  let loadError = "";
  try {
    assistants = await listAssistants(ownerId);
  } catch (err) {
    loadError = (err as Error).message;
  }

  if (loadError) {
    return (
      <div className="shape-pill border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
        {loadError}
      </div>
    );
  }

  // Empty: guide the user to the create form already shown above.
  if (assistants.length === 0) {
    return (
      <section className="shape-card glass p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <Bot className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
              {L.createTitle}
            </h2>
            <p className="mt-1 max-w-lg text-sm text-neutral-500">{L.createBody}</p>
          </div>
        </div>

        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="rounded-xl border border-neutral-200/70 bg-white/60 p-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                {s.n}
              </span>
              <p className="mt-2 text-sm font-medium text-neutral-900">{s.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  let numberByAssistant = new Map<string, string>();
  try {
    const numbers = await listNumbers();
    numberByAssistant = new Map(
      numbers.filter((n) => n.assistant_id).map((n) => [n.assistant_id as string, n.e164]),
    );
  } catch {
    // ignore
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {L.yourAssistants}
        </h2>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
          {assistants.length}
        </span>
      </div>

      <div className="rise-stagger shape-card glass divide-y divide-neutral-200/60 overflow-hidden">
        {assistants.map((a, i) => {
          const number = numberByAssistant.get(a.id);
          return (
            <div
              key={a.id}
              style={{ "--i": i } as CSSProperties}
              className="group lift press relative flex items-center gap-4 px-4 py-4 hover:bg-white/70 sm:px-5"
            >
              {/* Stretched link makes the whole row open the assistant; the
                  toggle sits above it (z-10) so it stays clickable. */}
              <Link
                href={`/dashboard/assistant/${a.id}`}
                aria-label={`Open ${a.name}`}
                className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-900/60"
              />

              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
                <Bot className="h-5 w-5" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                    a.enabled ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-neutral-900">{a.name}</div>
                <div className="truncate text-xs text-neutral-500">{languageLabel(a.language)}</div>
              </div>

              <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                <Tooltip
                  side="top"
                  label={
                    number
                      ? "The phone number callers dial to reach this assistant."
                      : "No number yet - open the assistant to get one so it can take calls."
                  }
                  className={`hidden text-xs sm:inline-flex ${
                    number ? "font-medium text-neutral-700" : "text-neutral-400"
                  }`}
                >
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <span className="truncate font-mono tracking-tight">{number ? formatPhone(number) : L.noNumber}</span>
                  </span>
                </Tooltip>

                <EnabledToggle id={a.id} enabled={a.enabled} />
              </div>

              <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-900" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
