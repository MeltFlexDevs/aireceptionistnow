import Link from "next/link";
import { listAssistants, listNumbers, type Assistant } from "@/lib/dashboard/db";
import { currentUserId } from "@/lib/auth";
import { Bot, ChevronDown, Phone } from "../icons";
import { SubmitButton } from "../components/SubmitButton";
import { toggleAssistantEnabledAction } from "./actions";

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

const STEPS = [
  { n: 1, title: "Name it", body: "Call it something like Front desk." },
  { n: 2, title: "Give it a number", body: "Get a number so it can take calls." },
  { n: 3, title: "Go live", body: "It greets callers in their language." },
];

// Async server component: streams below the (instantly drawn) page header and
// create form. The parent <Suspense> waits on this fetch, so the create UI is
// interactive while these rows load in the background.
export async function AssistantsList() {
  const ownerId = await currentUserId();

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
              Create your first assistant
            </h2>
            <p className="mt-1 max-w-lg text-sm text-neutral-500">
              An assistant is the AI voice that answers a phone number. Name it in the form above,
              give it a number, and it starts taking calls.
            </p>
          </div>
        </div>

        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => (
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
          Your assistants
        </h2>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
          {assistants.length}
        </span>
      </div>

      <div className="shape-card glass divide-y divide-neutral-200/60 overflow-hidden">
        {assistants.map((a) => {
          const number = numberByAssistant.get(a.id);
          return (
            <div
              key={a.id}
              className="group relative flex items-center gap-4 px-4 py-4 transition-colors hover:bg-white/70 sm:px-5"
            >
              {/* Stretched link makes the whole row open the assistant; the
                  toggle sits above it (z-10) so it stays clickable. */}
              <Link
                href={`/dashboard/assistant/${a.id}`}
                aria-label={`Open ${a.name}`}
                className="absolute inset-0"
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
                <span
                  className={`hidden items-center gap-1.5 text-xs sm:inline-flex ${
                    a.enabled ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${a.enabled ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {a.enabled ? "Active" : "Disabled"}
                </span>
                <span
                  className={`hidden min-w-0 items-center gap-1.5 text-xs sm:inline-flex ${
                    number ? "font-medium text-neutral-700" : "text-neutral-400"
                  }`}
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <span className="truncate font-mono tracking-tight">{number ?? "No number"}</span>
                </span>

                <form action={toggleAssistantEnabledAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="enabled" value={a.enabled ? "0" : "1"} />
                  <SubmitButton
                    variant={a.enabled ? "secondary" : "primary"}
                    pendingText="…"
                    className="h-7 px-2.5 text-xs"
                  >
                    {a.enabled ? "Disable" : "Enable"}
                  </SubmitButton>
                </form>
              </div>

              <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-900" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
