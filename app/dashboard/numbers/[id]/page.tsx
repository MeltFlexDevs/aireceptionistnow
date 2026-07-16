import Link from "next/link";
import { notFound } from "next/navigation";
import { getNumber, listAssistants, type Assistant } from "@/lib/dashboard/db";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { getDictionary } from "@/lib/i18n/server";
import { countryForE164 } from "@/lib/number-pricing";
import { SectionCard } from "../../components/SectionCard";
import { BackLink } from "../../components/BackLink";
import { SubmitButton } from "../../components/SubmitButton";
import { setAssistantAction } from "../actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";

export default async function NumberSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const t = await getDictionary();

  const [number, assistants] = await Promise.all([
    getNumber(id).catch(() => null),
    listAssistants().catch(() => [] as Assistant[]),
  ]);
  if (!number) notFound();
  const assigned = assistants.find((a) => a.id === number.assistant_id) ?? null;
  const { flag, name: country } = countryForE164(number.e164);

  return (
    <div className="space-y-6 rise">
      <header>
        <BackLink href="/dashboard/numbers" label="Phone numbers" className="mb-2" />
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-medium tracking-tight text-neutral-900">
          <span className="text-2xl leading-none" aria-hidden>{flag}</span>
          {formatPhone(number.e164)}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{country} · assign this number to an assistant.</p>
      </header>

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Saved.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <SectionCard title={t.assistants.assistantLabel} subtitle="The AI assistant that answers this number. All voice and behavior settings live on the assistant.">
        <form action={setAssistantAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="id" value={number.id} />
          <div className="flex-1">
            <label htmlFor="assistant_id" className="mb-1.5 block text-sm font-medium text-neutral-700">{t.assistants.assistantLabel}</label>
            <select id="assistant_id" name="assistant_id" defaultValue={number.assistant_id ?? ""} className={field}>
              <option value="">Free</option>
              {assistants.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <SubmitButton pendingText="Saving…" className="press w-full sm:w-auto">
            Save
          </SubmitButton>
        </form>
        {assigned && (
          <p className="mt-2 text-xs text-neutral-400">
            Edit behavior in{" "}
            <Link href={`/dashboard/assistant/${assigned.id}`} className="text-neutral-900 hover:text-neutral-900">
              {assigned.name} settings →
            </Link>
          </p>
        )}
        {assistants.length === 0 && (
          <p className="mt-2 text-xs text-neutral-400">
            No assistants yet.{" "}
            <Link href="/dashboard/assistant" className="text-neutral-900 hover:text-neutral-900">Create one →</Link>
          </p>
        )}
      </SectionCard>
    </div>
  );
}
