import Link from "next/link";
import { listAssistants, listNumbers, type Assistant } from "@/lib/dashboard/db";
import { currentUserId } from "@/lib/auth";
import { SectionCard } from "../components/SectionCard";
import { Bot } from "../icons";
import { CreateAssistantForm } from "./CreateAssistantForm";

export const dynamic = "force-dynamic";

const STEPS = [
  { num: "01", title: "Create AI phone assistants", desc: "Select voice, language, and a welcome message." },
  { num: "02", title: "Define in-call behavior and post-processing", desc: "Set up call handling and choose how you receive transcripts." },
  { num: "03", title: "Let the AI take your phone calls", desc: "Link the assistant to a phone number or your own phone system." },
];

export default async function AssistantsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  let assistants: Assistant[] = [];
  let loadError = "";
  try {
    assistants = await listAssistants(await currentUserId());
  } catch (err) {
    loadError = (err as Error).message;
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

      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.num} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-sm font-medium text-violet-700">
              {s.num}
            </div>
            <h3 className="mt-3 text-sm font-medium text-neutral-900">{s.title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{s.desc}</p>
          </div>
        ))}
      </div>

      <SectionCard title="New assistant" subtitle="Name it and pick where its number is created - we generate the number on submit.">
        <CreateAssistantForm />
      </SectionCard>

      {assistants.length === 0 && !loadError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Bot className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-medium text-neutral-900">No assistants yet</h2>
          <p className="mt-1 text-sm text-neutral-500">Create your first assistant above.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {assistants.map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/assistant/${a.id}`}
              className="group rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
                  <Bot className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-neutral-900">{a.name}</div>
                  <div className="text-xs text-neutral-400">{numberByAssistant.get(a.id) ?? "No number yet"}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
