import Link from "next/link";
import { notFound } from "next/navigation";
import { getNumber, listAssistants, type Assistant } from "@/lib/dashboard/db";
import { SectionCard } from "../../components/SectionCard";
import { updateNumberAction, deleteNumberAction, setAssistantAction } from "../actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-violet-400";

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-neutral-400">{label}</dt>
      <dd className={`mt-0.5 text-sm text-neutral-800 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

export default async function NumberSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;

  const number = await getNumber(id).catch(() => null);
  if (!number) notFound();

  let assistants: Assistant[] = [];
  try {
    assistants = await listAssistants();
  } catch {
    assistants = [];
  }
  const assigned = assistants.find((a) => a.id === number.assistant_id) ?? null;

  return (
    <div className="space-y-6">
      <header>
        <Link href="/dashboard/numbers" className="text-sm text-violet-600 hover:text-violet-700">
          ← Phone numbers
        </Link>
        <h1 className="mt-1 text-2xl font-medium tracking-tight text-neutral-900">{number.e164}</h1>
        <p className="mt-1 text-sm text-neutral-500">Number, assignment, and Twilio settings.</p>
      </header>

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Saved.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <SectionCard title="Assistant" subtitle="The AI assistant that answers this number. All voice and behavior settings live on the assistant.">
        <form action={setAssistantAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="id" value={number.id} />
          <div className="flex-1">
            <label htmlFor="assistant_id" className="mb-1.5 block text-sm font-medium text-neutral-700">Assistant</label>
            <select id="assistant_id" name="assistant_id" defaultValue={number.assistant_id ?? ""} className={field}>
              <option value="">Unassigned</option>
              {assistants.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex h-[38px] items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Save
          </button>
        </form>
        {assigned && (
          <p className="mt-2 text-xs text-neutral-400">
            Edit behavior in{" "}
            <Link href={`/dashboard/assistant/${assigned.id}`} className="text-violet-600 hover:text-violet-700">
              {assigned.name} settings →
            </Link>
          </p>
        )}
        {assistants.length === 0 && (
          <p className="mt-2 text-xs text-neutral-400">
            No assistants yet.{" "}
            <Link href="/dashboard/assistant" className="text-violet-600 hover:text-violet-700">Create one →</Link>
          </p>
        )}
      </SectionCard>

      <SectionCard title="Twilio settings" subtitle="Carrier details for this number.">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Info label="Number" value={number.e164} mono />
          <Info label="Twilio SID" value={number.twilio_sid || "Not provisioned"} mono />
          <Info label="Assistant" value={assigned?.name ?? "Unassigned"} />
          <Info label="Status" value={number.enabled ? "Live" : "Off"} />
        </dl>

        <form action={updateNumberAction} className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
          <input type="hidden" name="id" value={number.id} />
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <input type="checkbox" name="enabled" defaultChecked={number.enabled} className="h-4 w-4 rounded border-neutral-300 accent-violet-600" />
            Answer calls on this number
          </label>
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Save
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Danger zone">
        <form action={deleteNumberAction} className="flex items-center justify-between gap-4">
          <input type="hidden" name="id" value={number.id} />
          <p className="text-sm text-neutral-500">Remove this number. Call history is kept.</p>
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-lg border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            Delete number
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
