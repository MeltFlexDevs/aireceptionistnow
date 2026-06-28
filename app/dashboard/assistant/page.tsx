import Link from "next/link";
import { listAssistants, listNumbers, type Assistant } from "@/lib/dashboard/db";
import { getPlanContext } from "@/lib/dashboard/plan";
import { currentUserId } from "@/lib/auth";
import { Bot, ChevronDown, Phone, Plus } from "../icons";
import { PlanUsage } from "../components/PlanUsage";
import { CreateAssistantForm } from "./CreateAssistantForm";

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

export const dynamic = "force-dynamic";

export default async function AssistantsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;

  const ownerId = await currentUserId();

  let assistants: Assistant[] = [];
  let loadError = "";
  try {
    assistants = await listAssistants(ownerId);
  } catch (err) {
    loadError = (err as Error).message;
  }

  const planCtx = await getPlanContext(ownerId).catch(() => null);

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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">AI assistants</h1>
        <p className="mt-1 text-sm text-neutral-500">Create an assistant, then link it to a phone number.</p>
      </header>

      {(error || loadError) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error ?? loadError}
        </div>
      )}

      {notice && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>{notice}</span>
          <Link href="/pricing" className="font-medium underline underline-offset-2 hover:text-amber-900">
            View plans
          </Link>
        </div>
      )}

      {planCtx && <PlanUsage ctx={planCtx} />}

      <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm shadow-neutral-200">
            <Plus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-medium text-neutral-900">Create a new assistant</h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              Name it and pick where its number is created.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <CreateAssistantForm credits={planCtx?.limits.minutesIncluded ?? 1000} />
        </div>
      </section>

      {assistants.length === 0 && !loadError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white">
            <Bot className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-medium text-neutral-900">No assistants yet</h2>
          <p className="mt-1 text-sm text-neutral-500">Create your first assistant above.</p>
        </div>
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-900">Your assistants</h2>
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
              {assistants.length}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {assistants.map((a) => {
              const number = numberByAssistant.get(a.id);
              return (
                <Link
                  key={a.id}
                  href={`/dashboard/assistant/${a.id}`}
                  className="group relative flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-900 text-white shadow-sm">
                      <Bot className="h-5 w-5" />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                          a.enabled ? "bg-emerald-500" : "bg-neutral-300"
                        }`}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-neutral-900">{a.name}</div>
                      <div className="mt-0.5 truncate text-xs text-neutral-500">{languageLabel(a.language)}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-900" />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-100 pt-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        a.enabled
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-neutral-100 text-neutral-500 ring-neutral-200"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${a.enabled ? "bg-emerald-500" : "bg-neutral-400"}`} />
                      {a.enabled ? "Active" : "Disabled"}
                    </span>

                    <span
                      className={`inline-flex min-w-0 items-center gap-1.5 text-xs ${
                        number ? "font-medium text-neutral-700" : "text-neutral-400"
                      }`}
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                      <span className="truncate font-mono tracking-tight">{number ?? "No number"}</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
