import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getNumber,
  listAssistants,
  listIntegrations,
  type Assistant,
} from "@/lib/dashboard/db";
import { SectionCard } from "../../components/SectionCard";
import { CALENDAR_PROVIDERS } from "../../integrations/providers";
import { LanguageSelect } from "../LanguageSelect";
import { VoiceSelect } from "../VoiceSelect";
import { updateNumberAction, deleteNumberAction, setAssistantAction } from "../actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-violet-400";
const labelCls = "mb-1.5 block text-sm font-medium text-neutral-700";

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

  const notes = String((number.knowledge as { notes?: string })?.notes ?? "");
  const transferTo = String((number.routing as { transferTo?: string })?.transferTo ?? "");
  const smsAlerts = (number.routing as { smsAlerts?: boolean })?.smsAlerts ?? true;
  const sttProvider = String((number.routing as { sttProvider?: string })?.sttProvider ?? "");
  const calAccess =
    (number.routing as { calendar?: { access?: Array<{ integrationId: string; level: string }> } })
      ?.calendar?.access ?? [];
  const accessMap = new Map(calAccess.map((a) => [a.integrationId, a.level]));
  let calendars: Awaited<ReturnType<typeof listIntegrations>> = [];
  try {
    calendars = (await listIntegrations()).filter((i) => i.type === "calendar");
  } catch {
    calendars = [];
  }

  let assistants: Assistant[] = [];
  try {
    assistants = await listAssistants();
  } catch {
    assistants = [];
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/dashboard/numbers" className="text-sm text-violet-600 hover:text-violet-700">
            ← Phone numbers
          </Link>
          <h1 className="mt-1 text-2xl font-medium tracking-tight text-neutral-900">{number.e164}</h1>
          <p className="mt-1 text-sm text-neutral-500">Settings for the {number.label} line.</p>
        </div>
      </header>

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Settings saved.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <SectionCard title="Assistant" subtitle="Pick the AI assistant that answers this number.">
        <form action={setAssistantAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="id" value={number.id} />
          <div className="flex-1">
            <label htmlFor="assistant_id" className="mb-1.5 block text-sm font-medium text-neutral-700">Assistant</label>
            <select id="assistant_id" name="assistant_id" defaultValue={number.assistant_id ?? ""} className={field}>
              <option value="">This number&apos;s own settings (below)</option>
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
        {assistants.length === 0 && (
          <p className="mt-2 text-xs text-neutral-400">
            No assistants yet. <Link href="/dashboard/assistant" className="text-violet-600 hover:text-violet-700">Create one →</Link>
          </p>
        )}
      </SectionCard>

      <form action={updateNumberAction} className="space-y-4">
        <input type="hidden" name="id" value={number.id} />
        <input type="hidden" name="label" value={number.label} />
        <input type="hidden" name="e164" value={number.e164} />
        <input type="hidden" name="twilio_sid" value={number.twilio_sid ?? ""} />
        {number.enabled && <input type="hidden" name="enabled" value="on" />}

        <SectionCard title="Voice & language" subtitle="How the AI sounds on this line.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={labelCls}>Voice</span>
              <VoiceSelect name="voice_id" defaultValue={number.voice_id} />
            </div>
            <div>
              <span className={labelCls}>Default language</span>
              <LanguageSelect name="language" defaultValue={number.language} />
              <p className="mt-1 text-xs text-neutral-400">
                The AI detects the caller&apos;s language and replies in it — this is the fallback when it can&apos;t tell.
              </p>
            </div>
            <div>
              <label htmlFor="stt_provider" className={labelCls}>Speech-to-text</label>
              <select id="stt_provider" name="stt_provider" defaultValue={sttProvider} className={field}>
                <option value="">Default</option>
                <option value="deepgram">Deepgram (best accuracy)</option>
                <option value="elevenlabs">ElevenLabs (budget)</option>
              </select>
              <p className="mt-1 text-xs text-neutral-400">Transcription engine for this line.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Calendar access" subtitle="Pick which connected calendars this line can use, and how.">
          {calendars.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No calendars connected yet.{" "}
              <Link href="/dashboard/integrations" className="text-violet-600 hover:text-violet-700">
                Connect one →
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {calendars.map((c) => {
                const provName = CALENDAR_PROVIDERS.find((p) => p.id === c.provider)?.name ?? c.provider;
                const calId = c.config.calendar_id ? String(c.config.calendar_id) : "";
                return (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-neutral-800">{provName}</div>
                      {calId ? <div className="truncate text-xs text-neutral-400">{calId}</div> : null}
                    </div>
                    <select
                      name={`cal_access_${c.id}`}
                      defaultValue={accessMap.get(c.id) ?? "none"}
                      className="shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-900 outline-none focus:border-violet-400"
                    >
                      <option value="none">No access</option>
                      <option value="busy">Busy only (hide details)</option>
                      <option value="read">Read details</option>
                      <option value="write">Write &amp; book here</option>
                    </select>
                  </div>
                );
              })}
              <p className="text-xs text-neutral-400">
                Pick &ldquo;Write &amp; book&rdquo; on the calendar appointments go into. &ldquo;Busy only&rdquo; lets the AI avoid conflicts without revealing what&apos;s scheduled.
              </p>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Behavior" subtitle="What the AI says and how it handles the call.">
          <div className="space-y-4">
            <div>
              <label htmlFor="greeting" className={labelCls}>Greeting</label>
              <textarea id="greeting" name="greeting" defaultValue={number.greeting} rows={2} className={`${field} resize-y`} />
            </div>
            <div>
              <label htmlFor="system_prompt" className={labelCls}>Behavior instructions</label>
              <textarea
                id="system_prompt"
                name="system_prompt"
                defaultValue={number.system_prompt}
                rows={4}
                placeholder="e.g. You handle a dental clinic. Book cleanings, answer hours and insurance questions, escalate emergencies."
                className={`${field} resize-y`}
              />
            </div>
            <div>
              <label htmlFor="knowledge_notes" className={labelCls}>Business knowledge & FAQs</label>
              <textarea
                id="knowledge_notes"
                name="knowledge_notes"
                defaultValue={notes}
                rows={4}
                placeholder="Hours, services, pricing, address, policies — anything the AI should know."
                className={`${field} resize-y`}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="transfer_to" className={labelCls}>Personal number</label>
                <input id="transfer_to" name="transfer_to" defaultValue={transferTo} placeholder="Your real number, e.g. +14155550199" className={field} />
                <p className="mt-1 text-xs text-neutral-400">Important calls forward here; message alerts are texted here.</p>
              </div>
              <label className="flex items-center gap-2 self-start pt-8 text-sm font-medium text-neutral-700">
                <input type="checkbox" name="sms_alerts" defaultChecked={smsAlerts} className="h-4 w-4 rounded border-neutral-300 accent-violet-600" />
                Text me message alerts
              </label>
            </div>
          </div>
        </SectionCard>

        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Save settings
          </button>
        </div>
      </form>

      <SectionCard title="Danger zone">
        <form action={deleteNumberAction} className="flex items-center justify-between gap-4">
          <input type="hidden" name="id" value={number.id} />
          <p className="text-sm text-neutral-500">Remove this number and its configuration. Call history is kept.</p>
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
